"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "CTF", href: "/ctf" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Mail Us", href: "mailto:thakurshivasinghraghuwanshi@gmail.com" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Detect scroll for glass background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-[rgba(5,8,22,0.92)] backdrop-blur-xl border-b border-[rgba(0,240,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "py-5 bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-section flex items-center justify-between">
        {/* Logo */}
    <Link href="/" className="flex items-center gap-3 group" aria-label="K.A.V.A.C.H. Home">
          <div className="relative">
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none" aria-hidden="true">
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
  <span className="text-gradient">K.A.V.A.C.H.</span>
</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1" role="menubar">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg ${
                isActive(link.href)
                  ? "text-kavach-cyan bg-kavach-cyan/8"
                  : "text-[var(--text-secondary)] hover:text-kavach-cyan hover:bg-kavach-cyan/5"
              }`}
            >
              {link.label}
              {/* Animated active underline */}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-kavach-cyan rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Auth Buttons — Desktop */}
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
  Join K.A.V.A.C.H.
</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <div className="space-y-1.5" aria-hidden="true">
            <motion.span
              className="block w-6 h-0.5 bg-kavach-cyan origin-center"
              animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-4 h-0.5 bg-kavach-cyan"
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-0.5 bg-kavach-cyan origin-center"
              animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 right-0 bg-[rgba(5,8,22,0.98)] backdrop-blur-2xl border-b border-kavach-cyan/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container-section py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(link.href)
                      ? "text-kavach-cyan bg-kavach-cyan/10 border border-kavach-cyan/20"
                      : "text-[var(--text-secondary)] hover:text-kavach-cyan hover:bg-kavach-cyan/5"
                  }`}
                >
                  {isActive(link.href) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse flex-shrink-0" />
                  )}
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3 border-t border-white/5 mt-4">
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
                      Join K.A.V.A.C.H.
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
