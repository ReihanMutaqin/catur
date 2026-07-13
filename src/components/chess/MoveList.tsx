import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type MoveRow = {
  moveNumber: number;
  color: "w" | "b";
  san: string;
};

export default function MoveList({ moves }: { moves: MoveRow[] }) {
  // Kelompokkan jadi pasangan (putih, hitam) per nomor langkah
  const pairs: { n: number; white?: string; black?: string }[] = [];
  for (const m of moves) {
    let pair = pairs.find((p) => p.n === m.moveNumber);
    if (!pair) {
      pair = { n: m.moveNumber };
      pairs.push(pair);
    }
    if (m.color === "w") pair.white = m.san;
    else pair.black = m.san;
  }

  if (moves.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Belum ada langkah.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="pr-3">
        {pairs.map((p) => (
          <div
            key={p.n}
            className="grid grid-cols-[2.5rem_1fr_1fr] text-sm font-mono"
          >
            <span className="text-muted-foreground py-1">{p.n}.</span>
            <span
              className={cn(
                "py-1 px-1.5 rounded",
                p.white && "text-foreground",
              )}
            >
              {p.white ?? ""}
            </span>
            <span className="py-1 px-1.5 rounded">{p.black ?? ""}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
