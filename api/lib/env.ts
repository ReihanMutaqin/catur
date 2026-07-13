import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  // Legacy Kimi OAuth (kept for backward compat, can be removed later)
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  // Firebase Admin
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "catur-bae",
  firebaseAdminCredentialsJson: process.env.FIREBASE_ADMIN_CREDENTIALS_JSON ?? "",
  firebaseDatabaseUrl:
    process.env.FIREBASE_DATABASE_URL ??
    "https://catur-bae-default-rtdb.asia-southeast1.firebasedatabase.app",
};
