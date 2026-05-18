/**
 * Separator — thin divider line.
 *
 * Radix handles ARIA semantics: aria-orientation, decorative role.
 * Pass decorative={false} when the separator carries semantic meaning
 * (e.g. between two distinct sections).
 */
'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '@/lib/cn';

export const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
));
Separator.displayName = 'Separator';
