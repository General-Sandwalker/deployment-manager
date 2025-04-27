'use client';
import { Website } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useWebsites } from '@/context/WebsiteContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WebsiteCardProps {
  website: Website;
  className?: string;
  isAdminView?: boolean;
}

export default function WebsiteCard({ website, className, isAdminView = false }: WebsiteCardProps) {
  const { startWebsite, stopWebsite, redeployWebsite, deleteWebsite, adminDeleteWebsite } = useWebsites();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<'start' | 'stop' | 'redeploy' | 'delete' | null>(null);
  
  const isCurrentUserWebsite = user?.id === website.user_id;
  const isAdmin = user?.is_admin || false;

  const handleAction = async (action: () => Promise<void>, type: 'start' | 'stop' | 'redeploy' | 'delete') => {
    setIsLoading(type);
    try {
      await action();
    } finally {
      setIsLoading(null);
    }
  };

  // Check if the current user has the right to manage this website
  const canManageWebsite = isAdmin || isCurrentUserWebsite;
  
  // Admin view uses adminDeleteWebsite, user view uses regular deleteWebsite
  const handleDelete = () => {
    if (isAdmin && isAdminView) {
      return handleAction(() => adminDeleteWebsite(website.id), 'delete');
    } else if (isCurrentUserWebsite) {
      return handleAction(() => deleteWebsite(website.id), 'delete');
    }
  };

  return (
    <div className={cn(
      "bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent hover:border-cosmic-highlight transition-colors",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white">{website.name}</h3>
          <p className="text-cosmic-highlight text-sm mt-1">{website.git_repo}</p>
          <div className="mt-3 flex items-center space-x-3">
            <StatusBadge status={website.status} />
            <span className="text-sm text-cosmic-highlight">
              Port: {website.port}
            </span>
          </div>
          {website.owner && isAdminView && (
            <p className="text-sm text-cosmic-highlight mt-2">
              Owner: {website.owner.full_name || website.owner.email}
            </p>
          )}
        </div>
      </div>

      {canManageWebsite && (
        <div className="mt-6 flex flex-wrap gap-2">
          {website.status === 'stopped' ? (
            <Button
              size="sm"
              onClick={() => handleAction(() => startWebsite(website.id), 'start')}
              disabled={isLoading !== null}
              className="bg-green-600 hover:bg-green-600/90"
            >
              {isLoading === 'start' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleAction(() => stopWebsite(website.id), 'stop')}
              disabled={isLoading !== null}
              className="bg-red-600 hover:bg-red-600/90"
            >
              {isLoading === 'stop' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="mr-2 h-4 w-4" />
              )}
              Stop
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={() => handleAction(() => redeployWebsite(website.id), 'redeploy')}
            disabled={isLoading !== null}
            className="bg-blue-600 hover:bg-blue-600/90"
          >
            {isLoading === 'redeploy' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Redeploy
          </Button>
          
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={isLoading !== null || (!isCurrentUserWebsite && !isAdmin)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600/10"
          >
            {isLoading === 'delete' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}