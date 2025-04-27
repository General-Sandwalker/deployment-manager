// src/components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow the auth check to complete
    if (isLoading) return;

    if (!token) {
      // Redirect to login if no token
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (adminOnly && !user?.is_admin) {
      // If admin route but user is not admin
      router.push('/dashboard');
    }
  }, [token, isLoading, router, pathname, adminOnly, user]);

  // Show loading state while checking authentication
  if (isLoading || !token || (adminOnly && !user?.is_admin)) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--cosmic-dark)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}