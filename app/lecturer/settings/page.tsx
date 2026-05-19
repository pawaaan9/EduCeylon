"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import {
  BankingStep,
  BasicStep,
  ProfessionalStep,
  SocialStep,
  TeachingStep,
} from "@/components/lecturer/LecturerProfileStepForms";
import type { QualificationsInputHandle } from "@/components/QualificationsInput";
import { CheckCircleIcon, GlobeIcon, ShieldIcon, UserIcon } from "@/components/icons";
import { saveMyLecturerProfile } from "@/lib/api/lecturers";
import type { LecturerProfile } from "@/lib/api/types";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useLecturerProfile } from "@/lib/lecturer/LecturerProfileProvider";
import {
  lecturerProfileSectionPatch,
  mergeSectionFromServer,
  profileSectionSnapshot,
  type ProfileEditSection,
} from "@/lib/lecturer/profile-patch";
import { normalizeSriLankaPhone } from "@/lib/phone/sri-lanka";
import {
  formatSettingsValidationError,
  validateSettingsSection,
} from "@/lib/lecturer/settings-validation";
import type { QualificationDraft } from "@/lib/onboarding/steps";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";

type Tab = "general" | "security" | "language";

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

      {tab === "general" && <LecturerGeneralTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "language" && (
        <LanguageTab locale={locale} setLocale={setLocale} />
      )}
    </>
  );
}

function LecturerGeneralTab() {
  const t = useT();
  const { user } = useAuth();
  const { profile: serverProfile, loading, setFromResponse } = useLecturerProfile();
  const [form, setForm] = useState<LecturerProfile | null>(null);
  const [savingSection, setSavingSection] = useState<ProfileEditSection | null>(
    null,
  );
  const [sectionMessage, setSectionMessage] = useState<
    Partial<Record<ProfileEditSection, string>>
  >({});
  const [sectionError, setSectionError] = useState<
    Partial<Record<ProfileEditSection, string>>
  >({});
  const qualificationsRef = useRef<QualificationsInputHandle>(null);
  const [qualificationDraft, setQualificationDraft] =
    useState<QualificationDraft>({
      title: "",
      institute: "",
      year: "",
    });
  const [phoneFieldError, setPhoneFieldError] = useState<string | undefined>();

  const email =
    serverProfile?.email ?? user?.email ?? "";

  useEffect(() => {
    if (!serverProfile) return;
    const next = { ...serverProfile };
    if (next.phone) {
      const normalized = normalizeSriLankaPhone(next.phone);
      if (normalized) next.phone = normalized;
    }
    setForm(next);
  }, [serverProfile]);

  const isSectionDirty = useCallback(
    (section: ProfileEditSection) => {
      if (!form || !serverProfile) return false;
      return (
        profileSectionSnapshot(form, section) !==
        profileSectionSnapshot(serverProfile, section)
      );
    },
    [form, serverProfile],
  );

  const clearSectionFeedback = useCallback((section: ProfileEditSection) => {
    setSectionMessage((m) => {
      const next = { ...m };
      delete next[section];
      return next;
    });
    setSectionError((e) => {
      const next = { ...e };
      delete next[section];
      return next;
    });
  }, []);

  const resetSection = useCallback(
    (section: ProfileEditSection) => {
      if (!serverProfile || !form) return;
      setForm(mergeSectionFromServer(form, serverProfile, section));
      clearSectionFeedback(section);
    },
    [serverProfile, form, clearSectionFeedback],
  );

  async function persist(patch: Partial<LecturerProfile>): Promise<boolean> {
    if (!user) return false;
    try {
      const token = await user.getIdToken();
      const result = await saveMyLecturerProfile(token, patch);
      setFromResponse(result);
      setForm({ ...result.profile });
      return true;
    } catch {
      return false;
    }
  }

  function applyChange(patch: Partial<LecturerProfile>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    if ("phone" in patch) setPhoneFieldError(undefined);
    const section = patchSectionForFields(patch);
    if (section) clearSectionFeedback(section);
  }

  async function saveSection(section: ProfileEditSection) {
    if (!user || !form) return;

    let next = form;
    if (section === "professional") {
      const merged = qualificationsRef.current?.commitDraft();
      if (merged) {
        next = { ...next, qualifications: merged };
        setForm(next);
      }
    }
    if (section === "basic" && next.phone) {
      const normalized = normalizeSriLankaPhone(next.phone);
      if (normalized) next = { ...next, phone: normalized };
    }

    const missing = validateSettingsSection(section, next, t, {
      qualificationDraft:
        section === "professional" ? qualificationDraft : undefined,
    });
    if (missing.length > 0) {
      const message = formatSettingsValidationError(missing, t);
      setSectionError((e) => ({ ...e, [section]: message }));
      setSectionMessage((m) => {
        const copy = { ...m };
        delete copy[section];
        return copy;
      });
      if (section === "basic") {
        if (!next.phone?.trim()) {
          setPhoneFieldError(t("lecturer.settings.validation.phoneRequired"));
        } else if (
          missing.some((m) => m === t("phone.sriLanka.invalid"))
        ) {
          setPhoneFieldError(t("phone.sriLanka.invalid"));
        }
      }
      return;
    }

    setPhoneFieldError(undefined);
    setSavingSection(section);
    clearSectionFeedback(section);

    try {
      const token = await user.getIdToken();
      const result = await saveMyLecturerProfile(
        token,
        lecturerProfileSectionPatch(next, section),
      );
      setFromResponse(result);
      setForm({ ...result.profile });
      setSectionMessage((m) => ({
        ...m,
        [section]: t("lecturer.settings.saved"),
      }));
    } catch (e) {
      setSectionError((err) => ({
        ...err,
        [section]:
          e instanceof Error ? e.message : t("lecturer.settings.saveError"),
      }));
    } finally {
      setSavingSection(null);
    }
  }

  if (loading || !form || !user) {
    return (
      <div className="card p-8 text-center text-sm text-ink-500">
        {t("lecturer.settings.loading")}
      </div>
    );
  }

  const sectionProps = (section: ProfileEditSection) => ({
    dirty: isSectionDirty(section),
    saving: savingSection === section,
    message: sectionMessage[section],
    error: sectionError[section],
    onReset: () => resetSection(section),
    onSave: () => void saveSection(section),
  });

  return (
    <div className="space-y-4">

      <ProfileSection
        title={t("onboard.step.basic")}
        desc={t("onboard.step.basic.desc")}
        {...sectionProps("basic")}
      >
        <BasicStep
          uid={user.uid}
          value={form}
          onChange={applyChange}
          onPersist={persist}
          showPhone
          email={email}
          emailLockedHint={t("settings.profile.emailLocked")}
          phoneError={phoneFieldError}
        />
      </ProfileSection>

      <ProfileSection
        title={t("onboard.step.professional")}
        desc={t("onboard.step.professional.desc")}
        {...sectionProps("professional")}
      >
        <ProfessionalStep
          value={form}
          onChange={applyChange}
          qualificationsRef={qualificationsRef}
          onQualificationDraftChange={setQualificationDraft}
        />
      </ProfileSection>

      <ProfileSection
        title={t("onboard.step.teaching")}
        desc={t("onboard.step.teaching.desc")}
        {...sectionProps("teaching")}
      >
        <TeachingStep value={form} onChange={applyChange} />
      </ProfileSection>

      <ProfileSection
        title={t("onboard.step.social")}
        desc={t("onboard.step.social.desc")}
        {...sectionProps("social")}
      >
        <SocialStep value={form} onChange={applyChange} />
      </ProfileSection>

      <ProfileSection
        title={t("onboard.step.banking")}
        desc={t("onboard.step.banking.desc")}
        {...sectionProps("banking")}
      >
        <BankingStep value={form} onChange={applyChange} />
      </ProfileSection>
    </div>
  );
}

