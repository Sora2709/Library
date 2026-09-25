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

