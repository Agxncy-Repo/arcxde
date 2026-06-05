import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SlantEggProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * lg  — full branding lockup (303×312px egg + Arcxde® wordmark)
   * sm  — small decorative egg only, no text (95×98px, top-left corner usage)
   */
  size?: 'sm' | 'lg';
  /** Show the Arcxde® wordmark. Only valid for size="lg". */
  showText?: boolean;
}

/**
 *
 *   parent container : 566 × 312.2 px
 *   egg wrapper      : 303 × 312.2 px, overflow hidden
 *   ellipse          : fills wrapper, tilted ≈ -20 deg
 *   "Arcxde" text    : left 279.67, top 156.14 (baseline ~265), 74.12px / 300
 *     "Ar"   letter-spacing -0.05em
 *     "cxde" letter-spacing -0.07em
 *   ® text           : left 474.34, top 186.28 (y≈196), 9.88px / 300
 *
 * For size="sm" (role-page / assessment top-left):
 */
export const SlantEgg = forwardRef<HTMLDivElement, SlantEggProps>(
  ({ size = 'lg', showText = false, className, ...props }, ref) => {
    if (size === 'sm') {
      return (
        <div
          ref={ref}
          className={cn('relative', className)}
          style={{ width: 95, height: 97.9 }}
          {...props}
        >
          <svg
            width="95"
            height="97.9"
            viewBox="0 0 95 97.9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="47.5"
              cy="48.95"
              rx="30"
              ry="43"
              stroke="white"
              strokeWidth="0.9"
              opacity="0.55"
              transform="rotate(-35 47.5 48.95)"
            />
          </svg>
        </div>
      );
    }

    // size === 'lg'
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        style={{ width: 566, height: 312.2 }}
        {...props}
      >
        <svg
          width="566"
          height="312.2"
          viewBox="0 0 566 312.2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <defs>
            <clipPath id="egg-clip-lg">
              <rect x="0" y="0" width="303" height="312.2" />
            </clipPath>
          </defs>

          {/* Egg — tilted ellipse clipped to its 303×312.2 container */}
          <g clipPath="url(#egg-clip-lg)">
            <ellipse
              cx="151.5"
              cy="156.1"
              rx="112"
              ry="145"
              stroke="white"
              strokeWidth="1"
              opacity="0.55"
              transform="rotate(-35 151.5 156.1)"
            />
          </g>

          {showText && (
            <>
              {/*
               * line-height 150% on 74.12px ≈ 111px, so visual baseline ≈ 156 + 111*0.8 ≈ 245.
               */}
              <text
                y="265"
                fontFamily="'Suisse Int\27l', system-ui, sans-serif"
                fontSize="74.12"
                fontWeight="300"
                fill="white"
              >
                <tspan x="279.67" letterSpacing="-3.71">
                  {/* -0.05 × 74.12 */}Ar
                </tspan>
                <tspan letterSpacing="-5.19">{/* -0.07 × 74.12 */}cxde</tspan>
              </text>

              <text
                x="474.34"
                y="196"
                fontFamily="'Suisse Int\27l', system-ui, sans-serif"
                fontSize="9.88"
                fontWeight="300"
                letterSpacing="-0.07em"
                fill="white"
              >
                ®
              </text>
            </>
          )}
        </svg>
      </div>
    );
  },
);

SlantEgg.displayName = 'SlantEgg';
