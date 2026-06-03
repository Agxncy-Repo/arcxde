import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface RoleSelectorProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export const RoleSelector = forwardRef<HTMLDivElement, RoleSelectorProps>(
  ({ className, columns = 2, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('gap-4', columns === 2 ? 'grid grid-cols-2' : 'grid grid-cols-3', className)}
      role="group"
      {...props}
    />
  ),
);

RoleSelector.displayName = 'RoleSelector';
