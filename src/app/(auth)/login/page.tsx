// src/app/(auth)/login/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Library, Mail, Lock, Eye, EyeOff, ArrowRight, UserRound, ShieldCheck, RefreshCw, BookOpen, Sparkles, Fingerprint } from "lucide-react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const checkSetup = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/auth/bootstrap", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to check account setup. Please try again.");
      }
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Unable to sign in.");
      }

      try {
        localStorage.setItem("libraria_user", JSON.stringify(json.data));
      } catch {}

      console.log("Login successful, redirecting to dashboard...");
      window.location.href = "/dashboard";
      
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const isSetup = setupRequired === true;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[20%] w-[60%] h-[60%] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      {/* Mouse Follow Glow */}
      <div 
        className="absolute pointer-events-none w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-3xl transition-all duration-1000"
        style={{
          left: `calc(50% + ${mousePosition.x * 100}px)`,
          top: `calc(50% + ${mousePosition.y * 100}px)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Floating Glass Elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/30 backdrop-blur-xl rounded-2xl rotate-12 border border-white/40 shadow-xl animate-float" />
        <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-xl animate-float-delayed" />
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl px-8 py-8 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-500 group">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg ring-1 ring-white/20 hover:scale-105 transition-transform duration-300 group-hover:rotate-3">
                  <Library className="h-7 w-7" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                BOPHA & VUTHY
              </h1>
              <p className="text-blue-200/90 text-sm mt-1 font-medium tracking-wider flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3 animate-spin-slow" />
                Library Management System
                <Sparkles className="h-3 w-3 animate-spin-slow" />
              </p>
            </div>
          </div>

          {/* Content Card with 3D Tilt Effect */}
          <div 
            ref={cardRef}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/60 px-8 py-8 border border-white/50 mt-4 transition-all duration-300"
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {checking ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                  <RefreshCw className="relative h-8 w-8 animate-spin text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-700 mt-4 animate-pulse">
                  Connecting to your account database…
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Checking administrator access
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">
                      {isSetup ? "Create administrator account" : "Welcome back"}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {isSetup
                        ? "No user exists yet. Create the first secure administrator account."
                        : "Sign in with your library administrator credentials."}
                    </p>
                  </div>
                  {isSetup && (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/10 animate-bounce-subtle">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-5 rounded-xl bg-red-50/90 backdrop-blur-sm border border-red-200 px-4 py-3 text-sm text-red-700 animate-in slide-in-from-top-2 duration-300">
                    <span className="font-medium">Error:</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSetup && (
                    <div className="space-y-1.5 group">
                      <label className="text-xs font-medium text-slate-600 tracking-wide uppercase flex items-center gap-2">
                        <UserRound className="h-3 w-3" />
                        Full name
                      </label>
                      <div className="relative">
                        <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="text"
                          placeholder="Head Librarian"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 text-slate-900 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                          autoFocus
                        />
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 group">
                    <label className="text-xs font-medium text-slate-600 tracking-wide uppercase flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-all duration-300 group-focus-within:scale-110" />
                      <input
                        type="email"
                        placeholder="admin@libraria.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 text-slate-900 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                        autoFocus={!isSetup}
                      />
                      <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5 group">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-600 tracking-wide uppercase flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Password
                      </label>
                      {isSetup && (
                        <span className="text-xs text-slate-400">
                          minimum 8 characters
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-all duration-300 group-focus-within:scale-110" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm pl-10 pr-11 py-2 text-sm placeholder:text-slate-400 text-slate-900 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  {!isSetup && (
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 cursor-pointer w-4 h-4 transition-all duration-200 hover:border-blue-400"
                          defaultChecked 
                        />
                        <span className="group-hover:text-slate-800 transition-colors duration-200">
                          Remember me
                        </span>
                      </label>
                      <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="relative w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white font-medium text-sm overflow-hidden group"
                    disabled={loading}
                  >
                    {/* Ripple Effect Container */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {loading ? (
                      <span className="flex items-center gap-3 relative z-10">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {isSetup ? "Creating account…" : "Signing in…"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5 relative z-10">
                        {isSetup ? "Create administrator" : "Sign in"}
                        <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200/50 text-center">
                  <p className="text-xs text-slate-400 leading-relaxed flex items-center justify-center gap-2">
                    <Fingerprint className="h-3 w-3" />
                    {isSetup
                      ? "Your password is hashed before it is stored securely."
                      : "Your account is protected with secure authentication."}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <p className="text-xs text-slate-400">
              © 2025 Bopha & Vuthy Foundation Library. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(0, -30px); }
          75% { transform: translate(-20px, -10px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-15px, 15px); }
          66% { transform: translate(10px, 25px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite 1s;
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 25s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}