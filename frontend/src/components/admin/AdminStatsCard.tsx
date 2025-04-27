'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  className?: string;
}

export default function AdminStatsCard({
  title,
  value,
  icon,
  trend = 'neutral',
  change,
  className,
}: AdminStatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className={cn(
      "bg-[var(--cosmic-blue)] border border-[var(--cosmic-accent)] rounded-lg p-6 shadow-sm",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          {change && (
            <div className="mt-2 flex items-center">
              {getTrendIcon()}
              <span className={`text-xs ml-1 ${getTrendColor()}`}>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-[var(--cosmic-light)] rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}