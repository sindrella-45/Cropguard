"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home",         href: "#" },
  { label: "Features",     href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

export function PublicNav() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white"
      }`}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="white" strokeWidth="2"/>
                <path d="M8 12C10 8 14 8 16 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">CropGuard AI</div>
              <div className="text-gray-400 text-[10px] leading-tight">
                Scan your crops. Get solutions.
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors no-underline"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="no-underline">
              <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2">
                Login
              </button>
            </Link>
            <Link href="/auth/register" className="no-underline">
              <button className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 text-gray-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-[61px] left-0 right-0 z-40 bg-white border-b border-gray-100 px-6 py-5 flex flex-col gap-4 shadow-lg md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-gray-700 font-medium no-underline hover:text-green-600"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <button className="w-full text-sm text-gray-700 font-medium py-2.5 border border-gray-200 rounded-lg">
                  Login
                </button>
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}>
                <button className="w-full text-sm bg-green-600 text-white font-semibold py-2.5 rounded-lg">
                  Get Started Free
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
