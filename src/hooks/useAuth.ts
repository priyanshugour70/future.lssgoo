'use client';

import { useEffect, useState } from 'react';
import { User, Session, SignInRequest, SignUpRequest } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const response = await fetch('/api/v1/auth/session');
        const result = await response.json();

        if (result.success && result.data) {
          setUser(result.data.user);
          setSession(result.data.session);
        }
      } catch (error) {
        console.error('Get session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Auto-refresh session every 5 minutes
    const interval = setInterval(() => {
      getSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const signIn = async (credentials: SignInRequest) => {
    try {
      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Sign in failed');
        return { success: false, error: result.error };
      }

      setUser(result.data.user);
      setSession(result.data.session);
      toast.success('Signed in successfully!');
      return { success: true, data: result.data };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return { success: false, error: { code: 'ERROR', message: error.message } };
    }
  };

  const signUp = async (credentials: SignUpRequest) => {
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Sign up failed');
        return { success: false, error: result.error };
      }

      setUser(result.data.user);
      setSession(result.data.session);
      toast.success('Account created successfully!');
      return { success: true, data: result.data };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return { success: false, error: { code: 'ERROR', message: error.message } };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/v1/auth/signout', {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        toast.error('Sign out failed');
        return { success: false };
      }

      setUser(null);
      setSession(null);
      toast.success('Signed out successfully!');
      // Reload page to clear all state
      window.location.href = '/';
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return { success: false };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Redirect to NextAuth Google provider
      window.location.href = '/api/auth/signin/google?callbackUrl=/';
    } catch (error: any) {
      toast.error(error.message || 'OAuth failed');
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Update failed');
        return { success: false, error: result.error };
      }

      setUser(result.data);
      toast.success('Profile updated successfully!');
      return { success: true, data: result.data };
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return { success: false, error: { code: 'ERROR', message: error.message } };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };
}
