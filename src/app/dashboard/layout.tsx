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
    // ✅ Check session using your custom auth API
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}