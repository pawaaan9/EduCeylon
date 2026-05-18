"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { GoogleIcon } from "@/components/icons";
import { PasswordField } from "@/components/PasswordField";
import {
  dashboardPathForRole,
  describeAuthError,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebase/auth";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleSubmitting(true);
    try {
      const { profile } = await signInWithGoogle();
      router.push(dashboardPathForRole(profile.role));
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

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

      <button
        type="button"
        disabled={googleSubmitting || submitting}
        onClick={handleGoogleSignIn}
        className="btn btn-secondary mt-8 w-full justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="h-5 w-5 shrink-0" />
        {googleSubmitting ? t("auth.connecting") : t("auth.continueWithGoogle")}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-ink-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-ink-50 px-3 text-xs font-medium uppercase tracking-wide text-ink-400">
            {t("auth.or")}
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          label={t("auth.email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordField
          label={t("auth.password")}
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelAside={
            <Link
              href="#"
              className="text-xs font-medium text-brand-700 hover:text-brand-900 shrink-0"
            >
              {t("auth.forgot")}
            </Link>
          }
        />

        <button
          type="submit"
          disabled={submitting || googleSubmitting}
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
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <input className="input-base" {...inputProps} />
    </label>
  );
}
