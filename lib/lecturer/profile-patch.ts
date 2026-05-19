import type { LecturerProfile } from "@/lib/api/types";
import { normalizeSriLankaPhone } from "@/lib/phone/sri-lanka";

function trimOptional(value?: string): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export type ProfileEditSection =
  | "basic"
  | "professional"
  | "teaching"
  | "social"
  | "banking";

/** Fields lecturers may edit from settings (excludes status/meta/verification). */
export function lecturerProfileEditPatch(
  p: LecturerProfile,
): Partial<LecturerProfile> {
  return {
    ...lecturerProfileSectionPatch(p, "basic"),
    ...lecturerProfileSectionPatch(p, "professional"),
    ...lecturerProfileSectionPatch(p, "teaching"),
    ...lecturerProfileSectionPatch(p, "social"),
    ...lecturerProfileSectionPatch(p, "banking"),
  };
}

export function lecturerProfileSectionPatch(
  p: LecturerProfile,
  section: ProfileEditSection,
): Partial<LecturerProfile> {
  switch (section) {
    case "basic":
      return {
        displayName: trimOptional(p.displayName),
        phone: p.phone ? normalizeSriLankaPhone(p.phone) : undefined,
        bio: trimOptional(p.bio),
        district: p.district || undefined,
        languages: [...(p.languages ?? [])],
        photoURL: p.photoURL,
        coverURL: p.coverURL,
      };
    case "professional":
      return {
        mainSubject: trimOptional(p.mainSubject),
        subCategories: [...(p.subCategories ?? [])],
        teachingLevels: [...(p.teachingLevels ?? [])],
        experienceYears: p.experienceYears,
        qualifications: [...(p.qualifications ?? [])],
        lecturerType: p.lecturerType,
      };
    case "teaching":
      return {
        teachingMethods: [...(p.teachingMethods ?? [])],
        availableDays: [...(p.availableDays ?? [])],
        availableSchedule: p.availableSchedule,
        availableFrom: trimOptional(p.availableFrom),
        availableTo: trimOptional(p.availableTo),
      };
    case "social":
      return {
        facebook: trimOptional(p.facebook),
        youtube: trimOptional(p.youtube),
        tiktok: trimOptional(p.tiktok),
        instagram: trimOptional(p.instagram),
        website: trimOptional(p.website),
      };
    case "banking":
      return {
        bankAccountHolder: trimOptional(p.bankAccountHolder),
        bankName: trimOptional(p.bankName),
        bankBranch: trimOptional(p.bankBranch),
        bankAccountNumber: trimOptional(p.bankAccountNumber),
      };
  }
}

export function profileEditSnapshot(p: LecturerProfile): string {
  return JSON.stringify(lecturerProfileEditPatch(p));
}

export function profileSectionSnapshot(
  p: LecturerProfile,
  section: ProfileEditSection,
): string {
  return JSON.stringify(lecturerProfileSectionPatch(p, section));
}

/** Restore one section's fields from the saved server profile into the form. */
export function mergeSectionFromServer(
  form: LecturerProfile,
  server: LecturerProfile,
  section: ProfileEditSection,
): LecturerProfile {
  const patch = lecturerProfileSectionPatch(server, section);
  return { ...form, ...patch };
}
