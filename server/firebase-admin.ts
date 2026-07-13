import { initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";

let app: App | null = null;

function getFirebaseAdmin(): App {
  if (app) return app;

  // Support credentials via env vars (base64 encoded JSON) or a direct project ID
  const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ??
    "https://catur-bae-default-rtdb.asia-southeast1.firebasedatabase.app";

  if (credentialsJson) {
    // Credentials stored as base64-encoded JSON in env var
    const serviceAccount = JSON.parse(
      Buffer.from(credentialsJson, "base64").toString("utf8"),
    );
    app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL,
    });
  } else {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS_JSON is missing from Environment Variables. Please configure it in Vercel.");
  }

  return app;
}

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<DecodedIdToken> {
  const adminApp = getFirebaseAdmin();
  return getAuth(adminApp).verifyIdToken(idToken);
}
