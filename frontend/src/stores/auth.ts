'use client';

import { create } from 'zustand';
import { ApiError, setToken } from '@/lib/api/client';
import { authApi, type LoginInput, type RegisterInput } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';

/**
 * Who is signed in.
 *
 * This store holds the current user and nothing else that matters: it is a
 * cache of what the API already knows, never the source of truth. Permissions
 * here decide what to *render*; the server decides what is *allowed*, and
 * re-checks on every request.
 */
interface AuthState {
  user: User | null;
  /** True until the first `restore()` has settled, so guards do not flash. */
  initialising: boolean;
  submitting: boolean;

  restore: () => Promise<void>;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;

  hasRole: (...roles: string[]) => boolean;
  can: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialising: true,
  submitting: false,

  /** Called once on mount: turns a stored token back into a user. */
  restore: async () => {
    try {
      const user = await authApi.me();
      set({ user, initialising: false });
    } catch (error) {
      // An expired or revoked token is the normal case here, not a problem.
      if (error instanceof ApiError && (error.isUnauthenticated || error.isForbidden)) {
        setToken(null);
      }
      set({ user: null, initialising: false });
    }
  },

  login: async (input) => {
    set({ submitting: true });

    try {
      const { user, token } = await authApi.login({
        device_name: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : undefined,
        ...input,
      });

      setToken(token);
      set({ user, submitting: false });

      return user;
    } catch (error) {
      set({ submitting: false });
      throw error;
    }
  },

  register: async (input) => {
    set({ submitting: true });

    try {
      const { user, token } = await authApi.register(input);

      setToken(token);
      set({ user, submitting: false });

      return user;
    } catch (error) {
      set({ submitting: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the call fails, the local session must end.
    } finally {
      setToken(null);
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),

  hasRole: (...roles) => {
    const user = get().user;
    return user ? roles.some((role) => user.roles.includes(role as User['roles'][number])) : false;
  },

  /**
   * A render-time hint only. Never the last word on whether something is
   * permitted -- the API refuses regardless of what this returns.
   */
  can: (permission) => get().user?.permissions?.includes(permission) ?? false,
}));
