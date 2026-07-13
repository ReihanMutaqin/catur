/** Utilitas tampilan papan catur */

export type PieceCode =
  | "K" | "Q" | "R" | "B" | "N" | "P"
  | "k" | "q" | "r" | "b" | "n" | "p";

/** Glyph unicode per kode bidak (huruf besar = putih) */
export const PIECE_GLYPH: Record<PieceCode, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

/** Daftar 64 kotak sesuai orientasi (white = a8..h1, black = dibalik) */
export function boardSquares(orientation: "white" | "black"): string[] {
  const files = orientation === "white" ? [...FILES] : [...FILES].reverse();
  const ranks = orientation === "white" ? [...RANKS] : [...RANKS].reverse();
  const squares: string[] = [];
  for (const r of ranks) {
    for (const f of files) squares.push(`${f}${r}`);
  }
  return squares;
}

export function isLightSquare(square: string): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  return (file + rank) % 2 === 1;
}

export const MODE_LABEL: Record<string, string> = {
  bot: "Lawan BOT",
  online: "Online",
  friend: "Teman",
};

export function outcomeLabel(outcome: "win" | "loss" | "draw"): string {
  return outcome === "win" ? "Menang" : outcome === "loss" ? "Kalah" : "Remis";
}
