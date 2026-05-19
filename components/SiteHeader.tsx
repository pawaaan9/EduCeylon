"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "./Logo";
import { SignOutConfirmDialog } from "./SignOutConfirmDialog";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useT } from "@/lib/i18n/I18nProvider";
import { MenuIcon, CloseIcon } from "./icons";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { dashboardPathForRole } from "@/lib/firebase/auth";

export function SiteHeader() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuShown, setMenuShown] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const { profile, loading, signOut } = useAuth();
  const dashboardHref = profile ? dashboardPathForRole(profile.role) : null;

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (open) {
      setMenuMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMenuShown(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setMenuShown(false);
  }, [open]);

  const handlePanelTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
      if (!menuShown) setMenuMounted(false);
    },
    [menuShown],
  );

  useEffect(() => {
    if (menuShown || !menuMounted) return;
    const id = window.setTimeout(() => setMenuMounted(false), 320);
    return () => clearTimeout(id);
  }, [menuShown, menuMounted]);

  useEffect(() => {
    if (!menuMounted) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [menuMounted]);

  useEffect(() => {
    if (!menuMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuMounted]);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/lecturers", label: t("nav.lecturers") },
    { href: "/about", label: t("nav.about") },
  ];

  function requestSignOut() {
    setOpen(false);
    setSignOutConfirmOpen(true);
  }

  async function handleSignOut() {
    setSignOutConfirmOpen(false);
    try {
      await signOut();
    } finally {
      router.push("/login");
    }
  }

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
          {!loading && dashboardHref ? (
            <>
              <Link href={dashboardHref} className="btn btn-ghost">
                {t("nav.dashboard")}
              </Link>
              <button type="button" onClick={requestSignOut} className="btn btn-primary">
                {t("action.signOut")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                {t("nav.login")}
              </Link>
              <Link href="/register" className="btn btn-primary">
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-700"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {menuMounted &&
        portalReady &&
        createPortal(
          <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true">
            <div
              className={`mobile-drawer-backdrop absolute inset-0 bg-black/40 ${
                menuShown ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              className={`mobile-drawer-panel absolute right-0 top-0 flex h-[100dvh] w-72 max-w-[85vw] flex-col bg-white shadow-xl ${
                menuShown ? "translate-x-0" : "translate-x-full"
              }`}
              onTransitionEnd={handlePanelTransitionEnd}
            >
              <div className="flex items-center justify-between p-5 pb-3">
                <Logo size="sm" />
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-100"
                  aria-label="Close"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
                <nav className="flex flex-col gap-1 mt-2">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4 flex flex-col gap-2">
                  <LanguageSwitcher />
                  {!loading && dashboardHref ? (
                    <>
                      <Link
                        href={dashboardHref}
                        className="btn btn-secondary"
                        onClick={() => setOpen(false)}
                      >
                        {t("nav.dashboard")}
                      </Link>
                      <button type="button" onClick={requestSignOut} className="btn btn-primary">
                        {t("action.signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
                        {t("nav.login")}
                      </Link>
                      <Link href="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                        {t("nav.register")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <SignOutConfirmDialog
        open={signOutConfirmOpen}
        onClose={() => setSignOutConfirmOpen(false)}
        onConfirm={handleSignOut}
      />
    </header>
  );
}
