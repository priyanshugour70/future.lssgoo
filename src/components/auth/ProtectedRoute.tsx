'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Role } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: Role;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      } else if (requireRole && user?.role !== requireRole) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, requireAuth, requireRole, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireRole && user?.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}

