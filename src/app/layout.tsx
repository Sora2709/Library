// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/toast"; // ✅ Add this import
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Libraria — Library Management System",
  description: "A modern, professional library management platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <ToastProvider> {/* ✅ Wrap children with ToastProvider */}
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}