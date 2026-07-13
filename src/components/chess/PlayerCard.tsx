import { Bot, User } from "lucide-react";
import RankBadge from "./RankBadge";
import { cn } from "@/lib/utils";

export type PlayerInfo = {
  id: number | null;
  name: string;
  elo: number;
  isBot: boolean;
} | null;

export default function PlayerCard({
  player,
  color,
  active,
  isYou,
}: {
  player: PlayerInfo;
  color: "white" | "black";
  active: boolean;
  isYou: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
        active
          ? "border-amber-400/60 bg-amber-400/10"
          : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1",
          color === "white"
            ? "bg-slate-100 ring-slate-300"
            : "bg-slate-800 ring-slate-600",
        )}
      >
        {player?.isBot ? (
          <Bot
            className={cn(
              "w-5 h-5",
              color === "white" ? "text-slate-700" : "text-slate-200",
            )}
          />
        ) : (
          <User
            className={cn(
              "w-5 h-5",
              color === "white" ? "text-slate-700" : "text-slate-200",
            )}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {player ? player.name : "Menunggu pemain…"}
          </span>
          {isYou && player && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold shrink-0">
              KAMU
            </span>
          )}
        </div>
        {player && (
          <div className="mt-0.5">
            <RankBadge elo={player.elo} size="sm" showElo />
          </div>
        )}
      </div>

      <span className="text-xs text-muted-foreground shrink-0">
        {color === "white" ? "Putih" : "Hitam"}
      </span>
    </div>
  );
}
