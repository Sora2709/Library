"use client";
import { useEffect, useState } from "react";
import { Database, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Health = {
  ok: boolean;
  postgres?: string;
  mongodb?: string;
  mongoError?: string;
  mongodbConfigured?: boolean;
};

export function DbStatusBanner() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-3.5 py-2 text-xs text-slate-500 backdrop-blur-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> 
        Checking database connection…
      </div>
    );
  }

  // Check if MongoDB is connected
  const mongoOk = health?.mongodb === "ok";
  const mongoNotConfigured = health?.mongodb === "not_configured";

  // Don't show anything when MongoDB is connected
  if (mongoOk) {
    return null;
  }

  if (mongoNotConfigured) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3.5 py-2 text-xs backdrop-blur-sm">
        <Database className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-amber-900 font-medium">Demo Mode</span>
        <span className="text-amber-700">
          — Set <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[10px]">MONGODB_URI</code> in{" "}
          <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[10px]">.env</code> to connect MongoDB.
        </span>
        <Link
          href="/settings"
          className="ml-auto rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200"
        >
          Setup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-red-200/60 bg-red-50/80 px-3.5 py-2 text-xs backdrop-blur-sm">
      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
      <span className="text-red-900 font-medium">MongoDB Connection Error</span>
      {health?.mongoError && (
        <span className="text-red-700 truncate">— {health.mongoError}</span>
      )}
    </div>
  );
}