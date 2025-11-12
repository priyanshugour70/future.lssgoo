'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  onClick?: () => void;
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <Button onClick={onClick} className="gap-2">
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}

