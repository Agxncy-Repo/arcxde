import { forwardRef, InputHTMLAttributes, PropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface MembershipCardProps extends PropsWithoutRef<
  InputHTMLAttributes<HTMLInputElement>
> {
  title: string;
  description: string;
}

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

export const MembershipCard = forwardRef<HTMLInputElement, MembershipCardProps>(
  ({ title, description, className, ...props }, ref) => {
    const checked = props.checked;
    const id = props.id || `membership-${title.toLowerCase()}`;

    return (
      <label htmlFor={id} className="relative block cursor-pointer">
        <div
          className={cn(
            'relative transition-colors',
            checked ? 'bg-white/[0.04]' : 'bg-transparent',
            className,
          )}
          style={{
            borderRadius: 34.23,
            border: '0.9px solid #6b6b6b',
            padding: '21px 56px',
          }}
        >
          {/* Custom radio dot */}
          <span
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '1.5px solid #626262',
              background: checked ? '#dfdfdf' : 'transparent',
              display: 'block',
              flexShrink: 0,
            }}
          />
          <input ref={ref} id={id} type="radio" className="sr-only" {...props} />

          {/* Title: 28px / 300 / 150% */}
          <p
            className="text-white"
            style={{
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 300,
              lineHeight: '150%',
              marginBottom: 0,
            }}
          >
            {title}
          </p>
          {/* Description: 16px / 100 / 100% */}
          <p
            className="text-white"
            style={{ fontFamily: FONT, fontSize: 16, fontWeight: 100, lineHeight: '100%' }}
          >
            {description}
          </p>
        </div>
      </label>
    );
  },
);

MembershipCard.displayName = 'MembershipCard';
