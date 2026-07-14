"use client";
import { useState, useEffect } from "react";
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
  const [notifList, setNotifList] = useState<NotifItem[]>([]);
  const unreadCount = notifList.filter((n) => !n.read).length;
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("admin@libraria.edu");
  const [userAvatar, setUserAvatar] = useState("AD");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to get user from localStorage first
    try {
      const storedUser = localStorage.getItem("libraria_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserName(u.name || "Admin User");
        setUserEmail(u.email || "admin@libraria.edu");
        setUserAvatar(u.avatar || "AD");
        setIsAuthenticated(true);
      }
    } catch {}

    // Then fetch from API to get latest data
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data) {
          const u = json.data;
          setUserName(u.name || "Admin User");
          setUserEmail(u.email || "admin@libraria.edu");
          setUserAvatar(u.avatar || "AD");
          try { localStorage.setItem("libraria_user", JSON.stringify(u)); } catch {}
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // If API fails, keep using stored user or defaults
        if (!isAuthenticated) {
          // Use default user
        }
      });

    // Fetch notifications
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data?.notifications) {
          setNotifList(json.data.notifications);
        }
      })
      .catch(() => {
        // Set some default notifications for demo
        setNotifList([
          {
            id: "1",
            title: "Welcome to Libraria",
            message: "Your library management system is ready!",
            time: new Date().toISOString(),
            read: false,
            type: "borrow",
          }
        ]);
      });
  }, []);

  const markAllRead = () => setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
    } catch {}
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 lg:px-6 backdrop-blur-md">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition -ml-1"
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
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative"
          >
            <Bell className="h-[18px] w-[18px] text-slate-600" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-500">You have {unreadCount} unread notifications</p>
                  </div>
                  <button onClick={markAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Mark all read
                  </button>
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
                            setNotifList((prev) => prev.map((item) => 
                              item.id === n.id ? { ...item, read: true } : item
                            ));
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
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 transition"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{userAvatar}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-tight">{userName}</p>
              <p className="text-[11px] text-slate-500 leading-tight">Head Librarian</p>
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
                      <AvatarFallback>{userAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  {[
                    { label: "Your Profile", icon: User, href: "/settings?tab=profile" },
                    { label: "Preferences", icon: Sliders, href: "/settings?tab=preferences" },
                    { label: "Help & Support", icon: HelpCircle, href: "/settings?tab=help" },
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
      </div>
    </header>
  );
}