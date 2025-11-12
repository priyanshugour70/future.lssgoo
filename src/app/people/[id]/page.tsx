'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Building2,
  Loader2,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  Link as LinkIcon,
} from 'lucide-react';
import type { PeopleWithRelations } from '@/types/people';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [person, setPerson] = useState<PeopleWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/people/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          setPerson(result.data);
        } else {
          router.push('/people');
        }
      } catch (error) {
        console.error('Failed to fetch person:', error);
        router.push('/people');
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!person) {
    return null;
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/people">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to People
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={person.photoUrl || undefined} alt={person.fullName} />
              <AvatarFallback className="text-2xl">{getInitials(person.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{person.fullName}</h1>
              {person.company && (
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <Link
                    href={`/companies/${person.company.id}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {person.company.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {person.profileUrl && (
              <Button variant="outline" asChild>
                <a href={person.profileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Profile
                </a>
              </Button>
            )}
            {!authLoading && user?.role === 'ADMIN' && (
              <Button asChild>
                <Link href={`/admin/people/${person.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Passion */}
        {person.passion && (
          <Card>
            <CardHeader>
              <CardTitle>Passionate About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{person.passion}</p>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        {person.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{person.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {person.contact && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.contact.email && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <a
                      href={`mailto:${person.contact.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {person.contact.email}
                    </a>
                  </div>
                  <Separator />
                </>
              )}

              {person.contact.phoneNumber && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <a
                      href={`tel:${person.contact.phoneNumber}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {person.contact.phoneNumber}
                    </a>
                  </div>
                  <Separator />
                </>
              )}

              {/* Social Media Links */}
              <div className="flex flex-wrap gap-3 pt-2">
                {person.contact.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={person.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {person.contact.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={person.contact.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                )}
                {person.contact.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={person.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="mr-2 h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes & Links */}
        {person.notes && person.notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Notes & Links</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {person.notes.map((note, index) => {
                  // Check if the note is a URL
                  const isUrl = note.startsWith('http://') || note.startsWith('https://');
                  
                  return (
                    <li key={index} className="flex items-start gap-2">
                      <LinkIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      {isUrl ? (
                        <a
                          href={note}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {note}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">{note}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Added on {formatDate(person.createdAt.toString())}</span>
              <span>•</span>
              <span>Last updated {formatDate(person.updatedAt.toString())}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

