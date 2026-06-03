import { forwardRef, InputHTMLAttributes, PropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface RoleCardProps extends PropsWithoutRef<InputHTMLAttributes<HTMLInputElement>> {
  title: string;
  description: string;
  /** sm: 6-up grid card (399×118, 29.24px radius, 23.92px title, 13.67px desc)
   *  md: full-width hybrid card (467×138, 34.23px radius, 28px title, 16px desc) */
  cardSize?: 'sm' | 'md';
}

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

export const RoleCard = forwardRef<HTMLInputElement, RoleCardProps>(
  ({ title, description, cardSize = 'sm', className, ...props }, ref) => {
    const checked = props.checked;
    const id = props.id || `role-${title.toLowerCase()}`;
    const isMd = cardSize === 'md';

    return (
      <label htmlFor={id} className="relative block cursor-pointer w-full">
        <div
          className={cn(
            'relative transition-colors',
            checked ? 'bg-white/[0.04]' : 'bg-transparent',
            className,
          )}
          style={{
            borderRadius: isMd ? 34.23 : 29.24,
            border: `${isMd ? '0.9' : '0.7'}px solid #6b6b6b`,
            padding: isMd ? '21px 56px' : '18px 48px',
          }}
        >
          {/* Radio dot */}
          <span
            style={{
              position: 'absolute',
              left: isMd ? 24 : 20.5,
              top: '50%',
              transform: 'translateY(-50%)',
              width: isMd ? 16 : 13.7,
              height: isMd ? 16 : 13.7,
              borderRadius: '50%',
              border: `${isMd ? '1.5' : '1.3'}px solid #626262`,
              background: checked ? '#dfdfdf' : 'transparent',
              display: 'block',
            }}
          />
          <input ref={ref} id={id} type="radio" className="sr-only" {...props} />
          <p
            className="text-white"
            style={{
              fontFamily: FONT,
              fontSize: isMd ? 28 : 23.92,
              fontWeight: 300,
              lineHeight: '150%',
              marginBottom: 0,
            }}
          >
            {title}
          </p>
          <p
            className="text-white/70"
            style={{
              fontFamily: FONT,
              fontSize: isMd ? 16 : 13.67,
              fontWeight: 100,
              lineHeight: '100%',
            }}
          >
            {description}
          </p>
        </div>
      </label>
    );
  },
);

RoleCard.displayName = 'RoleCard';
