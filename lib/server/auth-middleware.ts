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

function readBearerToken(req: NextRequest | Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function roleFromCustomClaims(
  decoded: Record<string, unknown>,
): AppRole | null {
  const role = decoded.role;
  if (role === "admin" || role === "lecturer" || role === "student") {
    return role;
  }
  return null;
}

/**
 * Fast auth for `/api/lecturers/me/*` — verifies the ID token only (no Firestore).
 * Saves ~1–2s vs full `verifyFirebaseToken` on every lecturer self-service call.
 */
export async function verifyBearerToken(
  req: NextRequest | Request,
): Promise<AuthResult> {
  const idToken = readBearerToken(req);
  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 },
      ),
    };
  }

  try {
    const { auth } = getAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    const claims = decoded as unknown as Record<string, unknown>;
    return {
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        role: roleFromCustomClaims(claims),
        name: (claims.name as string | undefined) ?? null,
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
  const idToken = readBearerToken(req);
  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 },
      ),
    };
  }

  try {
    const { auth, db } = getAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const claims = decoded as unknown as Record<string, unknown>;
    const claimRole = roleFromCustomClaims(claims);

    if (claimRole) {
      return {
        ok: true,
        user: {
          uid,
          email: decoded.email ?? null,
          role: claimRole,
          name: (claims.name as string | undefined) ?? null,
        },
      };
    }

    const [adminSnap, lecturerSnap, studentSnap, legacySnap] = await Promise.all([
      db.collection("admins").doc(uid).get(),
      db.collection("lecturers").doc(uid).get(),
      db.collection("students").doc(uid).get(),
      db.collection("users").doc(uid).get(),
    ]);

    let role: AppRole | null = null;
    let name: string | null = null;

    if (adminSnap.exists) {
      role = "admin";
      name = (adminSnap.data()?.name as string | undefined) ?? null;
    } else if (lecturerSnap.exists) {
      role = "lecturer";
      name = (lecturerSnap.data()?.name as string | undefined) ?? null;
    } else if (studentSnap.exists) {
      role = "student";
      name = (studentSnap.data()?.name as string | undefined) ?? null;
    } else if (legacySnap.exists) {
      const profile = legacySnap.data();
      const docRole = profile?.role as AppRole | undefined;
      role = docRole === "admin" ? null : docRole ?? null;
      name = (profile?.name as string | undefined) ?? null;
    }

    return {
      ok: true,
      user: {
        uid,
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
