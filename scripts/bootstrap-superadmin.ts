/**
 * Bootstrap the EduCeylon superadmin using ONLY the public web API key
 * (no service-account JSON required).
 *
 *   npm run bootstrap-admin
 *
 * What it does:
 *  1. Creates (or signs in to) the Auth user from SUPERADMIN_EMAIL /
 *     SUPERADMIN_PASSWORD via the Identity Toolkit REST API.
 *  2. Updates the user's display name.
 *  3. Writes `admins/{uid}` in Firestore with `role: "admin"` via the
 *     Firestore REST API, authenticated as that user.
 *  4. Removes any stale `users/{uid}` row left over from an older layout.
 *
 * Prerequisites in the Firebase Console (https://console.firebase.google.com):
 *  • Authentication → Sign-in method → Email/Password → Enabled.
 *  • Firestore Database → Create database (start in test mode is fine for now).
 *
 * Required env (educeylon-fe/.env.local):
 *  • FIREBASE_WEB_API_KEY — same value as NEXT_PUBLIC_FIREBASE_API_KEY
 *  • FIREBASE_PROJECT_ID
 *  • SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
 */
import { config } from "dotenv";

config({ path: ".env.local" });

function requireEnv(name: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) {
    console.error(`\n❌ Missing required env ${name}`);
    console.error(
      "   Set it in educeylon-fe/.env.local. FIREBASE_WEB_API_KEY should match",
    );
    console.error("   NEXT_PUBLIC_FIREBASE_API_KEY.\n");
    process.exit(1);
  }
  return v;
}

const API_KEY = requireEnv("FIREBASE_WEB_API_KEY", process.env.FIREBASE_WEB_API_KEY);
const PROJECT_ID = requireEnv("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID);
const EMAIL = requireEnv("SUPERADMIN_EMAIL", process.env.SUPERADMIN_EMAIL).toLowerCase();
const PASSWORD = requireEnv("SUPERADMIN_PASSWORD", process.env.SUPERADMIN_PASSWORD);
/**
 * Optional fallback used to recover when the password on Firebase has drifted
 * from PASSWORD (e.g. because a previous run wrote a different value). After
 * a successful sign-in, this script always resets the password to PASSWORD,
 * so subsequent runs only need PASSWORD.
 */
const CURRENT_PASSWORD = process.env.SUPERADMIN_CURRENT_PASSWORD ?? PASSWORD;
const DISPLAY_NAME = "EduCeylon Admin";

type FirebaseErr = { error?: { message?: string; code?: number } };

async function postJson<T = unknown>(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{ ok: boolean; status: number; data: T & FirebaseErr }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & FirebaseErr;
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log(`▶ Bootstrapping superadmin ${EMAIL} (project ${PROJECT_ID})\n`);

  let idToken: string;
  let uid: string;

  type SignResp = {
    idToken: string;
    localId: string;
    email: string;
  };

  const signUp = await postJson<SignResp>(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email: EMAIL, password: PASSWORD, returnSecureToken: true },
  );

  if (signUp.ok) {
    idToken = signUp.data.idToken;
    uid = signUp.data.localId;
    console.log(`✔ Created Auth user (uid=${uid})`);
  } else if (signUp.data.error?.message === "EMAIL_EXISTS") {
    console.log("ℹ Auth user already exists — signing in to continue…");
    let signIn = await postJson<SignResp>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email: EMAIL, password: PASSWORD, returnSecureToken: true },
    );
    if (!signIn.ok && CURRENT_PASSWORD !== PASSWORD) {
      console.log(
        "ℹ Configured password didn't work — trying SUPERADMIN_CURRENT_PASSWORD fallback…",
      );
      signIn = await postJson<SignResp>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        { email: EMAIL, password: CURRENT_PASSWORD, returnSecureToken: true },
      );
    }
    if (!signIn.ok) {
      console.error(
        `❌ Could not sign in: ${signIn.data.error?.message ?? "unknown"}.`,
      );
      console.error(
        "   The Auth user exists but the password doesn't match what's in this script.",
      );
      console.error(
        "   Either set SUPERADMIN_CURRENT_PASSWORD=<the current password> in",
      );
      console.error("   .env.local and rerun, or reset it in the Firebase Console.");
      process.exit(1);
    }
    idToken = signIn.data.idToken;
    uid = signIn.data.localId;
    console.log(`✔ Signed in as existing Auth user (uid=${uid})`);

    const resetPw = await postJson<{ idToken: string }>(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
      { idToken, password: PASSWORD, returnSecureToken: true },
    );
    if (resetPw.ok) {
      idToken = resetPw.data.idToken ?? idToken;
      console.log("✔ Password synced with SUPERADMIN_PASSWORD");
    } else {
      console.warn(
        `⚠ Could not sync password: ${resetPw.data.error?.message ?? "unknown"} (non-fatal)`,
      );
    }
  } else {
    console.error("❌ Failed to create Auth user.");
    console.error(`   API said: ${signUp.data.error?.message ?? "unknown error"}`);
    if (signUp.data.error?.message === "OPERATION_NOT_ALLOWED") {
      console.error(
        "\n   👉 Enable Email/Password sign-in in the Firebase Console:",
      );
      console.error(
        "      Build → Authentication → Sign-in method → Email/Password → Enable",
      );
    }
    if (signUp.data.error?.message === "WEAK_PASSWORD") {
      console.error("\n   👉 Choose a password with at least 6 characters.");
    }
    process.exit(1);
  }

  const update = await postJson(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
    { idToken, displayName: DISPLAY_NAME, returnSecureToken: false },
  );
  if (update.ok) {
    console.log(`✔ Display name set to "${DISPLAY_NAME}"`);
  } else {
    console.warn(
      `⚠ Could not set display name: ${update.data.error?.message ?? "unknown"} (non-fatal)`,
    );
  }

  const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`;
  const fsRes = await fetch(adminDocUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      fields: {
        uid: { stringValue: uid },
        email: { stringValue: EMAIL },
        name: { stringValue: DISPLAY_NAME },
        role: { stringValue: "admin" },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!fsRes.ok) {
    const fsErr = await fsRes.text();
    console.warn(`\n⚠ Firestore write failed (${fsRes.status}): ${fsErr}`);
    console.warn(
      "   Common causes: Firestore database isn't created yet, or security",
    );
    console.warn(
      "   rules block writes to admins/{uid}. Create the database in the",
    );
    console.warn(
      "   Firebase Console (Build → Firestore Database → Create database)",
    );
    console.warn(
      "   and (during bootstrap) allow the signed-in admin to write its own",
    );
    console.warn("   admins/{uid} doc — see the rules suggested in the README.");
    console.warn(
      "\n   The Auth user IS created, so you can already sign in at /login.",
    );
    console.warn(
      `   On first sign-in the frontend will auto-create the admins/{uid} doc`,
    );
    console.warn(
      `   for ${EMAIL} (it matches NEXT_PUBLIC_SUPERADMIN_EMAIL).`,
    );
    return;
  }
  console.log("✔ Firestore admins/{uid} written with role=admin");

  const userDocUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const probe = await fetch(userDocUrl, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (probe.ok) {
    const del = await fetch(userDocUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (del.ok) {
      console.log("✔ Removed stale users/{uid} doc (admin moved to admins/)");
    } else {
      const detail = await del.text();
      console.warn(
        `⚠ Could not delete users/{uid}: ${del.status} ${detail} (non-fatal)`,
      );
    }
  }

  console.log(`\n✅ Superadmin is ready.`);
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`   UID:      ${uid}`);
  console.log("\n   Sign in at http://localhost:3000/login → /admin");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
