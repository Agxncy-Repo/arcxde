import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnboardingQuestion, OnboardingResult } from '@app/contracts';

import type { OnboardingRepository, QuestionForScoring } from './onboarding.repository.js';
import { OnboardingService } from './onboarding.service.js';

const ROLE = 'developer';
const USER_ID = 'usr_abcdefghijklmnop123456';

const displayQuestion = (overrides: Partial<OnboardingQuestion> = {}): OnboardingQuestion => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  text: 'How do you use AI?',
  description: null,
  options: ['A. Never', 'B. Sometimes', 'C. Always'],
  order: 1,
  ...overrides,
});

const scoringQuestion = (overrides: Partial<QuestionForScoring> = {}): QuestionForScoring => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  options: ['A. Never', 'B. Sometimes', 'C. Always'],
  correctAnswer: 'C',
  ...overrides,
});

const makeRepo = (): OnboardingRepository =>
  ({
    findQuestionsForDisplay: vi.fn(),
    findQuestionsForScoring: vi.fn(),
    findOrCreateTempUser: vi.fn(),
    saveSubmission: vi.fn(),
    upsertResult: vi.fn(),
  }) as unknown as OnboardingRepository;

describe('OnboardingService', () => {
  let repo: OnboardingRepository;
  let service: OnboardingService;

  beforeEach(() => {
    repo = makeRepo();
    service = new OnboardingService(repo);
  });

  describe('getQuestions', () => {
    it('returns display questions for the role', async () => {
      const questions = [displayQuestion()];
      vi.mocked(repo.findQuestionsForDisplay).mockResolvedValue(questions);

      await expect(service.getQuestions(ROLE)).resolves.toEqual(questions);
      expect(repo.findQuestionsForDisplay).toHaveBeenCalledWith(ROLE);
    });
  });

  describe('submit', () => {
    it('computes totalScore, normalizedScore and profileKey correctly', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      // Mock 20 questions (all with C as correct)
      const questions = Array.from({ length: 20 }, (_, i) =>
        scoringQuestion({
          id: `obq_${i}`,
          correctAnswer: 'C',
        }),
      );
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue(questions);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: Array.from({ length: 20 }, (_, i) => ({
          questionId: `obq_${i}`,
          // First 18 correct (C), last 2 wrong (A and B)
          selectedOption: i < 18 ? 'C. Always' : i === 18 ? 'A. Never' : 'B. Sometimes',
        })),
      });

      // 18 correct answers out of 20 = 90%
      expect(result).toMatchObject<OnboardingResult>({
        userId: USER_ID,
        totalScore: 18,
        normalizedScore: 90,
        maxPossibleScore: 20,
        profileKey: 'advanced',
      });
    });

    it('assigns "beginner" profile for low scores', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'A. Never' },
        ],
      });

      expect(result.profileKey).toBe('beginner');
      expect(result.normalizedScore).toBe(0);
    });

    it('throws NOT_FOUND when no questions exist for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([]);

      await expect(
        service.submit({
          role: 'unknown',
          answers: [{ questionId: 'obq_x', selectedOption: 'A. Never' }],
        }),
      ).rejects.toMatchObject({ kind: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when questionId is not active for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            { questionId: 'obq_wrong_id_12345678901234567890', selectedOption: 'A. Never' },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_QUESTION', kind: 'BAD_REQUEST' });
    });

    it('throws BAD_REQUEST when selectedOption is not valid', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            {
              questionId: 'obq_550e8400e29b41d4a716446655440000',
              selectedOption: 'D. Not an option',
            },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_OPTION', kind: 'BAD_REQUEST' });
    });

    it('creates a temp user when userId is not provided', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsForScoring).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'B. Sometimes' },
        ],
      });

      expect(repo.findOrCreateTempUser).toHaveBeenCalledWith(undefined);
    });
  });
});
