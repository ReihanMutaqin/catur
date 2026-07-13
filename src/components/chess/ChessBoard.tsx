import { useMemo, useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import {
  boardSquares,
  isLightSquare,
  type PieceCode,
} from "@/lib/chess-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  WK, WQ, WR, WB, WN, WP,
  BK, BQ, BR, BB, BN, BP,
} from "./pieces";
import type { ComponentType, CSSProperties } from "react";

type PieceSvgProps = { style?: CSSProperties; className?: string };

const PIECE_SVG: Record<PieceCode, ComponentType<PieceSvgProps>> = {
  K: WK, Q: WQ, R: WR, B: WB, N: WN, P: WP,
  k: BK, q: BQ, r: BR, b: BB, n: BN, p: BP,
};

type Props = {
  fen: string;
  orientation: "white" | "black";
  /** true saat pemain boleh melangkah (giliran & partai berlangsung) */
  interactive: boolean;
  lastMove: { from: string; to: string } | null;
  onMove: (from: string, to: string, promotion?: string) => void;
};

const PROMO_PIECES = ["q", "r", "b", "n"] as const;

// Warna kotak papan — palet Lichess Blue
const LIGHT_SQ = "#dee3e6"; // biru-abu terang
const DARK_SQ  = "#8ca2ad"; // biru-abu gelap
const LIGHT_SQ_LABEL = "#8ca2ad";
const DARK_SQ_LABEL  = "#dee3e6";

