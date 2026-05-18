/**
 * Spinner — loading indicator.
 *
 * Pure CSS rotation, scales with the parent font size by default. Pass a
 * size class (size-4, size-5, etc.) to override.
 *
 * Accessibility: gets aria-label="Loading" by default — screen readers will
 * announce it. Override label by passing `label` prop.
 */
import type { SVGProps } from 'react';

import { cn } from '@/lib/cn';

export interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  label?: string;
}

export function Spinner({ className, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-4 animate-spin text-current', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
