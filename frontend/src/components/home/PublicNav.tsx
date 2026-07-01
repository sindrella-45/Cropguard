"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const links = [
  { label: "Home",         href: "#" },
  { label: "Features",     href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Guides",       href: "/guides" },
  { label: "About Us",     href: "#" },
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
          ? "bg-white/97 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src="/cropguard-logo.png"
              alt="CropGuard AI Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />

        <div>
      <div className="font-bold text-gray-900 text-sm leading-tight">
      CropGuard AI
    </div>
    <div className="text-gray-400 text-[10px] leading-tight">
      Smart Crop Protection
      </div>
      </div>
     </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors no-underline pb-0.5 ${
                  i === 0
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-200"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="no-underline">
              <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
                Log In
              </button>
            </Link>
            <Link href="/auth/register" className="no-underline">
              <button className="text-sm font-semibold bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm">
                Sign Up
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
            className="fixed top-[61px] left-0 right-0 z-40 bg-white border-b border-gray-100 px-6 py-5 flex flex-col gap-3 shadow-lg md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-gray-700 font-medium no-underline hover:text-green-600 py-1"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <button className="w-full text-sm font-semibold text-gray-700 py-2.5 border-2 border-gray-200 rounded-xl">
                  Log In
                </button>
              </Link>
              <Link href="/auth/register" onClick={() => setOpen(false)}>
                <button className="w-full text-sm font-semibold bg-green-700 text-white py-2.5 rounded-xl">
                  Sign Up
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
