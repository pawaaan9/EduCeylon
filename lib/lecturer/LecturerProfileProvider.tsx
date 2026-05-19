"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "firebase/auth";
import { fetchMyLecturerProfileForUser } from "@/lib/api/lecturers";
import type {
  LecturerProfile,
  LecturerProfileResponse,
  OnboardingMeta,
} from "@/lib/api/types";
import { useAuth } from "@/lib/firebase/AuthProvider";

const CACHE_KEY = "educeylon:lecturer-profile";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  uid: string;
  at: number;
  data: LecturerProfileResponse | null;
};

function readCache(uid: string): LecturerProfileResponse | null | undefined {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry.uid !== uid || Date.now() - entry.at > CACHE_TTL_MS) {
      return undefined;
    }
    return entry.data;
  } catch {
    return undefined;
  }
}

function writeCache(uid: string, data: LecturerProfileResponse | null) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const entry: CacheEntry = { uid, at: Date.now(), data };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // private mode / quota
  }
}

type LecturerProfileContextValue = {
  profile: LecturerProfile | null;
  onboarding: OnboardingMeta | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setFromResponse: (data: LecturerProfileResponse | null) => void;
};

const LecturerProfileContext =
  createContext<LecturerProfileContextValue | null>(null);

let inflight: Promise<LecturerProfileResponse | null> | null = null;
let inflightUid: string | null = null;

/** One shared fetch + session cache for all lecturer pages (dashboard, onboarding, etc.). */
export function LecturerProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const applyResponse = useCallback(
    (data: LecturerProfileResponse | null, uid: string) => {
      writeCache(uid, data);
      setProfile(data?.profile ?? null);
      setOnboarding(data?.onboarding ?? null);
    },
    [],
  );

  const load = useCallback(
    async (u: User, opts?: { background?: boolean }) => {
      if (!opts?.background) setLoading(true);
      try {
        if (!inflight || inflightUid !== u.uid) {
          inflightUid = u.uid;
          inflight = fetchMyLecturerProfileForUser(u, { attempts: 2 });
        }
        const data = await inflight;
        if (!mounted.current) return;
        applyResponse(data, u.uid);
      } catch {
        // keep cached / last known state
      } finally {
        inflight = null;
        inflightUid = null;
        if (mounted.current) setLoading(false);
      }
    },
    [applyResponse],
  );

  useEffect(() => {
    mounted.current = true;

    if (!user || authProfile?.role !== "lecturer") {
      setProfile(null);
      setOnboarding(null);
      setLoading(false);
      return () => {
        mounted.current = false;
      };
    }

    const cached = readCache(user.uid);
    if (cached !== undefined) {
      applyResponse(cached, user.uid);
      setLoading(false);
      void load(user, { background: true });
    } else {
      void load(user);
    }

    return () => {
      mounted.current = false;
    };
  }, [user, authProfile?.role, load, applyResponse]);

  const refresh = useCallback(async () => {
    if (!user) return;
    inflight = null;
    inflightUid = null;
    await load(user);
  }, [user, load]);

  const setFromResponse = useCallback(
    (data: LecturerProfileResponse | null) => {
      if (!user) return;
      applyResponse(data, user.uid);
    },
    [user, applyResponse],
  );

  const value = useMemo<LecturerProfileContextValue>(
    () => ({
      profile,
      onboarding,
      loading,
      refresh,
      setFromResponse,
    }),
    [profile, onboarding, loading, refresh, setFromResponse],
  );

  if (authProfile?.role !== "lecturer") {
    return <>{children}</>;
  }

  return (
    <LecturerProfileContext.Provider value={value}>
      {children}
    </LecturerProfileContext.Provider>
  );
}

export function useLecturerProfile(): LecturerProfileContextValue {
  const ctx = useContext(LecturerProfileContext);
  if (!ctx) {
    throw new Error(
      "useLecturerProfile must be used within LecturerProfileProvider",
    );
  }
  return ctx;
}

export function useOptionalLecturerProfile() {
  return useContext(LecturerProfileContext);
}
