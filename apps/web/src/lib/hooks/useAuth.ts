import { useMutation } from '@tanstack/react-query';
import { api } from '../api-client';
import { useUserStore } from '../../store/user-store';

interface SignupResponse {
  data: {
    user: {
      id: string;
      email: string;
      fullName?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
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

export const useSignupIndividual = () => {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { email: string; firstName?: string; lastName?: string }) =>
      api.post<SignupResponse>('/auth/signup/individual', data),
    onSuccess: (response) => {
      setUser(response.data.user.id, response.data.accessToken);
    },
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

export const useLogout = () => {
  const logout = useUserStore((s) => s.logout);

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      logout();
    },
  });
};
