"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircleIcon, CloseIcon } from "@/components/icons";
import {
  getTeachingScheduleRows,
  type TeachingScheduleRow,
} from "@/lib/onboarding/schedule-display";
import { findDistrict, localizedLabel } from "@/lib/data/sri-lanka-locations";
import { formatLanguagesList } from "@/lib/i18n/language-labels";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import type { LecturerProfile, LecturerQualification } from "@/lib/api/types";

function formatQualification(q: LecturerQualification): string {
  const parts = [q.title.trim()];
  if (q.institute.trim()) parts.push(q.institute.trim());
  if (q.year.trim()) parts.push(q.year.trim());
  return parts.join(" · ");
}

function formatSubmittedAt(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate().toLocaleString();
    } catch {
      return "—";
    }
  }
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  }
  return "—";
}

function ScheduleRows({
  label,
  rows,
}: {
  label: string;
  rows: TeachingScheduleRow[];
}) {
  return (
    <>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500 sm:col-span-2">
        {label}
      </dt>
      <dd className="mt-0 sm:col-span-2">
        {rows.length === 0 ? (
          <span className="text-sm text-ink-400">—</span>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-ink-100 bg-ink-50 divide-y divide-ink-100">
            {rows.map((row) => (
              <li
                key={row.day}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="w-10 shrink-0 font-semibold text-brand-700">
                  {row.dayLabel}
                </span>
                <span className="tabular-nums text-ink-700">
                  {row.from}
                  <span className="mx-1.5 text-ink-300">→</span>
                  {row.to}
                </span>
              </li>
            ))}
          </ul>
        )}
      </dd>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  const text = value?.trim();
  return (
    <>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink-900 break-words">
        {text ? value : <span className="text-ink-400">—</span>}
      </dd>
    </>
  );
}

function DocImage({ label, src, alt }: { label: string; src?: string; alt: string }) {
  if (!src) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold text-ink-600">{label}</p>
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-ink-200 bg-ink-50 text-xs text-ink-400">
          Missing
        </div>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold text-ink-600">{label}</p>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-ink-200 bg-ink-900/5"
        title="Open full size"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="mx-auto block w-full h-auto max-h-[min(45vh,320px)] object-contain"
        />
      </a>
    </div>
  );
}

