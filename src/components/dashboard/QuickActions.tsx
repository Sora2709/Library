"use client";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, ArrowRightLeft, Download, BookOpen } from "lucide-react";

const actions = [
  { label: "Add New Book", icon: Plus, href: "/books", primary: true },
  { label: "Issue Book", icon: ArrowRightLeft, href: "/borrow", primary: false },
  { label: "Register Member", icon: UserPlus, href: "/members", primary: false },
  { label: "Browse Books", icon: BookOpen, href: "/books", primary: false },
];

export function QuickActions() {
  const router = useRouter();
  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={
              action.primary
                ? "flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition shadow-sm shadow-primary-600/20"
                : "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            }
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        );
      })}
      <button
        onClick={() => router.push("/reports")}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <Download className="h-4 w-4" />
        Export Data
      </button>
    </div>
  );
}
