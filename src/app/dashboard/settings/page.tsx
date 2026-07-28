// src/app/dashboard/settings/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/textarea";
import { 
  Building2, 
  Bell, 
  Shield, 
  Save, 
  Sparkles,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Users,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
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

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    libraryName: "Bopha & Vuthy Foundation Library",
    email: "library@bophavuthy.edu",
    phone: "+1 (555) 123-4567",
    address: "123 University Ave, Academic City, AC 12345",
    loanPeriod: 14,
    maxBooksStudent: 5,
    maxBooksFaculty: 10,
    renewalLimit: 2,
    dueDateReminders: true,
    overdueAlerts: true,
    newBookArrivals: false,
    membershipExpiry: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    toast("Settings saved successfully", "success");
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
      {/* Header */}
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
            <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
            <p className="text-sm text-slate-500">Manage library configuration and policies</p>
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

      {/* Library Information */}
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
                <Building2 className="h-4 w-4 text-blue-600" />
              </motion.div>
              Library Information
            </CardTitle>
            <CardDescription>Basic information about your library</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              variants={fieldVariants}
              custom={0}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="md:col-span-2"
            >
              <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Library Name
              </Label>
              <Input 
                value={settings.libraryName}
                onChange={(e) => updateSetting('libraryName', e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" 
              />
            </motion.div>
            <motion.div 
              variants={fieldVariants}
              custom={1}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email
              </Label>
              <Input 
                type="email" 
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" 
              />
            </motion.div>
            <motion.div 
              variants={fieldVariants}
              custom={2}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Phone
              </Label>
              <Input 
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" 
              />
            </motion.div>
            <motion.div 
              variants={fieldVariants}
              custom={3}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="md:col-span-2"
            >
              <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Address
              </Label>
              <Input 
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" 
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Borrowing Policies */}
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
                <Clock className="h-4 w-4 text-blue-600" />
              </motion.div>
              Borrowing Policies
            </CardTitle>
            <CardDescription>Configure loan periods and limits</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'loanPeriod', label: 'Default Loan Period (days)', icon: Clock, value: settings.loanPeriod },
              { key: 'maxBooksStudent', label: 'Max Books Per Student', icon: Users, value: settings.maxBooksStudent },
              { key: 'maxBooksFaculty', label: 'Max Books Per Faculty', icon: Users, value: settings.maxBooksFaculty },
              { key: 'renewalLimit', label: 'Renewal Limit', icon: RefreshCw, value: settings.renewalLimit },
            ].map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.key}
                  variants={fieldVariants}
                  custom={index + 4}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {field.label}
                  </Label>
                  <Input 
                    type="number" 
                    value={field.value}
                    onChange={(e) => updateSetting(field.key as keyof typeof settings, Number(e.target.value))}
                    className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" 
                  />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
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
                <Shield className="h-4 w-4 text-blue-600" />
              </motion.div>
              Notification Settings
            </CardTitle>
            <CardDescription>Configure email and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'dueDateReminders', label: "Due date reminders", desc: "Send reminder 3 days before due date", checked: settings.dueDateReminders },
              { key: 'overdueAlerts', label: "Overdue alerts", desc: "Notify members when books are overdue", checked: settings.overdueAlerts },
              { key: 'newBookArrivals', label: "New book arrivals", desc: "Weekly newsletter with new additions", checked: settings.newBookArrivals },
              { key: 'membershipExpiry', label: "Membership expiry", desc: "Notify members 30 days before membership ends", checked: settings.membershipExpiry }
            ].map((item, index) => (
              <motion.div
                key={item.key}
                custom={index}
                variants={toggleItemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 transition-all duration-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={item.checked}
                  onChange={(v) => updateSetting(item.key as keyof typeof settings, v)}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}