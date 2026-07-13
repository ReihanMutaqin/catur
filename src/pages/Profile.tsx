import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/AppShell";
import RankBadge from "@/components/chess/RankBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RANK_TIERS } from "@contracts/chess";
import { MODE_LABEL, outcomeLabel } from "@/lib/chess-ui";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data: profile } = trpc.chess.profile.useQuery();
  const { data: history } = trpc.chess.history.useQuery({ limit: 30 });

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const rename = trpc.chess.renameProfile.useMutation({
    onSuccess: () => {
      utils.chess.profile.invalidate();
      setEditing(false);
      toast.success("Nama diperbarui!");
    },
    onError: (e) => toast.error(e.message),
  });

  const elo = profile?.elo ?? 1200;
  const total =
    (profile?.wins ?? 0) + (profile?.losses ?? 0) + (profile?.draws ?? 0);
  const winRate = total > 0 ? Math.round(((profile?.wins ?? 0) / total) * 100) : 0;

  // Progres menuju tier berikutnya
  const currentTierIdx = RANK_TIERS.findIndex((t) => elo >= t.minElo);
  const nextTier = currentTierIdx > 0 ? RANK_TIERS[currentTierIdx - 1] : null;
  const currentTier = RANK_TIERS[currentTierIdx] ?? RANK_TIERS[RANK_TIERS.length - 1];
  const progress = nextTier
    ? Math.min(
        100,
        Math.round(
          ((elo - currentTier.minElo) / (nextTier.minElo - currentTier.minElo)) *
            100,
        ),
      )
    : 100;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Kartu profil */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">♚</div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      maxLength={32}
                      className="max-w-[220px]"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={rename.isPending || !nameDraft.trim()}
                      onClick={() =>
                        rename.mutate({ displayName: nameDraft.trim() })
                      }
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold truncate">
                      {profile?.displayName ?? "…"}
                    </h1>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7"
                      onClick={() => {
                        setNameDraft(profile?.displayName ?? "");
                        setEditing(true);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <RankBadge elo={elo} size="lg" showElo />
                </div>
              </div>
            </div>

            {/* Progres rank */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{currentTier.name}</span>
                <span>
                  {nextTier
                    ? `${nextTier.minElo - elo} ELO menuju ${nextTier.name}`
                    : "Tier tertinggi! 👑"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              <StatBox label="Partai" value={total} />
              <StatBox label="Menang" value={profile?.wins ?? 0} className="text-emerald-400" />
              <StatBox label="Seri" value={profile?.draws ?? 0} />
              <StatBox label="Win Rate" value={`${winRate}%`} className="text-amber-300" />
            </div>
          </CardContent>
        </Card>

        {/* Semua tier */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Tier Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...RANK_TIERS].reverse().map((t) => (
                <div
                  key={t.name}
                  className={cn(
                    "rounded-xl border p-3 flex items-center justify-between",
                    elo >= t.minElo &&
                      (nextTier ? t.minElo <= elo : true) &&
                      currentTier.name === t.name
                      ? "border-amber-400/50 bg-amber-400/10"
                      : "border-border",
                  )}
                >
                  <RankBadge elo={t.minElo} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {t.minElo}+
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Riwayat lengkap */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Riwayat Partai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {history?.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada partai selesai.
              </p>
            )}
            {history?.map((g) => (
              <button
                key={g.id}
                onClick={() => navigate(`/game/${g.id}`)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent text-left transition-colors"
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    g.outcome === "win" && "bg-emerald-400",
                    g.outcome === "loss" && "bg-red-400",
                    g.outcome === "draw" && "bg-slate-400",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {MODE_LABEL[g.mode]}
                    {g.mode === "bot" && g.botLevel ? ` Lv.${g.botLevel}` : ""}
                    {" · "}
                    {g.myColor === "white" ? "Putih" : "Hitam"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.resultReason ?? ""}
                    {g.finishedAt
                      ? ` · ${new Date(g.finishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold shrink-0",
                    g.outcome === "win" && "text-emerald-400",
                    g.outcome === "loss" && "text-red-400",
                    g.outcome === "draw" && "text-slate-300",
                  )}
                >
                  {outcomeLabel(g.outcome)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatBox({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center">
      <div className={cn("text-xl font-bold", className)}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
