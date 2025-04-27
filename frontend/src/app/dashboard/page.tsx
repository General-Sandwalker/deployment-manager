// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWebsites } from '@/context/WebsiteContext';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import { WebsiteStatus } from '@/types';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';
import { Plus, Rocket, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WebsiteCard from '@/components/shared/WebsiteCard';
import ReviewCard from '@/components/shared/ReviewCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import CreateWebsiteModal from '@/components/shared/CreateWebsiteModal';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { websites, isLoading: websitesLoading, fetchWebsites } = useWebsites();
  const { reviews, isLoading: reviewsLoading, fetchReviews } = useReviews();
  const [deploymentCount, setDeploymentCount] = useState(0);

  useEffect(() => {
    fetchWebsites();
    fetchReviews();
    
    // This would ideally come from an API endpoint that tracks deployment history
    // For now, we'll just use the website count as a proxy
    setDeploymentCount(websites.length * 2);
  }, [fetchWebsites, fetchReviews, websites.length]);

  // Calculate stats
  const runningWebsites = websites.filter(w => w.status === WebsiteStatus.RUNNING);
  
  if (websitesLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || 'Developer'}</h1>
        <p className="text-[var(--text-secondary)]">
          Here&apos;s what&apos;s happening with your web projects
        </p>
      </div>
      
      {/* Stats Section */}
      <DashboardStats
        websiteCount={websites.length}
        runningCount={runningWebsites.length}
        reviewCount={reviews.length}
        deploymentCount={deploymentCount}
      />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreateWebsiteModal>
          <Card className="cursor-pointer hover:border-[var(--cosmic-highlight)] transition-all">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 mb-4 rounded-full bg-[var(--cosmic-light)] flex items-center justify-center">
                <Plus className="h-6 w-6 text-[var(--cosmic-highlight)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">New Website</h3>
              <p className="text-sm text-center text-[var(--text-secondary)]">
                Deploy a new project from your Git repository
              </p>
            </CardContent>
          </Card>
        </CreateWebsiteModal>
        
        <Link href="/dashboard/websites">
          <Card className="cursor-pointer hover:border-[var(--cosmic-highlight)] transition-all h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 mb-4 rounded-full bg-[var(--cosmic-light)] flex items-center justify-center">
                <Rocket className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Websites</h3>
              <p className="text-sm text-center text-[var(--text-secondary)]">
                View and manage your deployed websites
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/reviews">
          <Card className="cursor-pointer hover:border-[var(--cosmic-highlight)] transition-all h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 mb-4 rounded-full bg-[var(--cosmic-light)] flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Review</h3>
              <p className="text-sm text-center text-[var(--text-secondary)]">
                Share your feedback on websites
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Recent Websites */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Websites</CardTitle>
              <Link href="/dashboard/websites">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {websites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {websites.slice(0, 2).map(website => (
                  <WebsiteCard key={website.id} website={website} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>You haven&apos;t created any websites yet.</p>
                <CreateWebsiteModal>
                  <Button 
                    className="mt-4 bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Website
                  </Button>
                </CreateWebsiteModal>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Reviews */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Reviews</CardTitle>
              <Link href="/dashboard/reviews">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 2).map(review => (
                  <ReviewCard key={review.id} review={review} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>You haven&apos;t created any reviews yet.</p>
                <Link href="/dashboard/reviews">
                  <Button 
                    className="mt-4 bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Review
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}