'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

interface AcceleratorData {
  title: string;
  description: string;
  whyItStandsOut: string;
  averageFunding: string;
  fundedCompanies: string;
  foundedYear: string;
  country: string;
  type: string;
  website: string;
  logoUrl: string;
}

export default function EditAcceleratorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<AcceleratorData>({
    title: '',
    description: '',
    whyItStandsOut: '',
    averageFunding: '',
    fundedCompanies: '',
    foundedYear: '',
    country: '',
    type: '',
    website: '',
    logoUrl: '',
  });

  // Redirect if not admin
  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    redirect('/accelerators');
  }

  useEffect(() => {
    const fetchAccelerator = async () => {
      try {
        const response = await fetch(`/api/v1/accelerators/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setFormData({
            title: data.title,
            description: data.description,
            whyItStandsOut: data.whyItStandsOut,
            averageFunding: data.averageFunding || '',
            fundedCompanies: data.fundedCompanies?.toString() || '',
            foundedYear: data.foundedYear?.toString() || '',
            country: data.country || '',
            type: data.type || '',
            website: data.website || '',
            logoUrl: data.logoUrl || '',
          });
        } else {
          toast.error('Accelerator not found');
          router.push('/accelerators');
        }
      } catch (error) {
        toast.error('Failed to load accelerator');
        router.push('/accelerators');
      } finally {
        setLoading(false);
      }
    };

    fetchAccelerator();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        whyItStandsOut: formData.whyItStandsOut,
      };

      // Add optional fields
      if (formData.averageFunding) payload.averageFunding = formData.averageFunding;
      if (formData.fundedCompanies) payload.fundedCompanies = parseInt(formData.fundedCompanies);
      if (formData.foundedYear) payload.foundedYear = parseInt(formData.foundedYear);
      if (formData.country) payload.country = formData.country;
      if (formData.type) payload.type = formData.type;
      if (formData.website) payload.website = formData.website;
      if (formData.logoUrl) payload.logoUrl = formData.logoUrl;

      const response = await fetch(`/api/v1/accelerators/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Accelerator updated successfully');
        router.push(`/accelerators/${resolvedParams.id}`);
      } else {
        toast.error(result.error?.message || 'Failed to update accelerator');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this accelerator? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/v1/accelerators/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Accelerator deleted successfully');
        router.push('/accelerators');
      } else {
        toast.error(result.error?.message || 'Failed to delete accelerator');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/accelerators/${resolvedParams.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Accelerator
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Edit Accelerator</CardTitle>
              <CardDescription>Update accelerator information</CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Required Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyItStandsOut">Why It Stands Out *</Label>
                <Textarea
                  id="whyItStandsOut"
                  value={formData.whyItStandsOut}
                  onChange={(e) => setFormData({ ...formData, whyItStandsOut: e.target.value })}
                  required
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Optional Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="averageFunding">Average Funding</Label>
                  <Input
                    id="averageFunding"
                    value={formData.averageFunding}
                    onChange={(e) => setFormData({ ...formData, averageFunding: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundedCompanies">Companies Funded</Label>
                  <Input
                    id="fundedCompanies"
                    type="number"
                    value={formData.fundedCompanies}
                    onChange={(e) => setFormData({ ...formData, fundedCompanies: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/accelerators/${resolvedParams.id}`)}
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

