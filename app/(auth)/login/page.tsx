"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/I18nProvider";

export default function LoginPage() {
  const t = useT();
  return (
    <div className="fade-up">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        {t("auth.login.title")}
      </h1>
      <p className="mt-2 text-ink-600">{t("auth.login.subtitle")}</p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = "/student";
        }}
      >
        <Field label={t("auth.email")} type="email" placeholder="you@example.com" required />
        <Field
          label={t("auth.password")}
          type="password"
          placeholder="••••••••"
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
        <button type="submit" className="btn btn-primary mt-2 justify-center">
          {t("auth.submit.login")}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-xs text-ink-500 uppercase tracking-wider">
          {t("auth.continueWith")}
        </span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      <button className="btn btn-secondary w-full justify-center">
        <GoogleIcon className="h-4 w-4" />
        {t("auth.google")}
      </button>

      <p className="mt-8 text-center text-sm text-ink-600">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-900">
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.67-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.67 2.83C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
