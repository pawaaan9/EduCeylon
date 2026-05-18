import type { LecturerProfile } from "@/lib/lecturer/profile";
import { isProfileSubmittable } from "@/lib/lecturer/profile";

export type OnboardingStepKey =
  | "basic"
  | "professional"
  | "teaching"
  | "social"
  | "verification"
  | "banking"
  | "review";

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
    p.qualifications.length > 0 &&
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

export function isOnboardingStepComplete(
  key: OnboardingStepKey,
  profile: LecturerProfile,
): boolean {
  return STEP_CHECKS[key](profile);
}

/** Highest step index the user may open (0-based). */
export function maxReachableStepIndex(
  stepKeys: OnboardingStepKey[],
  profile: LecturerProfile,
): number {
  for (let i = 0; i < stepKeys.length; i++) {
    if (!isOnboardingStepComplete(stepKeys[i], profile)) {
      return i;
    }
  }
  return stepKeys.length - 1;
}
