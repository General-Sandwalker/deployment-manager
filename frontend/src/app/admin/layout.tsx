'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/shared/Navbar';
import { ToastProvider } from '@/components/ui/use-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard adminOnly={true}>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--cosmic-dark)]">
          <Navbar />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 ml-0 md:ml-64 pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}