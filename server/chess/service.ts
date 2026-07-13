/**
 * Logika inti Catur Online: pembuatan partai, langkah, BOT, matchmaking,
 * chat, dan update rank ELO. Server adalah sumber kebenaran posisi (FEN).
 */
import { Chess } from "chess.js";
import { customAlphabet } from "nanoid";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import {
  BOT_ELO,
  BOT_NAMES,
  INITIAL_FEN,
} from "@contracts/chess";
import { pickBotMove } from "./engine";
import { newElo } from "./elo";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export async function getOrCreateProfile(userId: number, name?: string | null) {
  const db = getDb();
  const existing = await db.query.chessProfiles.findFirst({
    where: eq(schema.chessProfiles.userId, userId),
  });
  if (existing) return existing;

  const displayName = (name ?? "").trim() || `Pemain${userId}`;
  await db.insert(schema.chessProfiles).values({ userId, displayName });
  const created = await db.query.chessProfiles.findFirst({
    where: eq(schema.chessProfiles.userId, userId),
  });
  if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  return created;
}

export async function renameProfile(userId: number, displayName: string) {
  const db = getDb();
  const clean = displayName.trim().slice(0, 32);
  if (!clean) throw new TRPCError({ code: "BAD_REQUEST", message: "Nama tidak boleh kosong" });
  await getOrCreateProfile(userId);
  await db
    .update(schema.chessProfiles)
    .set({ displayName: clean })
    .where(eq(schema.chessProfiles.userId, userId));
  return getOrCreateProfile(userId);
}

export async function getLeaderboard(limit: number) {
  return getDb()
    .select()
    .from(schema.chessProfiles)
    .orderBy(desc(schema.chessProfiles.elo))
    .limit(limit);
}

// ---------------------------------------------------------------------------
// Helpers internal
// ---------------------------------------------------------------------------

async function getGameOrThrow(gameId: number) {
  const game = await getDb().query.games.findFirst({
    where: eq(schema.games.id, gameId),
  });
  if (!game)
    throw new TRPCError({ code: "NOT_FOUND", message: "Partai tidak ditemukan" });
  return game;
}

function playerColorOf(game: schema.Game, userId: number): "w" | "b" | null {
  if (game.whiteId === userId) return "w";
  if (game.blackId === userId) return "b";
  return null;
}

function isBotSide(game: schema.Game, color: "w" | "b"): boolean {
  if (game.mode !== "bot") return false;
  return color === "w" ? game.whiteId === null : game.blackId === null;
}

async function addSystemMessage(gameId: number, body: string) {
  await getDb()
    .insert(schema.chatMessages)
    .values({ gameId, userId: null, body, system: true });
}

function resultReasonOf(chess: Chess): { result: "white" | "black" | "draw"; reason: string } {
  if (chess.isCheckmate()) {
    return {
      result: chess.turn() === "w" ? "black" : "white",
      reason: "Skakmat",
    };
  }
  if (chess.isStalemate()) return { result: "draw", reason: "Stalemate (remis)" };
  if (chess.isInsufficientMaterial())
    return { result: "draw", reason: "Bidak tidak cukup (remis)" };
  if (chess.isThreefoldRepetition())
    return { result: "draw", reason: "Pengulangan 3x (remis)" };
  return { result: "draw", reason: "Aturan 50 langkah (remis)" };
}

