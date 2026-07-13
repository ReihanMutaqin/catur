import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogOut, Menu, Swords, Trophy, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import RankBadge from "@/components/chess/RankBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Lobby", icon: Swords },
  { to: "/leaderboard", label: "Peringkat", icon: Trophy },
  { to: "/profile", label: "Profil", icon: User },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profile } = trpc.chess.profile.useQuery(undefined, {
    enabled: !!user,
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl text-amber-400">♛</span>
            <span>
              Catur<span className="text-amber-400">Online</span>
            </span>
          </Link>

          {/* Navigasi desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  location.pathname === item.to
                    ? "bg-amber-400/15 text-amber-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {profile && (
              <div className="hidden sm:block">
                <RankBadge elo={profile.elo} size="sm" showElo />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none">
                  <Avatar className="w-8 h-8 ring-1 ring-border">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-amber-400/20 text-amber-300 text-xs">
                      {(profile?.displayName ?? user?.name ?? "P")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">
                    {profile?.displayName ?? user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ELO {profile?.elo ?? 1200}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/leaderboard")}>
                  <Trophy className="w-4 h-4 mr-2" /> Papan Peringkat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-400">
                  <LogOut className="w-4 h-4 mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Navigasi mobile */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border/60 px-4 py-2 flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm",
                  location.pathname === item.to
                    ? "bg-amber-400/15 text-amber-300"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        CaturOnline — main catur gratis vs BOT, teman, & pemain online
      </footer>
    </div>
  );
}
