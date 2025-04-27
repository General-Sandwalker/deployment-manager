/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useWebsites } from '@/context/WebsiteContext';
import WebsiteCard from '@/components/shared/WebsiteCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Website, WebsiteStatus } from '@/types';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WebsitesAdminPage() {
  const { websites, isLoading, fetchAllWebsites, adminDeleteWebsite } = useWebsites();
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchAllWebsites();
  }, [fetchAllWebsites]);

  useEffect(() => {
    if (websites.length > 0) {
      let filtered = [...websites];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(website => 
          website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          website.git_repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (website.owner?.email && website.owner.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter(website => 
          website.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      setFilteredWebsites(filtered);
    } else {
      setFilteredWebsites([]);
    }
  }, [websites, searchTerm, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Websites</h1>
        <Button className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
          <Plus className="mr-2 h-4 w-4" />
          New Website
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <Input
            placeholder="Search by name, repository or owner email..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            onClick={() => handleStatusFilter(WebsiteStatus.RUNNING)}
            className={`cursor-pointer ${statusFilter === WebsiteStatus.RUNNING ? 'bg-green-500' : 'bg-[var(--cosmic-light)] hover:bg-green-500/30'}`}
          >
            Running
          </Badge>
          <Badge 
            onClick={() => handleStatusFilter(WebsiteStatus.STOPPED)}
            className={`cursor-pointer ${statusFilter === WebsiteStatus.STOPPED ? 'bg-red-500' : 'bg-[var(--cosmic-light)] hover:bg-red-500/30'}`}
          >
            Stopped
          </Badge>
          <Badge 
            onClick={() => handleStatusFilter(WebsiteStatus.DEPLOYING)}
            className={`cursor-pointer ${statusFilter === WebsiteStatus.DEPLOYING ? 'bg-yellow-500' : 'bg-[var(--cosmic-light)] hover:bg-yellow-500/30'}`}
          >
            Deploying
          </Badge>
          <Badge 
            onClick={() => handleStatusFilter(WebsiteStatus.ERROR)}
            className={`cursor-pointer ${statusFilter === WebsiteStatus.ERROR ? 'bg-red-500' : 'bg-[var(--cosmic-light)] hover:bg-red-500/30'}`}
          >
            Error
          </Badge>
          {statusFilter && (
            <Badge 
              onClick={() => setStatusFilter(null)}
              className="cursor-pointer bg-[var(--cosmic-accent)] hover:bg-[var(--cosmic-accent)]/80"
            >
              Clear Filters
            </Badge>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-[var(--text-secondary)]">
        {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''} found
      </div>

      {/* Websites Grid */}
      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map(website => (
            <WebsiteCard 
              key={website.id} 
              website={website} 
              isAdminView={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p>No websites found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}