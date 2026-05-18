"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/I18nProvider";
import { GraduationIcon, MicIcon } from "@/components/icons";

type Role = "student" | "lecturer";

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
  const initial = (params.get("role") === "lecturer" ? "lecturer" : "student") as Role;
  const [role, setRole] = useState<Role>(initial);

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

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(role === "lecturer" ? "/lecturer" : "/student");
        }}
      >
        <Field label={t("auth.name")} placeholder="Pawan Dhanapala" required />
        <Field label={t("auth.email")} type="email" placeholder="you@example.com" required />
        <Field label={t("auth.password")} type="password" placeholder="••••••••" required />

        <button type="submit" className="btn btn-primary mt-2 justify-center">
          {t("auth.submit.register")}
        </button>
        <p className="text-xs text-ink-500 text-center">{t("auth.terms")}</p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-600">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-900">
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
