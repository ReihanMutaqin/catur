import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bot,
  Loader2,
  Search,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/AppShell";
import RankBadge from "@/components/chess/RankBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOT_ELO, BOT_NAMES } from "@contracts/chess";
import { MODE_LABEL, outcomeLabel } from "@/lib/chess-ui";
import { cn } from "@/lib/utils";

const BOT_LEVEL_INFO = [
  { level: 1, desc: "Baru belajar main", emoji: "🐣" },
  { level: 2, desc: "Lawan santai", emoji: "🙂" },
  { level: 3, desc: "Setara pemain menengah", emoji: "😤" },
  { level: 4, desc: "Sulit dikalahkan", emoji: "🔥" },
  { level: 5, desc: "Tantangan maksimal", emoji: "👑" },
];

type ColorChoice = "white" | "black" | "random";

export default function Home() {
  const navigate = useNavigate();

  const { data: profile } = trpc.chess.profile.useQuery();
  const { data: leaderboard } = trpc.chess.leaderboard.useQuery({ limit: 5 });
  const { data: history } = trpc.chess.history.useQuery({ limit: 5 });

  const [botDialog, setBotDialog] = useState(false);
  const [friendDialog, setFriendDialog] = useState(false);
  const [searching, setSearching] = useState(false);
  const [botLevel, setBotLevel] = useState(3);
  const [botColor, setBotColor] = useState<ColorChoice>("random");
  const [joinCode, setJoinCode] = useState("");
  const [waitSeconds, setWaitSeconds] = useState(0);

  // ---- Mutations ----
  const createBot = trpc.chess.createVsBot.useMutation({
    onSuccess: (data) => navigate(`/game/${data.gameId}`),
    onError: (e) => toast.error(e.message),
  });

  const createRoom = trpc.chess.createFriendRoom.useMutation({
    onSuccess: (data) => navigate(`/game/${data.gameId}`),
    onError: (e) => toast.error(e.message),
  });

  const joinRoom = trpc.chess.joinFriendRoom.useMutation({
    onSuccess: (data) => navigate(`/game/${data.gameId}`),
    onError: (e) => toast.error(e.message),
  });

  const enqueue = trpc.chess.matchmakingEnqueue.useMutation({
    onSuccess: (data) => {
      if (data.matched) navigate(`/game/${data.gameId}`);
    },
    onError: (e) => {
      toast.error(e.message);
      setSearching(false);
    },
  });

  const cancelQueue = trpc.chess.matchmakingCancel.useMutation();

  // Polling status matchmaking saat sedang mencari
  const { data: mmStatus } = trpc.chess.matchmakingStatus.useQuery(undefined, {
    enabled: searching,
    refetchInterval: searching ? 2000 : false,
  });

  useEffect(() => {
    if (mmStatus && "matched" in mmStatus && mmStatus.matched) {
      setSearching(false);
      navigate(`/game/${mmStatus.gameId}`);
    }
  }, [mmStatus, navigate]);

  useEffect(() => {
    if (!searching) {
      setWaitSeconds(0);
      return;
    }
    const t = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [searching]);

  function startMatchmaking() {
    setSearching(true);
    enqueue.mutate();
  }

  function stopMatchmaking() {
    setSearching(false);
    cancelQueue.mutate();
  }

  const totalGames =
    (profile?.wins ?? 0) + (profile?.losses ?? 0) + (profile?.draws ?? 0);
  const winRate =
    totalGames > 0
      ? Math.round(((profile?.wins ?? 0) / totalGames) * 100)
      : 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Kartu profil */}
        <Card className="border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-card to-card">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5">
            <div className="text-5xl">♞</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">
                Halo, {profile?.displayName ?? "Pemain"}! 👋
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {profile && <RankBadge elo={profile.elo} showElo />}
                <span className="text-sm text-muted-foreground">
                  {totalGames} partai · {winRate}% menang
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <Stat label="Menang" value={profile?.wins ?? 0} className="text-emerald-400" />
              <Stat label="Seri" value={profile?.draws ?? 0} className="text-slate-300" />
              <Stat label="Kalah" value={profile?.losses ?? 0} className="text-red-400" />
            </div>
          </CardContent>
        </Card>

        {/* Mode permainan */}
        <div className="grid md:grid-cols-3 gap-4">
          <ModeCard
            icon={<Bot className="w-7 h-7" />}
            title="Lawan BOT"
            desc="Latihan melawan AI 5 tingkat kesulitan. Rank ikut naik!"
            accent="from-violet-500/20 to-violet-500/5"
            iconColor="text-violet-300"
            onClick={() => setBotDialog(true)}
          />
          <ModeCard
            icon={<Swords className="w-7 h-7" />}
            title="Cari Lawan Online"
            desc="Matchmaking otomatis dengan pemain setara rank-mu."
            accent="from-amber-500/20 to-amber-500/5"
            iconColor="text-amber-300"
            onClick={startMatchmaking}
          />
          <ModeCard
            icon={<Users className="w-7 h-7" />}
            title="Main dengan Teman"
            desc="Buat ruangan & bagikan kode, atau gabung dengan kode teman."
            accent="from-emerald-500/20 to-emerald-500/5"
            iconColor="text-emerald-300"
            onClick={() => setFriendDialog(true)}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Papan peringkat mini */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-amber-400" /> Papan Peringkat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {leaderboard?.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Belum ada pemain.
                </p>
              )}
              {leaderboard?.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-1.5",
                    p.userId === profile?.userId && "bg-amber-400/10",
                  )}
                >
                  <span className="w-6 text-center font-bold text-muted-foreground">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">
                    {p.displayName}
                  </span>
                  <RankBadge elo={p.elo} size="sm" showElo />
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full mt-1"
                onClick={() => navigate("/leaderboard")}
              >
                Lihat semua
              </Button>
            </CardContent>
          </Card>

          {/* Riwayat mini */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Partai Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {history?.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Belum ada partai. Mulai main yuk!
                </p>
              )}
              {history?.map((g) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/game/${g.id}`)}
                  className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-accent text-left transition-colors"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      g.outcome === "win" && "bg-emerald-400",
                      g.outcome === "loss" && "bg-red-400",
                      g.outcome === "draw" && "bg-slate-400",
                    )}
                  />
                  <span className="flex-1 text-sm">
                    {MODE_LABEL[g.mode]}
                    {g.mode === "bot" && g.botLevel ? ` Lv.${g.botLevel}` : ""}
                    {" · "}
                    {g.myColor === "white" ? "Putih" : "Hitam"}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
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
      </div>

      {/* Dialog lawan BOT */}
      <Dialog open={botDialog} onOpenChange={setBotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lawan BOT</DialogTitle>
            <DialogDescription>
              Pilih tingkat kesulitan dan warna bidakmu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {BOT_LEVEL_INFO.map((info) => (
              <button
                key={info.level}
                onClick={() => setBotLevel(info.level)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  botLevel === info.level
                    ? "border-amber-400/60 bg-amber-400/10"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="text-xl">{info.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    Lv.{info.level} · {BOT_NAMES[info.level]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {info.desc}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  ~{BOT_ELO[info.level]} ELO
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Warna bidak</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { v: "white", label: "Putih", g: "♔" },
                  { v: "random", label: "Acak", g: "🎲" },
                  { v: "black", label: "Hitam", g: "♚" },
                ] as const
              ).map((c) => (
                <button
                  key={c.v}
                  onClick={() => setBotColor(c.v)}
                  className={cn(
                    "rounded-xl border py-2.5 flex flex-col items-center gap-1 transition-colors",
                    botColor === c.v
                      ? "border-amber-400/60 bg-amber-400/10"
                      : "border-border hover:bg-accent",
                  )}
                >
                  <span className="text-2xl">{c.g}</span>
                  <span className="text-xs">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={createBot.isPending}
            onClick={() => {
              setBotDialog(false);
              createBot.mutate({ level: botLevel, color: botColor });
            }}
          >
            {createBot.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Mulai Partai
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog main dengan teman */}
      <Dialog open={friendDialog} onOpenChange={setFriendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Main dengan Teman</DialogTitle>
            <DialogDescription>
              Buat ruangan baru atau gabung dengan kode dari temanmu.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="create">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">
                Buat Ruangan
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1">
                Gabung
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Kamu akan mendapat kode 6 huruf. Bagikan ke temanmu — warna
                bidak diundi acak.
              </p>
              <Button
                className="w-full"
                size="lg"
                disabled={createRoom.isPending}
                onClick={() => {
                  setFriendDialog(false);
                  createRoom.mutate();
                }}
              >
                {createRoom.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Buat Ruangan
              </Button>
            </TabsContent>
            <TabsContent value="join" className="pt-4 space-y-3">
              <Input
                placeholder="Masukkan kode (mis. ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-lg tracking-widest font-mono"
              />
              <Button
                className="w-full"
                size="lg"
                disabled={joinCode.trim().length < 4 || joinRoom.isPending}
                onClick={() => {
                  setFriendDialog(false);
                  joinRoom.mutate({ code: joinCode.trim() });
                }}
              >
                {joinRoom.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Gabung Partai
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Overlay matchmaking */}
      {searching && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
            <Search className="w-8 h-8 text-amber-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Mencari lawan…</h2>
            <p className="text-muted-foreground mt-1">
              {waitSeconds > 0 ? `${waitSeconds} detik` : "Menyiapkan antrian"}
              {profile ? ` · ELO kamu ${profile.elo}` : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Semakin lama menunggu, rentang ELO lawan semakin luas.
            </p>
          </div>
          <Button variant="outline" onClick={stopMatchmaking}>
            <X className="w-4 h-4 mr-2" /> Batalkan
          </Button>
        </div>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <div className={cn("text-xl font-bold", className)}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  accent,
  iconColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border border-border p-5 bg-gradient-to-br transition-all hover:scale-[1.02] hover:border-amber-400/40 active:scale-[0.99]",
        accent,
      )}
    >
      <div className={cn("mb-3", iconColor)}>{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}
