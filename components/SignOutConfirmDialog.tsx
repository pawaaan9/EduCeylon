"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/lib/i18n/I18nProvider";

export function SignOutConfirmDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-ink-200 bg-white p-6 shadow-xl"
      >
        <h2 id="sign-out-dialog-title" className="text-lg font-semibold text-ink-900">
          {t("dashboard.signOutConfirm.title")}
        </h2>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed">
          {t("dashboard.signOutConfirm.message")}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={onClose}
          >
            {t("action.cancel")}
          </button>
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={onConfirm}>
            {t("action.signOut")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
