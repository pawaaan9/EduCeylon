import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let cached: { app: App; auth: Auth; db: Firestore; storage: Storage } | null =
  null;

const MISSING_CREDS_MESSAGE =
  "Firebase Admin credentials are not configured. " +
  "Add either FIREBASE_SERVICE_ACCOUNT (JSON string) or " +
  "FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY to .env.local, then restart `next dev`.";

function resolveServiceAccount(): ServiceAccount | null {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return {
        projectId: parsed.project_id ?? parsed.projectId,
        clientEmail: parsed.client_email ?? parsed.clientEmail,
        privateKey: (parsed.private_key ?? parsed.privateKey)?.replace(
          /\\n/g,
          "\n",
        ),
      };
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON. Paste the full service-account JSON as a single-line string.",
      );
    }
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  return null;
}

/**
 * Lazily initialize the Firebase Admin SDK on the server.
 *
 * Requires one of:
 *  1. FIREBASE_SERVICE_ACCOUNT (JSON string of the service-account key)
 *  2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *
 * We deliberately do NOT fall back to applicationDefault(): on machines
 * without Google credentials it spends ~5-6 s timing out against the GCE
 * metadata server before every request, then still fails with 401.
 */
export function getAdmin() {
  if (cached) return cached;

  const existing = getApps()[0];
  if (existing) {
    cached = {
      app: existing,
      auth: getAuth(existing),
      db: getFirestore(existing),
      storage: getStorage(existing),
    };
    return cached;
  }

  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount) {
    throw new Error(MISSING_CREDS_MESSAGE);
  }

  const storageBucket = getStorageBucketName();
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
    ...(storageBucket ? { storageBucket } : {}),
  });

  cached = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
  return cached;
}

export const SUPERADMIN_EMAIL =
  process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() ?? "";

/** Set SUPERADMIN_PASSWORD in .env.local (never commit passwords). */
export const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD ?? "";

/** Firebase / GCS bucket (must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET). */
export function getStorageBucketName(): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    ""
  );
}
