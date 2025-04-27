// src/app/dashboard/layout.tsx
'use client';

import { DashboardSidebar } from '@/components/shared/DashboardSidebar';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="text-[var(--cosmic-highlight)] h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen in the useEffect
  }

  return (
    <div className="min-h-screen bg-[var(--cosmic-dark)] text-[var(--text-primary)]">
      <Navbar />
      <div className="flex pt-16">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed z-20 left-4 top-20 md:hidden"
            variant="ghost"
            size="sm"
          >
            <Menu className="h-6 w-6 text-[var(--cosmic-highlight)]" />
          </Button>
        )}

        {/* Sidebar */}
        <div
          className={`fixed md:static z-10 w-64 h-[calc(100vh-4rem)] transition-all duration-300 ${
            sidebarOpen ? 'left-0' : '-left-64 md:left-0'
          }`}
        >
          <DashboardSidebar isAdmin={user.is_admin} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-0 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          className={`flex-1 p-4 md:p-8 transition-all ${
            isMobile ? 'ml-0' : 'ml-0 md:ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}