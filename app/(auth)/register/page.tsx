"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/I18nProvider";
import { GraduationIcon, MicIcon } from "@/components/icons";
import {
  dashboardPathForRole,
  describeAuthError,
  signUpWithEmail,
  type AppRole,
} from "@/lib/firebase/auth";

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
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { profile } = await signUpWithEmail({ name, email, password, role });
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

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
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
        <Field
          label={t("auth.password")}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
