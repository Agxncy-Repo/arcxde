/**
 * Button.
 *
 * Variants: primary | secondary | outline | ghost | destructive | link
 * Sizes:    sm | md | lg | icon
 *
 * Pattern notes:
 *   - asChild lets the button render as any element (e.g. <Link>, <a>) while
 *     keeping the same styles. Critical for accessibility — never wrap an
 *     anchor in a button or vice versa.
 *   - Focus rings use --ring (warm, matches our terracotta accent), not the
 *     generic blue browser default.
 *   - Subtle 1px translate on :active so clicks feel tactile without being
 *     gimmicky.
 */
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium',
    'transition-[background-color,color,border-color,box-shadow,transform] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-[0.5px]',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:bg-primary/90 hover:shadow-md',
        ],
        secondary: ['bg-secondary text-secondary-foreground', 'hover:bg-secondary/80'],
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        ghost: ['bg-transparent', 'hover:bg-accent hover:text-accent-foreground'],
        destructive: [
          'bg-destructive text-destructive-foreground shadow-sm',
          'hover:bg-destructive/90',
        ],
        link: ['bg-transparent text-primary underline-offset-4', 'hover:underline'],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as any element (e.g. an anchor) while keeping button styles. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
