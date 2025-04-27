import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/lable';
import { cn } from '@/lib/utils';

interface InputFieldProps extends InputProps {
  label?: string;
  className?: string;
  error?: string;
}

export default function InputField({
  label,
  className,
  error,
  ...props
}: InputFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-cosmic-highlight">{label}</Label>}
      <Input
        className={cn(
          'bg-cosmic-light border-cosmic-accent text-white focus-visible:ring-cosmic-highlight',
          error && 'border-danger'
        )}
        {...props}
      />
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}