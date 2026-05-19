"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@/components/icons";
import { GradientHeader } from "@/components/GradientHeader";
import {
  BankingStep,
  BasicStep,
  ProfessionalStep,
  SocialStep,
  TeachingStep,
  VerificationStep,
} from "@/components/lecturer/LecturerProfileStepForms";
import { type QualificationsInputHandle } from "@/components/QualificationsInput";
import { formatTeachingScheduleSummary } from "@/lib/onboarding/schedule-display";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { formatLanguagesList } from "@/lib/i18n/language-labels";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import {
  evaluateMyLecturerProfile,
  saveMyLecturerProfile,
  submitMyLecturerProfile,
} from "@/lib/api/lecturers";
import { useLecturerProfile } from "@/lib/lecturer/LecturerProfileProvider";
import {
  getOnboardingMeta,
  getProfessionalStepMissing,
  isProfessionalStepComplete,
  type QualificationDraft,
} from "@/lib/onboarding/steps";
import {
  emptyLecturerProfile,
  type LecturerProfile,
  type LecturerQualification,
  type OnboardingMeta,
  type OnboardingStepKey,
} from "@/lib/api/types";
import {
  findDistrict,
  localizedLabel,
  SRI_LANKA_DISTRICTS,
} from "@/lib/data/sri-lanka-locations";
import { MIN_BIO_LENGTH } from "@/app/lecturer/onboarding/constants";

function formatQualification(q: LecturerQualification): string {
  return [q.title, q.institute, q.year].filter(Boolean).join(" · ");
}

const STEPS: {
  key: OnboardingStepKey;
  titleKey: string;
  shortKey: string;
  descKey: string;
}[] = [
  { key: "basic", titleKey: "onboard.step.basic", shortKey: "onboard.step.basic.short", descKey: "onboard.step.basic.desc" },
  { key: "professional", titleKey: "onboard.step.professional", shortKey: "onboard.step.professional.short", descKey: "onboard.step.professional.desc" },
  { key: "teaching", titleKey: "onboard.step.teaching", shortKey: "onboard.step.teaching.short", descKey: "onboard.step.teaching.desc" },
  { key: "social", titleKey: "onboard.step.social", shortKey: "onboard.step.social.short", descKey: "onboard.step.social.desc" },
  { key: "verification", titleKey: "onboard.step.verification", shortKey: "onboard.step.verification.short", descKey: "onboard.step.verification.desc" },
  { key: "banking", titleKey: "onboard.step.banking", shortKey: "onboard.step.banking.short", descKey: "onboard.step.banking.desc" },
  { key: "review", titleKey: "onboard.step.review", shortKey: "onboard.step.review.short", descKey: "onboard.step.review.desc" },
];

