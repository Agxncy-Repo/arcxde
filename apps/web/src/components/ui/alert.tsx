/**
 * Alert — inline contextual notification.
 *
 *   <Alert variant="success">
 *     <CheckCircle2 className="size-4" />
 *     <AlertTitle>Saved</AlertTitle>
 *     <AlertDescription>Your changes have been saved.</AlertDescription>
 *   </Alert>
 *
 * Grid-based layout means the optional icon stays neatly aligned even with
 * multi-line content. Variants tint the background and border subtly — never
 * a screaming color block.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const alertVariants = cva(
  [
    'relative w-full rounded-lg border px-4 py-3 text-sm',
    'grid grid-cols-[auto_1fr] items-start gap-x-3',
    '[&>svg]:mt-0.5 [&>svg]:size-4',
  ],
  {
    variants: {
      variant: {
        default: 'bg-card text-foreground border-border',
        info: 'bg-info/8 text-info border-info/25 [&>svg]:text-info',
        success: 'bg-success/8 text-success border-success/25 [&>svg]:text-success',
        warning: 'bg-warning/10 text-warning border-warning/30 [&>svg]:text-warning',
        destructive:
          'bg-destructive/8 text-destructive border-destructive/25 [&>svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  ),
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('col-start-2 mb-0.5 font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'col-start-2 text-sm leading-relaxed opacity-90 [&_p]:leading-relaxed',
      className,
    )}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
