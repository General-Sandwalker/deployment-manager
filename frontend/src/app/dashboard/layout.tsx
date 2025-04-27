// src/app/dashboard/layout.tsx
'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/shared/Navbar';
import { ToastProvider } from '@/components/ui/use-toast';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--cosmic-dark)]">
          <Navbar />
          <div className="flex">
            <DashboardSidebar />
            <main className="flex-1 ml-0 md:ml-64 pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}