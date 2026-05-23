"use client";

import { useRef, useState } from "react";
import { CheckIcon, CloseIcon, UploadIcon } from "@/components/icons";
import { LecturerImageUpload } from "@/components/LecturerImageUpload";
import { SriLankaPhoneField } from "@/components/SriLankaPhoneField";
import {
  QualificationsInput,
  type QualificationsInputHandle,
} from "@/components/QualificationsInput";
import { SubCategoriesInput } from "@/components/SubCategoriesInput";
import {
  LANGUAGE_OPTIONS,
  LECTURER_TYPES,
  MIN_BIO_LENGTH,
  TEACHING_LEVELS,
  TEACHING_METHODS,
} from "@/app/lecturer/onboarding/constants";
import { uploadLecturerAsset } from "@/lib/api/lecturers";
import type {
  LecturerProfile,
  LecturerType,
  TeachingLevel,
  TeachingMethod,
} from "@/lib/api/types";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import type { QualificationDraft } from "@/lib/onboarding/steps";
import {
  localizedLabel,
  SRI_LANKA_DISTRICTS,
} from "@/lib/data/sri-lanka-locations";

export type ProfileStepChange = (patch: Partial<LecturerProfile>) => void;
export type ProfileStepPersist = (
  patch: Partial<LecturerProfile>,
) => Promise<boolean>;

export function BasicStep({
  uid,
  value,
  onChange,
  onPersist,
  showPhone,
  email,
  emailLockedHint,
  phoneError,
}: {
  uid: string;
  value: LecturerProfile;
  onChange: ProfileStepChange;
  onPersist: ProfileStepPersist;
  showPhone?: boolean;
  email?: string;
  emailLockedHint?: string;
  phoneError?: string;
}) {
  const t = useT();
  return (
    <div className="grid gap-5">
      <LecturerImageUpload
        uid={uid}
        label={t("onboard.basic.photo")}
        helper={t("onboard.basic.photo.helper")}
        currentUrl={value.photoURL}
        uploadKey="photo"
        onChange={(url) => void onPersist({ photoURL: url })}
        previewAspect="square"
        cropPreset="profile"
        priority
      />
      <LecturerImageUpload
        uid={uid}
        label={t("onboard.basic.cover")}
        helper={t("onboard.basic.cover.helper")}
        currentUrl={value.coverURL}
        uploadKey="cover"
        onChange={(url) => void onPersist({ coverURL: url })}
        previewAspect="cover"
        cropPreset="cover"
        priority
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={t("onboard.basic.displayName")}
          value={value.displayName ?? ""}
          onChange={(e) => onChange({ displayName: e.target.value })}
          required
        />
        {email !== undefined && (
          <Field
            label={t("settings.profile.email")}
            value={email}
            disabled
            hint={emailLockedHint}
          />
        )}
        {showPhone && (
          <SriLankaPhoneField
            label={t("lecturer.settings.phone")}
            value={value.phone ?? ""}
            onChange={(phone) => onChange({ phone })}
            required
            error={phoneError}
          />
        )}
      </div>
      <TextArea
        label={t("onboard.basic.bio")}
        value={value.bio ?? ""}
        onChange={(e) => onChange({ bio: e.target.value })}
        rows={4}
        helper={t("onboard.basic.bio.helper")}
        minChars={MIN_BIO_LENGTH}
        minCharsRemainingLabel={(count) =>
          t("onboard.basic.bio.charsRemaining").replace("{count}", String(count))
        }
        minCharsMetLabel={t("onboard.basic.bio.minMet")}
      />
      <LocationSelects value={value} onChange={onChange} />
      <CheckboxGroup
        label={t("onboard.basic.languages")}
        options={LANGUAGE_OPTIONS.map((code) => ({
          value: code,
          label: t(`onboard.languages.${code}`),
        }))}
        values={value.languages}
        onChange={(languages) => onChange({ languages })}
      />
    </div>
  );
}

