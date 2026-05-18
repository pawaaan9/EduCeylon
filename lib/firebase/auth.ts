"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebase, SUPERADMIN_EMAIL } from "./client";

export type AppRole = "admin" | "lecturer" | "student";

export type AppUserProfile = {
  uid: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: unknown;
};

const USERS_COLLECTION = "users";

/** Read the Firestore profile for a Firebase user. */
export async function getUserProfile(uid: string): Promise<AppUserProfile | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as AppUserProfile) : null;
}

/** Decide what role a freshly-signed-in account should have. */
function resolveBootstrapRole(email: string, requestedRole?: AppRole): AppRole {
  if (email.toLowerCase() === SUPERADMIN_EMAIL) return "admin";
  if (requestedRole === "lecturer") return "lecturer";
  return "student";
}

/**
 * Ensure a Firestore profile exists for the user.
 * - First login of the configured superadmin email is auto-promoted to `admin`.
 * - Other accounts default to `student` unless `requestedRole` is provided.
 */
export async function ensureProfile(
  user: User,
  options?: { requestedRole?: AppRole; name?: string },
): Promise<AppUserProfile> {
  const { db } = getFirebase();
  const ref = doc(db, USERS_COLLECTION, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const profile = existing.data() as AppUserProfile;
    // Self-heal: if the configured superadmin email is not yet marked admin, fix it.
    if (
      user.email &&
      user.email.toLowerCase() === SUPERADMIN_EMAIL &&
      profile.role !== "admin"
    ) {
      const upgraded: AppUserProfile = { ...profile, role: "admin" };
      await setDoc(ref, upgraded, { merge: true });
      return upgraded;
    }
    return profile;
  }

  const role = resolveBootstrapRole(user.email ?? "", options?.requestedRole);
  const profile: AppUserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    name: options?.name ?? user.displayName ?? user.email?.split("@")[0] ?? "User",
    role,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return profile;
}

/** Sign in with email/password and return the resolved profile. */
export async function signInWithEmail(email: string, password: string) {
  const { auth } = getFirebase();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await ensureProfile(cred.user);
  return { user: cred.user, profile };
}

/** Create a new student or lecturer account. */
export async function signUpWithEmail(input: {
  name: string;
  email: string;
  password: string;
  role: AppRole;
}) {
  const { auth } = getFirebase();
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );
  if (input.name) {
    try {
      await updateProfile(cred.user, { displayName: input.name });
    } catch {
      // non-fatal
    }
  }
  const profile = await ensureProfile(cred.user, {
    requestedRole: input.role,
    name: input.name,
  });
  return { user: cred.user, profile };
}

export async function signOut() {
  const { auth } = getFirebase();
  await fbSignOut(auth);
}

export function dashboardPathForRole(role: AppRole): string {
  if (role === "admin") return "/admin";
  if (role === "lecturer") return "/lecturer";
  return "/student";
}

export type AuthStateListener = (user: User | null) => void;

export function subscribeToAuth(listener: AuthStateListener) {
  const { auth } = getFirebase();
  return onAuthStateChanged(auth, listener);
}

/** Translate Firebase error codes to short, friendly messages. */
export function describeAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/invalid-email":
      return "That email address doesn’t look right.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err instanceof Error ? err.message : "Something went wrong.";
  }
}
