// src/components/layout/TopNav.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  Clock, 
  LogOut, 
  User, 
  Sliders, 
  HelpCircle,
  ChevronDown,
  X,
  Settings,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  borrow: "text-blue-600 bg-blue-50",
  overdue: "text-amber-600 bg-amber-50",
  member: "text-indigo-600 bg-indigo-50",
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
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifList.filter((n) => !n.read).length;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get storage key for current user
  const getStorageKey = useCallback(() => {
    if (!userId) return "read_notifications";
    return `read_notifications_${userId}`;
  }, [userId]);

  // Load read notifications from localStorage
  const loadReadStatus = useCallback(() => {
    if (!userId) return [];
    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [userId, getStorageKey]);

  // Save read notification to localStorage
  const saveReadStatus = useCallback((notificationIds: string[]) => {
    if (!userId) return;
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(notificationIds));
    } catch (error) {
      console.error("Failed to save read status:", error);
    }
  }, [userId, getStorageKey]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/dashboard");
      const json = await response.json();
      
      if (json.ok && json.data?.notifications) {
        const notifications = json.data.notifications;
        
        // Load read status from localStorage for this user
        const readIds = loadReadStatus();
        
        // Merge read status - mark as read if in localStorage
        const merged = notifications.map((n: NotifItem) => ({
          ...n,
          read: readIds.includes(n.id) || n.read || false,
        }));
        
        setNotifList(merged);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [userId, loadReadStatus]);

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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
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
    saveReadStatus(readIds);
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifList, saveReadStatus]);

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifList((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, read: true } : item
      );
      
      const readIds = updated.filter((n) => n.read).map((n) => n.id);
      saveReadStatus(readIds);
      
      return updated;
    });
  }, [saveReadStatus]);

  // Mark notification as unread (for testing)
  const markAsUnread = useCallback((id: string) => {
    setNotifList((prev) => {
      const updated = prev.map((item) => 
        item.id === id ? { ...item, read: false } : item
      );
      
      const readIds = updated.filter((n) => n.read).map((n) => n.id);
      saveReadStatus(readIds);
      
      return updated;
    });
  }, [saveReadStatus]);

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

  // Animation variants for dropdowns
  const dropdownVariants = {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.2,
      }
    },
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Show nothing while loading
  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/80 px-4 lg:px-6 backdrop-blur-md">
        <div className="flex-1">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100"></div>
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
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/80 px-3 sm:px-4 lg:px-6 backdrop-blur-md"
    >
      {/* Mobile menu button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMobileMenuClick}
        className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition -ml-1"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      {/* Welcome Section */}
      <div className="flex-1 flex items-center gap-3 min-w-0 px-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 min-w-0"
        >
          <Sparkles className="h-4 w-4 text-blue-500 hidden sm:block" />
          <div>
            <p className="text-sm font-medium text-slate-700 truncate">
              <span className="hidden sm:inline">{getGreeting()}, </span>
              <span className="text-blue-600 font-semibold">{userName || "Admin"}</span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(currentTime)}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1.5 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative hover:bg-slate-100 rounded-lg p-2"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px] text-slate-600" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-500">
                      {unreadCount > 0 ? `You have ${unreadCount} unread` : "All caught up!"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllRead} 
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </motion.button>
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
                        <motion.button
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: {
                              delay: 0.05,
                              type: "spring" as const,
                              stiffness: 300,
                              damping: 25,
                            }
                          }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => {
                            if (!n.read) {
                              markAsRead(n.id);
                            }
                          }}
                          className={cn(
                            "w-full text-left flex gap-3 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer",
                            !n.read && "bg-blue-50/30"
                          )}
                        >
                          <motion.div
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, -5, 5, 0],
                              transition: { duration: 0.3 }
                            }}
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              iconColorMap[n.type] ?? "text-slate-600 bg-slate-100"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </motion.div>
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
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-blue-600 mt-1 shrink-0"
                            />
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
                <div className="p-3 border-t border-slate-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      markAllRead();
                      setNotifOpen(false);
                    }}
                    className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1"
                  >
                    View all notifications
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        {isAuthenticated ? (
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 transition"
              aria-label="Profile"
            >
              <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-300">
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
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
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
                            {userAvatar || (userName ? userName.charAt(0).toUpperCase() : "U")}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{userName || "User"}</p>
                        <p className="text-xs text-slate-500">{userEmail || ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {[
                      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
                      { label: "Your Profile", icon: User, href: "/dashboard/settings/profile" },
                      { label: "Preferences", icon: Sliders, href: "/dashboard/settings/preferences" },
                      { label: "Help & Support", icon: HelpCircle, href: "/dashboard/settings/help" },
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: {
                            delay: index * 0.03,
                            type: "spring" as const,
                            stiffness: 300,
                            damping: 25,
                          }
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: "rgb(241 245 249)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setProfileOpen(false); router.push(item.href); }}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      >
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="p-1.5 border-t border-slate-100">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/login")}
              className="h-9 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Sign In
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}