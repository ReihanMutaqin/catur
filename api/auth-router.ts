import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { verifyFirebaseIdToken } from "./firebase-admin";
import { upsertUser, findUserByUnionId } from "./queries/users";
import { signSessionToken } from "./kimi/session";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  /** Verifikasi Firebase ID Token → upsert user → set session cookie */
  firebaseLogin: publicQuery
    .input(z.object({ idToken: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      // 1. Verify the token with Firebase Admin
      const decoded = await verifyFirebaseIdToken(input.idToken);

      // 2. Firebase UID becomes the unionId in our DB
      const unionId = `firebase:${decoded.uid}`;
      const name = decoded.name ?? decoded.email ?? "Player";
      const email = decoded.email ?? undefined;
      const avatar = decoded.picture ?? undefined;

      // 3. Upsert user
      await upsertUser({
        unionId,
        name,
        email,
        avatar,
        lastSignInAt: new Date(),
      });

      const user = await findUserByUnionId(unionId);
      if (!user) throw new Error("Failed to create user");

      // 4. Issue session cookie (same mechanism as Kimi OAuth)
      const token = await signSessionToken({
        unionId,
        clientId: "firebase",
      });

      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
          secure: cookieOpts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return { success: true, userId: user.id };
    }),
});

