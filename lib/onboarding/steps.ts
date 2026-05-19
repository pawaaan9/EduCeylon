import type {
  LecturerProfile,
  OnboardingMeta,
  OnboardingStepKey,
} from "@/lib/api/types";
import { MIN_BIO_LENGTH } from "@/lib/onboarding/bio";
import {
  hasValidQualifications,
  isQualificationComplete,
} from "@/lib/onboarding/qualifications";
import { isTeachingScheduleComplete } from "@/lib/onboarding/schedule";

export type { OnboardingMeta, OnboardingStepKey };

const STEP_KEYS: OnboardingStepKey[] = [
  "basic",
  "professional",
  "teaching",
  "social",
  "verification",
  "banking",
  "review",
];

const STEP_CHECKS: Record<OnboardingStepKey, (p: LecturerProfile) => boolean> = {
  basic: (p) =>
    !!p.displayName?.trim() &&
    !!p.photoURL &&
    !!p.bio &&
    p.bio.trim().length >= MIN_BIO_LENGTH &&
    !!p.district?.trim() &&
    p.languages.length > 0,
  professional: (p) =>
    !!p.mainSubject?.trim() &&
    p.teachingLevels.length > 0 &&
    typeof p.experienceYears === "number" &&
    !Number.isNaN(p.experienceYears) &&
    p.experienceYears >= 0 &&
    hasValidQualifications(p.qualifications) &&
    !!p.lecturerType,
  teaching: (p) =>
    p.teachingMethods.length > 0 && isTeachingScheduleComplete(p),
  social: () => true,
  verification: (p) => !!p.nicFrontURL && !!p.nicBackURL,
  banking: (p) =>
    !!p.bankAccountHolder?.trim() &&
    !!p.bankName?.trim() &&
    !!p.bankBranch?.trim() &&
    !!p.bankAccountNumber?.trim(),
  review: (p) => isProfileSubmittable(p),
};

const REQUIRED_SLOTS: ((p: LecturerProfile) => boolean)[] = [
  STEP_CHECKS.basic,
  STEP_CHECKS.professional,
  STEP_CHECKS.teaching,
  STEP_CHECKS.verification,
  STEP_CHECKS.banking,
];

export function isProfileSubmittable(p: LecturerProfile): boolean {
  return REQUIRED_SLOTS.every((check) => check(p));
}

export function isOnboardingStepComplete(
  key: OnboardingStepKey,
  profile: LecturerProfile,
): boolean {
  return STEP_CHECKS[key](profile);
}

export function maxReachableStepIndex(profile: LecturerProfile): number {
  for (let i = 0; i < STEP_KEYS.length; i++) {
    if (!isOnboardingStepComplete(STEP_KEYS[i]!, profile)) {
      return i;
    }
  }
  return STEP_KEYS.length - 1;
}

export function getOnboardingMeta(profile: LecturerProfile): OnboardingMeta {
  const steps = Object.fromEntries(
    STEP_KEYS.map((key) => [key, isOnboardingStepComplete(key, profile)]),
  ) as Record<OnboardingStepKey, boolean>;

  const filled = REQUIRED_SLOTS.reduce(
    (acc, check) => acc + (check(profile) ? 1 : 0),
    0,
  );
  const completion = Math.round((filled / REQUIRED_SLOTS.length) * 100);

  return {
    steps,
    maxReachableStepIndex: maxReachableStepIndex(profile),
    submittable: isProfileSubmittable(profile),
    completion,
  };
}

export type QualificationDraft = {
  title: string;
  institute: string;
  year: string;
};

/** Professional step valid if saved fields are complete, or a complete draft is pending add. */
export function isProfessionalStepComplete(
  profile: LecturerProfile,
  pendingDraft?: QualificationDraft | null,
): boolean {
  const hasQual =
    hasValidQualifications(profile.qualifications) ||
    (pendingDraft != null && isQualificationComplete(pendingDraft));

  return (
    !!profile.mainSubject?.trim() &&
    profile.teachingLevels.length > 0 &&
    typeof profile.experienceYears === "number" &&
    !Number.isNaN(profile.experienceYears) &&
    profile.experienceYears >= 0 &&
    hasQual &&
    !!profile.lecturerType
  );
}

/** Human-readable missing fields for the current step (for inline errors). */
export function getProfessionalStepMissing(
  profile: LecturerProfile,
  t: (key: string) => string,
  pendingDraft?: QualificationDraft | null,
): string[] {
  const missing: string[] = [];
  if (!profile.mainSubject?.trim()) {
    missing.push(t("onboard.prof.mainSubject"));
  }
  if (profile.teachingLevels.length === 0) {
    missing.push(t("onboard.prof.levels"));
  }
  if (
    typeof profile.experienceYears !== "number" ||
    Number.isNaN(profile.experienceYears)
  ) {
    missing.push(t("onboard.prof.experience"));
  }
  if (
    !hasValidQualifications(profile.qualifications) &&
    !(pendingDraft && isQualificationComplete(pendingDraft))
  ) {
    missing.push(t("onboard.prof.qualifications"));
  }
  if (!profile.lecturerType) {
    missing.push(t("onboard.prof.type"));
  }
  return missing;
}
