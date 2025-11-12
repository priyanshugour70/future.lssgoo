'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Building2,
  Calendar,
  Globe,
  TrendingUp,
  Loader2,
  Target,
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

export default function AcceleratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccelerator = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/accelerators/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          setAccelerator(result.data);
        } else {
          router.push('/accelerators');
        }
      } catch (error) {
        console.error('Failed to fetch accelerator:', error);
        router.push('/accelerators');
      } finally {
        setLoading(false);
      }
    };

    fetchAccelerator();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accelerator) {
    return null;
  }

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
        <Link href="/accelerators">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Accelerators
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{accelerator.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {accelerator.country && (
              <Badge variant="secondary" className="gap-1">
                <Globe className="h-3 w-3" />
                {accelerator.country}
              </Badge>
            )}
            {accelerator.foundedYear && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Founded {accelerator.foundedYear}
              </Badge>
            )}
            {accelerator.type && (
              <Badge variant="outline" className="gap-1">
                <Target className="h-3 w-3" />
                {accelerator.type}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {accelerator.website && (
            <Button variant="outline" asChild>
              <a href={accelerator.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Website
              </a>
            </Button>
          )}
          {!authLoading && user?.role === 'ADMIN' && (
            <Button asChild>
              <Link href={`/admin/accelerators/${accelerator.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{accelerator.description}</p>
          </CardContent>
        </Card>

        {/* Why It Stands Out Card */}
        <Card>
          <CardHeader>
            <CardTitle>Why It Stands Out</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {accelerator.whyItStandsOut}
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accelerator.fundedCompanies && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Companies Funded
                  </div>
                  <span className="text-lg font-semibold">
                    {accelerator.fundedCompanies.toLocaleString()}+
                  </span>
                </div>
                <Separator />
              </>
            )}

            {accelerator.averageFunding && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Average Funding
                  </div>
                  <span className="text-lg font-semibold">{accelerator.averageFunding}</span>
                </div>
                <Separator />
              </>
            )}

            {accelerator.foundedYear && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Founded
                  </div>
                  <span className="text-lg font-semibold">{accelerator.foundedYear}</span>
                </div>
                <Separator />
              </>
            )}

            {accelerator.country && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Location
                </div>
                <span className="text-lg font-semibold">{accelerator.country}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Added on {formatDate(accelerator.createdAt)}</span>
              <span>•</span>
              <span>Last updated {formatDate(accelerator.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

