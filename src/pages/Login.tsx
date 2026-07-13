import { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Email Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const firebaseLoginMutation = trpc.auth.firebaseLogin.useMutation({
    onSuccess: () => {
      navigate("/");
    },
    onError: (e) => {
      toast.error(e.message);
      setLoading(false);
    },
  });

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      firebaseLoginMutation.mutate({ idToken });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        setLoading(false);
        return;
      }
      toast.error(error?.message ?? "Login gagal");
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Mohon isi email dan password.");
      return;
    }
    
    setLoading(true);
    try {
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const idToken = await result.user.getIdToken();
      firebaseLoginMutation.mutate({ idToken });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      // User-friendly error messages
      let errorMsg = error?.message ?? "Terjadi kesalahan";
      if (error?.code === "auth/email-already-in-use") errorMsg = "Email ini sudah terdaftar. Silakan login.";
      if (error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") errorMsg = "Email atau password salah.";
      if (error?.code === "auth/weak-password") errorMsg = "Password terlalu lemah (minimal 6 karakter).";
      
      toast.error(errorMsg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1a1f2e]">
      {/* Animated chess board pattern background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            repeating-conic-gradient(
              #ffffff 0% 25%,
              transparent 0% 50%
            )`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(251,191,36,0.08))",
              border: "1px solid rgba(251,191,36,0.3)",
              boxShadow: "0 8px 24px rgba(251,191,36,0.15)",
            }}
          >
            ♛
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Catur Bae
          </h1>
          <p className="text-sm text-white/50 text-center leading-relaxed">
            Tantang lawan dari seluruh Indonesia.<br />
            {isRegistering ? "Buat akun untuk mulai bermain." : "Login untuk mulai bermain."}
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: loading
                ? "rgba(251,191,36,0.5)"
                : "linear-gradient(135deg, rgba(251,191,36,0.9), rgba(245,158,11,0.9))",
              color: "#fff",
              boxShadow: loading
                ? "none"
                : "0 4px 16px rgba(245,158,11,0.3)",
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isRegistering ? "Daftar Akun" : "Masuk"}
          </button>
        </form>

        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-white/30 font-medium">ATAU</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white/70" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </button>

        <p className="text-xs text-white/50 text-center mt-2">
          {isRegistering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-amber-400 font-semibold hover:underline"
          >
            {isRegistering ? "Login di sini" : "Daftar sekarang"}
          </button>
        </p>
      </div>

      {/* Chess pieces floating decoration */}
      <div className="absolute bottom-8 left-8 text-6xl opacity-10 select-none pointer-events-none">
        ♞
      </div>
      <div className="absolute top-8 right-12 text-5xl opacity-10 select-none pointer-events-none">
        ♜
      </div>
      <div className="absolute top-1/2 right-8 text-4xl opacity-10 select-none pointer-events-none">
        ♝
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
