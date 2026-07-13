import { Award, Crown, Diamond, Gem, Medal, Shield } from "lucide-react";
import { getRankTier } from "@contracts/chess";
import { cn } from "@/lib/utils";

const ICONS = {
  crown: Crown,
  gem: Gem,
  diamond: Diamond,
  medal: Medal,
  shield: Shield,
  award: Award,
} as const;

export default function RankBadge({
  elo,
  size = "md",
  showElo = false,
}: {
  elo: number;
  size?: "sm" | "md" | "lg";
  showElo?: boolean;
}) {
  const tier = getRankTier(elo);
  const Icon = ICONS[tier.icon as keyof typeof ICONS] ?? Award;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base",
      )}
      style={{
        color: tier.color,
        borderColor: `${tier.color}55`,
        backgroundColor: `${tier.color}14`,
      }}
    >
      <Icon
        className={cn(
          size === "sm" && "w-3 h-3",
          size === "md" && "w-4 h-4",
          size === "lg" && "w-5 h-5",
        )}
      />
      {tier.name}
      {showElo && <span className="opacity-70">· {elo}</span>}
    </span>
  );
}