export default function ChessBoard({
  fen,
  orientation,
  interactive,
  lastMove,
  onMove,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingPromo, setPendingPromo] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Track pieces for animation
  const [animatingPiece, setAnimatingPiece] = useState<string | null>(null);
  const prevFenRef = useRef(fen);

  const chess = useMemo(() => new Chess(fen), [fen]);
  const squares = useMemo(() => boardSquares(orientation), [orientation]);

  // Peta bidak dari FEN
  const pieceMap = useMemo(() => {
    const map = new Map<string, PieceCode>();
    for (const row of chess.board()) {
      for (const cell of row) {
        if (cell) {
          const code = (cell.color === "w"
            ? cell.type.toUpperCase()
            : cell.type) as PieceCode;
          map.set(cell.square, code);
        }
      }
    }
    return map;
  }, [chess]);

  // Langkah legal dari kotak terpilih
  const legalTargets = useMemo(() => {
    if (!selected) return new Map<string, { capture: boolean; promotion: boolean }>();
    const map = new Map<string, { capture: boolean; promotion: boolean }>();
    const moves = chess.moves({ square: selected as Square, verbose: true });
    for (const m of moves) {
      const prev = map.get(m.to);
      map.set(m.to, {
        capture: !!prev?.capture || m.flags.includes("c") || m.flags.includes("e"),
        promotion: !!prev?.promotion || m.flags.includes("p"),
      });
    }
    return map;
  }, [chess, selected]);

  // Kotak raja yang sedang skak
  const checkSquare = useMemo(() => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    for (const row of chess.board()) {
      for (const cell of row) {
        if (cell && cell.type === "k" && cell.color === turn) return cell.square;
      }
    }
    return null;
  }, [chess]);

  // Reset animating piece when FEN changes
  useEffect(() => {
    if (prevFenRef.current !== fen) {
      prevFenRef.current = fen;
      setAnimatingPiece(null);
    }
  }, [fen]);

  function handleSquareClick(square: string) {
    if (!interactive) return;
    const piece = pieceMap.get(square);
    const myColor = orientation === "white" ? "w" : "b";
    const pieceColor = piece
      ? piece === piece.toUpperCase()
        ? "w"
        : "b"
      : null;

    if (selected) {
      const target = legalTargets.get(square);
      if (target) {
        if (target.promotion) {
          setPendingPromo({ from: selected, to: square });
        } else {
          setAnimatingPiece(selected);
          onMove(selected, square);
        }
        setSelected(null);
        return;
      }
      if (pieceColor === myColor && chess.turn() === myColor) {
        setSelected(square === selected ? null : square);
        return;
      }
      setSelected(null);
      return;
    }

    if (pieceColor === myColor && chess.turn() === myColor) {
      setSelected(square);
    }
  }

  function choosePromotion(p: (typeof PROMO_PIECES)[number]) {
    if (pendingPromo) onMove(pendingPromo.from, pendingPromo.to, p);
    setPendingPromo(null);
  }

  return (
    <div className="w-full max-w-[min(92vw,600px)] mx-auto select-none">
      {/* Outer frame */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#2c3e50",
          padding: "20px",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Top coordinate labels */}
        <div className="flex mb-1 pl-5 pr-0">
          {(orientation === "white"
            ? ["a","b","c","d","e","f","g","h"]
            : ["h","g","f","e","d","c","b","a"]
          ).map((f) => (
            <div
              key={f}
              className="flex-1 text-center text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {f}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Left rank labels */}
          <div className="flex flex-col justify-around pr-1.5" style={{ width: "20px" }}>
            {(orientation === "white"
              ? ["8","7","6","5","4","3","2","1"]
              : ["1","2","3","4","5","6","7","8"]
            ).map((r) => (
              <div
                key={r}
                className="flex items-center justify-center text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,0.5)", height: "12.5%" }}
              >
                {r}
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div
            className="flex-1 aspect-square grid grid-cols-8"
            style={{
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            {squares.map((square) => {
              const light = isLightSquare(square);
              const piece = pieceMap.get(square);
              const isSelected = selected === square;
              const legal = legalTargets.get(square);
              const isLast =
                lastMove && (lastMove.from === square || lastMove.to === square);
              const isCheckSq = checkSquare === square;
              const PieceSvg = piece ? PIECE_SVG[piece] : null;

              let bgColor = light ? LIGHT_SQ : DARK_SQ;

              return (
                <button
                  key={square}
                  type="button"
                  onClick={() => handleSquareClick(square)}
                  className={cn(
                    "relative flex items-center justify-center p-0 border-0 outline-none overflow-hidden",
                    "aspect-square",
                    interactive && "cursor-pointer",
                    !interactive && "cursor-default",
                  )}
                  style={{ background: bgColor }}
                >
                  {/* highlight langkah terakhir */}
                  {isLast && (
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "rgba(205,210,25,0.45)" }}
                    />
                  )}
                  {/* highlight seleksi */}
                  {isSelected && (
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "rgba(20,85,30,0.5)" }}
                    />
                  )}
                  {/* raja skak */}
                  {isCheckSq && (
                    <span
                      className="absolute inset-0 pointer-events-none animate-pulse"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(255,60,60,0.85) 0%, rgba(255,0,0,0.2) 60%, transparent 80%)",
                      }}
                    />
                  )}

                  {/* legal move dot */}
                  {legal && !legal.capture && (
                    <span
                      className="absolute rounded-full pointer-events-none z-10"
                      style={{
                        width: "30%",
                        height: "30%",
                        background: "rgba(0,0,0,0.22)",
                      }}
                    />
                  )}
                  {/* legal capture ring */}
                  {legal && legal.capture && (
                    <span
                      className="absolute inset-0 rounded-none pointer-events-none z-10"
                      style={{
                        background: `radial-gradient(circle, transparent 55%, rgba(0,0,0,0.22) 55%)`,
                      }}
                    />
                  )}

                  {/* Piece SVG */}
                  {PieceSvg && (
                    <PieceSvg
                      className="absolute inset-[4%] pointer-events-none z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      style={{
                        width: "92%",
                        height: "92%",
                        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom file labels */}
        <div className="flex mt-1 pl-5 pr-0">
          {(orientation === "white"
            ? ["a","b","c","d","e","f","g","h"]
            : ["h","g","f","e","d","c","b","a"]
          ).map((f) => (
            <div
              key={f}
              className="flex-1 text-center text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Dialog promosi pion */}
      <Dialog
        open={!!pendingPromo}
        onOpenChange={(open) => !open && setPendingPromo(null)}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Promosi Pion</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3">
            {PROMO_PIECES.map((p) => {
              const code = (orientation === "white"
                ? p.toUpperCase()
                : p) as PieceCode;
              const PromoPiece = PIECE_SVG[code];
              return (
                <button
                  key={p}
                  onClick={() => choosePromotion(p)}
                  className="aspect-square rounded-xl bg-secondary hover:bg-accent flex items-center justify-center p-2 transition-all hover:scale-110 active:scale-95"
                >
                  <PromoPiece className="w-full h-full" />
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
