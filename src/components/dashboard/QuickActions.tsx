"use client";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  UserPlus, 
  ArrowRightLeft, 
  Download, 
  BookOpen,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const actions = [
  { 
    label: "Add New Book", 
    icon: Plus, 
    href: "/dashboard/books", 
    primary: true,
    description: "Add a new book to the library",
    color: "blue"
  },
  { 
    label: "Issue Book", 
    icon: ArrowRightLeft, 
    href: "/dashboard/borrow", 
    primary: false,
    description: "Lend a book to a member",
    color: "emerald"
  },
  { 
    label: "Register Member", 
    icon: UserPlus, 
    href: "/dashboard/members", 
    primary: false,
    description: "Add a new library member",
    color: "violet"
  },
  { 
    label: "Browse Books", 
    icon: BookOpen, 
    href: "/dashboard/books", 
    primary: false,
    description: "View and search the catalog",
    color: "sky"
  },
];

export function QuickActions() {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const handleClick = (href: string, index: number) => {
    setClickedIndex(index);
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="sync">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isPrimary = action.primary;
          const isHovered = hoveredIndex === index;
          const isClicked = clickedIndex === index;

          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: {
                  type: "spring" as const,
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.06,
                }
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { 
                  type: "spring" as const,
                  stiffness: 400,
                  damping: 15,
                }
              }}
              whileTap={{ 
                scale: isPrimary ? 0.97 : 0.98,
                transition: { 
                  type: "spring" as const,
                  stiffness: 400,
                  damping: 15,
                }
              }}
              onClick={() => handleClick(action.href, index)}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className={`relative w-full group overflow-hidden ${
                isPrimary
                  ? "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35"
                  : "flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
              }`}
            >
              {/* Animated gradient overlay for primary button */}
              {isPrimary && (
                <motion.span
                  initial={{ x: "-100%" }}
                  animate={isHovered ? { x: "100%" } : { x: "-100%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0"
                />
              )}

              {/* Glow effect on hover */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 ${
                  isPrimary 
                    ? "bg-blue-500/20 blur-xl" 
                    : `bg-${action.color}-500/5 blur-lg`
                } pointer-events-none`}
              />

              {/* Icon with animation */}
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                whileHover={{ 
                  rotate: [0, -10, 10, -5, 5, 0],
                  scale: 1.1,
                  transition: { 
                    duration: 0.5,
                    ease: "easeInOut",
                  }
                }}
                whileTap={{ 
                  scale: 0.9,
                  transition: { 
                    duration: 0.1,
                  }
                }}
                className="relative z-10 flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 transition-all duration-300 ${
                  isPrimary ? "text-white" : `text-${action.color}-600`
                } group-hover:scale-110`} />
                <span>{action.label}</span>
              </motion.div>

              {/* Arrow indicator on hover */}
              <motion.span
                initial={{ x: 0, opacity: 0 }}
                animate={{ 
                  x: isHovered ? 4 : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className={`relative z-10 ${isPrimary ? "text-white/80" : "text-slate-400"}`}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>

              {/* Sparkle effect for primary button */}
              {isPrimary && isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                    y: [-10, -20, -30],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </motion.div>
              )}

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded shadow-sm pointer-events-none ${
                      isPrimary 
                        ? "bg-white text-blue-600" 
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {action.description}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click ripple effect */}
              {isClicked && (
                <motion.span
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute inset-0 rounded-xl ${
                    isPrimary ? "bg-white/20" : "bg-blue-500/10"
                  } pointer-events-none`}
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Export Data Button - Styled differently */}
      <motion.button
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          scale: 1,
          transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
            delay: 0.24,
          }
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 15,
          }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { 
            type: "spring" as const,
            stiffness: 400,
            damping: 15,
          }
        }}
        onClick={() => router.push("/dashboard/reports")}
        onHoverStart={() => setHoveredIndex(-1)}
        onHoverEnd={() => setHoveredIndex(null)}
        className="relative w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 group overflow-hidden"
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ 
            rotate: [0, -10, 10, -5, 5, 0],
            scale: 1.1,
            transition: { 
              duration: 0.5,
              ease: "easeInOut",
            }
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
          <span>Export Data</span>
        </motion.div>
        
        {/* Subtle underline animation */}
        <motion.span
          initial={{ width: 0 }}
          whileHover={{ width: "80%" }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500/30 rounded-full"
        />
      </motion.button>
    </div>
  );
}