import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  cancelMatchmaking,
  createFriendRoom,
  createVsBot,
  enqueueMatchmaking,
  getGameState,
  getLeaderboard,
  getOrCreateProfile,
  getUserHistory,
  joinFriendRoom,
  makeMove,
  matchmakingStatus,
  renameProfile,
  resignGame,
  sendChat,
} from "./chess/service";

export const chessRouter = createRouter({
  // ---- Profil & rank ----
  profile: authedQuery.query(({ ctx }) =>
    getOrCreateProfile(ctx.user.id, ctx.user.name),
  ),

  renameProfile: authedQuery
    .input(z.object({ displayName: z.string().min(1).max(32) }))
    .mutation(({ ctx, input }) => renameProfile(ctx.user.id, input.displayName)),

  leaderboard: publicQuery
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(({ input }) => getLeaderboard(input?.limit ?? 50)),

  history: authedQuery
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
    .query(({ ctx, input }) => getUserHistory(ctx.user.id, input?.limit ?? 10)),

  // ---- Pembuatan partai ----
  createVsBot: authedQuery
    .input(
      z.object({
        level: z.number().int().min(1).max(5),
        color: z.enum(["white", "black", "random"]).default("random"),
      }),
    )
    .mutation(({ ctx, input }) =>
      createVsBot(ctx.user.id, ctx.user.name, input.level, input.color),
    ),

  createFriendRoom: authedQuery.mutation(({ ctx }) =>
    createFriendRoom(ctx.user.id, ctx.user.name),
  ),

  joinFriendRoom: authedQuery
    .input(z.object({ code: z.string().min(4).max(8) }))
    .mutation(({ ctx, input }) =>
      joinFriendRoom(ctx.user.id, ctx.user.name, input.code),
    ),

  // ---- Bermain ----
  state: authedQuery
    .input(z.object({ gameId: z.number().int() }))
    .query(({ ctx, input }) => getGameState(ctx.user.id, input.gameId)),

  move: authedQuery
    .input(
      z.object({
        gameId: z.number().int(),
        from: z.string().length(2),
        to: z.string().length(2),
        promotion: z.string().max(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) => makeMove(ctx.user.id, input.gameId, input)),

  resign: authedQuery
    .input(z.object({ gameId: z.number().int() }))
    .mutation(({ ctx, input }) => resignGame(ctx.user.id, input.gameId)),

  // ---- Chat ----
  sendChat: authedQuery
    .input(
      z.object({
        gameId: z.number().int(),
        body: z.string().min(1).max(280),
      }),
    )
    .mutation(({ ctx, input }) => sendChat(ctx.user.id, input.gameId, input.body)),

  // ---- Matchmaking ----
  matchmakingEnqueue: authedQuery.mutation(({ ctx }) =>
    enqueueMatchmaking(ctx.user.id, ctx.user.name),
  ),

  matchmakingStatus: authedQuery.query(({ ctx }) =>
    matchmakingStatus(ctx.user.id),
  ),

  matchmakingCancel: authedQuery.mutation(({ ctx }) =>
    cancelMatchmaking(ctx.user.id),
  ),
});
