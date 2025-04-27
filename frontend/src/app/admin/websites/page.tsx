/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useWebsites } from '@/context/WebsiteContext';
import WebsiteCard from '@/components/shared/WebsiteCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Website, WebsiteStatus } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminWebsitesPage() {
  const { websites, isLoading, fetchAllWebsites } = useWebsites();
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const loadWebsites = async () => {
      await fetchAllWebsites();
    };
    loadWebsites();
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
      
      // Apply expired filter
      if (!showExpired) {
        filtered = filtered.filter(website => !website.expires_at || new Date(website.expires_at) > new Date());
      }
      
      setFilteredWebsites(filtered);
    } else {
      setFilteredWebsites([]);
    }
  }, [websites, searchTerm, statusFilter, showExpired]);

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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExpired(!showExpired)}
            className={`${showExpired ? 'bg-cosmic-highlight text-white' : 'border-cosmic-accent'}`}
          >
            {showExpired ? 'Hide Expired' : 'Show Expired'}
          </Button>
        </div>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-[var(--cosmic-accent)] text-[var(--text-primary)]">
              <Filter className="mr-2 h-4 w-4" />
              Status: {statusFilter || 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[var(--cosmic-blue)] border-[var(--cosmic-accent)]">
            <DropdownMenuRadioGroup value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
              <DropdownMenuRadioItem value="" className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">
                All Statuses
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={WebsiteStatus.RUNNING} className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">
                Running
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={WebsiteStatus.STOPPED} className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">
                Stopped
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={WebsiteStatus.DEPLOYING} className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">
                Deploying
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={WebsiteStatus.ERROR} className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">
                Error
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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