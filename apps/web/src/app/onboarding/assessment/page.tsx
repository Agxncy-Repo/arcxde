'use client';

import { useState, useEffect } from 'react';
import { SlantEgg } from '@/components/slant-egg';
import { AssessmentQuestion } from '@/components/assessment-question';
import { AssessmentProgress } from '@/components/assessment-progress';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

interface Question {
  id: string;
  question: string;
  answers: { id: string; text: string }[];
  correctAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'ai_lit_01',
    question: 'What do foundation models generate responses from?',
    answers: [
      { id: 'a', text: 'Explicit rules' },
      { id: 'b', text: 'Training data patterns' },
      { id: 'c', text: 'User instructions' },
    ],
    correctAnswer: 'c',
  },
  {
    id: 'ai_lit_02',
    question: 'What is the term for when an AI generates plausible-sounding but false information?',
    answers: [
      { id: 'a', text: 'Bias' },
      { id: 'b', text: 'Hallucination' },
      { id: 'c', text: 'Variance' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_03',
    question: 'Why are AI outputs probabilistic rather than deterministic?',
    answers: [
      { id: 'a', text: 'AI outputs are probabilistic by design' },
      { id: 'b', text: 'Because of randomness in training' },
      { id: 'c', text: 'Due to system errors' },
    ],
    correctAnswer: 'a',
  },
  {
    id: 'ai_lit_04',
    question: 'What do AI systems fundamentally do?',
    answers: [
      { id: 'a', text: 'Follow explicit rules' },
      { id: 'b', text: 'Predict probable next outputs' },
      { id: 'c', text: 'Retrieve pre-stored answers' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_05',
    question: 'How can you best reduce hallucinations in AI outputs?',
    answers: [
      { id: 'a', text: 'Increase temperature' },
      { id: 'b', text: 'Use structured outputs' },
      { id: 'c', text: 'Remove context' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_06',
    question: 'What is the best approach to ensure AI uses current information?',
    answers: [
      { id: 'a', text: 'Train new models daily' },
      { id: 'b', text: 'Retrieve from trusted systems at runtime' },
      { id: 'c', text: 'Accept all outputs as current' },
    ],
    correctAnswer: 'c',
  },
  {
    id: 'ai_lit_07',
    question: 'What is automation bias in the context of AI systems?',
    answers: [
      { id: 'a', text: 'Preference for automated systems' },
      { id: 'b', text: 'Automation bias and lack of oversight' },
      { id: 'c', text: 'Systems becoming slower' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_08',
    question: 'Which is the most important control for responsible AI deployment?',
    answers: [
      { id: 'a', text: 'Removing all AI features' },
      { id: 'b', text: 'Tool permissions and approval controls' },
      { id: 'c', text: 'Never using AI' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_09',
    question: 'What should developers review before deploying AI features?',
    answers: [
      { id: 'a', text: 'Only code quality' },
      { id: 'b', text: 'Privacy requirements' },
      { id: 'c', text: 'Only speed metrics' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_10',
    question: 'What is the key principle for handling user data in AI systems?',
    answers: [
      { id: 'a', text: 'Collect all available data' },
      { id: 'b', text: 'Only provide necessary information' },
      { id: 'c', text: 'Share all data publicly' },
    ],
    correctAnswer: 'c',
  },
  {
    id: 'ai_lit_11',
    question: 'Why is privacy governance important for AI systems?',
    answers: [
      { id: 'a', text: 'It is not important' },
      { id: 'b', text: 'Privacy obligations and data rights' },
      { id: 'c', text: 'Only for compliance' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_12',
    question: 'What is a key risk when AI has access to sensitive user data?',
    answers: [
      { id: 'a', text: 'Data becomes faster' },
      { id: 'b', text: 'Potential exposure of sensitive information' },
      { id: 'c', text: 'No risks exist' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_13',
    question: 'What determines if an AI system is safe to deploy?',
    answers: [
      { id: 'a', text: 'Only technical performance' },
      { id: 'b', text: 'Accuracy alone does not determine risk' },
      { id: 'c', text: 'Speed of responses' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_14',
    question: 'What can cause AI systems to produce discriminatory outcomes?',
    answers: [
      { id: 'a', text: 'Low accuracy' },
      { id: 'b', text: 'Automation bias' },
      { id: 'c', text: 'User preferences' },
    ],
    correctAnswer: 'c',
  },
  {
    id: 'ai_lit_15',
    question: 'How should performance disparities across user groups be addressed?',
    answers: [
      { id: 'a', text: 'Ignore them' },
      { id: 'b', text: 'Investigate performance disparities' },
      { id: 'c', text: 'Document but not fix' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_16',
    question: 'Why is ongoing evaluation with production data important?',
    answers: [
      { id: 'a', text: 'It is not important' },
      { id: 'b', text: 'Conduct ongoing evaluation using production data' },
      { id: 'c', text: 'Only test once' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_17',
    question: 'What should be assessed when evaluating AI system risks?',
    answers: [
      { id: 'a', text: 'Only technical metrics' },
      { id: 'b', text: 'What harm could occur' },
      { id: 'c', text: 'Only user feedback' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_18',
    question: 'Who ultimately bears responsibility for AI system outcomes?',
    answers: [
      { id: 'a', text: 'Only the AI model' },
      { id: 'b', text: 'Deployers remain responsible' },
      { id: 'c', text: 'Only end users' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_19',
    question: 'What matters most when assessing AI system impact?',
    answers: [
      { id: 'a', text: 'Only theoretical metrics' },
      { id: 'b', text: 'Real-world outcomes and user impact' },
      { id: 'c', text: 'Only model benchmarks' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 'ai_lit_20',
    question: 'What is the goal of responsible AI governance?',
    answers: [
      { id: 'a', text: 'Eliminate all AI usage' },
      { id: 'b', text: 'Maximize speed' },
      { id: 'c', text: 'Balancing usefulness, reliability, oversight, privacy and user impact' },
    ],
    correctAnswer: 'c',
  },
];

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
        Answer 20 questions about AI literacy to complete your assessment.
      </h1>

      <div style={{ position: 'absolute', top: 303, left: 303, width: 733 }}>
        <AssessmentQuestion
          questionNumber={currentIndex + 1}
          roleContext="AI Literacy"
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
        {isLast ? 'submit' : 'continue'}
      </button>
    </div>
  );
}
