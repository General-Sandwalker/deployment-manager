// src/context/WebsiteContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Website, WebsiteCreate, WebsiteUpdate, WebsiteStatus } from '@/types';
import { 
  createWebsite as createWebsiteService,
  getUserWebsites,
  getWebsite as getWebsiteService,
  updateWebsite as updateWebsiteService,
  deleteWebsite as deleteWebsiteService,
  startWebsite as startWebsiteService,
  stopWebsite as stopWebsiteService,
  redeployWebsite as redeployWebsiteService,
  adminDeleteWebsite as adminDeleteWebsiteService,
  getAllWebsites
} from '@/services/websites';
import { useAuth } from './AuthContext';

interface WebsiteContextType {
  websites: Website[];
  currentWebsite: Website | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
  createWebsite: (data: WebsiteCreate) => Promise<Website>;
  fetchWebsites: () => Promise<void>;
  fetchAllWebsites: () => Promise<void>;
  getWebsite: (id: number) => Promise<Website>;
  updateWebsite: (id: number, data: WebsiteUpdate) => Promise<Website>;
  deleteWebsite: (id: number) => Promise<void>;
  adminDeleteWebsite: (id: number) => Promise<void>;
  startWebsite: (id: number) => Promise<void>;
  stopWebsite: (id: number) => Promise<void>;
  redeployWebsite: (id: number) => Promise<void>;
  setPagination: (skip: number, limit: number) => void;
  updateWebsiteStatus: (id: number, status: WebsiteStatus) => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider = ({ children }: { children: ReactNode }) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 10,
    total: 0
  });
  
  const { token, user } = useAuth();
  const isAdmin = user?.is_admin || false;

  const setPagination = useCallback((skip: number, limit: number) => {
    setPaginationState(prev => ({ ...prev, skip, limit }));
  }, []);

  const updateWebsiteStatus = useCallback((id: number, status: WebsiteStatus) => {
    setWebsites(prev => prev.map(w => 
      w.id === id ? { ...w, status } : w
    ));
    if (currentWebsite?.id === id) {
      setCurrentWebsite(prev => prev ? { ...prev, status } : null);
    }
  }, [currentWebsite]);

  const fetchWebsites = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserWebsites(token, pagination.skip, pagination.limit);
      setWebsites(data);
      setPaginationState(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch websites');
    } finally {
      setIsLoading(false);
    }
  }, [token, pagination.skip, pagination.limit]);

  const fetchAllWebsites = useCallback(async () => {
    if (!token || !isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllWebsites(token, pagination.skip, pagination.limit);
      setWebsites(data);
      setPaginationState(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all websites');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, pagination.skip, pagination.limit]);

  const getWebsite = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const website = await getWebsiteService(id, token);
      setCurrentWebsite(website);
      return website;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createWebsite = useCallback(async (data: WebsiteCreate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const newWebsite = await createWebsiteService(data, token);
      setWebsites(prev => [...prev, newWebsite]);
      return newWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateWebsite = useCallback(async (id: number, data: WebsiteUpdate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const updatedWebsite = await updateWebsiteService(id, data, token);
      setWebsites(prev => prev.map(w => w.id === id ? updatedWebsite : w));
      if (currentWebsite?.id === id) {
        setCurrentWebsite(updatedWebsite);
      }
      return updatedWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update website');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentWebsite]);

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

  // WebSocket for real-time updates
  useEffect(() => {
    if (!token) return;
    
    const ws = new WebSocket(`wss://your-api/websites/updates?token=${token}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'STATUS_UPDATE') {
        updateWebsiteStatus(data.websiteId, data.status);
      }
    };

    return () => ws.close();
  }, [token, updateWebsiteStatus]);

  return (
    <WebsiteContext.Provider value={{
      websites,
      currentWebsite,
      isLoading,
      error,
      isAdmin,
      pagination,
      createWebsite,
      fetchWebsites,
      fetchAllWebsites,
      getWebsite,
      updateWebsite,
      deleteWebsite,
      adminDeleteWebsite,
      startWebsite,
      stopWebsite,
      redeployWebsite,
      setPagination,
      updateWebsiteStatus
    }}>
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsites = () => {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsites must be used within a WebsiteProvider');
  }
  return context;
};