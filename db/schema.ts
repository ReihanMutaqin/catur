import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===========================================================================
// Catur Online — tabel permainan
// ===========================================================================

/** Profil & statistik catur per user (rank ELO, menang/kalah/seri) */
export const chessProfiles = mysqlTable("chess_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .unique(),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  elo: int("elo").default(1200).notNull(),
  wins: int("wins").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  draws: int("draws").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChessProfile = typeof chessProfiles.$inferSelect;

/** Satu baris = satu partai catur */
export const games = mysqlTable(
  "games",
  {
    id: serial("id").primaryKey(),
    mode: mysqlEnum("mode", ["bot", "online", "friend"]).notNull(),
    status: mysqlEnum("status", ["waiting", "playing", "finished"])
      .default("waiting")
      .notNull(),
    /** userId pemain putih. NULL = kursi kosong (menunggu) atau BOT */
    whiteId: bigint("whiteId", { mode: "number", unsigned: true }),
    blackId: bigint("blackId", { mode: "number", unsigned: true }),
    /** level BOT 1-5 (hanya untuk mode "bot") */
    botLevel: int("botLevel"),
    /** FEN posisi terkini — server adalah sumber kebenaran */
    fen: text("fen").notNull(),
    result: mysqlEnum("result", ["white", "black", "draw"]),
    resultReason: varchar("resultReason", { length: 64 }),
    winnerId: bigint("winnerId", { mode: "number", unsigned: true }),
    /** kode undangan untuk main dengan teman */
    roomCode: varchar("roomCode", { length: 8 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    finishedAt: timestamp("finishedAt"),
  },
  (t) => ({
    roomCodeIdx: uniqueIndex("games_room_code_idx").on(t.roomCode),
  }),
);

export type Game = typeof games.$inferSelect;

/** Riwayat langkah per partai */
export const moves = mysqlTable(
  "moves",
  {
    id: serial("id").primaryKey(),
    gameId: bigint("gameId", { mode: "number", unsigned: true }).notNull(),
    moveNumber: int("moveNumber").notNull(),
    color: mysqlEnum("color", ["w", "b"]).notNull(),
    san: varchar("san", { length: 16 }).notNull(),
    fromSq: varchar("fromSq", { length: 4 }).notNull(),
    toSq: varchar("toSq", { length: 4 }).notNull(),
    promotion: varchar("promotion", { length: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    gameIdx: index("moves_game_idx").on(t.gameId),
  }),
);

export type Move = typeof moves.$inferSelect;

/** Chat dalam partai */
export const chatMessages = mysqlTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    gameId: bigint("gameId", { mode: "number", unsigned: true }).notNull(),
    /** NULL = pesan sistem */
    userId: bigint("userId", { mode: "number", unsigned: true }),
    body: varchar("body", { length: 280 }).notNull(),
    system: boolean("system").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    gameIdx: index("chat_game_idx").on(t.gameId),
  }),
);

export type ChatMessage = typeof chatMessages.$inferSelect;

/** Antrian matchmaking */
export const matchQueue = mysqlTable("match_queue", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .unique(),
  elo: int("elo").notNull(),
  /** diisi saat sudah mendapat lawan */
  matchedGameId: bigint("matchedGameId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MatchQueueRow = typeof matchQueue.$inferSelect;
