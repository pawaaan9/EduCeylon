/**
 * One-shot script to create / promote the EduCeylon superadmin in Firebase.
 *
 *   npm run create-admin            (run with .env.local loaded)
 *
 * Requirements: FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY
 * must be set in educeylon-fe/.env.local.
 *
 * Behavior:
 *  - Ensures an Auth user exists with SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD.
 *  - Sets the password (so it always matches what you configured).
 *  - Marks the user as email-verified.
 *  - Writes `admins/{uid}` in Firestore with `role: "admin"` and deletes any
 *    stale `users/{uid}` document from the old layout.
 *  - Sets a custom claim `{ role: "admin" }` on the auth token.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import {
  getAdmin,
  SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD,
} from "../lib/server/firebase-admin";

async function main() {
  if (!SUPERADMIN_EMAIL.trim()) {
    console.error(
      "❌ SUPERADMIN_EMAIL is required in educeylon-fe/.env.local (never commit passwords).",
    );
    process.exit(1);
  }
  if (!SUPERADMIN_PASSWORD) {
    console.error(
      "❌ SUPERADMIN_PASSWORD is required in educeylon-fe/.env.local (never commit passwords).",
    );
    process.exit(1);
  }

  const { auth, db } = getAdmin();

  const email = SUPERADMIN_EMAIL;
  const password = SUPERADMIN_PASSWORD;
  const displayName = "EduCeylon Admin";

  console.log(`▶ Provisioning superadmin: ${email}`);

  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`✔ Auth user exists (uid=${user.uid})`);
    user = await auth.updateUser(user.uid, {
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
    console.log("✔ Password reset & profile refreshed");
  } catch (err: unknown) {
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code?: string }).code)
        : "";
    if (code === "auth/user-not-found") {
      user = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
      console.log(`✔ Created auth user (uid=${user.uid})`);
    } else {
      throw err;
    }
  }

  await auth.setCustomUserClaims(user.uid, { role: "admin" });
  console.log("✔ Custom claim { role: 'admin' } set");

  await db
    .collection("admins")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email,
        name: displayName,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
  console.log("✔ Firestore admins/{uid} written with role=admin");

  for (const collectionName of ["users", "lecturers", "students"]) {
    const staleRef = db.collection(collectionName).doc(user.uid);
    const stale = await staleRef.get();
    if (stale.exists) {
      await staleRef.delete();
      console.log(`✔ Removed stale ${collectionName}/{uid} doc`);
    }
  }

  console.log("\n✅ Superadmin is ready.");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   Sign in at http://localhost:3000/login → /admin");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Failed to create superadmin:");
    console.error(err);
    process.exit(1);
  });
