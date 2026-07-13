/** Perhitungan rating ELO standar */

export function expectedScore(selfElo: number, oppElo: number): number {
  return 1 / (1 + Math.pow(10, (oppElo - selfElo) / 400));
}

/**
 * Hitung ELO baru.
 * @param score 1 = menang, 0.5 = seri, 0 = kalah
 * @param k faktor K (online: 32, lawan bot: 16)
 */
export function newElo(
  selfElo: number,
  oppElo: number,
  score: number,
  k: number,
): number {
  const next = Math.round(selfElo + k * (score - expectedScore(selfElo, oppElo)));
  return Math.max(100, next);
}
