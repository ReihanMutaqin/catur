/**
 * AI BOT catur — minimax dengan alpha-beta pruning + evaluasi material &
 * piece-square tables. Berjalan di server agar langkah BOT tidak bisa dicurangi.
 */
import { Chess } from "chess.js";

type BotMove = { from: string; to: string; promotion?: string };

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Piece-square tables (dari sudut pandang putih, indeks 0 = a8)
const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30,
    30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5,
    -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0,
    0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0,
    15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5,
    0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10,
    0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10,
    10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5,
    -10, -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0,
    0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0,
    0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5,
    -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
    -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
    -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

/** Evaluasi posisi: positif = bagus untuk putih */
function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -100000 : 100000;
  }
  if (
    chess.isStalemate() ||
    chess.isInsufficientMaterial() ||
    chess.isThreefoldRepetition() ||
    chess.isDraw()
  ) {
    return 0;
  }

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const base = PIECE_VALUES[piece.type];
      const table = PST[piece.type];
      const idx = piece.color === "w" ? r * 8 + f : (7 - r) * 8 + (7 - f);
      const positional = table[idx];
      if (piece.color === "w") score += base + positional;
      else score -= base + positional;
    }
  }

  // Bonus mobilitas kecil
  const turn = chess.turn();
  const mobility = chess.moves().length;
  score += turn === "w" ? mobility * 2 : -mobility * 2;

  return score;
}

function orderMoves(moves: string[]): string[] {
  return moves
    .map((m) => {
      let s = 0;
      if (m.includes("x")) s += 10;
      if (m.includes("=")) s += 8;
      if (m.includes("+")) s += 5;
      if (m.includes("#")) s += 1000;
      return { m, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

const MAX_NODES = 60000;
let nodeCount = 0;

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingWhite: boolean,
): number {
  nodeCount++;
  if (nodeCount > MAX_NODES) return evaluate(chess);
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);

  const moves = orderMoves(chess.moves());

  if (maximizingWhite) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const val = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      chess.move(m);
      const val = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

const LEVEL_DEPTH: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };
const LEVEL_BLUNDER: Record<number, number> = {
  1: 0.35,
  2: 0.15,
  3: 0.05,
  4: 0,
  5: 0,
};

/** Pilih langkah BOT untuk posisi FEN tertentu */
export function pickBotMove(fen: string, level: number): BotMove | null {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true });
  if (legal.length === 0) return null;

  const depth = LEVEL_DEPTH[level] ?? 2;
  const blunderChance = LEVEL_BLUNDER[level] ?? 0;

  // Sesekali sengaja main langkah acak (level rendah)
  if (Math.random() < blunderChance) {
    const random = legal[Math.floor(Math.random() * legal.length)];
    return { from: random.from, to: random.to, promotion: random.promotion };
  }

  nodeCount = 0;
  const botIsWhite = chess.turn() === "w";
  const ordered = orderMoves(legal.map((m) => m.san));

  let bestMove: (typeof legal)[number] | null = null;
  let bestScore = botIsWhite ? -Infinity : Infinity;

  for (const san of ordered) {
    const applied = chess.move(san);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !botIsWhite);
    chess.undo();

    if (botIsWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = applied;
    }
  }

  if (!bestMove) {
    const random = legal[Math.floor(Math.random() * legal.length)];
    return { from: random.from, to: random.to, promotion: random.promotion };
  }
  return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
}