/** Tutup partai + update ELO & statistik pemain manusia */
async function finishGame(
  game: schema.Game,
  result: "white" | "black" | "draw",
  reason: string,
) {
  const db = getDb();
  const winnerId =
    result === "white" ? game.whiteId : result === "black" ? game.blackId : null;

  await db
    .update(schema.games)
    .set({
      status: "finished",
      result,
      resultReason: reason,
      winnerId,
      finishedAt: new Date(),
    })
    .where(eq(schema.games.id, game.id));

  // Update ELO untuk pemain manusia
  const whiteHuman = game.whiteId !== null;
  const blackHuman = game.blackId !== null;

  if (whiteHuman || blackHuman) {
    const whiteProfile = whiteHuman
      ? await getOrCreateProfile(game.whiteId!)
      : null;
    const blackProfile = blackHuman
      ? await getOrCreateProfile(game.blackId!)
      : null;

    // ELO lawan: profil manusia lain, atau ELO bot
    const botElo = BOT_ELO[game.botLevel ?? 3] ?? 1200;
    const whiteOppElo = blackProfile?.elo ?? botElo;
    const blackOppElo = whiteProfile?.elo ?? botElo;

    const k = game.mode === "bot" ? 16 : 32;
    const whiteScore = result === "white" ? 1 : result === "draw" ? 0.5 : 0;
    const blackScore = 1 - whiteScore;

    if (whiteProfile) {
      await db
        .update(schema.chessProfiles)
        .set({
          elo: newElo(whiteProfile.elo, whiteOppElo, whiteScore, k),
          wins: sql`${schema.chessProfiles.wins} + ${result === "white" ? 1 : 0}`,
          losses: sql`${schema.chessProfiles.losses} + ${result === "black" ? 1 : 0}`,
          draws: sql`${schema.chessProfiles.draws} + ${result === "draw" ? 1 : 0}`,
        })
        .where(eq(schema.chessProfiles.id, whiteProfile.id));
    }
    if (blackProfile) {
      await db
        .update(schema.chessProfiles)
        .set({
          elo: newElo(blackProfile.elo, blackOppElo, blackScore, k),
          wins: sql`${schema.chessProfiles.wins} + ${result === "black" ? 1 : 0}`,
          losses: sql`${schema.chessProfiles.losses} + ${result === "white" ? 1 : 0}`,
          draws: sql`${schema.chessProfiles.draws} + ${result === "draw" ? 1 : 0}`,
        })
        .where(eq(schema.chessProfiles.id, blackProfile.id));
    }
  }

  const resultText =
    result === "draw"
      ? `Partai berakhir remis — ${reason}`
      : `${result === "white" ? "Putih" : "Hitam"} menang — ${reason}`;
  await addSystemMessage(game.id, resultText);
}

/** Terapkan langkah ke partai + simpan ke tabel moves. Mengembalikan chess instance. */
async function applyMove(
  game: schema.Game,
  move: { from: string; to: string; promotion?: string },
): Promise<{ chess: Chess; gameOver: boolean }> {
  const db = getDb();
  const chess = new Chess(game.fen);

  const applied = chess.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion ?? "q",
  });
  if (!applied) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Langkah tidak sah" });
  }

  // Nomor langkah: setelah langkah hitam, fullmove sudah bertambah 1
  const moveNumber = chess.moveNumber() - (applied.color === "b" ? 1 : 0);

  await db.insert(schema.moves).values({
    gameId: game.id,
    moveNumber,
    color: applied.color,
    san: applied.san,
    fromSq: applied.from,
    toSq: applied.to,
    promotion: applied.promotion ?? null,
  });

  const gameOver = chess.isGameOver();
  await db
    .update(schema.games)
    .set({ fen: chess.fen() })
    .where(eq(schema.games.id, game.id));

  return { chess, gameOver };
}

// ---------------------------------------------------------------------------
// Pembuatan partai
// ---------------------------------------------------------------------------

export async function createVsBot(
  userId: number,
  userName: string | null | undefined,
  level: number,
  colorChoice: "white" | "black" | "random",
) {
  const db = getDb();
  await getOrCreateProfile(userId, userName);

  const playerColor: "white" | "black" =
    colorChoice === "random"
      ? Math.random() < 0.5
        ? "white"
        : "black"
      : colorChoice;

  const whiteId = playerColor === "white" ? userId : null;
  const blackId = playerColor === "black" ? userId : null;

  const [{ id }] = await db
    .insert(schema.games)
    .values({
      mode: "bot",
      status: "playing",
      whiteId,
      blackId,
      botLevel: level,
      fen: INITIAL_FEN,
    })
    .$returningId();

  await addSystemMessage(
    id,
    `Partai melawan ${BOT_NAMES[level] ?? "Bot"} dimulai. Semoga beruntung!`,
  );

  // Jika BOT pegang putih, BOT jalan duluan
  let game = await getGameOrThrow(id);
  if (isBotSide(game, "w")) {
    const botMove = pickBotMove(game.fen, level);
    if (botMove) {
      const { chess, gameOver } = await applyMove(game, botMove);
      game = await getGameOrThrow(id);
      if (gameOver) {
        const { result, reason } = resultReasonOf(chess);
        await finishGame(game, result, reason);
      }
    }
  }

  return { gameId: id };
}

