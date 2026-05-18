"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentReference,
} from "firebase/firestore";
import { getFirebase, SUPERADMIN_EMAIL } from "./client";

export type AppRole = "admin" | "lecturer" | "student";

export type AppUserProfile = {
  uid: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: unknown;
};

/**
 * Three-collection layout in Firestore (one collection per role):
 *  - admins/{uid}     → platform staff
 *  - lecturers/{uid}  → lecturers
 *  - students/{uid}   → students
 *
 * Legacy `users/{uid}` docs are still readable as a fallback so existing test
 * accounts keep working; new writes go to the per-role collection only.
 */
export const ADMINS_COLLECTION = "admins";
export const LECTURERS_COLLECTION = "lecturers";
export const STUDENTS_COLLECTION = "students";
const LEGACY_USERS_COLLECTION = "users";

function collectionForRole(role: AppRole): string {
  if (role === "admin") return ADMINS_COLLECTION;
  if (role === "lecturer") return LECTURERS_COLLECTION;
  return STUDENTS_COLLECTION;
}

function isSuperadminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === SUPERADMIN_EMAIL;
}

async function readProfileFromCollection(
  ref: DocumentReference,
  fallbackRole: AppRole,
): Promise<AppUserProfile | null> {
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<AppUserProfile>;
  return {
    uid: ref.id,
    email: data.email ?? "",
    name: data.name ?? "",
    role: (data.role as AppRole | undefined) ?? fallbackRole,
    createdAt: data.createdAt,
  };
}

/** Read a profile by checking each role-specific collection in turn. */
export async function getUserProfile(
  uid: string,
): Promise<AppUserProfile | null> {
  const { db } = getFirebase();

  const admin = await readProfileFromCollection(
    doc(db, ADMINS_COLLECTION, uid),
    "admin",
  );
  if (admin) return { ...admin, role: "admin" };

  const lecturer = await readProfileFromCollection(
    doc(db, LECTURERS_COLLECTION, uid),
    "lecturer",
  );
  if (lecturer) return { ...lecturer, role: "lecturer" };

  const student = await readProfileFromCollection(
    doc(db, STUDENTS_COLLECTION, uid),
    "student",
  );
  if (student) return { ...student, role: "student" };

  // Backward compatibility: legacy users/{uid} doc (pre-split schema).
  const legacy = await getDoc(doc(db, LEGACY_USERS_COLLECTION, uid));
  if (legacy.exists()) {
    const data = legacy.data() as Partial<AppUserProfile>;
    const role =
      data.role === "lecturer"
        ? "lecturer"
        : data.role === "admin"
        ? "student" // legacy guard — admins live elsewhere
        : "student";
    return {
      uid,
      email: data.email ?? "",
      name: data.name ?? "",
      role,
      createdAt: data.createdAt,
    };
  }

  return null;
}

/** Decide what role a freshly-signed-in account should have. */
function resolveBootstrapRole(email: string, requestedRole?: AppRole): AppRole {
  if (isSuperadminEmail(email)) return "admin";
  if (requestedRole === "lecturer") return "lecturer";
  return "student";
}

/**
 * Ensure a Firestore profile exists for the user in the right per-role
 * collection. Self-heals legacy `users/{uid}` records into the new layout.
 */
export async function ensureProfile(
  user: User,
  options?: { requestedRole?: AppRole; name?: string },
): Promise<AppUserProfile> {
  const { db } = getFirebase();
  const isAdminEmail = isSuperadminEmail(user.email);

  // 1. Already an admin?
  const adminSnap = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
  if (adminSnap.exists()) {
    const data = adminSnap.data() as Partial<AppUserProfile>;
    return {
      uid: user.uid,
      email: data.email ?? user.email ?? "",
      name: data.name ?? "Admin",
      role: "admin",
      createdAt: data.createdAt,
    };
  }

  // 2. Already a lecturer?
  const lecturerSnap = await getDoc(doc(db, LECTURERS_COLLECTION, user.uid));
  if (lecturerSnap.exists()) {
    const data = lecturerSnap.data() as Partial<AppUserProfile>;
    return {
      uid: user.uid,
      email: data.email ?? user.email ?? "",
      name: data.name ?? user.displayName ?? "Lecturer",
      role: "lecturer",
      createdAt: data.createdAt,
    };
  }

  // 3. Already a student?
  const studentSnap = await getDoc(doc(db, STUDENTS_COLLECTION, user.uid));
  if (studentSnap.exists()) {
    const data = studentSnap.data() as Partial<AppUserProfile>;
    return {
      uid: user.uid,
      email: data.email ?? user.email ?? "",
      name: data.name ?? user.displayName ?? "Student",
      role: "student",
      createdAt: data.createdAt,
    };
  }

  // 4. Legacy users/{uid} doc — migrate into the correct per-role collection.
  const legacyRef = doc(db, LEGACY_USERS_COLLECTION, user.uid);
  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) {
    const data = legacySnap.data() as Partial<AppUserProfile> & {
      phone?: string;
    };
    const legacyRole: AppRole =
      data.role === "lecturer" || data.role === "student"
        ? (data.role as AppRole)
        : "student";
    const targetRole: AppRole = isAdminEmail ? "admin" : legacyRole;
    const targetRef = doc(db, collectionForRole(targetRole), user.uid);

    const migrated: AppUserProfile = {
      uid: user.uid,
      email: data.email ?? user.email ?? "",
      name:
        data.name ??
        options?.name ??
        user.displayName ??
        user.email?.split("@")[0] ??
        "User",
      role: targetRole,
      createdAt: data.createdAt ?? serverTimestamp(),
    };
    await setDoc(
      targetRef,
      {
        ...migrated,
        ...(data.phone ? { phone: data.phone } : {}),
      },
      { merge: true },
    );
    try {
      await deleteDoc(legacyRef);
    } catch {
      // non-fatal — Firestore rules may forbid delete; new collection wins.
    }
    return migrated;
  }

  // 5. Brand new account — write into the right per-role collection.
  const role = resolveBootstrapRole(user.email ?? "", options?.requestedRole);
  const targetRef = doc(db, collectionForRole(role), user.uid);
  const profile: AppUserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    name: options?.name ?? user.displayName ?? user.email?.split("@")[0] ?? "User",
    role,
    createdAt: serverTimestamp(),
  };
  await setDoc(targetRef, profile);
  return profile;
}

/** Merge a small patch onto the profile in the role's own collection. */
async function patchRoleProfile(
  uid: string,
  role: AppRole,
  patch: Record<string, unknown>,
): Promise<void> {
  const { db } = getFirebase();
  await setDoc(doc(db, collectionForRole(role), uid), patch, { merge: true });
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
  phone?: string;
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

  // Persist phone alongside the role-specific profile (lecturer registration).
  if (input.phone) {
    try {
      await patchRoleProfile(cred.user.uid, profile.role, {
        phone: input.phone.trim(),
      });
    } catch {
      // non-fatal
    }
  }

  return { user: cred.user, profile };
}

/** Sign in with Google; new accounts get `requestedRole` (student/lecturer) when provided. */
export async function signInWithGoogle(options?: { requestedRole?: AppRole }) {
  const { auth } = getFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  const profile = await ensureProfile(cred.user, {
    requestedRole: options?.requestedRole,
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
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Try again when you’re ready.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow popups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    default:
      if (
        code === "permission-denied" ||
        (err instanceof Error && /insufficient permissions/i.test(err.message))
      ) {
        return "Could not save your profile. Publish the updated Firestore rules (lecturers & students) in Firebase Console.";
      }
      return err instanceof Error ? err.message : "Something went wrong.";
  }
}
