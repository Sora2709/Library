"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Download, 
  Calendar, 
  FileText,
  Sparkles,
  BarChart3,
  Users,
  BookOpen,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DashboardActionsProps {
  onExport?: () => Promise<void> | void;
  onAddBook?: () => void;
  showAnalytics?: boolean;
}

export function DashboardActions({ 
  onExport, 
  onAddBook,
  showAnalytics = false 
}: DashboardActionsProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleExport = async () => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport();
      } finally {
        setIsExporting(false);
      }
    } else {
      router.push("/dashboard/reports");
    }
  };

  const handleAddBook = () => {
    if (onAddBook) {
      onAddBook();
    } else {
      router.push("/dashboard/books");
    }
  };

  // Quick action buttons for additional features
  const quickActions = [
    {
      icon: Calendar,
      label: "Calendar",
      onClick: () => router.push("/dashboard/calendar"),
      color: "blue",
    },
    {
      icon: Users,
      label: "Patrons",
      onClick: () => router.push("/dashboard/patrons"),
      color: "emerald",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      onClick: () => router.push("/dashboard/analytics"),
      color: "purple",
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }}
      className="flex items-center gap-3 flex-wrap"
    >
      {/* Export Button */}
      <motion.div
        whileHover={{ 
          scale: 1.03,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 10,
          }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 10,
          }
        }}
        onHoverStart={() => setIsHovered("export")}
        onHoverEnd={() => setIsHovered(null)}
      >
        <Button 
          variant="outline" 
          size="md" 
          onClick={handleExport}
          disabled={isExporting}
          className="relative border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 group overflow-hidden"
        >
          {/* Ripple effect on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-slate-100/0 via-slate-100/50 to-slate-100/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ 
                  rotate: [0, -10, 10, -5, 5, 0],
                  transition: { 
                    duration: 0.5,
                    ease: "easeInOut",
                  }
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                <span>Export</span>
              </motion.div>
              
              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered === "export" && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 whitespace-nowrap pointer-events-none"
                  >
                    Export reports
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </Button>
      </motion.div>

      {/* Add Book Button - Primary Action */}
      <motion.div
        whileHover={{ 
          scale: 1.03,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 10,
          }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 10,
          }
        }}
        onHoverStart={() => setIsHovered("add")}
        onHoverEnd={() => setIsHovered(null)}
        className="relative"
      >
        <Button 
          size="md" 
          onClick={handleAddBook}
          className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white group overflow-hidden"
        >
          {/* Animated gradient overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {/* Glow effect on hover */}
          <span className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          
          <motion.div
            whileHover={{ 
              rotate: [0, -10, 10, -5, 5, 0],
              transition: { 
                duration: 0.5,
                ease: "easeInOut",
              }
            }}
            className="flex items-center gap-2 relative z-10"
          >
            <Plus className="h-4 w-4 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
            <span>Add Book</span>
            <motion.span
              initial={{ x: 0, opacity: 0 }}
              whileHover={{ x: 4, opacity: 1 }}
              className="hidden sm:inline-block"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.span>
          </motion.div>

          {/* Floating sparkle on hover */}
          <AnimatePresence>
            {isHovered === "add" && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                  y: [-10, -30, -50],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered === "add" && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white bg-slate-800 px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none"
            >
              Add new book to library
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Action Buttons */}
      {showAnalytics && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200"
        >
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ 
                scale: 1.05,
                transition: { 
                  type: "spring" as const,
                  stiffness: 400,
                  damping: 10,
                }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { 
                  type: "spring" as const,
                  stiffness: 400,
                  damping: 10,
                }
              }}
              onClick={action.onClick}
              onHoverStart={() => setIsHovered(action.label.toLowerCase())}
              onHoverEnd={() => setIsHovered(null)}
              className={`relative p-2 rounded-lg transition-all duration-200 group 
                bg-${action.color}-50 hover:bg-${action.color}-100 
                text-${action.color}-600 hover:text-${action.color}-700
                ring-1 ring-${action.color}-200/50 hover:ring-${action.color}-300/50`}
            >
              <motion.div
                whileHover={{ 
                  rotate: [0, -10, 10, -5, 5, 0],
                  transition: { 
                    duration: 0.5,
                    ease: "easeInOut",
                  }
                }}
              >
                <action.icon className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
              </motion.div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered === action.label.toLowerCase() && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white bg-slate-800 px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none"
                  >
                    {action.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Keyboard shortcut indicator */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 ml-2"
      >
        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">⌘</span>
        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">N</span>
      </motion.span>
    </motion.div>
  );
}