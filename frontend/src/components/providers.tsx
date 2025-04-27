// src/components/providers.tsx
'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WebsiteProvider } from '@/context/WebsiteContext';
import { ReviewProvider } from '@/context/ReviewContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebsiteProvider>
        <ReviewProvider>
          {children}
        </ReviewProvider>
      </WebsiteProvider>
    </AuthProvider>
  );
}