"use client";

import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { getFirebase } from "@/lib/firebase/client";

export type LecturerApprovalStatus =
  | "incomplete"
  | "pending"
  | "approved"
  | "rejected";

export type LecturerType = "individual" | "institute" | "organization";

export type TeachingLevel =
  | "ol"
  | "al"
  | "university"
  | "language"
  | "professional";

export type TeachingMethod = "recorded" | "live" | "physical" | "hybrid";

export type LecturerProfile = {
  uid: string;
  email?: string;
  phone?: string;

  // Basic
  displayName?: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  district?: string;
  city?: string;
  languages: string[];

  // Professional
  mainSubject?: string;
  subCategories: string[];
  teachingLevels: TeachingLevel[];
  experienceYears?: number;
  qualifications: string[];
  lecturerType?: LecturerType;

  // Teaching
  teachingMethods: TeachingMethod[];
  availableDays: string[];
  availableFrom?: string;
  availableTo?: string;

  // Social
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  website?: string;

  // Verification
  nicFrontURL?: string;
  nicBackURL?: string;
  extraDocs: string[];

  // Banking
  bankAccountHolder?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;

  // Status & meta
  approvalStatus: LecturerApprovalStatus;
  completion: number;
  rejectionReason?: string;
};

export const LECTURER_PROFILES = "lecturerProfiles";

/** Firestore rejects `undefined` field values — omit them before writes. */
function toFirestorePayload(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export const TEACHING_LEVELS: TeachingLevel[] = [
  "ol",
  "al",
  "university",
  "language",
  "professional",
];

export const TEACHING_METHODS: TeachingMethod[] = [
  "recorded",
  "live",
  "physical",
  "hybrid",
];

export const LECTURER_TYPES: LecturerType[] = [
  "individual",
  "institute",
  "organization",
];

export const LANGUAGE_OPTIONS = ["si", "ta", "en"] as const;

export const DAY_OPTIONS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export function emptyLecturerProfile(uid: string): LecturerProfile {
  return {
    uid,
    languages: [],
    subCategories: [],
    teachingLevels: [],
    qualifications: [],
    teachingMethods: [],
    availableDays: [],
    extraDocs: [],
    approvalStatus: "incomplete",
    completion: 0,
  };
}

/**
 * 12 required slots. Each filled slot adds ~8.33%.
 * Optional fields (social, cover, extra docs) don't gate completion.
 */
const REQUIRED_SLOTS: ((p: LecturerProfile) => boolean)[] = [
  (p) => !!p.displayName?.trim(),
  (p) => !!p.photoURL,
  (p) => !!p.bio && p.bio.trim().length >= 30,
  (p) => !!p.district?.trim(),
  (p) => p.languages.length > 0,
  (p) => !!p.mainSubject?.trim(),
  (p) => p.teachingLevels.length > 0,
  (p) => typeof p.experienceYears === "number" && p.experienceYears >= 0,
  (p) => p.qualifications.length > 0,
  (p) => !!p.lecturerType,
  (p) => p.teachingMethods.length > 0,
  (p) =>
    p.availableDays.length > 0 &&
    !!p.availableFrom &&
    !!p.availableTo,
  (p) => !!p.nicFrontURL && !!p.nicBackURL,
  (p) =>
    !!p.bankAccountHolder?.trim() &&
    !!p.bankName?.trim() &&
    !!p.bankBranch?.trim() &&
    !!p.bankAccountNumber?.trim(),
];

export function calculateCompletion(p: LecturerProfile): number {
  const filled = REQUIRED_SLOTS.reduce(
    (acc, check) => acc + (check(p) ? 1 : 0),
    0,
  );
  return Math.round((filled / REQUIRED_SLOTS.length) * 100);
}

export function isProfileSubmittable(p: LecturerProfile): boolean {
  return REQUIRED_SLOTS.every((check) => check(p));
}

/** Lightweight, single read. */
export async function getLecturerProfile(
  uid: string,
): Promise<LecturerProfile | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, LECTURER_PROFILES, uid));
  if (!snap.exists()) return null;
  return { ...emptyLecturerProfile(uid), ...(snap.data() as LecturerProfile) };
}

/** Subscribe to live updates (used by dashboard banner). */
export function subscribeLecturerProfile(
  uid: string,
  cb: (p: LecturerProfile | null) => void,
): Unsubscribe {
  const { db } = getFirebase();
  return onSnapshot(doc(db, LECTURER_PROFILES, uid), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb({ ...emptyLecturerProfile(uid), ...(snap.data() as LecturerProfile) });
  });
}

/**
 * Persist a profile patch. Server timestamps are added, and completion is
 * always recomputed before write.
 */
export async function saveLecturerProfile(
  uid: string,
  patch: Partial<LecturerProfile>,
  base: LecturerProfile,
): Promise<LecturerProfile> {
  const { db } = getFirebase();
  const next: LecturerProfile = {
    ...base,
    ...patch,
    uid,
  };
  next.completion = calculateCompletion(next);

  const payload: Record<string, unknown> = {
    ...toFirestorePayload(next as unknown as Record<string, unknown>),
    updatedAt: serverTimestamp(),
  };
  if (!next.city) payload.city = deleteField();

  await setDoc(doc(db, LECTURER_PROFILES, uid), payload, { merge: true });
  return next;
}

/** Submit for admin review. Only allowed when every required slot is filled. */
export async function submitProfileForReview(
  uid: string,
  current: LecturerProfile,
): Promise<LecturerProfile> {
  if (!isProfileSubmittable(current)) {
    throw new Error("Profile is not complete enough to submit.");
  }
  const { db } = getFirebase();
  const next: LecturerProfile = {
    ...current,
    approvalStatus: "pending",
    completion: 100,
  };
  const payload: Record<string, unknown> = {
    ...toFirestorePayload(next as unknown as Record<string, unknown>),
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (!next.city) payload.city = deleteField();

  await setDoc(doc(db, LECTURER_PROFILES, uid), payload, { merge: true });
  return next;
}

export type UploadKey =
  | "photo"
  | "cover"
  | "nicFront"
  | "nicBack"
  | "extraDoc";

/** Upload a file to `lecturers/{uid}/{key}.{ext}` and return its download URL. */
export async function uploadLecturerAsset(
  uid: string,
  file: File,
  key: UploadKey,
): Promise<string> {
  const { storage } = getFirebase();
  const ext = file.name.split(".").pop() ?? "bin";
  const safeKey =
    key === "extraDoc"
      ? `extra-${Date.now()}`
      : key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  const path = `lecturers/${uid}/${safeKey}.${ext}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}
