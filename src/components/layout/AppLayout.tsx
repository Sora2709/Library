// src/components/layout/AppLayout.tsx
"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { ToastProvider } from "@/components/ui/toast";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Handle resize to close mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  // Function to open mobile sidebar
  const handleMobileOpen = () => {
    console.log("Opening mobile sidebar from AppLayout");
    setMobileOpen(true);
  };

  // Function to close mobile sidebar
  const handleMobileClose = () => {
    console.log("Closing mobile sidebar from AppLayout");
    setMobileOpen(false);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
        />

        <div className="flex-1 flex flex-col min-w-0 relative">
          <TopNav 
            onMobileMenuClick={handleMobileOpen}
          />
          
          <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-sm px-6 py-3 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span>© {new Date().getFullYear()} Bopha & Vuthy Foundation Library</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  System Online
                </span>
                <span>•</span>
                <span>v2.0.0</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}