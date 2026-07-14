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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {leadingIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          leadingIcon && "pl-9",
          className
        )}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";
