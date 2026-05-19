"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/icons";
import { useOptionalLecturerProfile } from "@/lib/lecturer/LecturerProfileProvider";
import { useT } from "@/lib/i18n/I18nProvider";

/**
 * Dashboard prompt for incomplete lecturer profiles.
 * Renders immediately (no skeleton); progress refines when the API responds.
 */
export function LecturerOnboardingBanner() {
  const t = useT();
  const ctx = useOptionalLecturerProfile();

  if (!ctx) return null;

  const { profile, loading } = ctx;
  const completion = profile?.completion ?? 0;
  const status = profile?.approvalStatus ?? "incomplete";

  if (!loading && status === "approved") return null;

  if (!loading && status === "pending") {
    return (
      <div className="card flex flex-col gap-3 border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800">
          <CheckCircleIcon className="h-5 w-5" />
        </div>
        <PendingBannerText t={t} />
        <Link
          href="/lecturer/onboarding"
          className="btn btn-secondary justify-center"
        >
          {t("onboard.banner.review")}
        </Link>
      </div>
    );
  }

  const refining = loading && !!profile;

  return (
    <div className="card overflow-hidden p-0">
      <div className="grid gap-0 sm:grid-cols-[1fr,auto] sm:items-center">
        <div className="p-5 sm:p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {t("onboard.banner.eyebrow")}
          </div>
          <h3 className="mt-1 text-lg font-bold text-ink-900">
            {t("onboard.banner.title")}
          </h3>
          <p className="mt-1 text-sm text-ink-600">{t("onboard.banner.body")}</p>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5 text-xs font-medium text-ink-600">
              <span>{t("onboard.progress")}</span>
              <span
                className={`font-bold text-brand-700 ${refining ? "opacity-60" : ""}`}
              >
                {completion}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full brand-gradient transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 p-5 sm:border-l sm:border-t-0 sm:p-6">
          <Link href="/lecturer/onboarding" className="btn btn-primary w-full">
            {completion === 0
              ? t("onboard.banner.start")
              : t("onboard.banner.continue")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          {status === "rejected" && profile?.rejectionReason && (
            <p className="mt-3 text-xs text-rose-600">
              {t("onboard.banner.rejected")}: {profile.rejectionReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingBannerText({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex-1">
      <div className="text-sm font-semibold text-amber-900">
        {t("onboard.banner.pendingTitle")}
      </div>
      <div className="text-xs text-amber-800">{t("onboard.banner.pendingBody")}</div>
    </div>
  );
}