export function ProfessionalStep({
  value,
  onChange,
  qualificationsRef,
  onQualificationDraftChange,
}: {
  value: LecturerProfile;
  onChange: ProfileStepChange;
  qualificationsRef: React.RefObject<QualificationsInputHandle | null>;
  onQualificationDraftChange: (draft: QualificationDraft) => void;
}) {
  const t = useT();
  return (
    <div className="grid gap-5">
      <Field
        label={t("onboard.prof.mainSubject")}
        placeholder="e.g. A/L ICT"
        value={value.mainSubject ?? ""}
        onChange={(e) => onChange({ mainSubject: e.target.value })}
      />
      <SubCategoriesInput
        label={t("onboard.prof.subCategories")}
        helper={t("onboard.prof.subCategories.helper")}
        values={value.subCategories}
        onChange={(subCategories) => onChange({ subCategories })}
      />
      <CheckboxGroup
        label={t("onboard.prof.levels")}
        options={TEACHING_LEVELS.map((lvl) => ({
          value: lvl,
          label: t(`onboard.levels.${lvl}`),
        }))}
        values={value.teachingLevels}
        onChange={(arr) => onChange({ teachingLevels: arr as TeachingLevel[] })}
      />
      <Field
        label={t("onboard.prof.experience")}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value.experienceYears ?? ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          if (digits === "") {
            onChange({ experienceYears: undefined });
            return;
          }
          onChange({ experienceYears: Math.min(60, parseInt(digits, 10)) });
        }}
      />
      <QualificationsInput
        ref={qualificationsRef}
        label={t("onboard.prof.qualifications")}
        helper={t("onboard.prof.qualifications.helper")}
        values={value.qualifications}
        onChange={(qualifications) => onChange({ qualifications })}
        onDraftChange={onQualificationDraftChange}
      />
      <RadioGroup
        label={t("onboard.prof.type")}
        options={LECTURER_TYPES.map((tp) => ({
          value: tp,
          label: t(`onboard.types.${tp}`),
        }))}
        value={value.lecturerType ?? ""}
        onChange={(v) => onChange({ lecturerType: v as LecturerType })}
      />
    </div>
  );
}

export function TeachingStep({
  value,
  onChange,
}: {
  value: LecturerProfile;
  onChange: ProfileStepChange;
}) {
  const t = useT();

  return (
    <div className="grid gap-5">
      <CheckboxGroup
        label={t("onboard.teaching.methods")}
        options={TEACHING_METHODS.map((m) => ({
          value: m,
          label: t(`onboard.methods.${m}`),
        }))}
        values={value.teachingMethods}
        onChange={(arr) => onChange({ teachingMethods: arr as TeachingMethod[] })}
      />
    </div>
  );
}

export function SocialStep({
  value,
  onChange,
}: {
  value: LecturerProfile;
  onChange: ProfileStepChange;
}) {
  const t = useT();
  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink-500">{t("onboard.social.optional")}</p>
      <Field
        label={t("onboard.social.facebook")}
        type="url"
        placeholder="https://facebook.com/your-page"
        value={value.facebook ?? ""}
        onChange={(e) => onChange({ facebook: e.target.value })}
      />
      <Field
        label={t("onboard.social.youtube")}
        type="url"
        placeholder="https://youtube.com/@channel"
        value={value.youtube ?? ""}
        onChange={(e) => onChange({ youtube: e.target.value })}
      />
      <Field
        label={t("onboard.social.tiktok")}
        type="url"
        placeholder="https://tiktok.com/@handle"
        value={value.tiktok ?? ""}
        onChange={(e) => onChange({ tiktok: e.target.value })}
      />
      <Field
        label={t("onboard.social.instagram")}
        type="url"
        placeholder="https://instagram.com/handle"
        value={value.instagram ?? ""}
        onChange={(e) => onChange({ instagram: e.target.value })}
      />
      <Field
        label={t("onboard.social.website")}
        type="url"
        placeholder="https://yoursite.lk"
        value={value.website ?? ""}
        onChange={(e) => onChange({ website: e.target.value })}
      />
    </div>
  );
}

export function VerificationStep({
  uid,
  value,
  onChange,
  onPersist,
}: {
  uid: string;
  value: LecturerProfile;
  onChange: ProfileStepChange;
  onPersist?: ProfileStepPersist;
}) {
  const t = useT();

  function persistNic(patch: Partial<LecturerProfile>) {
    if (onPersist) void onPersist(patch);
    else onChange(patch);
  }

  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink-500">{t("onboard.verify.note")}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <LecturerImageUpload
          uid={uid}
          label={t("onboard.verify.nicFront")}
          currentUrl={value.nicFrontURL}
          uploadKey="nicFront"
          onChange={(url) => persistNic({ nicFrontURL: url })}
          previewAspect="cover"
        />
        <LecturerImageUpload
          uid={uid}
          label={t("onboard.verify.nicBack")}
          currentUrl={value.nicBackURL}
          uploadKey="nicBack"
          onChange={(url) => persistNic({ nicBackURL: url })}
          previewAspect="cover"
        />
      </div>
      <ExtraDocsUpload
        urls={value.extraDocs}
        onChange={(extraDocs) => {
          if (onPersist) void onPersist({ extraDocs });
          else onChange({ extraDocs });
        }}
      />
    </div>
  );
}

