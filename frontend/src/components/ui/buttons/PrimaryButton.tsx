import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonProps {
    isLoading?: boolean;
}

export default function PrimaryButton({
    className,
    isLoading,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <Button
            className={cn(
                'bg-cosmic-highlight hover:bg-cosmic-highlight/90 text-white',
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