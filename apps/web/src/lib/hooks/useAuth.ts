import { useMutation } from '@tanstack/react-query';
import { api } from '../api-client';
import { useUserStore } from '../../store/user-store';
import { useState } from 'react';
import { FinalizeRegistrationDto } from '@app/contracts';
import { useRouter } from 'next/navigation';

interface FinalizeSignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
}

interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

// Initial hit: Triggers the 6-digit email dispatch
export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => api.post('/signup/email', data),
  });
};

// New hook: Verifies the 6-digit code and returns a temporary token or session
export const useVerifySignupToken = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      api.post<{ email: string; registrationToken: string }>('/signup/verify-link', data),
  });
};
export const useLoginWithEmailAndPassword = () => {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<LoginResponse>('/auth/login', data),
    onSuccess: (response) => {
      setUser(response.data.user.id, response.data.accessToken);
    },
  });
};

export const useFinalizeSignup = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: FinalizeRegistrationDto) => {
      try {
        const response = await api.post<FinalizeSignupResponse>('/users/finalize-signup', payload);

        return response;
      } catch (networkError: any) {
        console.error(' Network Request Failed Directly inside mutationFn:', {
          status: networkError?.response?.status,
          statusText: networkError?.response?.statusText,
          data: networkError?.response?.data,
          message: networkError?.message,
        });
        throw networkError; // Re-throw so React Query handles it in onError
      }
    },
    onSuccess: (data) => {
      try {
        setError(null);

        // Resolve data layer safely based on what your API client wraps
        const actualData = (data as any).data && !(data as any).user ? (data as any).data : data;
        setUser(actualData.user.id, actualData.accessToken);

        // Redirect to the onboarding step after successful registration finalization
        router.push('/signup/role');
      } catch (jsError: any) {
        console.error('[useFinalizeSignup] error in onSuccess:', jsError?.message, jsError?.stack);
        setError(`Client formatting error: ${jsError?.message}`);
      }
    },
    onError: (err: any) => {
      console.error('Mutation onError Handler triggered:', {
        message: err?.message,
        serverResponseData: err?.response?.data,
        status: err?.response?.status,
      });

      setError(
        err?.response?.data?.message || err?.message || 'Failed to complete registration profile.',
      );
    },
  });

  return {
    finalizeSignup: mutation.mutate,
    isFinalizing: mutation.isPending,
    finalizeError: error,
    clearFinalizeError: () => setError(null),
  };
};

export const useGoogleAuth = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectToGoogle = () => {
    setIsRedirecting(true);

    // Pull from environment variables, fallback to local if not defined
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    // Trigger the full browser navigation to break out of CORS
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return {
    redirectToGoogle,
    isRedirecting,
  };
};

export const useLogout = () => {
  const logout = useUserStore((s) => s.logout);

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      logout();
    },
  });
};
