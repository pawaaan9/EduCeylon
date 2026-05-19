"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import { LecturerImageUpload } from "@/components/LecturerImageUpload";
import { CheckIcon, CheckCircleIcon, GlobeIcon, ShieldIcon, UserIcon } from "@/components/icons";
import { LANGUAGE_OPTIONS } from "@/app/lecturer/onboarding/constants";
import { saveMyLecturerProfile } from "@/lib/api/lecturers";
import type { LecturerProfile } from "@/lib/api/types";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useLecturerProfile } from "@/lib/lecturer/LecturerProfileProvider";
import {
  SRI_LANKA_DISTRICTS,
  findDistrict,
  localizedLabel,
} from "@/lib/data/sri-lanka-locations";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { MIN_BIO_LENGTH } from "@/lib/onboarding/bio";

type Tab = "general" | "security" | "language";

type PersonalForm = {
  displayName: string;
  phone: string;
  bio: string;
  district: string;
  languages: string[];
};

function profileToForm(p: LecturerProfile): PersonalForm {
  return {
    displayName: p.displayName ?? "",
    phone: p.phone ?? "",
    bio: p.bio ?? "",
    district: p.district ?? "",
    languages: [...(p.languages ?? [])],
  };
}

export default function LecturerSettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [tab, setTab] = useState<Tab>("general");

  return (
    <>
      <GradientHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="flex items-center gap-1 border-b border-ink-200">
        {(
          [
            { id: "general" as const, icon: <UserIcon className="h-4 w-4" /> },
            { id: "security" as const, icon: <ShieldIcon className="h-4 w-4" /> },
            { id: "language" as const, icon: <GlobeIcon className="h-4 w-4" /> },
          ]
        ).map((x) => (
          <button
            key={x.id}
            type="button"
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

      {tab === "general" && <LecturerPersonalTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "language" && (
        <LanguageTab locale={locale} setLocale={setLocale} />
      )}
    </>
  );
}

function LecturerPersonalTab() {
  const t = useT();
  const { locale } = useI18n();
  const { user } = useAuth();
  const { profile, loading, setFromResponse } = useLecturerProfile();
  const [form, setForm] = useState<PersonalForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email =
    profile?.email ?? user?.email ?? "";

  useEffect(() => {
    if (profile) setForm(profileToForm(profile));
  }, [profile]);

  const dirty = useMemo(() => {
    if (!profile || !form) return false;
    return JSON.stringify(profileToForm(profile)) !== JSON.stringify(form);
  }, [profile, form]);

  const reset = useCallback(() => {
    if (profile) setForm(profileToForm(profile));
    setMessage(null);
    setError(null);
  }, [profile]);

  async function save() {
    if (!user || !form) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const result = await saveMyLecturerProfile(token, {
        displayName: form.displayName.trim(),
        phone: form.phone.trim() || undefined,
        bio: form.bio.trim(),
        district: form.district || undefined,
        languages: form.languages,
      });
      setFromResponse(result);
      setForm(profileToForm(result.profile));
      setMessage(t("lecturer.settings.saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("lecturer.settings.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="card p-8 text-center text-sm text-ink-500">
        {t("lecturer.settings.loading")}
      </div>
    );
  }

  const bioLen = form.bio.trim().length;
  const districtLabel = findDistrict(form.district);

  return (
    <div className="space-y-4">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">
                {t("lecturer.settings.profile.title")}
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                {t("lecturer.settings.profile.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!dirty || saving}
              onClick={reset}
            >
              {t("settings.reset")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!dirty || saving}
              onClick={() => void save()}
            >
              <CheckCircleIcon className="h-4 w-4" />
              {saving ? t("lecturer.settings.saving") : t("settings.save")}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-5 max-w-3xl">
          {user?.uid && (
            <LecturerImageUpload
              uid={user.uid}
              label={t("onboard.basic.photo")}
              helper={t("onboard.basic.photo.helper")}
              currentUrl={profile?.photoURL}
              uploadKey="photo"
              previewAspect="square"
              cropPreset="profile"
              priority
              onChange={async (url) => {
                if (!user) return;
                const token = await user.getIdToken();
                const result = await saveMyLecturerProfile(token, { photoURL: url });
                setFromResponse(result);
              }}
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label={t("onboard.basic.displayName")}
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => f && { ...f, displayName: e.target.value })
              }
            />
            <Field
              label={t("settings.profile.email")}
              value={email}
              disabled
              hint={t("settings.profile.emailLocked")}
            />
            <Field
              label={t("lecturer.settings.phone")}
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => f && { ...f, phone: e.target.value })
              }
            />
            <SelectField
              label={t("onboard.basic.district")}
              value={form.district}
              onChange={(e) =>
                setForm((f) => f && { ...f, district: e.target.value })
              }
            >
              <option value="">{t("onboard.basic.district.placeholder")}</option>
              {SRI_LANKA_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {localizedLabel(d.name, locale)}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <TextArea
              label={t("onboard.basic.bio")}
              value={form.bio}
              rows={4}
              onChange={(e) => setForm((f) => f && { ...f, bio: e.target.value })}
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-ink-500">{t("onboard.basic.bio.helper")}</p>
              <p className="text-xs text-ink-500">
                {bioLen >= MIN_BIO_LENGTH
                  ? t("onboard.basic.bio.minMet")
                  : t("onboard.basic.bio.charsRemaining").replace(
                      "{count}",
                      String(Math.max(0, MIN_BIO_LENGTH - bioLen)),
                    )}
              </p>
            </div>
          </div>

          <LanguageChips
            label={t("onboard.basic.languages")}
            values={form.languages}
            onChange={(languages) =>
              setForm((f) => f && { ...f, languages })
            }
          />
        </div>
      </div>

      {profile && (
        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-ink-900">
            {t("lecturer.settings.overview.title")}
          </h3>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-ink-500">{t("onboard.prof.mainSubject")}</dt>
              <dd className="font-medium text-ink-900">
                {profile.mainSubject?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("onboard.review.location")}</dt>
              <dd className="font-medium text-ink-900">
                {districtLabel
                  ? localizedLabel(districtLabel.name, locale)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("lecturer.settings.status")}</dt>
              <dd className="font-medium text-ink-900 capitalize">
                {profile.approvalStatus}
              </dd>
            </div>
          </dl>
          <Link
            href="/lecturer/onboarding"
            className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            {t("lecturer.settings.editFullProfile")} →
          </Link>
        </div>
      )}
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
            type="button"
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
              {locale === code && (
                <CheckCircleIcon className="h-5 w-5 text-brand-600" />
              )}
            </div>
            <div className="mt-3 font-semibold text-ink-900">
              {LOCALE_LABELS[code].native}
            </div>
            <div className="text-xs text-ink-500">
              {LOCALE_LABELS[code].english}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LanguageChips({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((code) => {
          const on = values.includes(code);
          return (
            <button
              key={code}
              type="button"
              onClick={() =>
                onChange(
                  on ? values.filter((x) => x !== code) : [...values, code],
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                on
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
              }`}
            >
              {on && <CheckIcon className="h-3.5 w-3.5" />}
              {t(`onboard.languages.${code}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  ...rest
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <input
        className={`input-base ${rest.disabled ? "bg-ink-50 text-ink-500" : ""}`}
        {...rest}
      />
      {hint && <p className="text-xs text-ink-500 mt-1.5">{hint}</p>}
    </label>
  );
}

function SelectField({
  label,
  children,
  ...rest
}: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <select className="input-base select-base" {...rest}>
        {children}
      </select>
    </label>
  );
}

function TextArea({
  label,
  helper,
  ...rest
}: {
  label: string;
  helper?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-2 block">{label}</span>
      <textarea className="textarea-base" {...rest} />
      {helper && <p className="text-xs text-ink-500 mt-1.5">{helper}</p>}
    </label>
  );
}
