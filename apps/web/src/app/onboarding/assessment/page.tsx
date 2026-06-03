'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlantEgg } from '@/components/slant-egg';
import { AssessmentQuestion } from '@/components/assessment-question';
import { AssessmentProgress } from '@/components/assessment-progress';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

interface Question {
  id: string;
  question: string;
  answers: { id: string; text: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'How do you currently use AI in your work?',
    answers: [
      { id: 'a1', text: 'I rarely use AI today' },
      { id: 'a2', text: 'I use AI occasionally' },
      { id: 'a3', text: 'I use AI regularly' },
      { id: 'a4', text: 'AI is central to my workflow' },
      { id: 'a5', text: 'I help shape AI-enabled products or workflows' },
    ],
  },
  {
    id: 'q2',
    question: 'What aspect of AI are you most focused on improving?',
    answers: [
      { id: 'a1', text: 'Understanding how AI models work fundamentally' },
      { id: 'a2', text: 'Practical day-to-day AI tool usage' },
      { id: 'a3', text: 'AI ethics and responsible deployment' },
      { id: 'a4', text: 'Building AI-enabled products or features' },
      { id: 'a5', text: 'Leading AI strategy and governance' },
    ],
  },
  {
    id: 'q3',
    question: 'How much time can you commit to learning per week?',
    answers: [
      { id: 'a1', text: 'Less than 2 hours' },
      { id: 'a2', text: '2–5 hours' },
      { id: 'a3', text: '5–10 hours' },
      { id: 'a4', text: '10–20 hours' },
      { id: 'a5', text: 'More than 20 hours' },
    ],
  },
  {
    id: 'q4',
    question: 'What is your preferred learning format?',
    answers: [
      { id: 'a1', text: 'Structured courses with clear learning paths' },
      { id: 'a2', text: 'Interactive exercises and hands-on projects' },
      { id: 'a3', text: 'Articles and written deep-dives' },
      { id: 'a4', text: 'Videos, podcasts and visual content' },
      { id: 'a5', text: 'A mix of everything' },
    ],
  },
];

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const isAnswered = !!answers[q.id];

  const handleSelect = (answerId: string) => setAnswers((prev) => ({ ...prev, [q.id]: answerId }));

  const handleContinue = () => {
    if (isLast) {
      console.log('Assessment complete:', answers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#222] overflow-hidden relative" style={{ minHeight: 1024 }}>
      {/* Small egg — top 38, left 47 */}
      <div style={{ position: 'absolute', top: 38, left: 47 }}>
        <SlantEgg size="sm" />
      </div>

      {/* Back arrow — top 151, left 178 */}
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
        Answer just 4 questions to help us personalise your Arcxde experience.
      </h1>

      <div style={{ position: 'absolute', top: 303, left: 303, width: 733 }}>
        <AssessmentQuestion
          questionNumber={currentIndex + 1}
          roleContext="an Analyst"
          question={q.question}
          answers={q.answers}
          selectedAnswerId={answers[q.id]}
          onAnswerSelect={handleSelect}
        />
      </div>

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
        <AssessmentProgress currentQuestion={currentIndex + 1} totalQuestions={QUESTIONS.length} />
      </div>

      <button
        disabled={!isAnswered}
        onClick={handleContinue}
        style={{
          position: 'absolute',
          top: 913,
          left: 966,
          width: 166,
          height: 38,
          borderRadius: 20,
          border: '1px solid #6b6b6b',
          background: isAnswered ? '#fff' : 'transparent',
          color: isAnswered ? '#222' : '#6b6b6b',
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '100%',
          cursor: isAnswered ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        continue
      </button>
    </div>
  );
}
