/**
 * UI components barrel.
 *
 * Import everything from one place:
 *   import { Button, Card, CardHeader, Badge } from '@/components/ui';
 *
 * Keep additions deliberate — every export here is a public component the
 * rest of the app depends on. Treat this file the way you'd treat a package
 * boundary.
 */
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Badge, badgeVariants } from './badge';
export { Button, buttonVariants } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Label } from './label';
export { Separator } from './separator';
export { Spinner } from './spinner';

export type { AlertProps } from './alert';
export type { BadgeProps } from './badge';
export type { ButtonProps } from './button';
export type { InputProps } from './input';
export type { SpinnerProps } from './spinner';
