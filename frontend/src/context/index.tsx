'use client';

import { AuthProvider } from './AuthContext';
import { WebsiteProvider } from './WebsiteContext';
import { ReviewProvider } from './ReviewContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
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