export function LecturerApprovalReview({
  profile,
  busy,
  readOnly = false,
  onApprove,
  onReject,
  onClose,
}: {
  profile: LecturerProfile;
  busy: boolean;
  /** Hide approve/reject when viewing an already reviewed profile. */
  readOnly?: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const district = findDistrict(profile.district);
  const districtLabel = district
    ? localizedLabel(district.name, locale)
    : profile.district;

  const scheduleRows = getTeachingScheduleRows(profile, (day) =>
    t(`onboard.days.${day}`),
  );

  return (
    <div className="card overflow-hidden flex flex-col max-h-[min(90vh,900px)]">
      <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2
            id="lecturer-review-title"
            className="text-lg font-semibold text-ink-900"
          >
            {profile.displayName ?? profile.email ?? profile.uid}
          </h2>
          <p className="text-sm text-ink-500">
            {t("admin.lecturers.submitted")}: {formatSubmittedAt(profile.submittedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <section className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-ink-200">
            {profile.photoURL ? (
              <Image
                src={profile.photoURL}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-ink-100 text-ink-400 text-xs">
                No photo
              </div>
            )}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailRow label={t("onboard.review.displayName")} value={profile.displayName} />
            <DetailRow label="Email" value={profile.email} />
            <DetailRow label={t("onboard.review.location")} value={districtLabel} />
            <DetailRow label={t("onboard.review.mainSubject")} value={profile.mainSubject} />
            <DetailRow
              label={t("onboard.review.languages")}
              value={formatLanguagesList(profile.languages)}
            />
            <DetailRow
              label={t("onboard.prof.type")}
              value={
                profile.lecturerType
                  ? t(`onboard.types.${profile.lecturerType}`)
                  : undefined
              }
            />
          </dl>
        </section>

        {profile.coverURL && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Cover
            </p>
            <a
              href={profile.coverURL}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-ink-200 bg-ink-900/5"
              title="Open full size"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.coverURL}
                alt="Profile cover"
                className="mx-auto block w-full h-auto max-h-[min(40vh,320px)] object-contain"
              />
            </a>
          </section>
        )}

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
            Bio
          </p>
          <p className="text-sm text-ink-800 whitespace-pre-wrap rounded-lg bg-ink-50 p-3">
            {profile.bio?.trim() || "—"}
          </p>
        </section>

        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            label={t("onboard.review.levels")}
            value={profile.teachingLevels.map((l) => t(`onboard.levels.${l}`)).join(", ")}
          />
          <DetailRow
            label={t("onboard.review.methods")}
            value={profile.teachingMethods
              .map((m) => t(`onboard.methods.${m}`))
              .join(", ")}
          />
          <DetailRow
            label={t("onboard.review.experience")}
            value={profile.experienceYears?.toString()}
          />
          <ScheduleRows label={t("onboard.review.schedule")} rows={scheduleRows} />
          <DetailRow
            label={t("onboard.review.qualifications")}
            value={
              profile.qualifications.length > 0
                ? profile.qualifications.map(formatQualification).join("; ")
                : undefined
            }
          />
          <DetailRow
            label={t("onboard.prof.subCategories")}
            value={profile.subCategories.join(", ")}
          />
        </dl>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
            {t("admin.lecturers.identity")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <DocImage
              label={t("admin.lecturers.nicFront")}
              src={profile.nicFrontURL}
              alt="NIC front"
            />
            <DocImage
              label={t("admin.lecturers.nicBack")}
              src={profile.nicBackURL}
              alt="NIC back"
            />
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
            {t("admin.lecturers.banking")}
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailRow label={t("onboard.review.bankName")} value={profile.bankName} />
            <DetailRow label={t("onboard.bank.branch")} value={profile.bankBranch} />
            <DetailRow label={t("onboard.bank.holder")} value={profile.bankAccountHolder} />
            <DetailRow label={t("onboard.bank.account")} value={profile.bankAccountNumber} />
          </dl>
        </section>

        {(profile.facebook ||
          profile.youtube ||
          profile.instagram ||
          profile.tiktok ||
          profile.website) && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              Social
            </p>
            <ul className="space-y-1 text-sm">
              {[
                ["Facebook", profile.facebook],
                ["YouTube", profile.youtube],
                ["Instagram", profile.instagram],
                ["TikTok", profile.tiktok],
                ["Website", profile.website],
              ]
                .filter(([, url]) => url?.trim())
                .map(([label, url]) => (
                  <li key={label}>
                    <span className="text-ink-500">{label}: </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {rejectOpen && (
          <div>
            <label className="text-sm font-medium text-ink-700">
              {t("admin.lecturers.rejectReason")}
            </label>
            <textarea
              className="input mt-1.5 min-h-[80px] w-full"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("admin.lecturers.rejectPlaceholder")}
            />
          </div>
        )}
      </div>

      {!readOnly && (
      <div className="flex flex-wrap gap-2 border-t border-ink-100 px-5 py-4 bg-ink-50/80">
        {!rejectOpen ? (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={onApprove}
            >
              <CheckCircleIcon className="h-4 w-4" />
              {t("admin.action.approve")}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
            >
              {t("admin.action.reject")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => {
                setRejectOpen(false);
                setReason("");
              }}
            >
              {t("action.cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600"
              disabled={busy || !reason.trim()}
              onClick={() => onReject(reason.trim())}
            >
              {t("admin.lecturers.confirmReject")}
            </button>
          </>
        )}
      </div>
      )}
    </div>
  );
}
