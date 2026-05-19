"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/I18nProvider";
import { GoogleIcon, GraduationIcon, MicIcon } from "@/components/icons";
import { PasswordField } from "@/components/PasswordField";
import { SriLankaPhoneField } from "@/components/SriLankaPhoneField";
import {
  dashboardPathForRole,
  describeAuthError,
  signInWithGoogle,
  signUpWithEmail,
  type AppRole,
} from "@/lib/firebase/auth";
import { isValidSriLankaPhone, normalizeSriLankaPhone } from "@/lib/phone/sri-lanka";

type Role = Extract<AppRole, "student" | "lecturer">;

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const initial: Role = params.get("role") === "lecturer" ? "lecturer" : "student";
  const [role, setRole] = useState<Role>(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLecturer = role === "lecturer";

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleSubmitting(true);
    try {
      const { profile } = await signInWithGoogle({ requestedRole: role });
      router.push(
        profile.role === "lecturer"
          ? "/lecturer/onboarding"
          : dashboardPathForRole(profile.role),
      );
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  }

  function validate(): string | null {
    if (isLecturer && password !== confirmPassword) {
      return t("auth.error.passwordMismatch");
    }
    if (password.length < 6) {
      return t("auth.error.weakPassword");
    }
    if (isLecturer && !isValidSriLankaPhone(phone)) {
      return t("auth.error.invalidPhone");
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const localError = validate();
    if (localError) {
      setError(localError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { profile } = await signUpWithEmail({
        name,
        email,
        password,
        role,
        phone: isLecturer ? normalizeSriLankaPhone(phone) : undefined,
      });
      router.push(
        profile.role === "lecturer"
          ? "/lecturer/onboarding"
          : dashboardPathForRole(profile.role),
      );
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fade-up">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        {t("auth.register.title")}
      </h1>
      <p className="mt-2 text-ink-600">{t("auth.register.subtitle")}</p>

      <div className="mt-6">
        <div className="text-sm font-medium text-ink-700 mb-2">{t("auth.role")}</div>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            active={role === "student"}
            onClick={() => setRole("student")}
            icon={<GraduationIcon className="h-5 w-5" />}
            title={t("auth.role.student")}
            desc="Learn from top lecturers"
          />
          <RoleCard
            active={role === "lecturer"}
            onClick={() => setRole("lecturer")}
            icon={<MicIcon className="h-5 w-5" />}
            title={t("auth.role.lecturer")}
            desc="Teach & earn online"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={googleSubmitting || submitting}
        onClick={handleGoogleSignUp}
        className="btn btn-secondary mt-6 w-full justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="h-5 w-5 shrink-0" />
        {googleSubmitting ? t("auth.connecting") : t("auth.continueWithGoogle")}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-ink-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-ink-400 lg:bg-white">
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
          label={t("auth.name")}
          placeholder="Pawan Dhanapala"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          label={t("auth.email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {isLecturer && (
          <SriLankaPhoneField
            label={t("auth.phone")}
            value={phone}
            onChange={setPhone}
            required
          />
        )}
        <PasswordField
          label={t("auth.password")}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isLecturer && (
          <PasswordField
            label={t("auth.confirmPassword")}
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <button
          type="submit"
          disabled={submitting || googleSubmitting}
          className="btn btn-primary mt-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating account…" : t("auth.submit.register")}
        </button>
        <p className="text-xs text-ink-500 text-center">{t("auth.terms")}</p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-900"
        >
          {t("nav.login")}
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-brand-600 bg-brand-50"
          : "border-ink-200 bg-white hover:border-ink-300"
      }`}
    >
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
          active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700"
        }`}
      >
        {icon}
      </div>
      <div className="mt-3 font-semibold text-ink-900">{title}</div>
      <div className="text-xs text-ink-500 mt-0.5">{desc}</div>
    </button>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">
        {label}
      </span>
      <input className="input-base" {...inputProps} />
    </label>
  );
}
