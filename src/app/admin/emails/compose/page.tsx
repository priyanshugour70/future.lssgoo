'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send, Plus, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ComposeEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toEmails, setToEmails] = useState<string[]>(['']);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    redirect('/');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validToEmails = toEmails.filter(email => email.trim() !== '');
      const validCcEmails = ccEmails.filter(email => email.trim() !== '');
      const validBccEmails = bccEmails.filter(email => email.trim() !== '');

      if (validToEmails.length === 0) {
        toast.error('At least one recipient is required');
        setIsSubmitting(false);
        return;
      }

      // Strip HTML tags for plain text version
      const plainText = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

      const payload = {
        to: validToEmails,
        cc: validCcEmails,
        bcc: validBccEmails,
        subject,
        body: plainText,
        bodyHtml: body,
      };

      const response = await fetch('/api/v1/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email sent successfully!');
        router.push('/admin/emails');
      } else {
        toast.error(result.error?.message || 'Failed to send email');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/emails">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Emails
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>Send an email and track it in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* To Recipients */}
            <div className="space-y-2">
              <Label>To (Recipients) *</Label>
              {toEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...toEmails];
                      newEmails[index] = e.target.value;
                      setToEmails(newEmails);
                    }}
                    placeholder="recipient@example.com"
                    disabled={isSubmitting}
                  />
                  {toEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setToEmails(toEmails.filter((_, i) => i !== index))}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setToEmails([...toEmails, ''])}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Recipient
              </Button>
            </div>

            {/* CC */}
            <div className="space-y-2">
              <Label>CC (Optional)</Label>
              {ccEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...ccEmails];
                      newEmails[index] = e.target.value;
                      setCcEmails(newEmails);
                    }}
                    placeholder="cc@example.com"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCcEmails(ccEmails.filter((_, i) => i !== index))}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCcEmails([...ccEmails, ''])}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add CC
              </Button>
            </div>

            {/* BCC */}
            <div className="space-y-2">
              <Label>BCC (Optional)</Label>
              {bccEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...bccEmails];
                      newEmails[index] = e.target.value;
                      setBccEmails(newEmails);
                    }}
                    placeholder="bcc@example.com"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setBccEmails(bccEmails.filter((_, i) => i !== index))}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBccEmails([...bccEmails, ''])}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add BCC
              </Button>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Email subject..."
              />
            </div>

            {/* Body with Rich Text Editor */}
            <div className="space-y-2">
              <Label>Email Body *</Label>
              <div className="border rounded-md">
                <ReactQuill
                  theme="snow"
                  value={body}
                  onChange={setBody}
                  modules={modules}
                  placeholder="Write your email here..."
                  className="h-64"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-16">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/emails')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

