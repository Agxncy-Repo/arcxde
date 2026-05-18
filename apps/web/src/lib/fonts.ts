/**
 * Typography stack — the soul of the design system.
 *
 *   Instrument Serif  — display / editorial. Beautiful italic, distinctive.
 *   Geist Sans        — UI / body. Refined, modern, NOT Inter.
 *   Geist Mono        — code / numerals where tabular alignment matters.
 *
 * Loaded via next/font/google so the CSS is self-hosted (no FOUT, no
 * runtime request to Google). Each exposes a CSS variable consumed by
 * the @theme block in globals.css.
 */
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

export const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const fontSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

/** Single class to apply all font CSS variables to <body>. */
export const fontVariables = `${fontSans.variable} ${fontMono.variable} ${fontSerif.variable}`;
