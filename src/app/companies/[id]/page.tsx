'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  Target,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from 'lucide-react';
import type { CompanyWithRelations } from '@/types/company';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<CompanyWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/companies/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          setCompany(result.data);
        } else {
          router.push('/companies');
        }
      } catch (error) {
        console.error('Failed to fetch company:', error);
        router.push('/companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
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
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/companies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          {company.tagline && (
            <p className="mt-2 text-lg text-muted-foreground">{company.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {company.accelerator && (
              <Badge variant="default" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {company.accelerator.title}
              </Badge>
            )}
            {company.location && (
              <Badge variant="secondary" className="gap-1">
                <Globe className="h-3 w-3" />
                {company.location}
              </Badge>
            )}
            {company.foundedYear && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Founded {company.foundedYear}
              </Badge>
            )}
            {company.companySize && (
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {company.companySize} employees
              </Badge>
            )}
            {company.fundingStage && (
              <Badge variant="outline">{company.fundingStage}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {company.website && (
            <Button variant="outline" asChild>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>
          )}
          {!authLoading && user?.role === 'ADMIN' && (
            <Button asChild>
              <Link href={`/admin/companies/${company.id}/edit`}>
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
            <p className="text-muted-foreground">{company.description}</p>
            
            {company.vision && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-2 font-semibold">Vision</h4>
                  <p className="text-muted-foreground">{company.vision}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tech Stack Card */}
        {company.techStack && company.techStack.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.sector && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Sector
                  </div>
                  <span className="font-medium">{company.sector}</span>
                </div>
                <Separator />
              </>
            )}

            {company.domain && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Domain
                  </div>
                  <span className="font-medium">{company.domain}</span>
                </div>
                <Separator />
              </>
            )}

            {company.companySize && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Company Size
                  </div>
                  <span className="font-medium">{company.companySize} employees</span>
                </div>
                <Separator />
              </>
            )}

            {company.fundingStage && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Funding Stage
                  </div>
                  <span className="font-medium">{company.fundingStage}</span>
                </div>
                <Separator />
              </>
            )}

            {company.foundedYear && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Founded
                </div>
                <span className="font-medium">{company.foundedYear}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        {company.contactSource && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.contactSource.emails && company.contactSource.emails.length > 0 && (
                <>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="space-y-1">
                      {company.contactSource.emails.map((email, idx) => (
                        <a
                          key={idx}
                          href={`mailto:${email}`}
                          className="block text-sm text-primary hover:underline"
                        >
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {company.contactSource.contactNumber && (
                <>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <a
                      href={`tel:${company.contactSource.contactNumber}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {company.contactSource.contactNumber}
                    </a>
                  </div>
                  <Separator />
                </>
              )}

              {/* Social Media Links */}
              <div className="flex flex-wrap gap-3">
                {company.contactSource.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={company.contactSource.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {company.contactSource.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={company.contactSource.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                )}
                {company.contactSource.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={company.contactSource.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="mr-2 h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}
                {company.contactSource.facebook && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={company.contactSource.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Added on {formatDate(company.createdAt.toString())}</span>
              <span>•</span>
              <span>Last updated {formatDate(company.updatedAt.toString())}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

