'use client';
import { Website, WebsiteStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, StopCircle, RefreshCw, Trash2, Loader2, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useWebsites } from '@/context/WebsiteContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface WebsiteCardProps {
  website: Website;
  className?: string;
  isAdminView?: boolean;
}

export default function WebsiteCard({ website, className, isAdminView = false }: WebsiteCardProps) {
  const { 
    startWebsite, 
    stopWebsite, 
    redeployWebsite, 
    deleteWebsite, 
    adminDeleteWebsite,
    adminStartWebsite,
    adminStopWebsite
  } = useWebsites();
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<'start' | 'stop' | 'redeploy' | 'delete' | null>(null);
  
  const isCurrentUserWebsite = user?.id === website.user_id;
  const isAdmin = user?.is_admin || false;

  const handleAction = async (action: () => Promise<void>, type: 'start' | 'stop' | 'redeploy' | 'delete') => {
    setIsLoading(type);
    try {
      await action();
      toast({
        title: "Success",
        description: `Website ${type === 'delete' ? 'deleted' : type === 'start' ? 'started' : type === 'stop' ? 'stopped' : 'redeployed'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Check if the current user has the right to manage this website
  const canManageWebsite = isAdmin || isCurrentUserWebsite;
  
  // Choose the appropriate action functions based on admin status
  const handleStart = () => {
    if (isAdmin && isAdminView) {
      handleAction(() => adminStartWebsite(website.id), 'start');
    } else if (canManageWebsite) {
      handleAction(() => startWebsite(website.id), 'start');
    }
  };
  
  const handleStop = () => {
    if (isAdmin && isAdminView) {
      handleAction(() => adminStopWebsite(website.id), 'stop');
    } else if (canManageWebsite) {
      handleAction(() => stopWebsite(website.id), 'stop');
    }
  };
  
  const handleRedeploy = () => {
    if (canManageWebsite) {
      handleAction(() => redeployWebsite(website.id), 'redeploy');
    }
  };
  
  // Admin view uses adminDeleteWebsite, user view uses regular deleteWebsite
  const handleDelete = () => {
    if (isAdmin && isAdminView) {
      handleAction(() => adminDeleteWebsite(website.id), 'delete');
    } else if (canManageWebsite) {
      handleAction(() => deleteWebsite(website.id), 'delete');
    }
  };

  const getWebsiteUrl = () => {
    if (website.custom_domain) {
      return `https://${website.custom_domain}`;
    }
    return `http://localhost:${website.port}`;
  };

  return (
    <div className={cn(
      "bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent hover:border-cosmic-highlight transition-colors",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white">{website.name}</h3>
          <p className="text-cosmic-highlight text-sm mt-1 truncate max-w-[250px]">{website.git_repo}</p>
          <div className="mt-3 flex items-center space-x-3">
            <StatusBadge status={website.status} />
            {website.port && (
              <span className="text-sm text-cosmic-highlight">
                Port: {website.port}
              </span>
            )}
          </div>
          {website.created_at && (
            <p className="text-xs text-cosmic-highlight mt-2">
              Created: {formatDate(website.created_at)}
            </p>
          )}
          {website.owner && isAdminView && (
            <p className="text-sm text-cosmic-highlight mt-2">
              Owner: {website.owner.full_name || website.owner.email}
            </p>
          )}
        </div>
        
        {website.status === WebsiteStatus.RUNNING && (
          <Button variant="outline" size="sm" asChild className="border-cosmic-highlight text-cosmic-highlight hover:bg-cosmic-highlight/10">
            <Link href={getWebsiteUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> 
              Visit
            </Link>
          </Button>
        )}
      </div>

      {canManageWebsite && (
        <div className="mt-6 flex flex-wrap gap-2">
          {website.status === WebsiteStatus.STOPPED ? (
            <Button
              size="sm"
              onClick={handleStart}
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
              onClick={handleStop}
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
            onClick={handleRedeploy}
            disabled={isLoading !== null || website.status === WebsiteStatus.STOPPED}
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
            disabled={isLoading !== null}
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
