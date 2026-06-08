"use client";
import { useEffect, useState } from "react";
import { startKeepAlive } from "@/lib/keepAlive";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Search, Clock, Wifi, BookOpen, MessageSquare,
  Settings, User, LogOut, Menu, X
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function DashboardLayout({ children }: { children: React.ReactNode }) {

  const { user, setUser, addToast, settings } = useAppStore();
  const lang = settings.language;

  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: t(lang, "nav_dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t(lang, "nav_diagnose"),  href: "/diagnose",  icon: Search },
    { label: t(lang, "nav_history"),   href: "/history",   icon: Clock },
    { label: t(lang, "nav_offline"),   href: "/offline",   icon: Wifi },
    { label: t(lang, "nav_guides"),    href: "/guides",    icon: BookOpen },
    { label: t(lang, "nav_feedback"),  href: "/feedback",  icon: MessageSquare },
    { label: t(lang, "nav_settings"),  href: "/settings",  icon: Settings },
    { label: t(lang, "nav_profile"),   href: "/profile",   icon: User },
  ];

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  // Keep Render backend alive
  useEffect(() => {
    startKeepAlive();
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    addToast("You have been signed out.", "info");
    router.push("/");
  };
  

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-6 no-underline" onClick={() => setSidebarOpen(false)}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" /><circle cx="12" cy="8" r="1.5" fill="white" /></svg>
        </div>
        <span className="font-heading font-bold text-sm text-gray-900">CropGuard<span className="text-green-600"> AI</span></span>
      </Link>

      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 no-underline ${
                active
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="h-px bg-gray-200 my-2" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all duration-150 w-full text-left"
        >
          <LogOut size={17} className="flex-shrink-0" />
          {t(lang, "nav_logout")}
        </button>
      </nav>

      <Link
        href="/profile"
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all mt-2 no-underline"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {user.avatar}
        </div>
        <div>
          <div className="text-xs font-medium text-gray-800 leading-tight">{user.name}</div>
          <div className="text-xs text-gray-400">{user.role}</div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 p-4 fixed top-0 bottom-0 left-0 z-40">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-1 text-gray-700"><Menu size={20} /></button>
        <span className="font-heading font-bold text-sm text-gray-900">CropGuard<span className="text-green-600"> AI</span></span>
        <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold no-underline">
          {user.avatar}
        </Link>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-60 bg-white border-r border-gray-200 p-4 z-[60] md:hidden flex flex-col"
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-8 max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}