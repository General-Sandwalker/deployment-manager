import { WebsiteStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: WebsiteStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case WebsiteStatus.RUNNING:
        return 'bg-green-500 hover:bg-green-600';
      case WebsiteStatus.STOPPED:
        return 'bg-red-500 hover:bg-red-600';
      case WebsiteStatus.DEPLOYING:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case WebsiteStatus.ERROR:
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Badge className={getStatusStyles()}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}