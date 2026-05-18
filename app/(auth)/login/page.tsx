"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  dashboardPathForRole,
  describeAuthError,
  signInWithEmail,
} from "@/lib/firebase/auth";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { profile } = await signInWithEmail(email, password);
      router.push(dashboardPathForRole(profile.role));
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-up">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        {t("auth.login.title")}
      </h1>
      <p className="mt-2 text-ink-600">{t("auth.login.subtitle")}</p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          label={t("auth.email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label={t("auth.password")}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aside={
            <Link
              href="#"
              className="text-xs font-medium text-brand-700 hover:text-brand-900"
            >
              {t("auth.forgot")}
            </Link>
          }
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing in…" : t("auth.submit.login")}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        {t("auth.noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-700 hover:text-brand-900"
        >
          {t("nav.register")}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  aside,
  ...inputProps
}: {
  label: string;
  aside?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-700">{label}</span>
        {aside}
      </div>
      <input className="input-base" {...inputProps} />
    </label>
  );
}