function patchSectionForFields(
  patch: Partial<LecturerProfile>,
): ProfileEditSection | null {
  const keys = Object.keys(patch);
  if (keys.some((k) => ["photoURL", "coverURL"].includes(k))) return "basic";
  if (
    keys.some((k) =>
      [
        "displayName",
        "phone",
        "bio",
        "district",
        "languages",
      ].includes(k),
    )
  ) {
    return "basic";
  }
  if (
    keys.some((k) =>
      [
        "mainSubject",
        "subCategories",
        "teachingLevels",
        "experienceYears",
        "qualifications",
        "lecturerType",
      ].includes(k),
    )
  ) {
    return "professional";
  }
  if (
    keys.some((k) =>
      [
        "teachingMethods",
        "availableDays",
        "availableSchedule",
        "availableFrom",
        "availableTo",
      ].includes(k),
    )
  ) {
    return "teaching";
  }
  if (
    keys.some((k) =>
      ["facebook", "youtube", "tiktok", "instagram", "website"].includes(k),
    )
  ) {
    return "social";
  }
  if (
    keys.some((k) =>
      [
        "bankAccountHolder",
        "bankName",
        "bankBranch",
        "bankAccountNumber",
      ].includes(k),
    )
  ) {
    return "banking";
  }
  return null;
}

function ProfileSection({
  title,
  desc,
  children,
  dirty,
  saving,
  message,
  error,
  onReset,
  onSave,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  dirty: boolean;
  saving: boolean;
  message?: string;
  error?: string;
  onReset: () => void;
  onSave: () => void;
}) {
  const t = useT();

  return (
    <section className="card p-6 sm:p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <p className="mt-1 text-sm text-ink-500">{desc}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!dirty || saving}
            onClick={onReset}
          >
            {t("settings.reset")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!dirty || saving}
            onClick={onSave}
          >
            <CheckCircleIcon className="h-4 w-4" />
            {saving ? t("lecturer.settings.saving") : t("settings.save")}
          </button>
        </div>
      </header>

      {message && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {children}
    </section>
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

function Field({
  label,
  ...rest
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <input className="input-base" {...rest} />
    </label>
  );
}
