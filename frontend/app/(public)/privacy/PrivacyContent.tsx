"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ──────────────────────────── Table of Contents ──────────────────────────── */
const tocSections = [
  { id: "who-we-are", number: "01", label: "Who We Are" },
  { id: "information-we-collect", number: "02", label: "Information We Collect" },
  { id: "how-we-use-your-data", number: "03", label: "How We Use Your Data" },
  { id: "legal-bases", number: "04", label: "Legal Bases" },
  { id: "sharing-disclosure", number: "05", label: "Sharing & Disclosure" },
  { id: "ctf-platform", number: "06", label: "CTF Platform" },
  { id: "cookies", number: "07", label: "Cookies & Tracking" },
  { id: "retention", number: "08", label: "Data Retention" },
  { id: "your-rights", number: "09", label: "Your Rights" },
  { id: "security", number: "10", label: "Data Security" },
  { id: "indian-law", number: "11", label: "Indian Law Compliance" },
  { id: "international", number: "12", label: "International Compliance" },
  { id: "minors", number: "13", label: "Minors" },
  { id: "policy-updates", number: "14", label: "Policy Updates" },
  { id: "contact", number: "15", label: "Contact & Grievance" },
];

/* ──────────────────────────── Reusable Components ──────────────────────────── */

function SectionHeading({
  id,
  number,
  title,
}: {
  id: string;
  number: string;
  title: string;
}) {
  return (
    <div id={id} className="scroll-mt-32 pt-2">
      <div className="flex items-center gap-4 mb-6">
        <span className="shrink-0 w-12 h-12 rounded-xl bg-kavach-cyan/[0.07] border border-kavach-cyan/20 flex items-center justify-center text-kavach-cyan font-mono text-sm font-bold">
          {number}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-kavach-cyan/70"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-5 py-3.5 text-gray-300 whitespace-normal"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LawBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-kavach-violet/10 border border-kavach-violet/20 text-kavach-violet text-xs font-semibold tracking-wide mr-2 mb-2">
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-kavach-cyan/20 hover:bg-kavach-cyan/[0.02] transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center text-kavach-cyan">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-semibold mb-1.5">{title}</h4>
          <div className="text-gray-400 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-white/90 mt-8 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan" />
      {children}
    </h3>
  );
}

/* ──────────────────────────── Icons (inline SVGs) ──────────────────────────── */

const ShieldIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const DatabaseIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const GlobeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const UserIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FlagIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const CookieIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5" />
    <path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" />
  </svg>
);

const ClockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ScaleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <path d="M17.5 6.5L12 3 6.5 6.5" />
    <path d="M6.5 6.5l-4 8c1.3 2.5 6.7 2.5 8 0" />
    <path d="M17.5 6.5l-4 8c1.3 2.5 6.7 2.5 8 0" />
  </svg>
);

const AlertIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FileIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/* ──────────────────────────── Main Component ──────────────────────────── */

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = tocSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => observerRef.current!.observe(h));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };

  return (
    <main className="min-h-screen pt-28 pb-24">
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden py-16 md:py-20">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-kavach-cyan/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-kavach-violet/[0.04] blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center">
              {ShieldIcon}
            </div>
            <span className="text-kavach-cyan font-mono text-sm font-semibold tracking-wider uppercase">
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-8">
            Kavach Cybersecurity Club is committed to protecting your privacy.
            This document explains how we collect, use, share, and safeguard your
            personal data across our website, CTF platform, and events.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Effective: June 13, 2026
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
              Last Updated: June 13, 2026
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              Version 1.0
            </span>
          </div>
        </div>
      </section>

      {/* ── Mobile TOC toggle ── */}
      <div className="lg:hidden sticky top-[72px] z-30 border-y border-white/[0.06] bg-[#050816]/90 backdrop-blur-xl">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300"
          aria-expanded={tocOpen}
          aria-controls="mobile-toc"
        >
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            Table of Contents
          </span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${tocOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {tocOpen && (
          <nav id="mobile-toc" className="px-4 pb-4 space-y-1 max-h-[50vh] overflow-y-auto">
            {tocSections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-kavach-cyan/10 text-kavach-cyan font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span className="font-mono text-xs mr-2 opacity-50">
                  {s.number}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ── Content + Desktop Sidebar ── */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 xl:gap-16">
          {/* Desktop TOC sidebar */}
          <aside className="hidden lg:block">
            <nav
              className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-8"
              aria-label="Table of contents"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
                On this page
              </p>
              <ul className="space-y-0.5">
                {tocSections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                        activeSection === s.id
                          ? "bg-kavach-cyan/[0.08] text-kavach-cyan font-semibold border-l-2 border-kavach-cyan"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border-l-2 border-transparent"
                      }`}
                    >
                      <span className="font-mono text-[11px] opacity-60 w-5 shrink-0">
                        {s.number}
                      </span>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
              {/* Back to top */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-6 flex items-center gap-2 text-xs text-gray-600 hover:text-kavach-cyan transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                Back to top
              </button>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <article className="max-w-3xl py-8 lg:py-0 space-y-16 text-gray-300 leading-relaxed">
            {/* ═══════════ 01 – Who We Are ═══════════ */}
            <section>
              <SectionHeading id="who-we-are" number="01" title="Who We Are" />
              <p className="mb-6">
                Kavach Cybersecurity Club (&ldquo;Kavach,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
                is a student-led cybersecurity community associated with an Indian Institute of
                Information Technology (IIIT). Kavach operates as a non-commercial educational and
                community organization focused on ethical hacking, security research, Capture-the-Flag
                (CTF) competitions, workshops, and awareness programs.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoCard icon={ShieldIcon} title="Nature">
                  Non-commercial, student-led educational community
                </InfoCard>
                <InfoCard icon={GlobeIcon} title="Primary Jurisdiction">
                  Republic of India — IT Act 2000 (as amended)
                </InfoCard>
                <InfoCard icon={DatabaseIcon} title="Platform Type">
                  Educational cybersecurity portal, CTF, and events platform
                </InfoCard>
                <InfoCard icon={UserIcon} title="Data Controller">
                  Kavach Club Leadership / Faculty Coordinator, IIIT
                </InfoCard>
              </div>
            </section>

            {/* ═══════════ 02 – Information We Collect ═══════════ */}
            <section>
              <SectionHeading
                id="information-we-collect"
                number="02"
                title="Information We Collect"
              />

              <SubHeading>2.1 Registration &amp; Account Data</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Name (full name or display name)",
                  "Email address (institutional or personal)",
                  "Institution / College name",
                  "Year of study and/or department",
                  "Password (stored as salted cryptographic hash — never in plaintext)",
                  "GitHub / Discord handle (optional, for community integration)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <SubHeading>2.2 CTF Platform Data</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Challenge submissions, flags submitted, solve timestamps",
                  "CTF team names and team membership",
                  "Points, rank, and leaderboard data",
                  "Hints accessed and challenges attempted",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <SubHeading>2.3 Usage &amp; Technical Data</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "IP address and approximate geolocation (country/city level)",
                  "Browser type, operating system, device type",
                  "Pages visited, time spent, navigation paths",
                  "Referrer URL and search terms leading to our site",
                  "HTTP request logs (retained per our logging policy)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <SubHeading>2.4 Communications Data</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Messages submitted via our Contact form",
                  "Event registration details (name, email, dietary/accessibility needs if provided)",
                  "Feedback, bug reports, and support requests",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <SubHeading>2.5 Voluntarily Provided Data</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Blog posts or writeups you publish on our platform",
                  "Profile bio, social links, avatar image",
                  "Comments or forum posts (if applicable)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-kavach-cyan/20 bg-kavach-cyan/[0.03] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-kavach-cyan">{ShieldIcon}</span>
                  <span>
                    We follow a <strong className="text-white">data minimisation principle</strong> — we only collect information
                    necessary for the stated purpose. We do not collect financial information, payment
                    card details, Aadhaar numbers, PAN details, or government-issued ID numbers.
                  </span>
                </p>
              </div>
            </section>

            {/* ═══════════ 03 – How We Use Your Data ═══════════ */}
            <section>
              <SectionHeading
                id="how-we-use-your-data"
                number="03"
                title="How We Use Your Data"
              />
              <p className="mb-6">We process your data for the following purposes:</p>
              <DataTable
                headers={["Purpose", "Data Used", "Basis"]}
                rows={[
                  ["Create and manage your account", "Name, email, password", "Contract / Consent"],
                  ["Operate CTF platform and track progress", "CTF data, account data", "Legitimate interest"],
                  ["Display public leaderboards", "Username, points, rank", "Consent (opt-in)"],
                  ["Send event/club announcements", "Email address", "Consent"],
                  ["Respond to contact form messages", "Name, email, message", "Consent"],
                  ["Improve website performance & security", "Technical/usage data", "Legitimate interest"],
                  ["Prevent abuse, fraud, and unauthorized access", "IP, logs, account data", "Legal obligation / Legitimate interest"],
                  ["Comply with legal requirements", "Any relevant data", "Legal obligation"],
                ]}
              />

              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-amber-400">{AlertIcon}</span>
                  <span>
                    We <strong className="text-white">do not</strong> use your data for advertising,
                    profiling, selling to third parties, or automated decision-making with significant
                    effects on you.
                  </span>
                </p>
              </div>
            </section>

            {/* ═══════════ 04 – Legal Bases ═══════════ */}
            <section>
              <SectionHeading id="legal-bases" number="04" title="Legal Bases for Processing" />
              <div className="flex flex-wrap mb-6">
                <LawBadge>IT Act 2000 (India)</LawBadge>
                <LawBadge>DPDP Act 2023 (India)</LawBadge>
                <LawBadge>GDPR Art. 6 (EU)</LawBadge>
              </div>
              <p className="mb-6">
                Under the Digital Personal Data Protection Act, 2023 (DPDPA) of India, and where
                applicable, the EU General Data Protection Regulation (GDPR), we rely on the following
                lawful bases:
              </p>
              <div className="space-y-4">
                <InfoCard icon={ShieldIcon} title="Consent">
                  For optional features such as newsletter subscriptions, public leaderboard display,
                  and profile visibility.
                </InfoCard>
                <InfoCard icon={FileIcon} title="Contractual Necessity">
                  To provide services you requested when creating an account or registering for an event.
                </InfoCard>
                <InfoCard icon={ScaleIcon} title="Legitimate Interests">
                  For security monitoring, abuse prevention, platform improvement, and analytics —
                  where such interests are not overridden by your rights.
                </InfoCard>
                <InfoCard icon={FlagIcon} title="Legal Obligation">
                  To comply with applicable Indian laws, court orders, or law enforcement requests
                  under lawful authority.
                </InfoCard>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                You may withdraw consent at any time. Withdrawal does not affect the lawfulness of
                processing prior to withdrawal.
              </p>
            </section>

            {/* ═══════════ 05 – Sharing & Disclosure ═══════════ */}
            <section>
              <SectionHeading
                id="sharing-disclosure"
                number="05"
                title="Sharing & Disclosure"
              />
              <div className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-5 text-sm mb-6">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-green-400">{ShieldIcon}</span>
                  <span>
                    We <strong className="text-white">do not sell, rent, or trade</strong> your
                    personal data. We may share data only in the limited circumstances described below.
                  </span>
                </p>
              </div>

              <SubHeading>5.1 Service Providers (Processors)</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Vercel Inc. — Hosting and CDN (US-based). Data may be processed on their servers.",
                  "Cloud database providers — For data storage (only as necessary for service delivery).",
                  "Email delivery services — For transactional emails (e.g., password reset, event notifications).",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-violet/60" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400 mb-6">
                All processors are bound by data processing agreements and may only use data as instructed by us.
              </p>

              <SubHeading>5.2 Legal Disclosure</SubHeading>
              <p className="mb-4 text-sm">We may disclose personal data when required by:</p>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Indian government authorities, law enforcement, or courts under the IT Act 2000, CrPC, or DPDPA 2023",
                  "CERT-In directives under Section 70B of the IT Act",
                  "A valid legal order, subpoena, or warrant",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-violet/60" />
                    {item}
                  </li>
                ))}
              </ul>

              <SubHeading>5.3 Safety &amp; Security</SubHeading>
              <p className="mb-6 text-sm">
                We may share data to prevent fraud, unauthorized access, illegal activity, or to
                protect the safety of our users and infrastructure.
              </p>

              <SubHeading>5.4 Public CTF Data</SubHeading>
              <p className="mb-4 text-sm">
                Usernames, CTF scores, team names, and solve times are publicly visible on leaderboards.
                If you want to remain private, use a pseudonym as your display name.
              </p>
              <p className="text-sm text-gray-400 italic">
                We will always attempt to notify you before disclosing your data to third parties unless
                prohibited by law or court order, or where notification would impede an ongoing investigation.
              </p>
            </section>

            {/* ═══════════ 06 – CTF Platform ═══════════ */}
            <section>
              <SectionHeading id="ctf-platform" number="06" title="CTF Platform & Ethical Research" />

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-sm mb-6">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-amber-400">{AlertIcon}</span>
                  <span>
                    <strong className="text-white">Important:</strong> Kavach is an educational
                    cybersecurity platform. All CTF challenges are intentionally designed for legal,
                    ethical security research and learning. Participation implies agreement to operate
                    only within designated challenge environments.
                  </span>
                </p>
              </div>

              <SubHeading>6.1 Responsible Use</SubHeading>
              <ul className="list-none space-y-2 ml-1 mb-6">
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-400/60" />
                  You must only attack systems, machines, or services explicitly designated as CTF
                  challenge targets.
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-400/60" />
                  Any attempt to attack Kavach&apos;s own infrastructure, third-party systems, or other
                  users&apos; machines is strictly prohibited and may constitute an offence under Section
                  43, 66, 66B, 66C, 66D of the IT Act, 2000.
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-400/60" />
                  Kavach maintains access logs. Any suspicious or unauthorized access will be
                  investigated and reported to appropriate authorities.
                </li>
              </ul>

              <SubHeading>6.2 Writeups &amp; Published Content</SubHeading>
              <p className="mb-6 text-sm">
                When you publish writeups or blog posts on our platform, you grant Kavach a
                non-exclusive licence to host and display that content. You retain ownership. You are
                responsible for ensuring your content does not contain actual exploit code targeting
                live production systems, or confidential/proprietary third-party data.
              </p>

              <SubHeading>6.3 No Safe Harbour for Illegal Activity</SubHeading>
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-red-400">{AlertIcon}</span>
                  <span>
                    Kavach does not provide legal safe harbour or protection for any illegal hacking
                    activity carried out under the guise of education or research. This platform is for
                    ethical, legal, and consensual security research only.
                  </span>
                </p>
              </div>
            </section>

            {/* ═══════════ 07 – Cookies ═══════════ */}
            <section>
              <SectionHeading id="cookies" number="07" title="Cookies & Tracking Technologies" />
              <DataTable
                headers={["Cookie Type", "Purpose", "Duration"]}
                rows={[
                  ["Essential", "Session management, authentication, CSRF protection", "Session / 7 days"],
                  ["Functional", "User preferences (theme, language)", "90 days"],
                  ["Analytics", "Anonymous usage statistics (if applicable)", "Up to 13 months"],
                ]}
              />
              <p className="mt-6 text-sm text-gray-400">
                We do not use third-party advertising cookies or cross-site tracking cookies. You may
                manage cookies via your browser settings. Disabling essential cookies may impact core
                functionality.
              </p>
              <p className="mt-3 text-sm text-gray-400">
                If we integrate third-party analytics tools (e.g., Plausible Analytics — privacy-first),
                these will be disclosed and configured to not collect personally identifiable information.
              </p>
            </section>

            {/* ═══════════ 08 – Retention ═══════════ */}
            <section>
              <SectionHeading id="retention" number="08" title="Data Retention" />
              <DataTable
                headers={["Data Category", "Retention Period"]}
                rows={[
                  ["Account and profile data", "Until account deletion + 30 days"],
                  ["CTF challenge logs & scores", "3 years (for archive/historical records) or until deletion request"],
                  ["Server/access logs", "90 days (per CERT-In guidelines, 2022)"],
                  ["Email communications", "2 years"],
                  ["Event registration data", "1 year post-event"],
                  ["Legal hold data", "As required by applicable law or court order"],
                ]}
              />
              <p className="mt-6 text-sm text-gray-400">
                Upon account deletion, we will anonymise or securely delete your personal data within
                30 days, unless retention is required by law.
              </p>
            </section>

            {/* ═══════════ 09 – Your Rights ═══════════ */}
            <section>
              <SectionHeading id="your-rights" number="09" title="Your Data Rights" />
              <div className="flex flex-wrap mb-6">
                <LawBadge>DPDP Act 2023 §§12-16</LawBadge>
                <LawBadge>GDPR Art. 15-22</LawBadge>
                <LawBadge>IT Act 2000</LawBadge>
              </div>

              <p className="mb-6">
                As a data principal under the DPDPA 2023 (India) and/or as a data subject under GDPR
                (if applicable), you have the following rights:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "Right to Access", desc: "Request a copy of personal data we hold about you." },
                  { title: "Right to Correction", desc: "Request correction of inaccurate or incomplete personal data." },
                  { title: "Right to Erasure", desc: 'Request deletion of your personal data ("right to be forgotten"), subject to legal retention obligations.' },
                  { title: "Right to Withdraw Consent", desc: "Withdraw consent for any processing based on consent, at any time." },
                  { title: "Right to Grievance Redressal", desc: "Lodge a complaint with our designated Grievance Officer." },
                  { title: "Right to Nominate", desc: "Under DPDPA 2023, nominate another individual to exercise your rights on your behalf in the event of death or incapacity." },
                  { title: "Right to Portability (GDPR)", desc: "Receive your data in a structured, machine-readable format, where applicable." },
                  { title: "Right to Object", desc: "Object to processing based on legitimate interests." },
                ].map((right) => (
                  <div
                    key={right.title}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-kavach-cyan/20 transition-colors"
                  >
                    <h4 className="text-white font-semibold text-sm mb-1">{right.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{right.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm">
                To exercise any of these rights, email us at{" "}
                <a href="mailto:privacy@kavach.club" className="text-kavach-cyan hover:underline">
                  privacy@kavach.club
                </a>{" "}
                or use the{" "}
                <Link href="/contact" className="text-kavach-cyan hover:underline">
                  contact form
                </Link>
                . We will respond within <strong className="text-white">30 days</strong> as required by
                DPDPA 2023.
              </p>

              <SubHeading>Complaints to Regulatory Authority</SubHeading>
              <ul className="list-none space-y-2 ml-1">
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                  <strong className="text-white mr-1">India:</strong> Data Protection Board of India (once operational under DPDPA 2023)
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                  <strong className="text-white mr-1">EU residents:</strong> Your local Data Protection Authority (DPA)
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                  <strong className="text-white mr-1">UK residents:</strong> Information Commissioner&apos;s Office (ICO)
                </li>
              </ul>
            </section>

            {/* ═══════════ 10 – Security ═══════════ */}
            <section>
              <SectionHeading id="security" number="10" title="Data Security Measures" />
              <p className="mb-6">As a cybersecurity community, we take security seriously:</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "Encryption in Transit", desc: "All data transmitted over TLS 1.2+ (HTTPS enforced)" },
                  { title: "Password Hashing", desc: "Passwords stored using bcrypt / Argon2 with appropriate work factors — never in plaintext" },
                  { title: "Access Controls", desc: "Principle of least privilege applied to all internal systems" },
                  { title: "Dependency Management", desc: "Regular security audits and dependency updates" },
                  { title: "Rate Limiting", desc: "Protection against brute-force and credential stuffing attacks" },
                  { title: "Logging & Monitoring", desc: "Anomalous access patterns are flagged and reviewed" },
                ].map((measure) => (
                  <div
                    key={measure.title}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-kavach-cyan/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-kavach-cyan">{LockIcon}</span>
                      <h4 className="text-white font-semibold text-sm">{measure.title}</h4>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{measure.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Despite best efforts, no system is 100% secure. In the event of a data breach affecting
                your rights, we will notify you and the relevant authorities as required under CERT-In
                Directions (2022) and applicable data protection law within the mandated timeframes.
              </p>

              <SubHeading>Vulnerability Disclosure</SubHeading>
              <div className="rounded-xl border border-kavach-cyan/20 bg-kavach-cyan/[0.03] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-kavach-cyan">{ShieldIcon}</span>
                  <span>
                    If you discover a security vulnerability in our platform, please report it
                    responsibly to{" "}
                    <a href="mailto:security@kavach.club" className="text-kavach-cyan hover:underline font-semibold">
                      security@kavach.club
                    </a>
                    . We operate a responsible disclosure policy and will not take legal action against
                    good-faith security researchers.
                  </span>
                </p>
              </div>
            </section>

            {/* ═══════════ 11 – Indian Law ═══════════ */}
            <section>
              <SectionHeading id="indian-law" number="11" title="Indian Regulatory Compliance" />

              <SubHeading>11.1 Information Technology Act, 2000</SubHeading>
              <div className="flex flex-wrap mb-4">
                <LawBadge>Section 43A</LawBadge>
                <LawBadge>Section 72A</LawBadge>
                <LawBadge>Section 66E</LawBadge>
              </div>
              <p className="mb-4 text-sm">
                We comply with the IT Act 2000 and its amendments, including the IT (Amendment) Act
                2008. Under Section 43A, we implement reasonable security practices to protect
                sensitive personal data as defined under the SPDI Rules 2011.
              </p>
              <p className="mb-6 text-sm text-gray-400">
                Sensitive Personal Data or Information (SPDI) under Rule 3 of IT (SPDI) Rules 2011
                includes passwords, financial information, biometric data, health data, and sexual
                orientation. We do not collect most SPDI categories. Any SPDI we do collect (passwords)
                is protected under applicable rules.
              </p>

              <SubHeading>11.2 Digital Personal Data Protection Act, 2023 (DPDPA)</SubHeading>
              <div className="flex flex-wrap mb-4">
                <LawBadge>DPDPA 2023</LawBadge>
                <LawBadge>Data Fiduciary</LawBadge>
                <LawBadge>Data Principal</LawBadge>
              </div>
              <p className="mb-6 text-sm">
                We act as a Data Fiduciary under the DPDPA 2023. We process personal data of Data
                Principals (you) in accordance with the purposes, grounds, and obligations prescribed
                by the Act. We have appointed a Grievance Officer accessible to Indian users (see
                Section 15).
              </p>

              <SubHeading>11.3 CERT-In Directions, 2022</SubHeading>
              <div className="flex flex-wrap mb-4">
                <LawBadge>CERT-In 2022</LawBadge>
              </div>
              <p className="mb-6 text-sm">
                In compliance with CERT-In&apos;s 2022 Directions, we maintain system logs for a minimum of
                180 days. ICT infrastructure logs are synchronized to IST and retained for the mandated
                period. Security incidents are reported to CERT-In within prescribed timelines.
              </p>

              <SubHeading>11.4 Other Applicable Indian Laws</SubHeading>
              <ul className="list-none space-y-2 ml-1">
                {[
                  "Indian Penal Code / Bharatiya Nyaya Sanhita (BNS): We do not facilitate any activity constituting cheating, defamation, criminal intimidation, or unlawful assembly.",
                  "IT (Intermediary Guidelines & Digital Media Ethics Code) Rules, 2021: To the extent Kavach acts as an intermediary, we maintain required grievance mechanisms.",
                  "Copyright Act, 1957: User-submitted content must not infringe third-party copyrights.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-violet/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* ═══════════ 12 – International Compliance ═══════════ */}
            <section>
              <SectionHeading id="international" number="12" title="International Data Protection" />

              <SubHeading>12.1 EU/EEA — General Data Protection Regulation (GDPR)</SubHeading>
              <div className="flex flex-wrap mb-4">
                <LawBadge>GDPR 2016/679</LawBadge>
                <LawBadge>Art. 6</LawBadge>
                <LawBadge>Art. 13</LawBadge>
              </div>
              <p className="mb-6 text-sm">
                If you are located in the EU/EEA, GDPR applies to our processing of your data to the
                extent we offer services to EU residents. We rely on lawful bases as described in
                Section 4. Cross-border transfers to India (our primary location) are made under
                standard data protection commitments.
              </p>

              <SubHeading>12.2 UK — UK GDPR &amp; Data Protection Act 2018</SubHeading>
              <p className="mb-6 text-sm">
                UK residents are afforded equivalent protections under the UK GDPR. You may contact the
                ICO for complaints.
              </p>

              <SubHeading>12.3 California — CCPA/CPRA</SubHeading>
              <div className="flex flex-wrap mb-4">
                <LawBadge>CCPA</LawBadge>
                <LawBadge>CPRA</LawBadge>
              </div>
              <p className="mb-6 text-sm">
                California residents have rights under the CCPA/CPRA, including the right to know,
                delete, and opt-out of sale (we do not sell data). To exercise CCPA rights, contact us
                using the details in Section 15.
              </p>

              <SubHeading>12.4 Canada — PIPEDA</SubHeading>
              <p className="mb-6 text-sm">
                We process personal information of Canadian users in accordance with PIPEDA&apos;s fair
                information principles — accountability, identifying purposes, consent, limiting
                collection, limiting use/disclosure/retention, accuracy, safeguards, openness,
                individual access, and challenging compliance.
              </p>

              <SubHeading>12.5 Australia — Privacy Act 1988</SubHeading>
              <p className="mb-6 text-sm">
                Australian users are afforded protections consistent with the Australian Privacy
                Principles (APPs) under the Privacy Act 1988.
              </p>

              <SubHeading>12.6 Cross-Border Data Transfers</SubHeading>
              <p className="text-sm">
                Our primary infrastructure is hosted via Vercel (US). Data processed by our team is
                located in India. Where data crosses international borders, we ensure appropriate
                safeguards, including reliance on standard contractual clauses or adequacy decisions
                where applicable.
              </p>
            </section>

            {/* ═══════════ 13 – Minors ═══════════ */}
            <section>
              <SectionHeading id="minors" number="13" title="Children & Minors" />
              <p className="mb-4 text-sm">
                Our services are not directed to children under 18 years of age. We do not knowingly
                collect personal data from minors. Under the DPDPA 2023 (India), we are required to
                obtain verifiable parental consent before processing data of minors.
              </p>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-amber-400">{AlertIcon}</span>
                  <span>
                    If you believe we have inadvertently collected information from a minor without
                    appropriate consent, please contact us immediately at{" "}
                    <a href="mailto:privacy@kavach.club" className="text-kavach-cyan hover:underline">
                      privacy@kavach.club
                    </a>{" "}
                    and we will take steps to delete such information promptly.
                  </span>
                </p>
              </div>
            </section>

            {/* ═══════════ 14 – Policy Updates ═══════════ */}
            <section>
              <SectionHeading id="policy-updates" number="14" title="Changes to This Policy" />
              <p className="mb-6 text-sm">
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, legal requirements, or other factors. When we make significant
                changes, we will:
              </p>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  'Post the updated policy with a new "Last Updated" date at the top',
                  "Notify registered users via email or a prominent in-platform notice",
                  "Where required by law, obtain fresh consent before processing under new purposes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400">
                Continued use of our services after the effective date of a revised policy constitutes
                your acceptance of the changes, to the extent permitted by law.
              </p>
            </section>

            {/* ═══════════ 15 – Contact ═══════════ */}
            <section>
              <SectionHeading id="contact" number="15" title="Contact Us & Grievance Officer" />
              <p className="mb-6 text-sm">
                For any privacy-related queries, requests to exercise your rights, or complaints,
                please contact:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-kavach-cyan/20 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-kavach-cyan">{MailIcon}</span>
                    <h4 className="text-white font-semibold">General Privacy</h4>
                  </div>
                  <a href="mailto:privacy@kavach.club" className="text-kavach-cyan hover:underline text-sm font-mono">
                    privacy@kavach.club
                  </a>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-kavach-cyan/20 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-kavach-cyan">{LockIcon}</span>
                    <h4 className="text-white font-semibold">Security Issues</h4>
                  </div>
                  <a href="mailto:security@kavach.club" className="text-kavach-cyan hover:underline text-sm font-mono">
                    security@kavach.club
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-kavach-violet/20 bg-kavach-violet/[0.03] p-6 mb-6">
                <h4 className="text-white font-bold mb-2">
                  Grievance Officer (India — DPDPA/IT Act)
                </h4>
                <p className="text-sm text-gray-300 mb-1">
                  Designated Faculty Coordinator / Club President
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  Kavach Cybersecurity Club, IIIT
                </p>
                <a
                  href="mailto:grievance@kavach.club"
                  className="text-kavach-cyan hover:underline text-sm font-mono"
                >
                  grievance@kavach.club
                </a>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-kavach-cyan">{ClockIcon}</span>
                  <span>
                    <strong className="text-white">Response Time:</strong> We aim to respond to all
                    privacy requests within <strong className="text-white">30 days</strong> as mandated by DPDPA 2023.
                  </span>
                </p>
              </div>

              <p className="mt-6 text-sm text-gray-400">
                If you are not satisfied with our response, you may escalate to the Data Protection
                Board of India (once constituted) or to your local data protection authority if you are
                outside India.
              </p>
            </section>

            {/* ── Footer signature ── */}
            <div className="border-t border-white/[0.06] pt-10 mt-16">
              <div className="flex items-center gap-3 mb-4">
                <svg width="24" height="24" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                  <path
                    d="M40 8L12 22V42C12 58 24 72 40 76C56 72 68 58 68 42V22L40 8Z"
                    stroke="url(#privacy-shield)"
                    strokeWidth="3"
                    fill="rgba(0,240,255,0.05)"
                  />
                  <path d="M30 42L37 49L52 34" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="privacy-shield" x1="12" y1="8" x2="68" y2="76">
                      <stop stopColor="#00f0ff" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-lg font-bold tracking-wider text-gradient">KAVACH</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Kavach Cybersecurity Club — Defend. Learn. Hack.
              </p>
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} Kavach. All rights reserved. This policy was last reviewed on June 13, 2026.
              </p>
              <div className="flex gap-4 mt-4 text-xs">
                <Link href="/terms" className="text-gray-500 hover:text-kavach-cyan transition-colors">
                  Terms of Service
                </Link>
                <Link href="/conduct" className="text-gray-500 hover:text-kavach-cyan transition-colors">
                  Code of Conduct
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-kavach-cyan transition-colors">
                  Contact
                </Link>
                <Link href="/" className="text-gray-500 hover:text-kavach-cyan transition-colors">
                  Home
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
