import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface DangerButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export default function DangerButton({
  className,
  isLoading,
  children,
  ...props
}: DangerButtonProps) {
  return (
    <Button
      className={cn(
        'bg-danger hover:bg-danger/90 text-white',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}