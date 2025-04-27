'use client';

import { useAuth } from '@/context/AuthContext';
import { useWebsites } from '@/context/WebsiteContext';
import { useReviews } from '@/context/ReviewContext';
import { useEffect, useState } from 'react';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import { Users, Globe, Star, Server } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getUsers } from '@/services/users';

export default function AdminDashboardPage() {
  const { token, isLoading: authLoading } = useAuth();
  const { websites, isLoading: websitesLoading, fetchAllWebsites } = useWebsites();
  const { reviews, isLoading: reviewsLoading, fetchAllReviews } = useReviews();
  const [users, setUsers] = useState<unknown[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        if (token) {
          // Load all websites (not just user's own)
          await fetchAllWebsites();
          
          // Load all reviews
          await fetchAllReviews();
          
          // Load all users
          const userData = await getUsers(token);
          setUsers(userData);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    loadAdminData();
  }, [token, fetchAllWebsites, fetchAllReviews]);

  const isLoading = authLoading || websitesLoading || reviewsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard 
          title="Total Users" 
          value={users.length} 
          icon={<Users className="h-6 w-6" />} 
          trend="up" 
          change="+12% from last month" 
        />
        <AdminStatsCard 
          title="Total Websites" 
          value={websites.length} 
          icon={<Globe className="h-6 w-6" />} 
          trend="up" 
          change="+8% from last month" 
        />
        <AdminStatsCard 
          title="Total Reviews" 
          value={reviews.length} 
          icon={<Star className="h-6 w-6" />} 
          trend="neutral" 
          change="Same as last month" 
        />
        <AdminStatsCard 
          title="Server Status" 
          value="Healthy" 
          icon={<Server className="h-6 w-6" />} 
          trend="up" 
          change="99.9% uptime" 
        />
      </div>

      {/* Additional admin content can go here */}
      <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Quick Access</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Use the sidebar to navigate to specific admin sections for detailed management.
        </p>
        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
          <li>Manage all users and their permissions</li>
          <li>View and manage all websites across the platform</li>
          <li>Moderate reviews and remove inappropriate content</li>
          <li>Configure system settings and monitor performance</li>
        </ul>
      </div>
    </div>
  );
}