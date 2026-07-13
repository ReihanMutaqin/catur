import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Copy,
  Flag,
  Home as HomeIcon,
  Loader2,
  MessageSquare,
  RotateCcw,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import ChessBoard from "@/components/chess/ChessBoard";
import PlayerCard from "@/components/chess/PlayerCard";
import MoveList from "@/components/chess/MoveList";
import ChatPanel from "@/components/chess/ChatPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODE_LABEL } from "@/lib/chess-ui";
import { cn } from "@/lib/utils";

export default function Game() {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [resignOpen, setResignOpen] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);

  const {
    data: state,
    error,
    refetch,
  } = trpc.chess.state.useQuery(
    { gameId },
    {
      refetchInterval: 1500,
      retry: false,
    },
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      navigate("/");
    }
  }, [error, navigate]);

  const moveMutation = trpc.chess.move.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => {
      toast.error(e.message);
      refetch();
    },
  });

  const resignMutation = trpc.chess.resign.useMutation({
    onSuccess: () => {
      refetch();
      utils.chess.profile.invalidate();
      utils.chess.history.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const chatMutation = trpc.chess.sendChat.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const createBot = trpc.chess.createVsBot.useMutation({
    onSuccess: (data) => navigate(`/game/${data.gameId}`),
    onError: (e) => toast.error(e.message),
  });

  // Reset dismiss saat ganti partai
  useEffect(() => setResultDismissed(false), [gameId]);

  const orientation = state?.yourColor ?? "white";

  const interactive = useMemo(() => {
    if (!state || state.status !== "playing") return false;
    if (!state.yourColor) return false;
    const turnColor = state.turn === "w" ? "white" : "black";
    return turnColor === state.yourColor && !moveMutation.isPending;
  }, [state, moveMutation.isPending]);

  const topColor = orientation === "white" ? "black" : "white";
  const bottomColor = orientation;

  const topPlayer = topColor === "white" ? state?.white : state?.black;
  const bottomPlayer = bottomColor === "white" ? state?.white : state?.black;

  const isYourTurn =
    state?.status === "playing" &&
    ((state.turn === "w" && state.yourColor === "white") ||
      (state.turn === "b" && state.yourColor === "black"));

  // Hasil partai untuk modal
  const outcome = useMemo(() => {
    if (!state || state.status !== "finished") return null;
    if (state.result === "draw") return "draw" as const;
    const winnerColor = state.result === "white" ? "white" : "black";
    return winnerColor === state.yourColor ? ("win" as const) : ("loss" as const);
  }, [state]);

  function handleMove(from: string, to: string, promotion?: string) {
    moveMutation.mutate({ gameId, from, to, promotion });
  }

  function copyCode() {
    if (state?.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
      toast.success("Kode disalin! Bagikan ke temanmu.");
    }
  }

  if (!state) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      </AppShell>
    );
  }

  const showResult =
    state.status === "finished" && !!outcome && !resultDismissed;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Bar info partai */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm px-2.5 py-1 rounded-full bg-secondary font-medium">
              {MODE_LABEL[state.mode]}
              {state.mode === "bot" && state.botLevel
                ? ` Lv.${state.botLevel}`
                : ""}
            </span>
            {state.status === "playing" && (
              <span
                className={cn(
                  "text-sm px-2.5 py-1 rounded-full font-medium",
                  isYourTurn
                    ? "bg-amber-400/20 text-amber-300"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {isYourTurn
                  ? state.isCheck
                    ? "Giliranmu — SKAK! ⚠️"
                    : "Giliranmu melangkah"
                  : `Menunggu ${state.turn === "w" ? "putih" : "hitam"}…`}
              </span>
            )}
            {state.status === "waiting" && (
              <span className="text-sm px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-medium">
                Menunggu teman…
              </span>
            )}
          </div>

          {state.status !== "finished" && state.yourColor && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              onClick={() => setResignOpen(true)}
            >
              <Flag className="w-4 h-4 mr-1.5" />
              {state.status === "waiting" ? "Batalkan" : "Menyerah"}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
          {/* Kolom papan */}
          <div className="space-y-3">
            <PlayerCard
              player={topPlayer ?? null}
              color={topColor}
              active={state.status === "playing" && state.turn === (topColor === "white" ? "w" : "b")}
              isYou={state.yourColor === topColor}
            />

            <div className="relative">
              <ChessBoard
                fen={state.fen}
                orientation={orientation}
                interactive={interactive}
                lastMove={state.lastMove}
                onMove={handleMove}
              />

              {/* Overlay menunggu teman */}
              {state.status === "waiting" && state.roomCode && (
                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4">
                  <p className="text-lg font-semibold">Menunggu teman bergabung…</p>
                  <p className="text-sm text-muted-foreground">
                    Bagikan kode ini:
                  </p>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                  >
                    <span className="text-3xl font-mono font-bold tracking-[0.3em] text-amber-300">
                      {state.roomCode}
                    </span>
                    <Copy className="w-5 h-5 text-amber-300" />
                  </button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ruangan terbuka otomatis saat teman masuk
                  </div>
                </div>
              )}
            </div>

            <PlayerCard
              player={bottomPlayer ?? null}
              color={bottomColor}
              active={state.status === "playing" && state.turn === (bottomColor === "white" ? "w" : "b")}
              isYou={state.yourColor === bottomColor}
            />
          </div>

          {/* Kolom samping: langkah & chat */}
          <Card className="h-[min(92vw,640px)] lg:h-[640px] flex flex-col overflow-hidden">
            <Tabs defaultValue="moves" className="flex flex-col h-full min-h-0">
              <TabsList className="m-2 shrink-0">
                <TabsTrigger value="moves" className="flex-1">
                  <ScrollText className="w-4 h-4 mr-1.5" /> Langkah
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="moves"
                className="flex-1 min-h-0 px-3 pb-3 mt-0 overflow-hidden"
              >
                <MoveList moves={state.moves} />
              </TabsContent>
              <TabsContent
                value="chat"
                className="flex-1 min-h-0 px-3 pb-3 mt-0 overflow-hidden"
              >
                <ChatPanel
                  messages={state.chat}
                  myUserId={user?.id ?? -1}
                  disabled={
                    state.mode === "bot" ||
                    state.status === "finished" ||
                    !state.yourColor
                  }
                  onSend={(body) => chatMutation.mutate({ gameId, body })}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Dialog konfirmasi menyerah */}
      <AlertDialog open={resignOpen} onOpenChange={setResignOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {state.status === "waiting" ? "Batalkan ruangan?" : "Menyerah?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {state.status === "waiting"
                ? "Ruangan akan ditutup dan kode tidak berlaku lagi."
                : "Kamu akan dinyatakan kalah dan ELO-mu bisa turun."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => resignMutation.mutate({ gameId })}
            >
              {state.status === "waiting" ? "Batalkan Ruangan" : "Ya, Menyerah"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal hasil partai */}
      <Dialog
        open={showResult}
        onOpenChange={(open) => !open && setResultDismissed(true)}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {outcome === "win" && "🎉 Kamu Menang!"}
              {outcome === "loss" && "Kamu Kalah"}
              {outcome === "draw" && "Partai Remis"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="text-6xl mb-3">
              {outcome === "win" ? "🏆" : outcome === "loss" ? "💪" : "🤝"}
            </div>
            <p className="text-muted-foreground">
              {state.resultReason ?? "Partai selesai"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {state.mode === "bot"
                ? "ELO diperbarui (partai vs BOT, K=16)"
                : "ELO kedua pemain telah diperbarui"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {state.mode === "bot" && state.botLevel && (
              <Button
                onClick={() =>
                  createBot.mutate({
                    level: state.botLevel!,
                    color:
                      state.yourColor === "white"
                        ? "black"
                        : state.yourColor === "black"
                          ? "white"
                          : "random",
                  })
                }
                disabled={createBot.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Main Lagi (ganti warna)
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>
              <HomeIcon className="w-4 h-4 mr-2" /> Kembali ke Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
