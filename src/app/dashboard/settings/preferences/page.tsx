"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { 
  Save, 
  Globe, 
  Bell, 
  Monitor, 
  Sparkles,
  CheckCircle2,
  Loader2,
  Moon,
  Sun,
  Laptop,
  Shield,
  Clock,
  Languages,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange, animated = true }: { checked: boolean; onChange: (v: boolean) => void; animated?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "h-6 w-11 rounded-full relative cursor-pointer transition-colors duration-200",
        checked ? "bg-blue-600" : "bg-slate-300"
      )}
    >
      <motion.div
        initial={false}
        animate={{
          left: checked ? "22px" : "0.5px",
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 30,
          }
        }}
        className="h-5 w-5 rounded-full bg-white absolute top-0.5 transition-shadow shadow-sm"
      />
    </motion.button>
  );
}

export default function PreferencesSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    itemsPerPage: "10",
    emailNotifs: true,
    pushNotifs: true,
    weeklyDigest: false,
    theme: "light",
  });

  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem("libraria_prefs");
      if (storedPrefs) setPreferences((prev) => ({ ...prev, ...JSON.parse(storedPrefs) }));
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("libraria_prefs", JSON.stringify(preferences));
    } catch {}
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    toast("Preferences saved successfully", "success");
    setTimeout(() => setSaved(false), 3000);
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

  const toggleItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      scale: 1.01,
      backgroundColor: "rgba(241, 245, 249, 0.8)",
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
      {/* Header with animated save button */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
            <p className="text-sm text-slate-500">Customize your language, region, and notification settings</p>
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

      {/* Language & Region */}
      <motion.div 
        variants={cardVariants} 
        custom={0}
        whileHover="hover"
      >
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Globe className="h-4 w-4 text-blue-600" />
              </motion.div>
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language and timezone</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                key: "language", 
                label: "Language", 
                icon: Languages,
                options: [
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                ]
              },
              { 
                key: "timezone", 
                label: "Timezone", 
                icon: Clock,
                options: [
                  { value: "UTC", label: "UTC" },
                  { value: "EST", label: "Eastern (EST)" },
                  { value: "CST", label: "Central (CST)" },
                  { value: "PST", label: "Pacific (PST)" },
                ]
              },
              { 
                key: "itemsPerPage", 
                label: "Items Per Page", 
                icon: Eye,
                options: [
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" },
                ]
              },
            ].map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {field.label}
                  </Label>
                  <Select
                    value={preferences[field.key as keyof typeof preferences] as string}
                    onChange={(e) => setPreferences((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
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
                <Bell className="h-4 w-4 text-blue-600" />
              </motion.div>
              Notifications
            </CardTitle>
            <CardDescription>Choose what updates you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["emailNotifs", "Email Notifications", "Receive email alerts for overdue books and new registrations"],
              ["pushNotifs", "Push Notifications", "Browser alerts for real-time updates"],
              ["weeklyDigest", "Weekly Digest", "Get a weekly library activity summary"]
            ].map(([key, label, desc], index) => (
              <motion.div
                key={key}
                custom={index}
                variants={toggleItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 transition-all duration-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={preferences[key as keyof typeof preferences] as boolean}
                  onChange={(v) => setPreferences((p) => ({ ...p, [key]: v }))}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div 
        variants={cardVariants} 
        custom={2}
        whileHover="hover"
      >
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Monitor className="h-4 w-4 text-blue-600" />
              </motion.div>
              Appearance
            </CardTitle>
            <CardDescription>Customize the interface appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "light", icon: Sun, label: "Light Mode", description: "Bright and clean" },
                { key: "dark", icon: Moon, label: "Dark Mode", description: "Coming soon", disabled: true },
                { key: "system", icon: Laptop, label: "System", description: "Coming soon", disabled: true },
              ].map((theme, index) => (
                <motion.div
                  key={theme.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    preferences.theme === theme.key 
                      ? "border-blue-500 bg-blue-50/40 shadow-sm shadow-blue-500/10"
                      : "border-slate-200/60 hover:border-slate-300",
                    theme.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <theme.icon className={cn(
                    "h-5 w-5",
                    preferences.theme === theme.key ? "text-blue-600" : "text-slate-400"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{theme.label}</p>
                    <p className="text-xs text-slate-500">{theme.description}</p>
                  </div>
                  {preferences.theme === theme.key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-slate-400 mt-4 flex items-center gap-2"
            >
              <Shield className="h-3 w-3" />
              Dark mode and system theme coming in a future update
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}