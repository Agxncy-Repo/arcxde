import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  token: string | null;
  selectedRole: string | null;
  onboardingCompleted: boolean;
  setUser: (userId: string, token: string) => void;
  setRole: (role: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      selectedRole: null,
      onboardingCompleted: false,
      setUser: (userId, token) => set({ userId, token }),
      setRole: (role) => set({ selectedRole: role }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      logout: () =>
        set({
          userId: null,
          token: null,
          selectedRole: null,
          onboardingCompleted: false,
        }),
    }),
    { name: 'user-storage' },
  ),
);
