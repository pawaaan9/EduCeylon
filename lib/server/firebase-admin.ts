import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let cached: { app: App; auth: Auth; db: Firestore; storage: Storage } | null =
  null;

/**
 * Lazily initialize the Firebase Admin SDK on the server.
 *
 * Reads credentials in this order:
 *  1. FIREBASE_SERVICE_ACCOUNT (JSON string of the service-account key)
 *  2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *  3. GOOGLE_APPLICATION_CREDENTIALS (path) — falls back to applicationDefault()
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

  const projectId = process.env.FIREBASE_PROJECT_ID;

  let app: App;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
      credential: cert(parsed),
      projectId: parsed.project_id ?? projectId,
    });
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // .env files store \n as a literal — convert back to real newlines.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId,
    });
  } else {
    app = initializeApp({ credential: applicationDefault(), projectId });
  }

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
