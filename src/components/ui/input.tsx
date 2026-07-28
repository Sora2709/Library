"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { leadingIcon?: React.ReactNode }
>(({ className, leadingIcon, ...props }, ref) => {
  return (
    <div className="relative">
      {leadingIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {leadingIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 text-slate-900 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300",
          leadingIcon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";