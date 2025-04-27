// src/app/dashboard/page.tsx
'use client';

import { useWebsites } from '@/context/WebsiteContext';
import { useReviews } from '@/context/ReviewContext';
import StatCard from '@/components/ui/cards/StatCard';
import WebsiteCard from '@/components/shared/WebsiteCard';
import ReviewCard from '@/components/shared/ReviewCard';
import { Button } from '@/components/ui/button';
import { Rocket, Globe, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { WebsiteStatus } from '@/types';
import CreateWebsiteModal from '@/components/shared/CreateWebsiteModal';

export default function DashboardPage() {
  const { websites, isLoading: websitesLoading } = useWebsites();
  const { reviews, isLoading: reviewsLoading } = useReviews();

  const activeWebsites = websites.filter(w => w.status === WebsiteStatus.RUNNING).length;
  const recentWebsites = websites.slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  if (websitesLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Websites" 
          value={websites.length} 
          icon={<Globe className="h-6 w-6" />} 
          trend="up" 
          trendValue="12%"
        />
        <StatCard 
          title="Active Websites" 
          value={activeWebsites} 
          icon={<Rocket className="h-6 w-6" />} 
          trend="up" 
          trendValue="5%"
        />
        <StatCard 
          title="Total Reviews" 
          value={reviews.length} 
          icon={<Star className="h-6 w-6" />} 
          trend="up" 
          trendValue="8%"
        />
      </div>

      {/* Recent Websites */}
      <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Websites</h2>
          <div className="flex gap-4">
            <Link 
              href="/dashboard/websites" 
              className="text-sm text-[var(--cosmic-highlight)] hover:underline"
            >
              View All
            </Link>
            <CreateWebsiteModal>
              <Button className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
                <Plus className="mr-2 h-4 w-4" />
                New Website
              </Button>
            </CreateWebsiteModal>
          </div>
        </div>
        {recentWebsites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentWebsites.map(website => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <p>No websites yet. Create your first website to get started!</p>
            <CreateWebsiteModal>
              <Button className="mt-4 bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
                <Plus className="mr-2 h-4 w-4" />
                New Website
              </Button>
            </CreateWebsiteModal>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Reviews</h2>
          <Link 
            href="/dashboard/reviews" 
            className="text-sm text-[var(--cosmic-highlight)] hover:underline"
          >
            View All
          </Link>
        </div>
        {recentReviews.length > 0 ? (
          <div className="space-y-4">
            {recentReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <p>No reviews yet. Your feedback will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}