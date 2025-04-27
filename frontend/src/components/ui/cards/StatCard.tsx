import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
  trendValue?: string; // Added trendValue as an optional property
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  const trendIcons = {
    up: <ArrowUp size={16} className="text-[var(--success)]" />,
    down: <ArrowDown size={16} className="text-[var(--danger)]" />,
    neutral: <ArrowRight size={16} className="text-[var(--info)]" />,
  };

  const trendTextClasses = {
    up: 'text-[var(--success)]',
    down: 'text-[var(--danger)]',
    neutral: 'text-[var(--info)]',
  };

  return (
    <div className={cn(
      'rounded-xl border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)]',
      'text-[var(--text-primary)] shadow-sm',
      className
    )}>
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h3 className="text-sm font-medium text-[var(--cosmic-highlight)]">
          {title}
        </h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-[var(--cosmic-highlight)] mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            'text-xs mt-1 flex items-center space-x-1',
            trendTextClasses[trend]
          )}>
            {trendIcons[trend]}
            <span>
              {trend === 'up' ? 'Increased' : 
               trend === 'down' ? 'Decreased' : 'No change'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}