"use client";

import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "./admin/components/Header";
import { Sidebar } from "./admin/components/Sidebar";
import { useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Optional: lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // loading state while auth check
  if (isAuthenticated === null) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="text-sm font-medium">Checking authentication…</div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // redirecting (useAuth handles redirect)
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-sm text-slate-600">Redirecting to login…</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ Use dvh for mobile stability + prevent body scroll wars */}
        <div className="h-dvh bg-slate-50 overflow-hidden">
          <div className="flex h-dvh overflow-hidden">
            {/* Sidebar (responsive drawer) */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main area */}
            <div className="flex flex-col flex-1 min-w-0">
              <Header onMenuClick={() => setSidebarOpen(true)} />

              {/* ✅ Make only this region scroll */}
              <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="p-4 md:p-6">
                  <div className="mx-auto max-w-7xl">{children}</div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
