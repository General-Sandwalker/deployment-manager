// src/context/WebsiteContext.tsx
'use client';

import { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Website, WebsiteStatus, WebsiteCreate, WebsiteUpdate } from '@/types';
import { useAuth } from './AuthContext';
import {
  createWebsite as createWebsiteService,
  getUserWebsites,
  getWebsite as getWebsiteService,
  updateWebsite as updateWebsiteService,
  deleteWebsite as deleteWebsiteService,
  startWebsite as startWebsiteService,
  stopWebsite as stopWebsiteService,
  redeployWebsite as redeployWebsiteService,
  adminGetAllWebsites,
  adminUpdateWebsite as adminUpdateWebsiteService,
  adminDeleteWebsite as adminDeleteWebsiteService,
  adminStartWebsite as adminStartWebsiteService,
  adminStopWebsite as adminStopWebsiteService,
} from '@/services/websites';

interface WebsiteContextProps {
  websites: Website[];
  currentWebsite: Website | null;
  isLoading: boolean;
  error: string | null;
  fetchWebsites: () => Promise<void>;
  fetchAllWebsites: () => Promise<void>;
  getWebsite: (id: number) => Promise<Website>;
  createWebsite: (name: string, gitRepo: string) => Promise<Website>;
  updateWebsite: (id: number, updates: WebsiteUpdate) => Promise<Website>;
  deleteWebsite: (id: number) => Promise<void>;
  startWebsite: (id: number) => Promise<void>;
  stopWebsite: (id: number) => Promise<void>;
  redeployWebsite: (id: number) => Promise<void>;
  setCurrentWebsite: (website: Website | null) => void;
  updateWebsiteStatus: (id: number, status: WebsiteStatus) => void;
  adminUpdateWebsite: (id: number, updates: WebsiteUpdate) => Promise<Website>;
  adminDeleteWebsite: (id: number) => Promise<void>;
  adminStartWebsite: (id: number) => Promise<void>;
  adminStopWebsite: (id: number) => Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextProps>({
  websites: [],
  currentWebsite: null,
  isLoading: false,
  error: null,
  fetchWebsites: async () => {},
  fetchAllWebsites: async () => {},
  getWebsite: async () => ({ id: 0 } as Website),
  createWebsite: async () => ({ id: 0 } as Website),
  updateWebsite: async () => ({ id: 0 } as Website),
  deleteWebsite: async () => {},
  startWebsite: async () => {},
  stopWebsite: async () => {},
  redeployWebsite: async () => {},
  setCurrentWebsite: () => {},
  updateWebsiteStatus: () => {},
  adminUpdateWebsite: async () => ({ id: 0 } as Website),
  adminDeleteWebsite: async () => {},
  adminStartWebsite: async () => {},
  adminStopWebsite: async () => {},
});

export const useWebsites = () => useContext(WebsiteContext);

export const WebsiteProvider = ({ children }: { children: ReactNode }) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAdmin } = useAuth();

  const fetchWebsites = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserWebsites(token);
      setWebsites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch websites');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAllWebsites = useCallback(async () => {
    if (!token || !isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminGetAllWebsites(token);
      setWebsites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all websites');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin]);

  const getWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      return await getWebsiteService(id, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createWebsite = useCallback(async (name: string, gitRepo: string) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const websiteData: WebsiteCreate = { name, git_repo: gitRepo };
      const website = await createWebsiteService(websiteData, token);
      setWebsites(prev => [...prev, website]);
      return website;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateWebsite = useCallback(async (id: number, updates: WebsiteUpdate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const website = await updateWebsiteService(id, updates, token);
      setWebsites(prev => prev.map(w => w.id === id ? website : w));
      if (currentWebsite?.id === id) {
        setCurrentWebsite(website);
      }
      return website;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentWebsite]);

  const updateWebsiteStatus = useCallback((id: number, status: WebsiteStatus) => {
    setWebsites(prev => {
      return prev.map(website => {
        if (website.id === id) {
          return { ...website, status };
        }
        return website;
      });
    });
    
    if (currentWebsite?.id === id) {
      setCurrentWebsite(prev => {
        if (prev) {
          return { ...prev, status };
        }
        return prev;
      });
    }
  }, [currentWebsite]);

  const deleteWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      await deleteWebsiteService(id, token);
      setWebsites(prev => prev.filter(w => w.id !== id));
      if (currentWebsite?.id === id) {
        setCurrentWebsite(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentWebsite]);

  const startWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const website = await startWebsiteService(id, token);
      updateWebsiteStatus(id, website.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, updateWebsiteStatus]);

  const stopWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const website = await stopWebsiteService(id, token);
      updateWebsiteStatus(id, website.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, updateWebsiteStatus]);

  const redeployWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const website = await redeployWebsiteService(id, token);
      updateWebsiteStatus(id, website.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeploy website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, updateWebsiteStatus]);

  const adminUpdateWebsite = useCallback(async (id: number, updates: WebsiteUpdate) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      const website = await adminUpdateWebsiteService(id, updates, token);
      setWebsites(prev => prev.map(w => w.id === id ? website : w));
      if (currentWebsite?.id === id) {
        setCurrentWebsite(website);
      }
      return website;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, currentWebsite]);

  const adminDeleteWebsite = useCallback(async (id: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      await adminDeleteWebsiteService(id, token);
      setWebsites(prev => prev.filter(w => w.id !== id));
      if (currentWebsite?.id === id) {
        setCurrentWebsite(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, currentWebsite]);

  const adminStartWebsite = useCallback(async (id: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      const website = await adminStartWebsiteService(id, token);
      updateWebsiteStatus(id, website.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, updateWebsiteStatus]);

  const adminStopWebsite = useCallback(async (id: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      const website = await adminStopWebsiteService(id, token);
      updateWebsiteStatus(id, website.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, updateWebsiteStatus]);

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        currentWebsite,
        isLoading,
        error,
        fetchWebsites,
        fetchAllWebsites,
        getWebsite,
        createWebsite,
        updateWebsite,
        deleteWebsite,
        startWebsite,
        stopWebsite,
        redeployWebsite,
        setCurrentWebsite,
        updateWebsiteStatus,
        adminUpdateWebsite,
        adminDeleteWebsite,
        adminStartWebsite,
        adminStopWebsite,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
};