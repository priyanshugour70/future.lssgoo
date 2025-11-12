'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import {
  TECH_STACK_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  FUNDING_STAGE_OPTIONS,
} from '@/types/company';

interface Accelerator {
  id: string;
  title: string;
}

interface CompanyData {
  name: string;
  tagline: string;
  description: string;
  companySize: string;
  domain: string;
  sector: string;
  vision: string;
  foundedYear: string;
  website: string;
  logoUrl: string;
  location: string;
  fundingStage: string;
  acceleratorId: string;
  techStack: string[];
  contactSource: {
    instagram: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    contactNumber: string;
    emails: string[];
  };
}

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [accelerators, setAccelerators] = useState<Accelerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    tagline: '',
    description: '',
    companySize: '',
    domain: '',
    sector: '',
    vision: '',
    foundedYear: '',
    website: '',
    logoUrl: '',
    location: '',
    fundingStage: '',
    acceleratorId: '',
    techStack: [],
    contactSource: {
      instagram: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      contactNumber: '',
      emails: [''],
    },
  });

  // Redirect if not admin
  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    redirect('/companies');
  }

  // Fetch company data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, acceleratorsRes] = await Promise.all([
          fetch(`/api/v1/companies/${resolvedParams.id}`),
          fetch('/api/v1/accelerators?limit=100'),
        ]);

        const companyResult = await companyRes.json();
        const acceleratorsResult = await acceleratorsRes.json();

        if (companyResult.success) {
          const data = companyResult.data;
          setFormData({
            name: data.name,
            tagline: data.tagline || '',
            description: data.description,
            companySize: data.companySize || '',
            domain: data.domain || '',
            sector: data.sector || '',
            vision: data.vision || '',
            foundedYear: data.foundedYear?.toString() || '',
            website: data.website || '',
            logoUrl: data.logoUrl || '',
            location: data.location || '',
            fundingStage: data.fundingStage || '',
            acceleratorId: data.acceleratorId || '',
            techStack: data.techStack || [],
            contactSource: {
              instagram: data.contactSource?.instagram || '',
              linkedin: data.contactSource?.linkedin || '',
              twitter: data.contactSource?.twitter || '',
              facebook: data.contactSource?.facebook || '',
              contactNumber: data.contactSource?.contactNumber || '',
              emails:
                data.contactSource?.emails && data.contactSource.emails.length > 0
                  ? data.contactSource.emails
                  : [''],
            },
          });
        } else {
          toast.error('Company not found');
          router.push('/companies');
        }

        if (acceleratorsResult.success) {
          setAccelerators(acceleratorsResult.data);
        }
      } catch (error) {
        toast.error('Failed to load company');
        router.push('/companies');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  const handleTechStackToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const handleAddEmail = () => {
    setFormData((prev) => ({
      ...prev,
      contactSource: {
        ...prev.contactSource,
        emails: [...prev.contactSource.emails, ''],
      },
    }));
  };

  const handleRemoveEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactSource: {
        ...prev.contactSource,
        emails: prev.contactSource.emails.filter((_, i) => i !== index),
      },
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactSource: {
        ...prev.contactSource,
        emails: prev.contactSource.emails.map((email, i) => (i === index ? value : email)),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        techStack: formData.techStack,
      };

      // Add optional fields
      if (formData.tagline) payload.tagline = formData.tagline;
      if (formData.companySize) payload.companySize = formData.companySize;
      if (formData.domain) payload.domain = formData.domain;
      if (formData.sector) payload.sector = formData.sector;
      if (formData.vision) payload.vision = formData.vision;
      if (formData.foundedYear) payload.foundedYear = parseInt(formData.foundedYear);
      if (formData.website) payload.website = formData.website;
      if (formData.logoUrl) payload.logoUrl = formData.logoUrl;
      if (formData.location) payload.location = formData.location;
      if (formData.fundingStage) payload.fundingStage = formData.fundingStage;
      if (formData.acceleratorId) payload.acceleratorId = formData.acceleratorId;

      // Add contact source
      const validEmails = formData.contactSource.emails.filter((email) => email.trim() !== '');
      payload.contactSource = {
        ...formData.contactSource,
        emails: validEmails,
      };

      const response = await fetch(`/api/v1/companies/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Company updated successfully');
        router.push(`/companies/${resolvedParams.id}`);
      } else {
        toast.error(result.error?.message || 'Failed to update company');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/v1/companies/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Company deleted successfully');
        router.push('/companies');
      } else {
        toast.error(result.error?.message || 'Failed to delete company');
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
        <Link href={`/companies/${resolvedParams.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Company
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Edit Company</CardTitle>
              <CardDescription>Update company information</CardDescription>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="One-line description"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
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
                <Label htmlFor="vision">Vision</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Company Details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="acceleratorId">Accelerator</Label>
                  <Select
                    value={formData.acceleratorId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, acceleratorId: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accelerator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {accelerators.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) =>
                      setFormData({ ...formData, companySize: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingStage">Funding Stage</Label>
                  <Select
                    value={formData.fundingStage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fundingStage: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_STAGE_OPTIONS.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    min="1800"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    placeholder="e.g., FinTech, HealthTech"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="e.g., E-commerce, SaaS"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
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

                <div className="space-y-2 sm:col-span-2">
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
            </div>

            {/* Tech Stack */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {TECH_STACK_OPTIONS.map((tech) => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech}
                      checked={formData.techStack.includes(tech)}
                      onCheckedChange={() => handleTechStackToggle(tech)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={tech}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tech}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Source */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>

              <div className="space-y-2">
                <Label>Email Addresses</Label>
                {formData.contactSource.emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="email@example.com"
                      disabled={isSubmitting}
                    />
                    {formData.contactSource.emails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmail(index)}
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
                  onClick={handleAddEmail}
                  disabled={isSubmitting}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Email
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactSource.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSource: {
                          ...formData.contactSource,
                          contactNumber: e.target.value,
                        },
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.contactSource.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSource: {
                          ...formData.contactSource,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.contactSource.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSource: {
                          ...formData.contactSource,
                          twitter: e.target.value,
                        },
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.contactSource.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSource: {
                          ...formData.contactSource,
                          instagram: e.target.value,
                        },
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={formData.contactSource.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSource: {
                          ...formData.contactSource,
                          facebook: e.target.value,
                        },
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>
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
                onClick={() => router.push(`/companies/${resolvedParams.id}`)}
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

