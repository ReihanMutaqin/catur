import { Trophy } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/AppShell";
import RankBadge from "@/components/chess/RankBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { data: profile } = trpc.chess.profile.useQuery();
  const { data: rows, isLoading } = trpc.chess.leaderboard.useQuery({
    limit: 100,
  });

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Papan Peringkat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-center text-muted-foreground py-8">
                Memuat…
              </p>
            )}
            {!isLoading && rows?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Belum ada pemain terdaftar.
              </p>
            )}
            {rows && rows.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Pemain</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead className="text-right">ELO</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      M/S/K
                    </TableHead>
                    <TableHead className="text-right hidden sm:table-cell">
                      Win%
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p, i) => {
                    const total = p.wins + p.losses + p.draws;
                    const wr =
                      total > 0 ? Math.round((p.wins / total) * 100) : 0;
                    return (
                      <TableRow
                        key={p.id}
                        className={cn(
                          p.userId === profile?.userId && "bg-amber-400/10",
                        )}
                      >
                        <TableCell className="font-bold">
                          {i === 0
                            ? "🥇"
                            : i === 1
                              ? "🥈"
                              : i === 2
                                ? "🥉"
                                : i + 1}
                        </TableCell>
                        <TableCell className="font-medium max-w-[160px] truncate">
                          {p.displayName}
                          {p.userId === profile?.userId && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                              KAMU
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RankBadge elo={p.elo} size="sm" />
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">
                          {p.elo}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell tabular-nums">
                          {p.wins}/{p.draws}/{p.losses}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell tabular-nums">
                          {wr}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
