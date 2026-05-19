import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdmin } from "./firebase-admin";

export type AppRole = "admin" | "lecturer" | "student";

export type AuthedUser = {
  uid: string;
  email: string | null;
  role: AppRole | null;
  name?: string | null;
};

export type AuthResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; response: NextResponse };

/**
 * Verify a Firebase ID token from the `Authorization: Bearer <token>` header.
 * Returns the authed user or a `NextResponse` with the appropriate error.
 *
 * Use at the top of a Route Handler:
 *
 *   const auth = await verifyFirebaseToken(req);
 *   if (!auth.ok) return auth.response;
 *   const { user } = auth;
 */
export async function verifyFirebaseToken(
  req: NextRequest | Request,
): Promise<AuthResult> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 },
      ),
    };
  }

  const idToken = header.slice("Bearer ".length).trim();
  try {
    const { auth, db } = getAdmin();
    const decoded = await auth.verifyIdToken(idToken);

    // One collection per role:
    //  - admins/{uid}     → admin
    //  - lecturers/{uid}  → lecturer
    //  - students/{uid}   → student
    //  - users/{uid}      → legacy fallback (pre-split schema)
    let role: AppRole | null = null;
    let name: string | null = null;

    const adminSnap = await db.collection("admins").doc(decoded.uid).get();
    if (adminSnap.exists) {
      role = "admin";
      name = (adminSnap.data()?.name as string | undefined) ?? null;
    } else {
      const lecturerSnap = await db
        .collection("lecturers")
        .doc(decoded.uid)
        .get();
      if (lecturerSnap.exists) {
        role = "lecturer";
        name = (lecturerSnap.data()?.name as string | undefined) ?? null;
      } else {
        const studentSnap = await db
          .collection("students")
          .doc(decoded.uid)
          .get();
        if (studentSnap.exists) {
          role = "student";
          name = (studentSnap.data()?.name as string | undefined) ?? null;
        } else {
          // Legacy
          const userSnap = await db.collection("users").doc(decoded.uid).get();
          const profile = userSnap.exists ? userSnap.data() : null;
          const docRole = profile?.role as AppRole | undefined;
          role = docRole === "admin" ? null : docRole ?? null;
          name = (profile?.name as string | undefined) ?? null;
        }
      }
    }

    return {
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        role,
        name,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to verify ID token";
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or expired token", detail: message },
        { status: 401 },
      ),
    };
  }
}

/** Require a specific role. Returns the user or an error response. */
export async function requireRole(
  req: NextRequest | Request,
  role: AppRole,
): Promise<AuthResult> {
  const result = await verifyFirebaseToken(req);
  if (!result.ok) return result;
  if (result.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden", needed: role },
        { status: 403 },
      ),
    };
  }
  return result;
}
