import "server-only";

import { getAdmin } from "./firebase-admin";
import {
  LECTURER_PROFILES,
  mergeLecturerProfileDoc,
} from "./lecturer-profile";
import type { LecturerProfile } from "./types";

const STATUS_SORT: Record<string, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
  incomplete: 3,
};

export async function listAllLecturerProfiles(): Promise<LecturerProfile[]> {
  const { db } = getAdmin();
  const snap = await db.collection(LECTURER_PROFILES).get();

  const profiles = snap.docs.map((doc) =>
    mergeLecturerProfileDoc(doc.id, doc.data() as Record<string, unknown>),
  );

  profiles.sort((a, b) => {
    const statusDiff =
      (STATUS_SORT[a.approvalStatus] ?? 9) - (STATUS_SORT[b.approvalStatus] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return (a.displayName ?? a.email ?? a.uid).localeCompare(
      b.displayName ?? b.email ?? b.uid,
    );
  });

  return profiles.map(serializeProfileTimestamps);
}

export async function listPendingLecturerProfiles(): Promise<
  LecturerProfile[]
> {
  const { db } = getAdmin();
  const snap = await db
    .collection(LECTURER_PROFILES)
    .where("approvalStatus", "==", "pending")
    .get();

  const profiles = snap.docs.map((doc) =>
    mergeLecturerProfileDoc(doc.id, doc.data() as Record<string, unknown>),
  );

  profiles.sort((a, b) => {
    const aTime = submittedMs(a.submittedAt);
    const bTime = submittedMs(b.submittedAt);
    return bTime - aTime;
  });

  return profiles.map(serializeProfileTimestamps);
}

function serializeProfileTimestamps(profile: LecturerProfile): LecturerProfile {
  return {
    ...profile,
    submittedAt: timestampToIso(profile.submittedAt),
    updatedAt: timestampToIso(profile.updatedAt),
    approvedAt: timestampToIso(profile.approvedAt),
    rejectedAt: timestampToIso(profile.rejectedAt),
  };
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null) {
    const v = value as Record<string, number>;
    const sec = v.seconds ?? v._seconds;
    if (typeof sec === "number") {
      return new Date(sec * 1000).toISOString();
    }
    if (typeof (value as { toDate?: () => Date }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
  }
  return undefined;
}

function submittedMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    const ms = (value as { toMillis: () => number }).toMillis();
    return Number.isFinite(ms) ? ms : 0;
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}
