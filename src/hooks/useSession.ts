'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@/types';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return {
    user,
    session,
    loading,
  };
}

