'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Mail, Plus, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { EmailWithSender } from '@/types/email';

export default function EmailsPage() {
  const { user, loading: authLoading } = useAuth();
  const [emails, setEmails] = useState<EmailWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    redirect('/');
  }

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/emails');
        const result = await response.json();

        if (result.success) {
          setEmails(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchEmails();
    }
  }, [authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Sent
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'BOUNCED':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Bounced
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
            <p className="mt-2 text-muted-foreground">
              Send emails and track all email history
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/emails/compose">
              <Plus className="mr-2 h-4 w-4" />
              Compose Email
            </Link>
          </Button>
        </div>
      </div>

      {/* Email List */}
      {emails.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No emails sent yet</h3>
          <p className="text-sm text-muted-foreground">
            Start by composing your first email
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/emails/compose">
              <Plus className="mr-2 h-4 w-4" />
              Compose Email
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="line-clamp-1">{email.subject}</CardTitle>
                      {getStatusBadge(email.status)}
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>To: {email.to.slice(0, 2).join(', ')}{email.to.length > 2 && ` +${email.to.length - 2} more`}</span>
                        {email.cc.length > 0 && <span>CC: {email.cc.length}</span>}
                        <span>•</span>
                        <span>{formatDate(email.createdAt)}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.body }}
                />
                {email.status === 'FAILED' && email.failureReason && (
                  <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <strong>Error:</strong> {email.failureReason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

