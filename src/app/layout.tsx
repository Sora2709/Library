// src/app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/toast"; 
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bopha & Vuthy — Library Management System",
  description: "A modern, professional library management platform for Bopha & Vuthy Foundation Library.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-50 text-slate-900 antialiased">
        <Providers>
          <ToastProvider> 
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}