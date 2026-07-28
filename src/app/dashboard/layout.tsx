// src/app/dashboard/layout.tsx
'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check session using custom auth API
    fetch('/api/auth/me', {
      cache: 'no-store',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setAuthenticated(true);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 shadow-lg shadow-blue-500/10"></div>
          <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}