/**
 * Input — text-like form field.
 *
 * Pass aria-invalid="true" (or invalid prop) to switch to error state. Pair
 * with Label for accessibility.
 */
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || props['aria-invalid']}
        className={cn(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2',
          'text-sm text-foreground',
          'placeholder:text-muted-foreground/70',
          'transition-[border-color,box-shadow] duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          invalid ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
