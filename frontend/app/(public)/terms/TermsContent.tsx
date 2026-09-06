"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ──────────────────────────── Table of Contents ──────────────────────────── */
const tocSections = [
  { id: "acceptance", number: "01", label: "Acceptance of Terms" },
  { id: "user-conduct", number: "02", label: "User Conduct & Ethics" },
  { id: "ctf-rules", number: "03", label: "CTF Platform Rules" },
  { id: "intellectual-property", number: "04", label: "Intellectual Property" },
  { id: "disclaimer", number: "05", label: "Disclaimer of Warranties" },
  { id: "limitation", number: "06", label: "Limitation of Liability" },
  { id: "modifications", number: "07", label: "Modifications to Terms" },
  { id: "governing-law", number: "08", label: "Governing Law" },
  { id: "contact", number: "09", label: "Contact Us" },
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

const AlertIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

export default function TermsContent() {
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
            Terms and Conditions
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-8">
            These Terms and Conditions govern your use of the Kavach Cybersecurity Club platform, including our CTF challenges, events, and community resources.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Effective: June 17, 2026
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
            </nav>
          </aside>

          {/* ── Main content ── */}
          <article className="max-w-3xl py-8 lg:py-0 space-y-16 text-gray-300 leading-relaxed">
            {/* ═══════════ 01 ═══════════ */}
            <section>
              <SectionHeading id="acceptance" number="01" title="Acceptance of Terms" />
              <p className="mb-6">
                By accessing or using the Kavach Cybersecurity Club website, CTF platform, or participating in our events, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access our services.
              </p>
            </section>

            {/* ═══════════ 02 ═══════════ */}
            <section>
              <SectionHeading id="user-conduct" number="02" title="User Conduct & Ethics" />
              <p className="mb-6">
                You agree to use our platform for legal, ethical, and educational purposes only. You must not:
              </p>
              <ul className="list-none space-y-2 ml-1 mb-6">
                {[
                  "Engage in any activity that violates any local, national, or international law.",
                  "Attempt to gain unauthorized access to our systems or third-party systems.",
                  "Harass, abuse, or harm other users or staff members.",
                  "Share solutions or flags for active CTF challenges (unless explicitly allowed).",
                  "Use automated tools (bots, scrapers) against our platform without permission.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-kavach-cyan/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* ═══════════ 03 ═══════════ */}
            <section>
              <SectionHeading id="ctf-rules" number="03" title="CTF Platform Rules" />
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 text-sm mb-6">
                <p className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-amber-400">{AlertIcon}</span>
                  <span>
                    <strong className="text-white">Important:</strong> All CTF challenges are designed for ethical security research. Do not attack infrastructure outside the designated challenge scope.
                  </span>
                </p>
              </div>
              <p className="mb-6">
                Participants must abide by the specific rules for each CTF event. Denial of Service (DoS) attacks on our infrastructure are strictly prohibited unless stated otherwise for a specific challenge.
              </p>
            </section>

            {/* ═══════════ 04 ═══════════ */}
            <section>
              <SectionHeading id="intellectual-property" number="04" title="Intellectual Property" />
              <p className="mb-6">
                The content, challenges, design, and software on the Kavach platform are owned by Kavach Cybersecurity Club or its licensors. You may not reproduce, distribute, or create derivative works without our explicit permission.
              </p>
            </section>

            {/* ═══════════ 05 ═══════════ */}
            <section>
              <SectionHeading id="disclaimer" number="05" title="Disclaimer of Warranties" />
              <p className="mb-6">
                The platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Kavach makes no warranties, express or implied, regarding the reliability, accuracy, or availability of the services.
              </p>
            </section>

            {/* ═══════════ 06 ═══════════ */}
            <section>
              <SectionHeading id="limitation" number="06" title="Limitation of Liability" />
              <p className="mb-6">
                In no event shall Kavach Cybersecurity Club be liable for any indirect, incidental, special, or consequential damages arising out of your use or inability to use the platform.
              </p>
            </section>

            {/* ═══════════ 07 ═══════════ */}
            <section>
              <SectionHeading id="modifications" number="07" title="Modifications to Terms" />
              <p className="mb-6">
                We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the platform after any changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            {/* ═══════════ 08 ═══════════ */}
            <section>
              <SectionHeading id="governing-law" number="08" title="Governing Law" />
              <p className="mb-6">
                These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* ═══════════ 09 ═══════════ */}
            <section>
              <SectionHeading id="contact" number="09" title="Contact Us" />
              <p className="mb-6">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-sm">
                  Email: <a href="mailto:contact@kavach.club" className="text-kavach-cyan hover:underline">contact@kavach.club</a>
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
