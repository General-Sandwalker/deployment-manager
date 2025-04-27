'use client';

import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend = 'neutral',
  trendValue 
}: StatCardProps) {
  const trendIcons = {
    up: <ArrowUp size={16} className="text-green-500" />,
    down: <ArrowDown size={16} className="text-red-500" />,
    neutral: <ArrowRight size={16} className="text-yellow-500" />,
  };

  const trendTextColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-yellow-500',
  };

  return (
    <Card className="hover:border-[var(--cosmic-highlight)] transition-colors">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--text-tertiary)] font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{value}</h3>
          </div>
          <div className="p-3 rounded-full bg-[var(--cosmic-light)] text-[var(--cosmic-highlight)]">
            {icon}
          </div>
        </div>

        {trendValue && (
          <div className="mt-4 text-sm flex items-center space-x-1">
            {trendIcons[trend]}
            <span className={trendTextColor[trend]}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}