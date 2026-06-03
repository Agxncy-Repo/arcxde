import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import { useUserStore } from '../../store/user-store';
import type { OnboardingQuestion, OnboardingResult } from '@app/contracts';

interface OnboardingQuestionsResponse {
  data: OnboardingQuestion[];
}

interface SubmitOnboardingPayload {
  userId: string;
  role: string;
  answers: Array<{ questionId: string; selectedOption: string }>;
}

interface SubmitOnboardingResponse {
  data: OnboardingResult;
}

export const useOnboardingQuestions = (role: string | null) => {
  return useQuery({
    queryKey: ['onboarding', 'questions', role],
    queryFn: () => api.get<OnboardingQuestionsResponse>(`/onboarding/questions?role=${role}`),
    enabled: !!role,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  return useMutation({
    mutationFn: (payload: SubmitOnboardingPayload) =>
      api.post<SubmitOnboardingResponse>('/onboarding/submit', {
        userId: payload.userId,
        role: payload.role,
        answers: payload.answers,
      }),
    onSuccess: () => {
      completeOnboarding();
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
};
