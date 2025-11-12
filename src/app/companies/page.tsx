'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Plus, Building2, Users, TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import type { CompanyWithRelations } from '@/types/company';

export default function CompaniesPage() {
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<CompanyWithRelations[]>([]);
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

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);

        const response = await fetch(`/api/v1/companies?${params}`);
        const result = await response.json();

        if (result.success) {
          setCompanies(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [debouncedSearch]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="mt-2 text-muted-foreground">
              Discover innovative startups backed by top accelerators
            </p>
          </div>
          {!authLoading && user?.role === 'ADMIN' && (
            <Button asChild>
              <Link href="/admin/companies/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
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
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : companies.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No companies found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try adjusting your search' : 'Companies will appear here once added'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{company.name}</CardTitle>
                      {company.tagline && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {company.tagline}
                        </CardDescription>
                      )}
                    </div>
                    {company.website && (
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {company.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {company.accelerator && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {company.accelerator.title}
                      </Badge>
                    )}
                    {company.companySize && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {company.companySize}
                      </Badge>
                    )}
                    {company.fundingStage && (
                      <Badge variant="outline">{company.fundingStage}</Badge>
                    )}
                  </div>

                  {company.techStack && company.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {company.techStack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {company.techStack.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{company.techStack.length - 3}
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