export async function createFriendRoom(userId: number, userName: string | null | undefined) {
  const db = getDb();
  await getOrCreateProfile(userId, userName);

  // Pembuat room pegang warna acak agar adil; kursi lawan kosong dulu
  const creatorWhite = Math.random() < 0.5;
  const code = nanoid();

  const [{ id }] = await db
    .insert(schema.games)
    .values({
      mode: "friend",
      status: "waiting",
      whiteId: creatorWhite ? userId : null,
      blackId: creatorWhite ? null : userId,
      fen: INITIAL_FEN,
      roomCode: code,
    })
    .$returningId();

  await addSystemMessage(id, "Ruang pertemanan dibuat. Bagikan kode ke temanmu!");
  return { gameId: id, code };
}

export async function joinFriendRoom(userId: number, userName: string | null | undefined, code: string) {
  const db = getDb();
  await getOrCreateProfile(userId, userName);

  const game = await db.query.games.findFirst({
    where: eq(schema.games.roomCode, code.trim().toUpperCase()),
  });
  if (!game)
    throw new TRPCError({ code: "NOT_FOUND", message: "Kode ruangan tidak ditemukan" });
  if (game.mode !== "friend")
    throw new TRPCError({ code: "BAD_REQUEST", message: "Ruang tidak valid" });
  if (game.status !== "waiting")
    throw new TRPCError({ code: "BAD_REQUEST", message: "Partai sudah dimulai atau selesai" });
  if (game.whiteId === userId || game.blackId === userId) {
    return { gameId: game.id }; // pembuat room membuka ulang
  }

  await db
    .update(schema.games)
    .set({
      whiteId: game.whiteId ?? userId,
      blackId: game.blackId ?? userId,
      status: "playing",
    })
    .where(eq(schema.games.id, game.id));

  await addSystemMessage(game.id, "Teman bergabung. Partai dimulai!");
  return { gameId: game.id };
}

// ---------------------------------------------------------------------------
// Langkah & menyerah
// ---------------------------------------------------------------------------

export async function makeMove(
  userId: number,
  gameId: number,
  move: { from: string; to: string; promotion?: string },
) {
  let game = await getGameOrThrow(gameId);
  if (game.status !== "playing")
    throw new TRPCError({ code: "BAD_REQUEST", message: "Partai belum berlangsung atau sudah selesai" });

  const myColor = playerColorOf(game, userId);
  if (!myColor)
    throw new TRPCError({ code: "FORBIDDEN", message: "Kamu bukan pemain di partai ini" });

  const chess = new Chess(game.fen);
  if (chess.turn() !== myColor)
    throw new TRPCError({ code: "BAD_REQUEST", message: "Bukan giliranmu" });

  const { chess: after, gameOver } = await applyMove(game, move);

  if (gameOver) {
    const { result, reason } = resultReasonOf(after);
    game = await getGameOrThrow(gameId);
    await finishGame(game, result, reason);
    return { ok: true };
  }

  // Giliran BOT?
  game = await getGameOrThrow(gameId);
  const botColor: "w" | "b" = game.whiteId === null ? "w" : "b";
  if (isBotSide(game, botColor) && after.turn() === botColor) {
    const botMove = pickBotMove(game.fen, game.botLevel ?? 3);
    if (botMove) {
      const { chess: afterBot, gameOver: botOver } = await applyMove(game, botMove);
      if (botOver) {
        const { result, reason } = resultReasonOf(afterBot);
        game = await getGameOrThrow(gameId);
        await finishGame(game, result, reason);
      }
    }
  }

  return { ok: true };
}

