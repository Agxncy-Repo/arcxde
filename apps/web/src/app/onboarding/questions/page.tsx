'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlantEgg } from '@/components/slant-egg';
import { AssessmentQuestion } from '@/components/assessment-question';
import { AssessmentProgress } from '@/components/assessment-progress';
import { useOnboardingQuestions, useSubmitOnboarding } from '@/lib/hooks/useOnboarding';
import { useUserStore } from '@/store/user-store';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

interface Question {
  id: string;
  text: string;
  description: string | null;
  options: string[];
  order: number;
}

function OnboardingQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const userId = useUserStore((s) => s.userId);
  const selectedRole = useUserStore((s) => s.selectedRole);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const currentRole = role || selectedRole;

  // Wait for Zustand rehydrate before rendering content that needs persisted state
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <p style={{ color: '#aaa', fontSize: 16 }}>Loading...</p>
      </div>
    );
  }

  const {
    data: questionsResponse,
    isLoading,
    error: questionsError,
  } = useOnboardingQuestions(currentRole);
  const {
    mutate: submitOnboarding,
    isPending: isSubmitting,
    error: submitError,
  } = useSubmitOnboarding();

  const questions = (questionsResponse?.data || []) as Question[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isAnswered = !!answers[q?.id];

  const handleSelect = (answerId: string) => {
    if (q) {
      setAnswers((prev) => ({ ...prev, [q.id]: answerId }));
    }
  };

  const handleContinue = () => {
    if (isLast && userId && currentRole) {
      const formattedAnswers = Object.entries(answers).map(([questionId, answerIdx]) => {
        const question = questions.find((q) => q.id === questionId);
        const selectedOption = question?.options[parseInt(answerIdx)] || answerIdx;
        return {
          questionId,
          selectedOption,
        };
      });

      submitOnboarding(
        {
          userId,
          role: currentRole,
          answers: formattedAnswers,
        },
        {
          onSuccess: () => {
            router.push('/dashboard');
          },
        },
      );
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <p style={{ fontFamily: FONT, color: 'white', fontSize: 18 }}>Loading questions...</p>
      </div>
    );
  }

  if (questionsError || !currentRole || !userId) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <p style={{ fontFamily: FONT, color: '#ff6b6b', fontSize: 18 }}>
          {questionsError?.message || 'Error loading questions'}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#222] flex items-center justify-center">
        <p style={{ fontFamily: FONT, color: 'white', fontSize: 18 }}>No questions found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222] overflow-hidden relative" style={{ minHeight: 1024 }}>
      <div style={{ position: 'absolute', top: 38, left: 47 }}>
        <SlantEgg size="sm" />
      </div>

      <Link
        href="/signup/role"
        style={{
          position: 'absolute',
          top: 151,
          left: 178,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 100,
          lineHeight: '100%',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        ←
      </Link>

      <h1
        style={{
          position: 'absolute',
          top: 185,
          left: 313,
          width: 740,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 450,
          lineHeight: '100%',
          color: 'white',
          margin: 0,
        }}
      >
        Answer just {questions.length} questions to help us personalise your Arcxde experience.
      </h1>

      {q && (
        <div style={{ position: 'absolute', top: 303, left: 303, width: 733 }}>
          <AssessmentQuestion
            questionNumber={currentIndex + 1}
            roleContext={currentRole}
            question={q.text}
            answers={q.options.map((opt, idx) => ({ id: String(idx), text: opt }))}
            selectedAnswerId={answers[q.id]}
            onAnswerSelect={handleSelect}
          />
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 846,
          left: 303,
          width: 733,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AssessmentProgress currentQuestion={currentIndex + 1} totalQuestions={questions.length} />
      </div>

      {submitError && (
        <p
          style={{
            position: 'absolute',
            top: 780,
            left: 303,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 300,
            lineHeight: '100%',
            color: '#ff6b6b',
          }}
        >
          {submitError.message || 'Error submitting answers'}
        </p>
      )}

      <button
        disabled={!isAnswered || isSubmitting}
        onClick={handleContinue}
        style={{
          position: 'absolute',
          top: 913,
          left: 966,
          width: 166,
          height: 38,
          borderRadius: 20,
          border: '1px solid #6b6b6b',
          background: isAnswered && !isSubmitting ? '#fff' : 'transparent',
          color: isAnswered && !isSubmitting ? '#222' : '#6b6b6b',
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '100%',
          cursor: isAnswered && !isSubmitting ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        {isSubmitting ? 'submitting...' : 'continue'}
      </button>
    </div>
  );
}

export default function OnboardingQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#222] flex items-center justify-center">
          <p style={{ fontFamily: FONT, color: 'white', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <OnboardingQuestionsContent />
    </Suspense>
  );
}
