"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useT } from "@/lib/i18n/I18nProvider";
import { MenuIcon, CloseIcon } from "./icons";

export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/lecturers", label: t("nav.lecturers") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 rounded-lg hover:bg-ink-100 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/login" className="btn btn-ghost">
            {t("nav.login")}
          </Link>
          <Link href="/register" className="btn btn-primary">
            {t("nav.register")}
          </Link>
        </div>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-700"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-5 flex flex-col gap-3 fade-up">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-100"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 mt-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2">
              <LanguageSwitcher />
              <Link href="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
                {t("nav.login")}
              </Link>
              <Link href="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                {t("nav.register")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
