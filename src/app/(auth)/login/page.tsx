"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Library, Mail, Lock, Eye, EyeOff, ArrowRight, UserRound, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const checkSetup = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/auth/bootstrap", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Unable to check account setup.");
      setSetupRequired(Boolean(json.data?.setupRequired));
    } catch (err) {
      setError((err as Error).message);
      setSetupRequired(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || (setupRequired && !name.trim())) {
      setError(setupRequired ? "Name, email, and password are required." : "Email and password are required.");
      return;
    }
    if (setupRequired && password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = setupRequired ? "/api/auth/bootstrap" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupRequired ? { name, email, password } : { email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Unable to sign in.");

      // Cache public details only for immediate client UI rendering.
      // Authentication itself is handled by the HTTP-only session cookie.
      try {
        localStorage.setItem("libraria_user", JSON.stringify(json.data));
      } catch {}
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isSetup = setupRequired === true;

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white mx-auto mb-4 shadow-lg">
            <Library className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Libraria</h1>
          <p className="text-primary-100 text-sm mt-1">Library Management System</p>
        </div>

        <div className="p-8">
          {checking ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary-600 mb-3" />
              <p className="text-sm font-medium text-slate-700">Connecting to your account database…</p>
              <p className="text-xs text-slate-500 mt-1">Checking administrator access</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    {isSetup ? "Create administrator account" : "Welcome back"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isSetup
                      ? "No user exists yet. Create the first secure administrator account."
                      : "Sign in with your library administrator credentials."}
                  </p>
                </div>
                {isSetup && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSetup && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">Full name</label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Head Librarian"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-1 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 transition"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="admin@libraria.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-1 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 transition"
                      autoFocus={!isSetup}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                    Password {isSetup && <span className="text-slate-400 font-normal">(minimum 8 characters)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-1 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 transition"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSetup && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setError("Please contact your library administrator to reset your password.")} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{isSetup ? "Creating account…" : "Signing in…"}</span>
                  ) : (
                    <span className="flex items-center gap-2">{isSetup ? "Create administrator" : "Sign in"}<ArrowRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {isSetup
                    ? "Your password is hashed before it is stored in MongoDB."
                    : "Your session is securely stored in an HTTP-only cookie."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