export function BankingStep({
  value,
  onChange,
}: {
  value: LecturerProfile;
  onChange: ProfileStepChange;
}) {
  const t = useT();
  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink-500">{t("onboard.bank.note")}</p>
      <Field
        label={t("onboard.bank.holder")}
        value={value.bankAccountHolder ?? ""}
        onChange={(e) => onChange({ bankAccountHolder: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("onboard.bank.name")}
          value={value.bankName ?? ""}
          onChange={(e) => onChange({ bankName: e.target.value })}
        />
        <Field
          label={t("onboard.bank.branch")}
          value={value.bankBranch ?? ""}
          onChange={(e) => onChange({ bankBranch: e.target.value })}
        />
      </div>
      <Field
        label={t("onboard.bank.account")}
        value={value.bankAccountNumber ?? ""}
        onChange={(e) => onChange({ bankAccountNumber: e.target.value })}
      />
    </div>
  );
}

function LocationSelects({
  value,
  onChange,
}: {
  value: LecturerProfile;
  onChange: ProfileStepChange;
}) {
  const t = useT();
  const { locale } = useI18n();

  return (
    <SelectField
      label={t("onboard.basic.district")}
      value={value.district ?? ""}
      required
      onChange={(e) => onChange({ district: e.target.value || undefined })}
    >
      <option value="">{t("onboard.basic.district.placeholder")}</option>
      {SRI_LANKA_DISTRICTS.map((d) => (
        <option key={d.id} value={d.id}>
          {localizedLabel(d.name, locale)}
        </option>
      ))}
    </SelectField>
  );
}

function SelectField({
  label,
  helper,
  children,
  ...rest
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">
        {label}
        {rest.required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      <select
        className="input-base select-base disabled:bg-ink-50 disabled:text-ink-500"
        {...rest}
      >
        {children}
      </select>
      {helper && <p className="mt-1 text-xs text-ink-500">{helper}</p>}
    </label>
  );
}

function Field({
  label,
  helper,
  hint,
  ...rest
}: {
  label: string;
  helper?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const note = helper ?? hint;
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">
        {label}
      </span>
      <input
        className={`input-base ${rest.disabled ? "bg-ink-50 text-ink-500" : ""}`}
        {...rest}
      />
      {note && <p className="mt-1 text-xs text-ink-500">{note}</p>}
    </label>
  );
}

function TextArea({
  label,
  helper,
  minChars,
  minCharsRemainingLabel,
  minCharsMetLabel,
  value,
  ...rest
}: {
  label: string;
  helper?: string;
  minChars?: number;
  minCharsRemainingLabel?: (remaining: number) => string;
  minCharsMetLabel?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const text = typeof value === "string" ? value : String(value ?? "");
  const length = text.trim().length;
  const remaining =
    minChars !== undefined ? Math.max(0, minChars - length) : 0;
  const minMet = minChars !== undefined && remaining === 0;

  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">
        {label}
      </span>
      <textarea className="textarea-base" value={value} {...rest} />
      <MinCharsFooter
        helper={helper}
        minChars={minChars}
        remaining={remaining}
        minMet={minMet}
        minCharsRemainingLabel={minCharsRemainingLabel}
        minCharsMetLabel={minCharsMetLabel}
      />
    </label>
  );
}

function MinCharsFooter({
  helper,
  minChars,
  remaining,
  minMet,
  minCharsRemainingLabel,
  minCharsMetLabel,
}: {
  helper?: string;
  minChars?: number;
  remaining: number;
  minMet: boolean;
  minCharsRemainingLabel?: (remaining: number) => string;
  minCharsMetLabel?: string;
}) {
  const showCounter =
    minChars !== undefined && (minCharsRemainingLabel || minCharsMetLabel);

  return (
    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      {helper ? <p className="text-xs text-ink-500">{helper}</p> : <span />}
      {showCounter && (
        <p
          className={`text-xs font-medium tabular-nums ${
            minMet ? "text-emerald-600" : "text-amber-700"
          }`}
          aria-live="polite"
        >
          {minMet && minCharsMetLabel
            ? minCharsMetLabel
            : minCharsRemainingLabel?.(remaining)}
        </p>
      )}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(
      values.includes(v) ? values.filter((x) => x !== v) : [...values, v],
    );
  }
  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                on
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
              }`}
            >
              {on && <CheckIcon className="h-3.5 w-3.5" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-2">{label}</div>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                on
                  ? "border-brand-600 bg-brand-50"
                  : "border-ink-200 bg-white hover:border-ink-300"
              }`}
            >
              <div className="text-sm font-semibold text-ink-900">{o.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExtraDocsUpload({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const ref = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const token = await user.getIdToken();
      const url = await uploadLecturerAsset(token, "extraDoc", file);
      onChange([...urls, url]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-1.5">
        {t("onboard.verify.extraDocs")}
      </div>
      <p className="mb-3 text-xs text-ink-500">
        {t("onboard.verify.extraDocs.helper")}
      </p>
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-700 hover:border-ink-300"
          >
            Doc #{i + 1}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange(urls.filter((x) => x !== u));
              }}
              className="text-ink-400 hover:text-rose-500"
              aria-label="Remove"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </a>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          <UploadIcon className="h-4 w-4" />
          {uploading
            ? t("onboard.upload.uploading")
            : t("onboard.verify.extraDocs.add")}
        </button>
      </div>
    </div>
  );
}
