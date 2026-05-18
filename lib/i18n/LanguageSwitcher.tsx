"use client";

import { useI18n } from "./I18nProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "./config";
import { useEffect, useRef, useState } from "react";

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const triggerClasses =
    variant === "dark"
      ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
      : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-medium transition-colors ${triggerClasses}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon className="h-4 w-4" />
        <span>{LOCALE_LABELS[locale].native}</span>
        <ChevronIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-ink-200 bg-white shadow-card z-50 overflow-hidden fade-up"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              role="option"
              aria-selected={locale === code}
              onClick={() => {
                setLocale(code as Locale);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-ink-50 ${
                locale === code ? "bg-brand-50 text-brand-700 font-semibold" : "text-ink-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink-100 text-[10px] font-bold text-ink-700">
                  {LOCALE_LABELS[code].flag}
                </span>
                {LOCALE_LABELS[code].native}
              </span>
              {locale === code && <CheckIcon className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
