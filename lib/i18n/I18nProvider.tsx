"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

type Dict = Record<string, string>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "educeylon.locale";

const listeners = new Set<() => void>();
const dictionaryListeners = new Set<() => void>();

let dictionaries: Record<Locale, Dict> | null = null;
let dictionariesLoading = false;

function notify() {
  for (const listener of listeners) listener();
}

function notifyDictionaries() {
  for (const listener of dictionaryListeners) listener();
}

function ensureDictionariesLoaded() {
  if (dictionaries || dictionariesLoading || typeof window === "undefined") return;
  dictionariesLoading = true;
  void import("./dictionaries")
    .then((mod) => {
      dictionaries = mod.dictionaries;
      notifyDictionaries();
    })
    .finally(() => {
      dictionariesLoading = false;
    });
}

function subscribeDictionaries(listener: () => void) {
  dictionaryListeners.add(listener);
  ensureDictionariesLoaded();
  return () => {
    dictionaryListeners.delete(listener);
  };
}

function getDictionariesSnapshot() {
  return dictionaries;
}

function getDictionariesServerSnapshot() {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loadedDictionaries = useSyncExternalStore(
    subscribeDictionaries,
    getDictionariesSnapshot,
    getDictionariesServerSnapshot,
  );

  useEffect(() => {
    ensureDictionariesLoaded();
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    notify();
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      if (!loadedDictionaries) return fallback ?? key;
      const dict = loadedDictionaries[locale];
      const value = dict[key] ?? loadedDictionaries.en[key];
      return value ?? fallback ?? key;
    },
    [locale, loadedDictionaries],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}
