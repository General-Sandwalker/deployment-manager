import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WebsiteStatus } from '@/types';

interface StatusBadgeProps {
  status: WebsiteStatus;
  className?: string;
}

type StatusVariant = 'success' | 'destructive' | 'warning' | 'default' | 'outline';

interface StatusConfig {
  variant: StatusVariant;
  text: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<WebsiteStatus, StatusConfig> = {
    [WebsiteStatus.RUNNING]: { variant: 'success', text: 'Running' },
    [WebsiteStatus.STOPPED]: { variant: 'destructive', text: 'Stopped' },
    [WebsiteStatus.DEPLOYING]: { variant: 'warning', text: 'Deploying' },
    [WebsiteStatus.ERROR]: { variant: 'destructive', text: 'Error' },
    [WebsiteStatus.PENDING]: { variant: 'warning', text: 'Pending' }
  };
  
  // Ensure we have a valid status config, fallback to default if not found
  const statusInfo = status in statusMap 
    ? statusMap[status] 
    : { variant: 'default', text: String(status) };

  return (
    <Badge 
      variant={statusInfo.variant}
      className={cn('capitalize', className)}
    >
      {statusInfo.text}
    </Badge>
  );
}