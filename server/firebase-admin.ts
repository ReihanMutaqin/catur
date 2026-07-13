import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  // Support credentials via env vars (base64 encoded JSON) or a direct project ID
  const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "catur-bae";
  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ??
    "https://catur-bae-default-rtdb.asia-southeast1.firebasedatabase.app";

  if (credentialsJson) {
    // Credentials stored as base64-encoded JSON in env var
    const serviceAccount = JSON.parse(
      Buffer.from(credentialsJson, "base64").toString("utf8"),
    );
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  } else {
    // Fall back to application default credentials (e.g., local gcloud auth)
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
      databaseURL,
    });
  }

  return app;
}

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<admin.auth.DecodedIdToken> {
  const adminApp = getFirebaseAdmin();
  return adminApp.auth().verifyIdToken(idToken);
}
