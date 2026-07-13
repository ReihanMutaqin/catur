import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Spinner } from "@/components/ui/spinner";

/** Bungkus halaman yang butuh login — redirect ke /login jika belum masuk */
export default function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
