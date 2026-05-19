import type { LecturerProfile } from "@/lib/api/types";
import { MIN_BIO_LENGTH } from "@/lib/onboarding/bio";
import {
  getProfessionalStepMissing,
  isOnboardingStepComplete,
  type QualificationDraft,
} from "@/lib/onboarding/steps";
import type { ProfileEditSection } from "@/lib/lecturer/profile-patch";
import { isValidSriLankaPhone } from "@/lib/phone/sri-lanka";

export function validateSettingsSection(
  section: ProfileEditSection,
  profile: LecturerProfile,
  t: (key: string) => string,
  options?: {
    qualificationDraft?: QualificationDraft | null;
  },
): string[] {
  switch (section) {
    case "basic":
      return validateBasicSection(profile, t);
    case "professional":
      return getProfessionalStepMissing(
        profile,
        t,
        options?.qualificationDraft,
      );
    case "teaching":
      return isOnboardingStepComplete("teaching", profile)
        ? []
        : [t("lecturer.settings.validation.teaching")];
    case "social":
      return [];
    case "banking":
      return isOnboardingStepComplete("banking", profile)
        ? []
        : [t("lecturer.settings.validation.banking")];
  }
}

function validateBasicSection(
  profile: LecturerProfile,
  t: (key: string) => string,
): string[] {
  const missing: string[] = [];

  if (!profile.displayName?.trim()) {
    missing.push(t("onboard.basic.displayName"));
  }
  if (!profile.photoURL) {
    missing.push(t("onboard.basic.photo"));
  }
  if (!profile.bio?.trim() || profile.bio.trim().length < MIN_BIO_LENGTH) {
    missing.push(t("onboard.basic.bio"));
  }
  if (!profile.district?.trim()) {
    missing.push(t("onboard.basic.district"));
  }
  if ((profile.languages ?? []).length === 0) {
    missing.push(t("onboard.basic.languages"));
  }
  if (!profile.phone?.trim()) {
    missing.push(t("lecturer.settings.phone"));
  } else if (!isValidSriLankaPhone(profile.phone)) {
    missing.push(t("phone.sriLanka.invalid"));
  }

  return missing;
}

export function formatSettingsValidationError(
  missing: string[],
  t: (key: string) => string,
): string {
  if (missing.length === 0) return "";
  return `${t("onboard.validation.fillRequired")}: ${missing.join(", ")}`;
}
