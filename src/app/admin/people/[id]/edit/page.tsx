'use client';
import { use, useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { redirect } from 'next/navigation';

interface Company { id: string; name: string; }
interface PersonData { fullName: string; passion: string; bio: string; profileUrl: string; photoUrl: string; companyId: string; notes: string[]; contact: { linkedin: string; instagram: string; twitter: string; email: string; phoneNumber: string; }; }

export default function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<PersonData>({
    fullName: '', passion: '', bio: '', profileUrl: '', photoUrl: '', companyId: '', notes: [''],
    contact: { linkedin: '', instagram: '', twitter: '', email: '', phoneNumber: '' },
  });

  if (!authLoading && (!user || user.role !== 'ADMIN')) redirect('/people');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personRes, companiesRes] = await Promise.all([
          fetch(`/api/v1/people/${resolvedParams.id}`),
          fetch('/api/v1/companies?limit=100'),
        ]);
        const personResult = await personRes.json();
        const companiesResult = await companiesRes.json();
        if (personResult.success) {
          const d = personResult.data;
          setFormData({
            fullName: d.fullName, passion: d.passion || '', bio: d.bio || '', profileUrl: d.profileUrl || '',
            photoUrl: d.photoUrl || '', companyId: d.companyId || '', notes: d.notes?.length > 0 ? d.notes : [''],
            contact: { linkedin: d.contact?.linkedin || '', instagram: d.contact?.instagram || '',
              twitter: d.contact?.twitter || '', email: d.contact?.email || '', phoneNumber: d.contact?.phoneNumber || '' },
          });
        } else { toast.error('Person not found'); router.push('/people'); }
        if (companiesResult.success) setCompanies(companiesResult.data);
      } catch (error) { toast.error('Failed to load'); router.push('/people'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { fullName: formData.fullName, notes: formData.notes.filter(n => n.trim()) };
      if (formData.passion) payload.passion = formData.passion;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.profileUrl) payload.profileUrl = formData.profileUrl;
      if (formData.photoUrl) payload.photoUrl = formData.photoUrl;
      if (formData.companyId) payload.companyId = formData.companyId;
      payload.contact = formData.contact;

      const response = await fetch(`/api/v1/people/${resolvedParams.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) { toast.success('Updated'); router.push(`/people/${resolvedParams.id}`); }
      else toast.error(result.error?.message || 'Failed');
    } catch (error: any) { toast.error(error.message || 'Error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this person? Cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/people/${resolvedParams.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) { toast.success('Deleted'); router.push('/people'); }
      else toast.error(result.error?.message || 'Failed');
    } catch (error: any) { toast.error(error.message || 'Error'); }
    finally { setIsDeleting(false); }
  };

  if (authLoading || loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6"><Link href={`/people/${resolvedParams.id}`}><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
      <Card><CardHeader><div className="flex items-start justify-between"><div><CardTitle>Edit Person</CardTitle><CardDescription>Update person information</CardDescription></div>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" />Delete</>}
            </Button></div></CardHeader>
        <CardContent><form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4"><h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="space-y-2"><Label>Full Name *</Label><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label>Passionate About</Label><Input value={formData.passion} onChange={(e) => setFormData({ ...formData, passion: e.target.value })} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} disabled={isSubmitting} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Company</Label>
                  <Select value={formData.companyId} onValueChange={(v) => setFormData({ ...formData, companyId: v })} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div className="space-y-2"><Label>Profile URL</Label><Input type="url" value={formData.profileUrl} onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })} disabled={isSubmitting} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Photo URL</Label><Input type="url" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} disabled={isSubmitting} /></div>
              </div></div>
            <div className="space-y-4"><h3 className="text-sm font-semibold">Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={formData.contact.phoneNumber} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phoneNumber: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>LinkedIn</Label><Input type="url" value={formData.contact.linkedin} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, linkedin: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Twitter</Label><Input type="url" value={formData.contact.twitter} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, twitter: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Instagram</Label><Input type="url" value={formData.contact.instagram} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, instagram: e.target.value }})} disabled={isSubmitting} /></div>
              </div></div>
            <div className="space-y-4"><h3 className="text-sm font-semibold">Notes & Links</h3>
              {formData.notes.map((note, i) => <div key={i} className="flex gap-2"><Input value={note} onChange={(e) => { const n = [...formData.notes]; n[i] = e.target.value; setFormData({ ...formData, notes: n }); }} placeholder="Note..." disabled={isSubmitting} />
                {formData.notes.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, notes: formData.notes.filter((_, idx) => idx !== i) })} disabled={isSubmitting}><X className="h-4 w-4" /></Button>}</div>)}
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, notes: [...formData.notes, ''] })} disabled={isSubmitting}><Plus className="mr-2 h-4 w-4" />Add Note</Button>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save</>}</Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/people/${resolvedParams.id}`)} disabled={isSubmitting}>Cancel</Button>
            </div>
          </form></CardContent>
      </Card>
    </div>
  );
}
