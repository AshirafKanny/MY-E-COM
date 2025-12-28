import { create } from "zustand";

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin";
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  setAuth: (payload: { user: User; accessToken: string }) => void;
  clearAuth: () => void;
};

const STORAGE_KEY = "auth-state";

function loadPersisted(): Pick<AuthState, "user" | "accessToken"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null };
    return JSON.parse(raw);
  } catch (_err) {
    return { user: null, accessToken: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadPersisted(),
  setAuth: ({ user, accessToken }) => {
    const next = { user, accessToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set(next);
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, accessToken: null });
  },
}));
