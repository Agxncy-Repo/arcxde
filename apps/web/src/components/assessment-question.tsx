import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface Answer {
  id: string;
  text: string;
}

export interface AssessmentQuestionProps extends HTMLAttributes<HTMLDivElement> {
  questionNumber: number;
  roleContext: string;
  question: string;
  answers: Answer[];
  selectedAnswerId?: string;
  onAnswerSelect: (answerId: string) => void;
}

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

export const AssessmentQuestion = forwardRef<HTMLDivElement, AssessmentQuestionProps>(
  (
    {
      questionNumber,
      roleContext,
      question,
      answers,
      selectedAnswerId,
      onAnswerSelect,
      className,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {/*
       *   Outer card: 733×501px, border-radius 29.24px, 0.7px border #6b6b6b
       *   "In your role…": 23.92px / 300 / 150%
       *   Question (ol): 24px / 100 / 100%
       *   Answers: 24px / 100 / 100%
       *   Radio dots: 13.7×13.7, left 80, spaced ≈50px apart
       */}
      <div
        style={{
          borderRadius: 29.24,
          border: '0.7px solid #6b6b6b',
          padding: '18px 48px 32px',
          background: 'transparent',
        }}
      >
        {/* Role context */}
        <p
          style={{
            fontFamily: FONT,
            fontSize: 23.92,
            fontWeight: 300,
            lineHeight: '150%',
            color: 'white',
            marginBottom: 0,
          }}
        >
          In your role as {roleContext}:
        </p>

        {/* Numbered question */}
        <ol
          style={{
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 100,
            lineHeight: '100%',
            color: 'white',
            marginTop: 16,
            paddingLeft: 32,
            marginBottom: 28,
          }}
        >
          <li>{question}</li>
        </ol>

        {/* Answer options with custom radio dots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingLeft: 58 }}>
          {answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            return (
              <label
                key={answer.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              >
                {/* Custom radio */}
                <span
                  style={{
                    width: 13.7,
                    height: 13.7,
                    borderRadius: '50%',
                    border: '1.3px solid #626262',
                    background: isSelected ? '#dfdfdf' : 'transparent',
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={answer.id}
                  checked={isSelected}
                  onChange={() => onAnswerSelect(answer.id)}
                  className="sr-only"
                />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 24,
                    fontWeight: 100,
                    lineHeight: '100%',
                    color: 'white',
                  }}
                >
                  {answer.text}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  ),
);

AssessmentQuestion.displayName = 'AssessmentQuestion';
