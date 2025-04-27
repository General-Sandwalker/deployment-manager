import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

export default function AdminStatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  change 
}: AdminStatsCardProps) {
  const trendIcons = {
    up: <ArrowUp size={16} className="text-success" />,
    down: <ArrowDown size={16} className="text-danger" />,
    neutral: <ArrowRight size={16} className="text-info" />,
  };

  return (
    <div className="bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent hover:border-cosmic-highlight transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-cosmic-highlight">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-cosmic-light text-cosmic-highlight">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 text-sm flex items-center space-x-1">
          {trendIcons[trend]}
          <span className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-info'}>
            {change || (trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'No change')}
          </span>
        </div>
      )}
    </div>
  );
}