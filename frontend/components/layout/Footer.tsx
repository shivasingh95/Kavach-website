"use client";

import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "CTF Challenges", href: "/ctf" },
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
    { label: "Achievements", href: "/achievements" },
  ],
  Club: [
    { label: "About Us", href: "/about" },
    { label: "Join Us", href: "/join" },
    { label: "Contact", href: "/contact" },
    { label: "Code of Conduct", href: "/conduct" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Status", href: "/health" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="container-section py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <svg width="32" height="32" viewBox="0 0 80 80" fill="none">
                <path
                  d="M40 8L12 22V42C12 58 24 72 40 76C56 72 68 58 68 42V22L40 8Z"
                  stroke="url(#footer-shield)"
                  strokeWidth="3"
                  fill="rgba(0,240,255,0.05)"
                />
                <path d="M30 42L37 49L52 34" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="footer-shield" x1="12" y1="8" x2="68" y2="76">
                    <stop stopColor="#00f0ff" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-lg font-bold tracking-wider text-gradient">KAVACH</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mb-6">
              The premier college cybersecurity club. We defend, learn, and hack — together.
              Building the next generation of security professionals.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {["GitHub", "Discord", "Twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-kavach-cyan hover:border-kavach-cyan/20 transition-all text-xs font-bold"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-kavach-cyan transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Kavach Cybersecurity Club. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with 🛡️ by the <span className="text-kavach-cyan font-medium">Kavach</span> dev team
          </p>
        </div>
      </div>
    </footer>
  );
}
