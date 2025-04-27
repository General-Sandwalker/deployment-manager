import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, { variant: 'success' | 'destructive' | 'warning' | 'default', text: string }> = {
    running: { variant: 'success', text: 'Running' },
    stopped: { variant: 'destructive', text: 'Stopped' },
    deploying: { variant: 'warning', text: 'Deploying' },
    error: { variant: 'destructive', text: 'Error' },
    active: { variant: 'success', text: 'Active' },
    inactive: { variant: 'destructive', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending' },
  };

  const statusInfo = statusMap[status.toLowerCase()] || { variant: 'default', text: status };

  return (
    <Badge 
      variant={statusInfo.variant}
      className={cn('capitalize', className)}
    >
      {statusInfo.text}
    </Badge>
  );
}