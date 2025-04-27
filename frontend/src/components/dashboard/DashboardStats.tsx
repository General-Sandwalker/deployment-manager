/* eslint-disable @typescript-eslint/no-unused-vars */
import { WebsiteStatus } from '@/types';
import { Globe, Server, Package, Clock, Users, Star } from 'lucide-react';
import { ReactNode } from 'react';
import StatCard from '@/components/ui/cards/StatCard';

interface DashboardStatsProps {
  websiteCount: number;
  runningCount: number;
  reviewCount: number;
  deploymentCount: number;
}

export default function DashboardStats({
  websiteCount,
  runningCount,
  reviewCount,
  deploymentCount
}: DashboardStatsProps) {
  // Create stat card data
  const stats: {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }[] = [
    {
      title: 'Total Websites',
      value: websiteCount,
      icon: <Globe className="h-5 w-5 text-[var(--cosmic-highlight)]" />,
    },
    {
      title: 'Active Websites',
      value: runningCount,
      icon: <Server className="h-5 w-5 text-green-500" />,
      trend: runningCount > 0 ? 'up' : 'neutral',
      trendValue: `${Math.round((runningCount / (websiteCount || 1)) * 100)}% active`
    },
    {
      title: 'Total Reviews',
      value: reviewCount,
      icon: <Star className="h-5 w-5 text-yellow-500" />,
    },
    {
      title: 'Deployments',
      value: deploymentCount,
      icon: <Package className="h-5 w-5 text-blue-500" />,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          trendValue={stat.trendValue}
        />
      ))}
    </div>
  );
}