import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface AssessmentProgressProps extends HTMLAttributes<HTMLDivElement> {
  currentQuestion: number;
  totalQuestions: number;
}

export const AssessmentProgress = forwardRef<HTMLDivElement, AssessmentProgressProps>(
  ({ currentQuestion, totalQuestions, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex justify-center gap-3', className)} {...props}>
      {Array.from({ length: totalQuestions }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 13.7,
            height: 13.7,
            borderRadius: '50%',
            background: i < currentQuestion ? '#dfdfdf' : 'transparent',
            border: '1.3px solid #626262',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}
          aria-label={`Question ${i + 1} of ${totalQuestions}`}
        />
      ))}
    </div>
  ),
);

AssessmentProgress.displayName = 'AssessmentProgress';
