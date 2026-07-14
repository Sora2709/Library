"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Tags,
  BarChart3,
  Library,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Books", href: "/books", icon: BookOpen },
  { name: "Members", href: "/members", icon: Users },
  { name: "Borrow & Return", href: "/borrow", icon: ArrowLeftRight },
  { name: "Categories & Authors", href: "/categories", icon: Tags },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
    } catch {}
    router.push("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 lg:relative lg:z-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
          mobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/20 shrink-0">
            <Library className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold text-slate-900 leading-tight tracking-tight">
                Libraria
              </span>
              <span className="text-[11px] text-slate-500 leading-tight">Management System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Main Menu
              </p>
            </div>
          )}
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-600/5"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100 space-y-0.5">
          <Link
            href="/settings"
            onClick={onMobileClose}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              pathname === "/settings"
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings
              className={cn(
                "h-5 w-5 shrink-0",
                pathname === "/settings" ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"
              )}
              strokeWidth={1.8}
            />
            {!collapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-red-600 hover:bg-red-50 hover:text-red-700",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
            {!collapsed && <span>Sign out</span>}
          </button>

          <button
            onClick={onToggle}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
