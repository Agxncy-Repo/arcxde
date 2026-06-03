import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface MembershipSelectorProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MembershipSelector = forwardRef<HTMLDivElement, MembershipSelectorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-5', className)} role="group" {...props} />
  ),
);

MembershipSelector.displayName = 'MembershipSelector';
