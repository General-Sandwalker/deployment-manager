// src/components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const publicRoutes = ['/', '/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If not authenticated and trying to access a protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push('/login');
      return;
    }

    // If authenticated but trying to access auth pages
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
      return;
    }

    // Special case: if authenticated and on landing page, allow but could redirect to dashboard
    if (user && pathname === '/') {
      // Optional: uncomment if you want to redirect to dashboard when logged in
      // router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--cosmic-highlight)]"></div>
      </div>
    );
  }

  return <>{children}</>;
}