export default function LecturerOnboardingPage() {
  const router = useRouter();
  const t = useT();
  const { user, profile: userProfile, loading: authLoading } = useAuth();
  const lecturerCtx = useLecturerProfile();
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingMeta | null>(null);
  const syncedFromServer = useRef(false);
  const qualificationsRef = useRef<QualificationsInputHandle>(null);
  const [qualificationDraft, setQualificationDraft] =
    useState<QualificationDraft>({
      title: "",
      institute: "",
      year: "",
    });

  /** Seed the form before paint so users are not stuck on a spinner while /api/lecturers/me loads. */
  useLayoutEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/lecturer/onboarding");
      return;
    }
    if (userProfile && userProfile.role !== "lecturer") {
      router.replace("/");
      return;
    }
    setProfile((prev) => {
      if (prev) return prev;
      const optimistic = emptyLecturerProfile(user.uid);
      if (userProfile?.name) optimistic.displayName = userProfile.name;
      if (userProfile?.email) optimistic.email = userProfile.email;
      return optimistic;
    });
  }, [authLoading, user, userProfile, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (userProfile && userProfile.role !== "lecturer") return;
    if (lecturerCtx.loading || syncedFromServer.current) return;

    syncedFromServer.current = true;
    const base = lecturerCtx.profile ?? emptyLecturerProfile(user.uid);
    if (!base.displayName && userProfile?.name) base.displayName = userProfile.name;
    if (!base.email && userProfile?.email) base.email = userProfile.email;
    setProfile({ ...base });
    setOnboarding(lecturerCtx.onboarding);
    if (
      base.approvalStatus === "pending" ||
      base.approvalStatus === "approved"
    ) {
      setSubmitted(true);
    }
    setError(null);
  }, [
    authLoading,
    user,
    userProfile,
    lecturerCtx.profile,
    lecturerCtx.onboarding,
    lecturerCtx.loading,
  ]);

  useEffect(() => {
    if (!user || !profile) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const token = await user.getIdToken();
        const { onboarding: next } = await evaluateMyLecturerProfile(token, profile);
        if (!cancelled) setOnboarding(next);
      } catch {
        // keep last known onboarding meta
      }
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [profile, user]);

  const localOnboarding = useMemo(
    () => (profile ? getOnboardingMeta(profile) : null),
    [profile],
  );

  const completion =
    onboarding?.completion ??
    localOnboarding?.completion ??
    profile?.completion ??
    0;

  const step = STEPS[stepIndex]!;
  const maxReachable =
    localOnboarding?.maxReachableStepIndex ??
    onboarding?.maxReachableStepIndex ??
    0;
  const currentStepComplete = useMemo(() => {
    if (!profile) return false;
    if (step.key === "professional") {
      return isProfessionalStepComplete(profile, qualificationDraft);
    }
    return localOnboarding?.steps[step.key] ?? onboarding?.steps[step.key] ?? false;
  }, [
    profile,
    step.key,
    qualificationDraft,
    localOnboarding,
    onboarding?.steps,
  ]);

  function goToStep(index: number) {
    if (!profile || index < 0 || index >= STEPS.length) return;
    if (index > maxReachable) return;
    setStepError(null);
    setStepIndex(index);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(patch: Partial<LecturerProfile>): Promise<boolean> {
    if (!profile || !user) return false;
    setSaving(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const result = await saveMyLecturerProfile(token, patch);
      setProfile(result.profile);
      setOnboarding(result.onboarding);
      lecturerCtx.setFromResponse(result);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function profileWithPendingQualification(base: LecturerProfile): LecturerProfile {
    if (step.key !== "professional" || !qualificationsRef.current) {
      return base;
    }
    const merged = qualificationsRef.current.commitDraft();
    if (!merged) return base;
    return { ...base, qualifications: merged };
  }

  async function handleNext() {
    if (!profile) return;

    const nextProfile = profileWithPendingQualification(profile);
    if (nextProfile !== profile) {
      setProfile(nextProfile);
    }

    const stepComplete = getOnboardingMeta(nextProfile).steps[step.key];
    if (!stepComplete) {
      if (step.key === "professional") {
        const missing = getProfessionalStepMissing(
          nextProfile,
          t,
          qualificationDraft,
        );
        if (missing.length > 0) {
          setStepError(
            `${t("onboard.validation.fillRequired")}: ${missing.join(", ")}`,
          );
          return;
        }
      }
      setStepError(t("onboard.validation.fillRequired"));
      return;
    }
    setStepError(null);
    const saved = await save(nextProfile);
    if (!saved) return;
    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  }

  async function handleSubmitForReview() {
    if (!profile || !user) return;
    setSaving(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const result = await submitMyLecturerProfile(token);
      setProfile(result.profile);
      setOnboarding(result.onboarding);
      lecturerCtx.setFromResponse(result);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-1 w-40 overflow-hidden rounded-full bg-ink-200">
          <div className="h-full w-1/3 brand-gradient animate-pulse" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SubmittedView profile={profile} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <GradientHeader
        title={t("onboard.hero.title")}
        subtitle={t("onboard.hero.subtitle")}
        actions={
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
              {t("onboard.progress")}
            </div>
            <div className="text-3xl font-bold leading-none">{completion}%</div>
          </div>
        }
      >
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white/90 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </GradientHeader>

      {/* Step progress — all 7 steps visible without horizontal scroll */}
      <nav aria-label="Onboarding steps" className="card p-3 sm:p-4">
        <ol className="grid grid-cols-7 gap-1">
          {STEPS.map((s, i) => {
            const active = i === stepIndex;
            const passed = i < stepIndex;
            const locked = i > maxReachable;
            return (
              <li key={s.key} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goToStep(i)}
                  disabled={locked}
                  title={t(s.titleKey)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full flex-col items-center gap-1 rounded-lg px-0.5 py-2 transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-800"
                      : passed
                      ? "text-ink-700 hover:bg-ink-50"
                      : locked
                      ? "cursor-not-allowed text-ink-300"
                      : "text-ink-500 hover:bg-ink-50"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      active
                        ? "bg-brand-600 text-white"
                        : passed
                        ? "bg-emerald-500 text-white"
                        : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {passed && !active ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="w-full text-center text-[9px] font-semibold leading-tight sm:text-[11px] line-clamp-2">
                    {t(s.shortKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <section className="card p-6 sm:p-8">
        <header className="mb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {t("onboard.step")} {stepIndex + 1} / {STEPS.length}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-ink-900">{t(step.titleKey)}</h2>
            <p className="mt-1 text-sm text-ink-600">{t(step.descKey)}</p>
          </div>
        </header>

        {(error || stepError) && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {stepError ?? error}
          </div>
        )}

        {step.key === "basic" && (
          <BasicStep
            uid={profile.uid}
            value={profile}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
            onPersist={(patch) => save(patch)}
          />
        )}
        {step.key === "professional" && (
          <ProfessionalStep
            value={profile}
            qualificationsRef={qualificationsRef}
            onQualificationDraftChange={setQualificationDraft}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
          />
        )}
        {step.key === "teaching" && (
          <TeachingStep
            value={profile}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
          />
        )}
        {step.key === "social" && (
          <SocialStep
            value={profile}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
          />
        )}
        {step.key === "verification" && (
          <VerificationStep
            uid={profile.uid}
            value={profile}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
          />
        )}
        {step.key === "banking" && (
          <BankingStep
            value={profile}
            onChange={(patch) => setProfile((p) => (p ? { ...p, ...patch } : p))}
          />
        )}
        {step.key === "review" && (
          <ReviewStep
            value={profile}
            submittable={onboarding?.submittable ?? false}
          />
        )}

        <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-ink-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0 || saving}
            className="btn btn-ghost justify-center disabled:opacity-50"
          >
            {t("action.back")}
          </button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => save(profile)}
              disabled={saving}
              className="btn btn-secondary justify-center disabled:opacity-60"
            >
              {saving ? t("onboard.saving") : t("action.save")}
            </button>
            {step.key !== "review" ? (
              <button
                type="button"
                onClick={() => void handleNext()}
                disabled={saving || !currentStepComplete}
                className="btn btn-primary justify-center disabled:opacity-60"
              >
                {t("onboard.saveContinue")} <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={saving || !onboarding?.submittable}
                className="btn btn-primary justify-center disabled:opacity-60"
              >
                {saving ? t("onboard.submitting") : t("onboard.submitReview")}
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

function ReviewStep({
  value,
  submittable,
}: {
  value: LecturerProfile;
  submittable: boolean;
}) {
  const t = useT();
  const { locale } = useI18n();
  const ready = submittable;
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-600">{t("onboard.review.intro")}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          ["onboard.review.displayName", value.displayName],
          [
            "onboard.review.location",
            (() => {
              const d = findDistrict(value.district);
              return d ? localizedLabel(d.name, locale) : "";
            })(),
          ],
          ["onboard.review.mainSubject", value.mainSubject],
          [
            "onboard.review.languages",
            formatLanguagesList(value.languages),
          ],
          [
            "onboard.review.levels",
            value.teachingLevels.map((l) => t(`onboard.levels.${l}`)).join(", "),
          ],
          [
            "onboard.review.methods",
            value.teachingMethods.join(", "),
          ],
          [
            "onboard.review.schedule",
            formatTeachingScheduleSummary(value, (day) =>
              t(`onboard.days.${day}`),
            ),
          ],
          ["onboard.review.experience", value.experienceYears?.toString()],
          [
            "onboard.review.qualifications",
            value.qualifications.length > 0
              ? value.qualifications.map(formatQualification).join("; ")
              : "",
          ],
          ["onboard.review.bankName", value.bankName],
        ].map(([k, v]) => (
          <li
            key={k as string}
            className="rounded-lg border border-ink-100 p-3 text-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {t(k as string)}
            </div>
            <div className="mt-1 text-ink-900">
              {v && String(v).trim() ? v : <span className="text-rose-500">{t("onboard.review.missing")}</span>}
            </div>
          </li>
        ))}
      </ul>

      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          ready
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {ready ? t("onboard.review.ready") : t("onboard.review.notReady")}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Submitted view                                                              */
/* -------------------------------------------------------------------------- */

function SubmittedView({ profile }: { profile: LecturerProfile }) {
  const t = useT();
  const isApproved = profile.approvalStatus === "approved";
  return (
    <div className="card mx-auto max-w-2xl p-8 text-center">
      <div
        className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full ${
          isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        <CheckCircleIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink-900">
        {isApproved ? t("onboard.done.approvedTitle") : t("onboard.done.pendingTitle")}
      </h2>
      <p className="mt-2 text-ink-600">
        {isApproved ? t("onboard.done.approvedBody") : t("onboard.done.pendingBody")}
      </p>
      <Link href="/lecturer" className="btn btn-primary mt-6 inline-flex">
        {t("onboard.done.goDashboard")}
      </Link>
    </div>
  );
}
