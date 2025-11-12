'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function NewAcceleratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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

      const response = await fetch('/api/v1/accelerators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Accelerator created successfully');
        router.push('/accelerators');
      } else {
        toast.error(result.error?.message || 'Failed to create accelerator');
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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/accelerators">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Accelerators
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Accelerator</CardTitle>
          <CardDescription>
            Add a new accelerator to the platform
          </CardDescription>
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
                  placeholder="Y Combinator"
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
                  placeholder="Brief overview of the accelerator..."
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
                  placeholder="What makes this accelerator unique..."
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
                    placeholder="$125K - $500K"
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
                    placeholder="5000"
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
                    placeholder="2005"
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
                    placeholder="USA"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Global, Industry-specific, etc."
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
                    placeholder="https://www.ycombinator.com"
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
                  placeholder="https://example.com/logo.png"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Accelerator
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/accelerators')}
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

