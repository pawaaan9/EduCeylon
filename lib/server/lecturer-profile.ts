import "server-only";
import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdmin, getStorageBucketName } from "./firebase-admin";
import { normalizeQualifications } from "./qualifications";
import type { LecturerProfile } from "./types";
import {
  getOnboardingMeta,
  type OnboardingMeta,
} from "./onboarding-steps";

export const LECTURER_PROFILES = "lecturerProfiles";

export {
  TEACHING_LEVELS,
  TEACHING_METHODS,
  LECTURER_TYPES,
  LANGUAGE_OPTIONS,
  DAY_OPTIONS,
} from "./lecturer-profile-constants";

export type { OnboardingMeta };

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

function toFirestorePayload(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function calculateCompletion(p: LecturerProfile): number {
  return getOnboardingMeta(p).completion;
}

export function isProfileSubmittable(p: LecturerProfile): boolean {
  return getOnboardingMeta(p).submittable;
}

function mergeProfile(
  uid: string,
  base: LecturerProfile | null,
  patch: Partial<LecturerProfile>,
): LecturerProfile {
  const next: LecturerProfile = {
    ...(base ?? emptyLecturerProfile(uid)),
    ...patch,
    uid,
  };
  next.completion = calculateCompletion(next);
  return next;
}

export function mergeLecturerProfileDoc(
  uid: string,
  data: Record<string, unknown>,
): LecturerProfile {
  const { qualifications: rawQuals, ...rest } = data;
  void rawQuals;
  const profile: LecturerProfile = {
    ...emptyLecturerProfile(uid),
    ...(rest as Partial<LecturerProfile>),
    uid,
    qualifications: normalizeQualifications(data.qualifications),
  };
  profile.completion =
    typeof data.completion === "number"
      ? data.completion
      : calculateCompletion(profile);
  return profile;
}

export async function getLecturerProfileByUid(
  uid: string,
): Promise<LecturerProfile | null> {
  const { db } = getAdmin();
  const snap = await db.collection(LECTURER_PROFILES).doc(uid).get();
  if (!snap.exists) return null;
  return mergeLecturerProfileDoc(uid, snap.data() as Record<string, unknown>);
}

export async function saveLecturerProfile(
  uid: string,
  patch: Partial<LecturerProfile>,
): Promise<{ profile: LecturerProfile; onboarding: OnboardingMeta }> {
  const { db } = getAdmin();
  const ref = db.collection(LECTURER_PROFILES).doc(uid);
  const existing = await getLecturerProfileByUid(uid);
  const next = mergeProfile(uid, existing, patch);

  const payload: Record<string, unknown> = {
    ...toFirestorePayload(next as unknown as Record<string, unknown>),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (!next.city) payload.city = FieldValue.delete();

  await ref.set(payload, { merge: true });

  return {
    profile: next,
    onboarding: getOnboardingMeta(next),
  };
}

export async function submitLecturerProfileForReview(
  uid: string,
): Promise<{ profile: LecturerProfile; onboarding: OnboardingMeta }> {
  const current = await getLecturerProfileByUid(uid);
  if (!current || !isProfileSubmittable(current)) {
    throw new Error("Profile is not complete enough to submit.");
  }

  const { db } = getAdmin();
  const next: LecturerProfile = {
    ...current,
    approvalStatus: "pending",
    completion: 100,
  };

  const payload: Record<string, unknown> = {
    ...toFirestorePayload(next as unknown as Record<string, unknown>),
    submittedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (!next.city) payload.city = FieldValue.delete();

  await db.collection(LECTURER_PROFILES).doc(uid).set(payload, { merge: true });

  return {
    profile: next,
    onboarding: getOnboardingMeta(next),
  };
}

export type UploadKey = "photo" | "cover" | "nicFront" | "nicBack" | "extraDoc";

export async function uploadLecturerAsset(
  uid: string,
  key: UploadKey,
  fileName: string,
  contentType: string,
  buffer: Buffer,
): Promise<string> {
  const ext = fileName.split(".").pop() ?? "bin";
  const safeKey =
    key === "extraDoc"
      ? `extra-${Date.now()}`
      : key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  const path = `lecturers/${uid}/${safeKey}.${ext}`;

  const bucketName = getStorageBucketName();
  if (!bucketName) {
    throw new Error(
      "Storage bucket is not configured. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local.",
    );
  }

  const { storage } = getAdmin();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(path);
  const downloadToken = randomUUID();

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
    resumable: false,
  });

  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

/** Evaluate onboarding progress from a profile payload (saved or draft). */
export function evaluateLecturerProfile(
  uid: string,
  patch: Partial<LecturerProfile>,
  base?: LecturerProfile | null,
): { profile: LecturerProfile; onboarding: OnboardingMeta } {
  const profile = mergeProfile(uid, base ?? null, patch);
  return { profile, onboarding: getOnboardingMeta(profile) };
}
