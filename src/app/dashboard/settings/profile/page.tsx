"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { 
  Save, 
  User, 
  Camera, 
  Sparkles,
  CheckCircle2,
  Loader2,
  Shield,
  Mail,
  Phone,
  Briefcase,
  UserCircle,
  Edit2,
  Lock,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@libraria.edu",
    role: "Head Librarian",
    avatar: "AD",
    phone: "",
    bio: "",
    joinedAt: "",
  });

  useEffect(() => {
    // Try to get user from localStorage first
    try {
      const storedUser = localStorage.getItem("libraria_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setProfile((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          role: user.role || prev.role,
          avatar: user.avatar || prev.avatar,
          joinedAt: user.joinedAt || prev.joinedAt,
        }));
      }
    } catch {}

    // Then fetch from API to get latest data
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          const user = json.data;
          setProfile((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            role: user.role || prev.role,
            avatar: user.avatar || prev.avatar,
            joinedAt: user.joinedAt || prev.joinedAt,
          }));
          try { localStorage.setItem("libraria_user", JSON.stringify(user)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Unable to update profile.");
      setProfile((prev) => ({ ...prev, ...json.data }));
      localStorage.setItem("libraria_user", JSON.stringify(json.data));
      setSaved(true);
      toast("Profile updated successfully", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      y: -2,
      boxShadow: "0 10px 40px -5px rgba(0,0,0,0.08)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
      }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      scale: 1.01,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
      }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
          >
            <UserCircle className="h-5 w-5" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
            <p className="text-sm text-slate-500">Manage your account profile and personal information</p>
          </div>
        </div>
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3"
        >
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs text-emerald-600 flex items-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved!
              </motion.span>
            )}
          </AnimatePresence>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2 relative z-10" />
                <span className="relative z-10">Saving…</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Save Changes</span>
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Profile Card */}
      <motion.div 
        variants={cardVariants} 
        custom={0}
        whileHover="hover"
      >
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  transition: {
                    type: "spring" as const,
                    stiffness: 500,
                    damping: 20,
                    delay: 0.1,
                  }
                }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -5, 5, 0],
                  transition: {
                    duration: 0.5,
                    ease: "easeInOut",
                  }
                }}
                className="relative group"
              >
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold">
                    {profile.avatar}
                  </AvatarFallback>
                </Avatar>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera className="h-6 w-6 text-white" />
                </motion.button>
              </motion.div>
              <div className="text-center sm:text-left flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap"
                >
                  <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {profile.role}
                  </Badge>
                  <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  {profile.joinedAt && (
                    <Badge variant="neutral" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since {new Date(profile.joinedAt).getFullYear()}
                    </Badge>
                  )}
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Information */}
      <motion.div 
        variants={cardVariants} 
        custom={1}
        whileHover="hover"
      >
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <User className="h-4 w-4 text-blue-600" />
              </motion.div>
              Personal Information
            </CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Full Name", icon: User, placeholder: "Your full name" },
                { key: "email", label: "Email", icon: Mail, placeholder: "your@email.com", type: "email" },
                { key: "phone", label: "Phone", icon: Phone, placeholder: "+1 (555) ..." },
                { key: "role", label: "Role", icon: Briefcase, placeholder: "", disabled: true },
              ].map((field, index) => {
                const Icon = field.icon;
                return (
                  <motion.div
                    key={field.key}
                    custom={index}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      {field.label}
                    </Label>
                    <Input
                      value={profile[field.key as keyof typeof profile] as string}
                      onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      type={field.type || "text"}
                      disabled={field.disabled}
                      className={cn(
                        "mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                        field.disabled && "bg-slate-50 text-slate-500"
                      )}
                    />
                  </motion.div>
                );
              })}
            </div>
            <motion.div
              variants={fieldVariants}
              custom={4}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                Bio
              </Label>
              <Textarea
                rows={3}
                value={profile.bio}
                placeholder="Tell us about yourself..."
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="mt-1.5 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y transition-all duration-200"
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Notice */}
      <motion.div 
        variants={itemVariants}
        className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200/60"
      >
        <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Secure Account</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Your profile information is encrypted and securely stored. 
            For security reasons, password changes must be done through the authentication system.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}