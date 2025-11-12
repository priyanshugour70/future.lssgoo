'use client';
import { useEffect, useState } from 'react';
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
import { ArrowLeft, Loader2, Plus, Save, X } from 'lucide-react';
import { redirect } from 'next/navigation';

interface Company { id: string; name: string; }

export default function NewPersonPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    fullName: '', passion: '', bio: '', profileUrl: '', photoUrl: '', companyId: '',
    contact: { linkedin: '', instagram: '', twitter: '', email: '', phoneNumber: '' },
  });

  if (!authLoading && (!user || user.role !== 'ADMIN')) redirect('/people');

  useEffect(() => {
    fetch('/api/v1/companies?limit=100').then(r => r.json()).then(result => {
      if (result.success) setCompanies(result.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { fullName: formData.fullName, notes: notes.filter(n => n.trim()) };
      if (formData.passion) payload.passion = formData.passion;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.profileUrl) payload.profileUrl = formData.profileUrl;
      if (formData.photoUrl) payload.photoUrl = formData.photoUrl;
      if (formData.companyId) payload.companyId = formData.companyId;
      if (formData.contact.email || formData.contact.phoneNumber || formData.contact.linkedin || 
          formData.contact.instagram || formData.contact.twitter) payload.contact = formData.contact;

      const response = await fetch('/api/v1/people', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) { toast.success('Person created'); router.push(`/people/${result.data.id}`); }
      else toast.error(result.error?.message || 'Failed to create');
    } catch (error: any) { toast.error(error.message || 'Error occurred'); }
    finally { setIsSubmitting(false); }
  };

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6"><Link href="/people"><ArrowLeft className="mr-2 h-4 w-4" />Back to People</Link></Button>
      <Card><CardHeader><CardTitle>Add New Person</CardTitle><CardDescription>Add a new person to the platform</CardDescription></CardHeader>
        <CardContent><form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4"><h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="passion">Passionate About</Label>
                <Input id="passion" placeholder="Tech, AI, Innovation..." value={formData.passion} onChange={(e) => setFormData({ ...formData, passion: e.target.value })} disabled={isSubmitting} /></div>
              <div className="space-y-2"><Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} disabled={isSubmitting} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="companyId">Company</Label>
                  <Select value={formData.companyId} onValueChange={(v) => setFormData({ ...formData, companyId: v })} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent><SelectItem value="">None</SelectItem>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div className="space-y-2"><Label htmlFor="profileUrl">Profile URL</Label>
                  <Input id="profileUrl" type="url" value={formData.profileUrl} onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })} disabled={isSubmitting} /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="photoUrl">Photo URL</Label>
                  <Input id="photoUrl" type="url" value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} disabled={isSubmitting} /></div>
              </div></div>
            <div className="space-y-4"><h3 className="text-sm font-semibold">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={formData.contact.phoneNumber} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phoneNumber: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>LinkedIn</Label><Input type="url" value={formData.contact.linkedin} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, linkedin: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Twitter</Label><Input type="url" value={formData.contact.twitter} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, twitter: e.target.value }})} disabled={isSubmitting} /></div>
                <div className="space-y-2"><Label>Instagram</Label><Input type="url" value={formData.contact.instagram} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, instagram: e.target.value }})} disabled={isSubmitting} /></div>
              </div></div>
            <div className="space-y-4"><h3 className="text-sm font-semibold">Notes & Links</h3>
              {notes.map((note, i) => <div key={i} className="flex gap-2"><Input value={note} onChange={(e) => { const n = [...notes]; n[i] = e.target.value; setNotes(n); }} placeholder="Note or link..." disabled={isSubmitting} />
                {notes.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setNotes(notes.filter((_, idx) => idx !== i))} disabled={isSubmitting}><X className="h-4 w-4" /></Button>}</div>)}
              <Button type="button" variant="outline" size="sm" onClick={() => setNotes([...notes, ''])} disabled={isSubmitting}><Plus className="mr-2 h-4 w-4" />Add Note</Button>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Save className="mr-2 h-4 w-4" />Create Person</>}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/people')} disabled={isSubmitting}>Cancel</Button>
            </div>
          </form></CardContent>
      </Card>
    </div>
  );
}
