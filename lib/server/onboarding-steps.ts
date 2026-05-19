import "server-only";
import { hasValidQualifications } from "./qualifications";
import type { LecturerProfile } from "./types";

export type OnboardingStepKey =
  | "basic"
  | "professional"
  | "teaching"
  | "social"
  | "verification"
  | "banking"
  | "review";

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
    p.bio.trim().length >= 30 &&
    !!p.district?.trim() &&
    p.languages.length > 0,
  professional: (p) =>
    !!p.mainSubject?.trim() &&
    p.teachingLevels.length > 0 &&
    typeof p.experienceYears === "number" &&
    p.experienceYears >= 0 &&
    hasValidQualifications(p.qualifications) &&
    !!p.lecturerType,
  teaching: (p) =>
    p.teachingMethods.length > 0 &&
    p.availableDays.length > 0 &&
    !!p.availableFrom &&
    !!p.availableTo,
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

export type OnboardingMeta = {
  steps: Record<OnboardingStepKey, boolean>;
  maxReachableStepIndex: number;
  submittable: boolean;
  completion: number;
};

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
