"use client";
import { useEffect, useState } from "react";
import { Database, AlertCircle, Loader2 } from "lucide-react";
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
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking database…
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
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs">
        <Database className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-amber-900 font-medium">Demo mode</span>
        <span className="text-amber-700">
          — Set <code className="rounded bg-amber-100 px-1 font-mono">MONGODB_URI</code> in{" "}
          <code className="rounded bg-amber-100 px-1 font-mono">.env</code> to connect MongoDB.
        </span>
        <Link
          href="/settings"
          className="ml-auto rounded-md bg-amber-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-amber-700 transition"
        >
          Setup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs">
      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
      <span className="text-red-900 font-medium">MongoDB connection error</span>
      {health?.mongoError && (
        <span className="text-red-700 truncate">— {health.mongoError}</span>
      )}
    </div>
  );
}