import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnboardingQuestion, OnboardingResult } from '@app/contracts';

import type { OnboardingRepository, QuestionWithWeights } from './onboarding.repository.js';
import { OnboardingService } from './onboarding.service.js';

const ROLE = 'developer';
const USER_ID = 'usr_abcdefghijklmnop123456';

const displayQuestion = (overrides: Partial<OnboardingQuestion> = {}): OnboardingQuestion => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  text: 'How do you use AI?',
  description: null,
  options: ['I rarely use AI', 'I use AI occasionally', 'I use AI regularly'],
  order: 1,
  ...overrides,
});

const scoringQuestion = (overrides: Partial<QuestionWithWeights> = {}): QuestionWithWeights => ({
  id: 'obq_550e8400e29b41d4a716446655440000',
  options: ['I rarely use AI', 'I use AI occasionally', 'I use AI regularly'],
  optionWeights: [0.2, 0.6, 1.0],
  questionWeight: 1.0,
  ...overrides,
});

const makeRepo = (): OnboardingRepository =>
  ({
    findQuestionsForDisplay: vi.fn(),
    findQuestionsWithWeights: vi.fn(),
    findOrCreateTempUser: vi.fn(),
    saveSubmission: vi.fn(),
    upsertResult: vi.fn(),
    markOnboardingComplete: vi.fn(),
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
      // 3 questions with varying weights
      const questions = [
        scoringQuestion({ id: 'obq_1', optionWeights: [0.2, 0.6, 1.0], questionWeight: 1.0 }),
        scoringQuestion({ id: 'obq_2', optionWeights: [0.3, 0.7, 1.0], questionWeight: 2.0 }),
        scoringQuestion({ id: 'obq_3', optionWeights: [0.1, 0.5, 1.0], questionWeight: 1.0 }),
      ];
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue(questions);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      // Pick highest-weight option for each (index 2 = weight 1.0)
      const result = await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_1', selectedOption: 'I use AI regularly' },
          { questionId: 'obq_2', selectedOption: 'I use AI regularly' },
          { questionId: 'obq_3', selectedOption: 'I use AI regularly' },
        ],
      });

      // All max weights: totalScore = 1*1.0 + 2*1.0 + 1*1.0 = 4.0, maxPossible = 4.0, normalized = 100%
      expect(result).toMatchObject<OnboardingResult>({
        userId: USER_ID,
        totalScore: 4,
        normalizedScore: 100,
        maxPossibleScore: 4,
        profileKey: 'advanced',
      });
      expect(repo.markOnboardingComplete).toHaveBeenCalledWith(USER_ID);
    });

    it('assigns "beginner" profile for low scores', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      const result = await service.submit({
        role: ROLE,
        answers: [
          { questionId: 'obq_550e8400e29b41d4a716446655440000', selectedOption: 'I rarely use AI' },
        ],
      });

      expect(result.profileKey).toBe('beginner');
      expect(result.normalizedScore).toBe(20); // 0.2 weight * 1.0 questionWeight / 1.0 max * 100
    });

    it('throws NOT_FOUND when no questions exist for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([]);

      await expect(
        service.submit({
          role: 'unknown',
          answers: [{ questionId: 'obq_x', selectedOption: 'I rarely use AI' }],
        }),
      ).rejects.toMatchObject({ kind: 'NOT_FOUND' });
    });

    it('throws BAD_REQUEST when questionId is not active for the role', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([scoringQuestion()]);

      await expect(
        service.submit({
          role: ROLE,
          answers: [
            { questionId: 'obq_wrong_id_12345678901234567890', selectedOption: 'I rarely use AI' },
          ],
        }),
      ).rejects.toMatchObject({ code: 'INVALID_QUESTION', kind: 'BAD_REQUEST' });
    });

    it('throws BAD_REQUEST when selectedOption is not valid', async () => {
      vi.mocked(repo.findOrCreateTempUser).mockResolvedValue(USER_ID);
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([scoringQuestion()]);

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
      vi.mocked(repo.findQuestionsWithWeights).mockResolvedValue([scoringQuestion()]);
      vi.mocked(repo.saveSubmission).mockResolvedValue(undefined);
      vi.mocked(repo.upsertResult).mockResolvedValue(undefined);

      await service.submit({
        role: ROLE,
        answers: [
          {
            questionId: 'obq_550e8400e29b41d4a716446655440000',
            selectedOption: 'I use AI occasionally',
          },
        ],
      });

      expect(repo.findOrCreateTempUser).toHaveBeenCalledWith(undefined);
    });
  });
});
