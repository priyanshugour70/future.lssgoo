'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Search, Plus, User, Loader2, Building2 } from 'lucide-react';
import type { PeopleWithRelations } from '@/types/people';

export default function PeoplePage() {
  const { user, loading: authLoading } = useAuth();
  const [people, setPeople] = useState<PeopleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch people
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);

        const response = await fetch(`/api/v1/people?${params}`);
        const result = await response.json();

        if (result.success) {
          setPeople(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch people:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [debouncedSearch]);

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People</h1>
            <p className="mt-2 text-muted-foreground">
              Discover talented individuals passionate about building the future
            </p>
          </div>
          {!authLoading && user?.role === 'ADMIN' && (
            <Button asChild>
              <Link href="/admin/people/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : people.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <User className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No people found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try adjusting your search' : 'People will appear here once added'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.photoUrl || undefined} alt={person.fullName} />
                      <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-1">{person.fullName}</CardTitle>
                      {person.company && (
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {person.company.name}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {person.passion && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      <span className="font-medium">Passionate about:</span> {person.passion}
                    </p>
                  )}

                  {person.bio && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {person.bio}
                    </p>
                  )}

                  {person.contact && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {person.contact.email && (
                        <Badge variant="outline" className="text-xs">
                          Email
                        </Badge>
                      )}
                      {person.contact.linkedin && (
                        <Badge variant="outline" className="text-xs">
                          LinkedIn
                        </Badge>
                      )}
                      {person.contact.twitter && (
                        <Badge variant="outline" className="text-xs">
                          Twitter
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

