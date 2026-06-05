"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "CTF", href: "/ctf" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-[rgba(5,8,22,0.85)] backdrop-blur-xl border-b border-[rgba(0,240,255,0.06)]"
          : "py-5 bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container-section flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
              <path
                d="M40 8L12 22V42C12 58 24 72 40 76C56 72 68 58 68 42V22L40 8Z"
                stroke="url(#nav-shield)"
                strokeWidth="3"
                fill="rgba(0,240,255,0.05)"
              />
              <path
                d="M30 42L37 49L52 34"
                stroke="#00f0ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="nav-shield" x1="12" y1="8" x2="68" y2="76">
                  <stop stopColor="#00f0ff" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 bg-kavach-cyan/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <span className="text-xl font-bold tracking-wider">
            <span className="text-gradient">KAVACH</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-kavach-cyan transition-colors duration-300 rounded-lg hover:bg-kavach-cyan/5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="px-5 py-2.5 text-sm font-medium text-kavach-cyan border border-kavach-cyan/20 rounded-xl hover:bg-kavach-cyan/5 hover:border-kavach-cyan/40 transition-all duration-300"
                >
                  Admin Panel
                </Link>
              )}
              <Link href="/dashboard" className="btn-primary !py-2.5 !px-5 !text-sm">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-kavach-cyan border border-kavach-cyan/20 rounded-xl hover:bg-kavach-cyan/5 hover:border-kavach-cyan/40 transition-all duration-300"
              >
                Login
              </Link>
              <Link href="/register" className="btn-primary !py-2.5 !px-5 !text-sm">
                Join Kavach
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden relative w-8 h-8 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          <div className="space-y-1.5">
            <motion.span
              className="block w-6 h-0.5 bg-kavach-cyan"
              animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="block w-4 h-0.5 bg-kavach-cyan"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-kavach-cyan"
              animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-[rgba(5,8,22,0.95)] backdrop-blur-2xl border-b border-kavach-cyan/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container-section py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-kavach-cyan hover:bg-kavach-cyan/5 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link href="/dashboard/admin" className="btn-secondary text-center text-sm">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/dashboard" className="btn-primary text-center text-sm">
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary text-center text-sm">
                      Login
                    </Link>
                    <Link href="/register" className="btn-primary text-center text-sm">
                      Join Kavach
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
