import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      'rounded-xl border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)]',
      'text-[var(--text-primary)] shadow-sm',
      className
    )}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      'flex flex-col space-y-1.5 p-6 pb-2',
      className
    )}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }: CardProps) => {
  return (
    <h3 className={cn(
      'font-semibold leading-none tracking-tight',
      className
    )}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className }: CardProps) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
};