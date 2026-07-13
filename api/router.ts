import { authRouter } from "./auth-router";
import { chessRouter } from "./chessRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  chess: chessRouter,
});

export type AppRouter = typeof appRouter;
