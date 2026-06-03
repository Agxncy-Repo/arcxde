/**
 * Typography stack — the soul of the design system.
 *
 *   Suisse Int'l      — primary UI font. Elegant, refined, proprietary.
 *   Geist Mono        — code / numerals where tabular alignment matters.
 *
 * Suisse Int'l is applied globally via CSS custom property fallback.
 * Geist Mono is loaded via next/font/google (self-hosted).
 */
import { Geist_Mono } from 'next/font/google';

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

/** Single class to apply all font CSS variables to <body>. */
export const fontVariables = `${fontMono.variable}`;
