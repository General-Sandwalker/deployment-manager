// src/components/AppProviders.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { WebsiteProvider } from '@/context/WebsiteContext';
import { ReviewProvider } from '@/context/ReviewContext';
import { ToastProvider } from '@/components/ui/use-toast';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <WebsiteProvider>
        <ReviewProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ReviewProvider>
      </WebsiteProvider>
    </AuthProvider>
  );
}