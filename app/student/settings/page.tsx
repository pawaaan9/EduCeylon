"use client";

import { useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { CheckCircleIcon, ShieldIcon, UserIcon, BellIcon, GlobeIcon } from "@/components/icons";

type Tab = "general" | "security" | "notifications" | "language";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [tab, setTab] = useState<Tab>("general");

  return (
    <>
      <GradientHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        actions={
          <div className="flex gap-2">
            <button className="btn border border-white/30 text-white hover:bg-white/10">
              {t("settings.reset")}
            </button>
            <button className="btn bg-white text-brand-700 hover:bg-white/90">
              <CheckCircleIcon className="h-4 w-4" /> {t("settings.save")}
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-1 border-b border-ink-200">
        {(
          [
            { id: "general", icon: <UserIcon className="h-4 w-4" /> },
            { id: "security", icon: <ShieldIcon className="h-4 w-4" /> },
            { id: "notifications", icon: <BellIcon className="h-4 w-4" /> },
            { id: "language", icon: <GlobeIcon className="h-4 w-4" /> },
          ] as { id: Tab; icon: React.ReactNode }[]
        ).map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === x.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-600 hover:text-ink-900"
            }`}
          >
            {x.icon}
            {t(`settings.tab.${x.id}`)}
          </button>
        ))}
      </div>

      {tab === "general" && <GeneralTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "language" && (
        <LanguageTab locale={locale} setLocale={setLocale} />
      )}
    </>
  );
}

function GeneralTab() {
  const { t } = useI18n();
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            {t("settings.profile.title")}
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            {t("settings.profile.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
        <Field label={t("settings.profile.name")} defaultValue="Pawan Dhanapala" />
        <Field
          label={t("settings.profile.email")}
          defaultValue="pawan@educeylon.lk"
          disabled
          hint={t("settings.profile.emailLocked")}
        />
      </div>
    </div>
  );
}

function SecurityTab() {
  const { t } = useI18n();
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
          <ShieldIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            {t("settings.security.title")}
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            {t("settings.security.subtitle")}
          </p>
        </div>
      </div>
      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
        <Field label={t("settings.security.current")} type="password" />
        <div />
        <Field label={t("settings.security.new")} type="password" />
        <Field label={t("settings.security.confirm")} type="password" />
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { title: "New live class reminders", desc: "Get a ping 30 min before any live class starts." },
    { title: "New course announcements", desc: "Lecturer posts updates in courses you're enrolled in." },
    { title: "Weekly progress summary", desc: "A digest of what you learned every Sunday." },
    { title: "Promotional offers", desc: "Discounts and new course drops." },
  ];
  return (
    <div className="card divide-y divide-ink-100">
      {items.map((i, idx) => (
        <ToggleRow key={i.title} title={i.title} desc={i.desc} defaultOn={idx !== 3} />
      ))}
    </div>
  );
}

function LanguageTab({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <GlobeIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            {t("settings.language.title")}
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            {t("settings.language.subtitle")}
          </p>
        </div>
      </div>
      <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            onClick={() => setLocale(code as Locale)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              locale === code
                ? "border-brand-600 bg-brand-50"
                : "border-ink-200 bg-white hover:border-ink-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink-100 text-xs font-bold text-ink-700">
                {LOCALE_LABELS[code].flag}
              </span>
              {locale === code && <CheckCircleIcon className="h-5 w-5 text-brand-600" />}
            </div>
            <div className="mt-3 font-semibold text-ink-900">
              {LOCALE_LABELS[code].native}
            </div>
            <div className="text-xs text-ink-500">{LOCALE_LABELS[code].english}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  ...inputProps
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 block mb-1.5">{label}</span>
      <input
        className={`input-base ${inputProps.disabled ? "bg-ink-50 text-ink-500" : ""}`}
        {...inputProps}
      />
      {hint && <p className="text-xs text-ink-500 mt-1.5">{hint}</p>}
    </label>
  );
}

function ToggleRow({
  title,
  desc,
  defaultOn,
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-6 p-5">
      <div>
        <div className="font-medium text-ink-900">{title}</div>
        <div className="text-sm text-ink-500 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
          on ? "bg-brand-600" : "bg-ink-300"
        }`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
