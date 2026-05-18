import type { User } from "firebase/auth";
import type { AppUserProfile } from "@/lib/firebase/auth";

/** Resolve the best display name from Firestore profile or Firebase Auth. */
export function resolveDisplayName(
  profile: Pick<AppUserProfile, "name"> | null | undefined,
  authUser: User | null | undefined,
): string {
  const fromProfile = profile?.name?.trim();
  if (fromProfile) return fromProfile;

  const fromAuth = authUser?.displayName?.trim();
  if (fromAuth) return fromAuth;

  const email = authUser?.email ?? "";
  const local = email.split("@")[0]?.trim();
  return local || "User";
}

/** First token of a full name for greetings (e.g. "Pawan" from "Pawan Dhanapala"). */
export function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName.trim() || "User";
}
