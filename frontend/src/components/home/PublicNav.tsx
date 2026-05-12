"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const links = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
              <path d="M9 9c1-2 5-2 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <circle cx="12" cy="8" r="1.5" fill="white" />
              <path d="M8 15c1.5 2 6.5 2 8 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="font-heading font-bold text-base text-gray-900">
            CropGuard<span className="text-green-600"> AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-200 no-underline"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link href="/auth/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-1 text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[61px] left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-3 shadow-md md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-gray-700 py-1 no-underline hover:text-green-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full mt-1">Login</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
