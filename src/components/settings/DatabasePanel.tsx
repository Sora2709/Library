"use client";
import { useEffect, useState } from "react";
import { Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Health = {
  ok?: boolean;
  mongodb?: string;
  mongoError?: string;
  mongodbConfigured?: boolean;
  mongodbDatabase?: string;
  mongodbHost?: string;
};

export function DatabasePanel() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const mongoOk = health?.mongodb === "ok";
  const mongoNotConfigured = health?.mongodb === "not_configured";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-primary-600" />
          MongoDB Connection
        </CardTitle>
        <CardDescription>
          MongoDB Atlas connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Single MongoDB Status Card */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              MongoDB Atlas
            </p>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : mongoOk ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </Badge>
            ) : mongoNotConfigured ? (
              <Badge variant="warning">Not configured</Badge>
            ) : (
              <Badge variant="danger" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Error
              </Badge>
            )}
          </div>
          
          {/* Show connection details when connected */}
          {mongoOk && (
            <div className="space-y-1">
              {health?.mongodbDatabase && (
                <p className="text-xs text-slate-500 font-mono">
                  Database: {health.mongodbDatabase}
                </p>
              )}
              {health?.mongodbHost && (
                <p className="text-xs text-slate-500 font-mono">
                  Host: {health.mongodbHost}
                </p>
              )}
              <p className="text-xs text-emerald-600 font-medium mt-1">
                ✓ Connection successful
              </p>
            </div>
          )}
          
          {health?.mongoError && (
            <p className="text-xs text-red-600 mt-2">{health.mongoError}</p>
          )}
        </div>

        {mongoNotConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">MongoDB is not connected</p>
                <p className="text-xs mt-1 text-amber-800">
                  To use MongoDB Atlas, add your connection URI to the{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px]">
                    .env
                  </code>{" "}
                  file at the project root:
                </p>
                <pre className="text-[11px] font-mono bg-white/60 border border-amber-200 rounded p-2 mt-2 overflow-x-auto">
{`MONGODB_URI=mongodb+srv://sambathsora_db_user:YOUR_REAL_PASSWORD@sora.ofemqen.mongodb.net/library?appName=sora
MONGODB_DB_NAME=library`}
                </pre>
                <p className="text-xs mt-2 text-amber-800">
                  Replace <code className="font-mono">YOUR_REAL_PASSWORD</code> with the
                  actual password (do not include the angle brackets). Then restart the
                  server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button Only */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}