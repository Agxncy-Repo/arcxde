import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ContentType = 'podcast' | 'article' | 'video';

export interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  contentType?: ContentType;
  variant?: 'signal' | 'course' | 'community';
}

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

/**
 *   signal cards  : 467.2 × 149px, radius 34.23, border 0.9px #6b6b6b
 *   course cards  : 467.2 × 344px, radius 34.23, border 0.9px #6b6b6b — title centred
 *   community     : 364.5 × 187px, radius 34.23, border 0.9px #6b6b6b
 *   All font: 32.52px / 300 / matches figma groupContainer fontSize
 */

const ICON_SRC: Record<ContentType, string> = {
  podcast: '/icons/podcasts.svg',
  article: '/icons/news.svg',
  video: '/icons/play_circle.svg',
};

export const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, contentType, variant = 'course', className, ...props }, ref) => {
    const dims = {
      signal: {
        w: 467.2,
        h: 149,
        textAlign: 'left' as const,
        titleTop: 46,
        titleLeft: 57,
        titleW: 374,
      },
      course: {
        w: 467.2,
        h: 344,
        textAlign: 'center' as const,
        titleTop: 140,
        titleLeft: 68,
        titleW: 330,
      },
      community: {
        w: 364.5,
        h: 187,
        textAlign: 'left' as const,
        titleTop: 58,
        titleLeft: 55,
        titleW: 267,
      },
    }[variant];

    return (
      <div
        ref={ref}
        className={cn('relative flex-shrink-0', className)}
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: 34.23,
          border: '0.9px solid #6b6b6b',
          background: 'transparent',
        }}
        {...props}
      >
        <p
          style={{
            position: 'absolute',
            top: dims.titleTop,
            left: dims.titleLeft,
            right: dims.titleLeft,
            width: dims.titleW,
            fontFamily: FONT,
            fontSize: 32.52,
            fontWeight: 300,
            lineHeight: variant === 'course' ? '150%' : '100%',
            color: 'white',
            textAlign: dims.textAlign,
            margin: 0,
          }}
        >
          {title}
        </p>

        {contentType && (
          <img
            src={ICON_SRC[contentType]}
            alt={contentType}
            style={{
              position: 'absolute',
              bottom: variant === 'course' ? 32 : 16,
              ...(dims.textAlign === 'center'
                ? { left: '50%', transform: 'translateX(-50%)' }
                : { right: 32 }),
              width: 45,
              height: 45,
              opacity: 0.8,
            }}
          />
        )}
      </div>
    );
  },
);

DashboardCard.displayName = 'DashboardCard';