export async function resignGame(userId: number, gameId: number) {
  const game = await getGameOrThrow(gameId);
  if (game.status === "finished")
    throw new TRPCError({ code: "BAD_REQUEST", message: "Partai sudah selesai" });

  const myColor = playerColorOf(game, userId);
  if (!myColor)
    throw new TRPCError({ code: "FORBIDDEN", message: "Kamu bukan pemain di partai ini" });

  if (game.status === "waiting") {
    // Batalkan room yang belum mulai
    await getDb()
      .update(schema.games)
      .set({ status: "finished", result: "draw", resultReason: "Dibatalkan", finishedAt: new Date() })
      .where(eq(schema.games.id, gameId));
    return { ok: true };
  }

  const result = myColor === "w" ? "black" : "white";
  await finishGame(game, result, "Menyerah");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// State partai (untuk polling frontend)
// ---------------------------------------------------------------------------

export async function getGameState(userId: number, gameId: number) {
  const db = getDb();
  const game = await getGameOrThrow(gameId);

  const myColor = playerColorOf(game, userId);
  const isParticipant = myColor !== null;
  if (!isParticipant && game.mode !== "online" && game.status !== "playing") {
    // penonton hanya boleh untuk partai yang sedang/selesai dimainkan
  }

  const chess = new Chess(game.fen);

  const [whiteProfile, blackProfile, moveRows, chatRows] = await Promise.all([
    game.whiteId
      ? db.query.chessProfiles.findFirst({
          where: eq(schema.chessProfiles.userId, game.whiteId),
        })
      : Promise.resolve(null),
    game.blackId
      ? db.query.chessProfiles.findFirst({
          where: eq(schema.chessProfiles.userId, game.blackId),
        })
      : Promise.resolve(null),
    db
      .select()
      .from(schema.moves)
      .where(eq(schema.moves.gameId, gameId))
      .orderBy(schema.moves.id),
    db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.gameId, gameId))
      .orderBy(desc(schema.chatMessages.id))
      .limit(60),
  ]);

  // nama pengirim chat
  const senderIds = [...new Set(chatRows.map((c) => c.userId).filter((x): x is number => x !== null))];
  const senders = senderIds.length
    ? await db
        .select()
        .from(schema.chessProfiles)
        .where(
          senderIds.length === 1
            ? eq(schema.chessProfiles.userId, senderIds[0])
            : or(...senderIds.map((id) => eq(schema.chessProfiles.userId, id))),
        )
    : [];
  const senderName = new Map(senders.map((s) => [s.userId, s.displayName]));

  const lastMoveRow = moveRows.at(-1);
  const botLevel = game.botLevel ?? 3;

  const playerInfo = (
    profile: schema.ChessProfile | null,
    sideIsBot: boolean,
  ) => {
    if (sideIsBot) {
      return {
        id: null as number | null,
        name: BOT_NAMES[botLevel] ?? "Bot",
        elo: BOT_ELO[botLevel] ?? 1200,
        isBot: true,
      };
    }
    if (!profile) return null; // kursi kosong (menunggu)
    return {
      id: profile.userId as number | null,
      name: profile.displayName,
      elo: profile.elo,
      isBot: false,
    };
  };

  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    fen: game.fen,
    turn: chess.turn(),
    isCheck: chess.inCheck(),
    yourColor: myColor === "w" ? ("white" as const) : myColor === "b" ? ("black" as const) : null,
    white: playerInfo(whiteProfile ?? null, isBotSide(game, "w")),
    black: playerInfo(blackProfile ?? null, isBotSide(game, "b")),
    botLevel: game.mode === "bot" ? botLevel : null,
    roomCode: game.roomCode,
    result: game.result,
    resultReason: game.resultReason,
    winnerId: game.winnerId,
    lastMove: lastMoveRow
      ? { from: lastMoveRow.fromSq, to: lastMoveRow.toSq }
      : null,
    moves: moveRows.map((m) => ({
      moveNumber: m.moveNumber,
      color: m.color,
      san: m.san,
      from: m.fromSq,
      to: m.toSq,
    })),
    chat: chatRows.reverse().map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.userId ? senderName.get(c.userId) ?? "Pemain" : null,
      body: c.body,
      system: c.system,
      createdAt: c.createdAt,
    })),
    createdAt: game.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Matchmaking
// ---------------------------------------------------------------------------

