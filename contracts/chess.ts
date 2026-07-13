/**
 * Konstanta catur yang dipakai bersama oleh frontend & backend.
 */

export type RankTier = {
  name: string;
  minElo: number;
  color: string;
  icon: string;
};

/** Tier rank berdasarkan ELO (urut dari tertinggi) */
export const RANK_TIERS: RankTier[] = [
  { name: "Grandmaster", minElo: 2300, color: "#f43f5e", icon: "crown" },
  { name: "Master", minElo: 2000, color: "#a855f7", icon: "gem" },
  { name: "Berlian", minElo: 1700, color: "#22d3ee", icon: "diamond" },
  { name: "Emas", minElo: 1400, color: "#eab308", icon: "medal" },
  { name: "Perak", minElo: 1000, color: "#94a3b8", icon: "shield" },
  { name: "Perunggu", minElo: 0, color: "#b45309", icon: "award" },
];

export function getRankTier(elo: number): RankTier {
  return RANK_TIERS.find((t) => elo >= t.minElo) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

/** "ELO" BOT per level — dipakai untuk perhitungan rank saat lawan BOT */
export const BOT_ELO: Record<number, number> = {
  1: 600,
  2: 900,
  3: 1200,
  4: 1500,
  5: 1850,
};

export const BOT_NAMES: Record<number, string> = {
  1: "Bot Pemula",
  2: "Bot Santai",
  3: "Bot Tangguh",
  4: "Bot Ahli",
  5: "Bot Grandmaster",
};

export const BOT_LEVELS = [1, 2, 3, 4, 5] as const;

export const INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type GameMode = "bot" | "online" | "friend";
export type GameStatus = "waiting" | "playing" | "finished";
export type GameResult = "white" | "black" | "draw";
