import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFieldProps extends InputProps {
  label: string;
  id: string;
  error?: string;
}

export default function InputField({ label, id, error, className, ...props }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[var(--text-primary)]">
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className={`bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)] ${
          error ? 'border-red-500' : ''
        } ${className || ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}