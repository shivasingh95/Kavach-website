import { Metadata } from 'next';
import JoinForm from './JoinForm';
import { Terminal, Shield, Code, Target, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Join Us — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Apply to join the K.A.V.A.C.H. Cybersecurity Club and start your journey in ethical hacking.',
};

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      {/* ─── Page Header ─── */}
      <div className="page-header-gradient pt-36 pb-20 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="ambient-cyan w-[500px] h-[300px] top-0 left-1/2 -translate-x-1/2 opacity-40" />
        <div className="ambient-violet w-[300px] h-[200px] bottom-0 right-10 opacity-30" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="cyber-badge mx-auto mb-6 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse" />
            Now Accepting Applications
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight">
            Join the <span className="text-gradient">Ranks</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We are looking for passionate individuals who want to learn, build, and defend. Whether you are a complete beginner or a seasoned pro, there is a place for you here.
          </p>
        </div>
      </div>

      <div className="section-divider-cyan" />

      {/* ─── Content ─── */}
      <section className="section-dark py-20 relative overflow-hidden">
        <div className="ambient-violet w-[400px] h-[400px] top-0 right-0 opacity-25" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left Column: Why Join */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-white mb-8">What you will get</h2>
                <div className="space-y-5">
                  <Feature
                    icon={Shield}
                    title="Hands-on Experience"
                    desc="Participate in our internal CTFs, workshops, and real-world security audits."
                  />
                  <Feature
                    icon={Code}
                    title="Skill Development"
                    desc="Learn web exploitation, reverse engineering, cryptography, and more from seniors and alumni."
                  />
                  <Feature
                    icon={Target}
                    title="Career Opportunities"
                    desc="Network with industry professionals, get referral opportunities, and build your resume."
                  />
                  <Feature
                    icon={Terminal}
                    title="Exclusive Resources"
                    desc="Get access to our private infrastructure, premium learning platforms, and library."
                  />
                </div>
              </div>

              {/* Recruitment Process */}
              <div className="gradient-border-card p-6" style={{ borderColor: 'rgba(0,240,255,0.2)', background: 'linear-gradient(135deg, rgba(0,240,255,0.04) 0%, rgba(13,18,36,0.9) 100%)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Users size={18} className="text-kavach-cyan" />
                  <h3 className="text-base font-bold text-kavach-cyan">Recruitment Process</h3>
                </div>
                <ol className="space-y-3">
                  {[
                    'Submit your application below.',
                    'Solve our initial qualification CTF challenge.',
                    'Attend a brief interview with the core team.',
                    'Welcome to K.A.V.A.C.H.!'
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-kavach-cyan/15 border border-kavach-cyan/30 flex items-center justify-center text-kavach-cyan font-bold text-xs">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right Column: Application Form */}
            <div className="gradient-border-card p-8 relative overflow-hidden">
              {/* Decorative glows */}
              <div className="ambient-cyan w-64 h-64 -top-16 -right-16 opacity-25" />
              <div className="ambient-violet w-48 h-48 -bottom-16 -left-8 opacity-20" />

              <div className="relative z-10">
                <h2 className="text-2xl font-black text-white mb-1">Membership Application</h2>
                <p className="text-slate-400 mb-8 text-sm">Fill out this form and tell us why you want to join.</p>
                <JoinForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="gradient-border-card p-5 flex gap-4">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center text-kavach-cyan">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-base font-bold text-white mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
