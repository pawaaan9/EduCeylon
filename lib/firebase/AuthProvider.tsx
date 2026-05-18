"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  type AppUserProfile,
  ensureProfile,
  getUserProfile,
  signOut as authSignOut,
  subscribeToAuth,
} from "./auth";

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  profile: AppUserProfile | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  user: null,
  profile: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeToAuth(async (fbUser) => {
      if (cancelled) return;
      setUser(fbUser);
      if (!fbUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        // Prefer cheap read; fall back to ensureProfile to self-heal new accounts.
        const existing = await getUserProfile(fbUser.uid);
        const next = existing ?? (await ensureProfile(fbUser));
        if (!cancelled) setProfile(next);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signOut: authSignOut,
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