export async function enqueueMatchmaking(userId: number, userName?: string | null) {
  const db = getDb();
  const profile = await getOrCreateProfile(userId, userName);

  // Jika sudah dapat match sebelumnya, langsung kembalikan
  const myRow = await db.query.matchQueue.findFirst({
    where: eq(schema.matchQueue.userId, userId),
  });
  if (myRow?.matchedGameId) {
    const gameId = myRow.matchedGameId;
    await db.delete(schema.matchQueue).where(eq(schema.matchQueue.userId, userId));
    return { matched: true as const, gameId };
  }

  // Masuk antrian (atau perbarui)
  await db
    .insert(schema.matchQueue)
    .values({ userId, elo: profile.elo })
    .onDuplicateKeyUpdate({
      set: { elo: profile.elo, matchedGameId: null, createdAt: new Date() },
    });

  // Cari lawan terdekat ELO-nya (maks selisih 400, diperluas seiring waktu)
  const waitingSince = myRow?.createdAt ?? new Date();
  const waitSeconds = (Date.now() - new Date(waitingSince).getTime()) / 1000;
  const maxDiff = Math.min(200 + Math.floor(waitSeconds / 10) * 100, 800);

  const candidates = await db
    .select()
    .from(schema.matchQueue)
    .where(
      and(
        ne(schema.matchQueue.userId, userId),
        isNull(schema.matchQueue.matchedGameId),
      ),
    );

  const opponent = candidates
    .filter((c) => Math.abs(c.elo - profile.elo) <= maxDiff)
    .sort((a, b) => Math.abs(a.elo - profile.elo) - Math.abs(b.elo - profile.elo))
    .at(0);

  if (!opponent) return { matched: false as const };

  // Buat partai, warna acak
  const iAmWhite = Math.random() < 0.5;
  const [{ id: gameId }] = await db
    .insert(schema.games)
    .values({
      mode: "online",
      status: "playing",
      whiteId: iAmWhite ? userId : opponent.userId,
      blackId: iAmWhite ? opponent.userId : userId,
      fen: INITIAL_FEN,
    })
    .$returningId();

  // Tandai lawan sudah dapat game; hapus baris antrianku
  await db
    .update(schema.matchQueue)
    .set({ matchedGameId: gameId })
    .where(eq(schema.matchQueue.userId, opponent.userId));
  await db.delete(schema.matchQueue).where(eq(schema.matchQueue.userId, userId));

  await addSystemMessage(gameId, "Lawan ditemukan! Partai dimulai.");
  return { matched: true as const, gameId };
}

export async function matchmakingStatus(userId: number) {
  const db = getDb();
  const myRow = await db.query.matchQueue.findFirst({
    where: eq(schema.matchQueue.userId, userId),
  });
  if (!myRow) return { queued: false as const };
  if (myRow.matchedGameId) {
    const gameId = myRow.matchedGameId;
    await db.delete(schema.matchQueue).where(eq(schema.matchQueue.userId, userId));
    return { queued: false as const, matched: true as const, gameId };
  }
  return {
    queued: true as const,
    matched: false as const,
    seconds: Math.floor((Date.now() - new Date(myRow.createdAt).getTime()) / 1000),
  };
}

export async function cancelMatchmaking(userId: number) {
  await getDb()
    .delete(schema.matchQueue)
    .where(eq(schema.matchQueue.userId, userId));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function sendChat(userId: number, gameId: number, body: string) {
  const game = await getGameOrThrow(gameId);
  const myColor = playerColorOf(game, userId);
  if (!myColor)
    throw new TRPCError({ code: "FORBIDDEN", message: "Hanya pemain yang bisa chat" });

  const clean = body.trim().slice(0, 280);
  if (!clean) throw new TRPCError({ code: "BAD_REQUEST", message: "Pesan kosong" });

  await getDb()
    .insert(schema.chatMessages)
    .values({ gameId, userId, body: clean, system: false });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Riwayat partai
// ---------------------------------------------------------------------------

export async function getUserHistory(userId: number, limit: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.games)
    .where(
      and(
        or(eq(schema.games.whiteId, userId), eq(schema.games.blackId, userId)),
        eq(schema.games.status, "finished"),
      ),
    )
    .orderBy(desc(schema.games.finishedAt))
    .limit(limit);

  return rows.map((g) => {
    const asWhite = g.whiteId === userId;
    const outcome =
      g.result === "draw"
        ? ("draw" as const)
        : (g.result === "white") === asWhite
          ? ("win" as const)
          : ("loss" as const);
    return {
      id: g.id,
      mode: g.mode,
      botLevel: g.botLevel,
      myColor: asWhite ? ("white" as const) : ("black" as const),
      outcome,
      resultReason: g.resultReason,
      finishedAt: g.finishedAt,
    };
  });
}
