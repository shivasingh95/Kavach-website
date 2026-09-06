import { Metadata } from 'next';
import ContactForm from './ContactForm';
import { Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Get in touch with the K.A.V.A.C.H. team for inquiries, partnerships, or support.',
};

// SVG icons for socials (no extra package needed)
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.028.019.054.04.07a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const SOCIALS = [
  { label: 'Twitter / X', href: '#', Icon: TwitterIcon },
  { label: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { label: 'Discord', href: '#', Icon: DiscordIcon },
  { label: 'GitHub', href: '#', Icon: GitHubIcon },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* ─── Page Header ─── */}
      <div className="page-header-gradient pt-36 pb-20 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="ambient-cyan w-[500px] h-[300px] top-0 left-1/2 -translate-x-1/2 opacity-40" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="cyber-badge mx-auto mb-6 w-fit">
            <Mail size={12} />
            Reach Out
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-slate-400">
            Have questions about our events, partnerships, or just want to say hi? We would love to hear from you.
          </p>
        </div>
      </div>

      <div className="section-divider-cyan" />

      {/* ─── Contact Content ─── */}
      <section className="section-dark py-20 relative overflow-hidden">
        <div className="ambient-violet w-[350px] h-[350px] top-0 right-0 opacity-30" />
        <div className="ambient-cyan w-[250px] h-[250px] bottom-0 left-0 opacity-20" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

            {/* Left Column: Info */}
            <div className="space-y-10">
              {/* Email */}
              <div className="gradient-border-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center text-kavach-cyan">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Email Us</h3>
                    <a href="mailto:hello@kavach.club" className="text-kavach-cyan hover:text-cyan-300 transition-colors text-sm font-medium">
                      hello@kavach.club
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="gradient-border-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center text-kavach-cyan">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Location</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Indian Institute of Information Technology<br />
                      Cybersecurity Lab, Academic Block A
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-base font-bold text-white mb-4">Find us on</h3>
                <div className="flex gap-3">
                  {SOCIALS.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      title={label}
                      className="social-icon-btn"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time note */}
              <div className="cyber-badge w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-kavach-green animate-pulse" />
                Typically replies within 24 hours
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="gradient-border-card p-8 relative overflow-hidden">
              <div className="ambient-cyan w-64 h-64 -top-16 -right-16 opacity-20" />
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-white mb-2">Send a Message</h2>
                <p className="text-slate-400 text-sm mb-8">Drop us a line and we will get back to you shortly.</p>
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
