// src/components/layout/Sidebar.tsx
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
  Sparkles,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Books", href: "/dashboard/books", icon: BookOpen },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Borrow & Return", href: "/dashboard/borrow", icon: ArrowLeftRight },
  { name: "Categories & Authors", href: "/dashboard/categories", icon: Tags },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        onMobileClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
    } catch {}
    setTimeout(() => {
      router.push("/login");
    }, 300);
  };

  const currentPath = pathname ?? "";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            role="button"
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      {/* REMOVED: Mobile Menu Button - Now handled by TopNav */}

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? "4.5rem" : "16rem",
          transform: mobileOpen ? "translateX(0)" : isMobile ? "translateX(-100%)" : "translateX(0)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          }
        }}
        className={cn(
          "sticky top-0 h-screen z-50 flex flex-col bg-white shadow-lg shadow-slate-200/50 border-r border-slate-200/60 overflow-hidden shrink-0",
          isMobile && "fixed top-0 left-0 h-full shadow-2xl"
        )}
        style={{
          width: mobileOpen ? "16rem" : collapsed ? "4.5rem" : "16rem",
          flexShrink: 0,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header - Clean, no toggle button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-16 items-center gap-2 px-4 border-b border-slate-200/60 shrink-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 relative overflow-hidden"
        >
          {/* Animated background shine */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Mobile close button inside sidebar */}
          {isMobile && mobileOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={onMobileClose}
              className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white"
              aria-label="Close menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}

          <motion.div
            whileHover={{
              rotate: [0, -5, 5, -3, 3, 0],
              scale: 1.05,
              transition: {
                duration: 0.5,
                ease: "easeInOut",
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 shrink-0"
          >
            <Library className="h-4 w-4" />
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden leading-none"
              >
                <span className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Bopha & Vuthy
                  <Sparkles className="h-3 w-3 text-blue-500 inline-block ml-1" />
                </span>
                <span className="text-[10px] text-slate-500 tracking-wide whitespace-nowrap">
                  Library System
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin" role="menubar">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="px-2 pt-2 pb-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Main Menu
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {navigation.map((item, index) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/dashboard" && currentPath.startsWith(item.href));
            const isHovered = hoveredItem === item.name;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }
                }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
                role="menuitem"
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    if (isMobile) onMobileClose();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-600/5"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Hover background glow */}
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"
                    />
                  )}

                  <motion.div
                    whileHover={{
                      rotate: [0, -8, 8, -4, 4, 0],
                      transition: {
                        duration: 0.5,
                        ease: "easeInOut",
                      }
                    }}
                    className="relative z-10"
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="truncate relative z-10"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 relative z-10"
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && isHovered && !isMobile && (
                    <motion.div
                      initial={{ opacity: 0, x: -5, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -5, scale: 0.95 }}
                      className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50"
                    >
                      {item.name}
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div 
          className="px-3 py-3 border-t border-slate-200/60 space-y-0.5 shrink-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Settings */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/dashboard/settings"
              onClick={() => {
                if (isMobile) onMobileClose();
              }}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                currentPath === "/dashboard/settings"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  currentPath === "/dashboard/settings" ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}
                strokeWidth={1.8}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-red-600 hover:bg-red-50 hover:text-red-700 w-full relative overflow-hidden",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            {isSigningOut ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"
              />
            ) : (
              <>
                <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                    >
                      Sign out
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.button>

          {/* Version indicator - NO TOGGLE BUTTON */}
          <AnimatePresence mode="wait">
            {!collapsed && !isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 pt-2"
              >
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  v2.0.0 • Secure
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.aside>
    </>
  );
}