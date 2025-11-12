'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { redirect } from 'next/navigation';
import { Send, Loader2, Sparkles, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ConversationWithMessages } from '@/types/ai';

interface Message { role: 'USER' | 'ASSISTANT'; content: string; }

export default function AIPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!authLoading && !user) redirect('/signin');

  useEffect(() => {
    if (!authLoading && user) fetchConversations();
  }, [authLoading, user]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/v1/ai/conversations');
      const result = await res.json();
      if (result.success) setConversations(result.data);
    } catch (error) {
      console.error('Failed to fetch conversations');
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/ai/conversations/${id}`);
      const result = await res.json();
      if (result.success) {
        setMessages(result.data.messages.map((m: any) => ({ role: m.role, content: m.content })));
        setCurrentConversationId(id);
      }
    } catch (error) {
      console.error('Failed to load');
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await fetch(`/api/v1/ai/conversations/${id}`, { method: 'DELETE' });
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversationId === id) { setCurrentConversationId(null); setMessages([]); }
      toast.success('Deleted');
    } catch {
      toast.error('Failed');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'USER', content: userMessage }]);
    setStreamingContent('');

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: currentConversationId, message: userMessage }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'chunk') {
              setStreamingContent(prev => prev + data.content);
              if (!currentConversationId) setCurrentConversationId(data.conversationId);
            } else if (data.type === 'done') {
              setMessages(prev => [...prev, { role: 'ASSISTANT', content: data.fullResponse }]);
              setStreamingContent('');
              fetchConversations();
            } else if (data.type === 'error') {
              toast.error(data.error);
            }
          } catch (e) {}
        }
      }
    } catch {
      toast.error('Failed to send');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const getInitials = (name?: string | null) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto hidden md:block">
        <Button onClick={() => { setCurrentConversationId(null); setMessages([]); }} className="w-full mb-4" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <div className="space-y-2">
          {conversations.map(conv => (
            <div key={conv.id} className="group relative">
              <button
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${currentConversationId === conv.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /><span className="truncate text-sm font-medium">{conv.title || 'New conversation'}</span></div>
                <div className="text-xs text-muted-foreground mt-1">{conv._count?.messages || 0} messages</div>
              </button>
              <Button variant="ghost" size="sm" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100" onClick={() => deleteConversation(conv.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-6 rounded-full mb-6">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chat with AI</h2>
              <p className="text-muted-foreground max-w-md">Powered by Google Gemini. Ask anything!</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ASSISTANT' && (
                <Avatar className="h-8 w-8 mt-1"><AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground"><Sparkles className="h-4 w-4" /></AvatarFallback></Avatar>
              )}
              <div className={`max-w-[80%] ${msg.role === 'USER' ? 'order-first' : ''}`}>
                <Card className={msg.role === 'USER' ? 'bg-primary text-primary-foreground' : ''}>
                  <CardContent className="p-4">
                    {msg.role === 'ASSISTANT' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              {msg.role === 'USER' && (
                <Avatar className="h-8 w-8 mt-1"><AvatarFallback>{getInitials(user?.name)}</AvatarFallback></Avatar>
              )}
            </div>
          ))}

          {streamingContent && (
            <div className="flex gap-4 justify-start">
              <Avatar className="h-8 w-8 mt-1"><AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground"><Sparkles className="h-4 w-4" /></AvatarFallback></Avatar>
              <div className="max-w-[80%]">
                <Card>
                  <CardContent className="p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                    </div>
                    <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-1">|</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-background p-4">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isLoading} className="flex-1" />
            <Button type="submit" disabled={isLoading || !input.trim()}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

