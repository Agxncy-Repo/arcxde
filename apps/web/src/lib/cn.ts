/**
 * cn — merges class names with conflict resolution.
 *
 * Combines clsx (conditional classes) with tailwind-merge (last-wins conflict
 * resolution, so `cn("p-2", "p-4")` correctly resolves to "p-4").
 *
 * Used in every UI component. If you find yourself reaching for
 * `${cond ? 'a' : 'b'}` template literals, switch to cn().
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
