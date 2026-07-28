// src/components/layout/TopNav.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, BookOpen, CheckCircle2, AlertTriangle, UserPlus, Clock, LogOut, User, Sliders, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onMobileMenuClick: () => void;
}

const iconMap: Record<string, typeof Bell> = {
  return: CheckCircle2,
  borrow: BookOpen,
  overdue: AlertTriangle,
  member: UserPlus,
};

const iconColorMap: Record<string, string> = {
  return: "text-emerald-600 bg-emerald-50",
  borrow: "text-primary-600 bg-primary-50",
  overdue: "text-amber-600 bg-amber-50",
  member: "text-sky-600 bg-sky-50",
};

interface NotifItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

export function TopNav({ onMobileMenuClick }: TopNavProps) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [notifList, setNotifList] = useState<NotifItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifList.filter((n) => !n.read).length;

  // Get storage key for current user
  const getStorageKey = useCallback(() => {
    if (!userId) return "read_notifications";
    return `read_notifications_${userId}`;
  }, [userId]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/dashboard");
      const json = await response.json();
      
      if (json.ok && json.data?.notifications) {
        const notifications = json.data.notifications;
        
        // Load read status from localStorage for this user
        const storageKey = getStorageKey();
        const readIds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        
        // Merge read status
        const merged = notifications.map((n: NotifItem) => ({
          ...n,
          read: readIds.includes(n.id) || n.read || false,
        }));
        
        setNotifList(merged);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [userId, getStorageKey]);

  // Initial load and auto-polling
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [userId, fetchNotifications]);

  // Fetch user data
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data) {
          const u = json.data;
          setIsAuthenticated(true);
          setUserName(u.name || "");
          setUserEmail(u.email || "");
          setUserAvatar(u.avatar || "");
          setUserId(u.id || "");
          try { localStorage.setItem("libraria_user", JSON.stringify(u)); } catch {}
        } else {
          setIsAuthenticated(false);
          try { localStorage.removeItem("libraria_user"); } catch {}
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
        try {
          const storedUser = localStorage.getItem("libraria_user");
          if (storedUser) {
            const u = JSON.parse(storedUser);
            setIsAuthenticated(true);
            setUserName(u.name || "");
            setUserEmail(u.email || "");
            setUserAvatar(u.avatar || "");
            setUserId(u.id || "");
          }
        } catch {}
      });
  }, []);

  // Click outside handler for notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click outside handler for profile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all notifications as read
  const markAllRead = useCallback(() => {
    const readIds = notifList.map((n) => n.id);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(readIds));
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifList, getStorageKey]);

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifList((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, read: true } : item
      );
      
      const readIds = updated.filter((n) => n.read).map((n) => n.id);
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(readIds));
      
      return updated;
    });
  }, [getStorageKey]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("libraria_user");
      setIsAuthenticated(false);
      setUserId("");
      setProfileOpen(false);
    } catch {}
    router.push("/login");
  };

  // Show nothing while loading
  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 lg:px-6 backdrop-blur-md">
        <div className="flex-1 max-w-xl">
          <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100"></div>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100"></div>
          <div className="hidden sm:block">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100"></div>
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100 mt-1"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 lg:px-6 backdrop-blur-md">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition -ml-1"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <Input
          leadingIcon={<Search className="h-4 w-4" />}
          placeholder="Search books, members, ISBN..."
          className="h-9 bg-slate-50/60 border-slate-200 focus-visible:bg-white"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px] text-slate-600" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "No unread notifications"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
                {notifList.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  notifList.map((n) => {
                    const Icon = iconMap[n.type] ?? Bell;
                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          if (!n.read) {
                            markAsRead(n.id);
                          }
                        }}
                        className={cn(
                          "w-full text-left flex gap-3 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer",
                          !n.read && "bg-primary-50/30"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            iconColorMap[n.type] ?? "text-slate-600 bg-slate-100"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 leading-tight">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {(() => {
                              const diff = Date.now() - new Date(n.time).getTime();
                              const mins = Math.floor(diff / 60000);
                              if (mins < 1) return "just now";
                              if (mins < 60) return `${mins}m ago`;
                              const hrs = Math.floor(mins / 60);
                              if (hrs < 24) return `${hrs}h ago`;
                              return `${Math.floor(hrs / 24)}d ago`;
                            })()}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="h-2 w-2 rounded-full bg-primary-600 mt-1 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    markAllRead();
                    setNotifOpen(false);
                  }}
                  className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 py-1"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile - Only show when authenticated */}
        {isAuthenticated ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 transition"
              aria-label="Profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700 font-medium">
                  {userAvatar || (userName ? userName.charAt(0).toUpperCase() : "U")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {userName || "User"}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {userEmail || ""}
                </p>
              </div>
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 animate-fade-in overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                          {userAvatar || (userName ? userName.charAt(0).toUpperCase() : "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{userName || "User"}</p>
                        <p className="text-xs text-slate-500">{userEmail || ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {[
                      { label: "Your Profile", icon: User, href: "/dashboard/profile" },
                      { label: "Preferences", icon: Sliders, href: "/dashboard/preferences" },
                      { label: "Help & Support", icon: HelpCircle, href: "/dashboard/help" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { setProfileOpen(false); router.push(item.href); }}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      >
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-1.5 border-t border-slate-100">
                    <button 
                      onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/login")}
            className="h-9"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}