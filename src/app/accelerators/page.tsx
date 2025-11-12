'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Search,
  Plus,
  ExternalLink,
  Building2,
  Calendar,
  Globe,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface Accelerator {
  id: string;
  title: string;
  description: string;
  whyItStandsOut: string;
  averageFunding?: string;
  fundedCompanies?: number;
  foundedYear?: number;
  country?: string;
  type?: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AcceleratorsPage() {
  const { user, loading: authLoading } = useAuth();
  const [accelerators, setAccelerators] = useState<Accelerator[]>([]);
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

  // Fetch accelerators
  useEffect(() => {
    const fetchAccelerators = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);

        const response = await fetch(`/api/v1/accelerators?${params}`);
        const result = await response.json();

        if (result.success) {
          setAccelerators(result.data.accelerators);
        }
      } catch (error) {
        console.error('Failed to fetch accelerators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccelerators();
  }, [debouncedSearch]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accelerators</h1>
            <p className="mt-2 text-muted-foreground">
              Discover top accelerators funding exceptional startups worldwide
            </p>
          </div>
          {!authLoading && user?.role === 'ADMIN' && (
            <Button asChild>
              <Link href="/admin/accelerators/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Accelerator
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accelerators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && accelerators.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-10 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No accelerators found</h3>
              <p className="text-sm text-muted-foreground">
                {search
                  ? 'Try adjusting your search terms'
                  : 'Check back soon for accelerator listings'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accelerators Grid */}
      {!loading && accelerators.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accelerators.map((accelerator) => (
            <Card key={accelerator.id} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{accelerator.title}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {accelerator.country && (
                        <Badge variant="secondary" className="gap-1">
                          <Globe className="h-3 w-3" />
                          {accelerator.country}
                        </Badge>
                      )}
                      {accelerator.foundedYear && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {accelerator.foundedYear}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <CardDescription className="line-clamp-2">
                  {accelerator.description}
                </CardDescription>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Why it stands out:</p>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {accelerator.whyItStandsOut}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {accelerator.fundedCompanies && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{accelerator.fundedCompanies.toLocaleString()}+ companies</span>
                    </div>
                  )}
                  {accelerator.averageFunding && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{accelerator.averageFunding}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/accelerators/${accelerator.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {accelerator.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={accelerator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

