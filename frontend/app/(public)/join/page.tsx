import { Metadata } from 'next';
import JoinForm from './JoinForm';
import { Terminal, Shield, Code, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Join Us — Kavach Cybersecurity Club',
  description: 'Apply to join the Kavach Cybersecurity Club and start your journey in ethical hacking.',
};

export default function JoinPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Ranks
          </h1>
          <p className="text-lg text-gray-400">
            We are looking for passionate individuals who want to learn, build, and defend. Whether you are a complete beginner or a seasoned pro, there is a place for you here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Why Join */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">What you will get</h2>
              
              <div className="space-y-8">
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

            <div className="bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-kavach-cyan mb-2">Recruitment Process</h3>
              <ul className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                <li>Submit your application below.</li>
                <li>Solve our initial qualification CTF challenge.</li>
                <li>Attend a brief interview with the core team.</li>
                <li>Welcome to Kavach!</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kavach-cyan/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Membership Application</h2>
            <p className="text-gray-400 mb-8 relative z-10 text-sm">Fill out this form and tell us why you want to join.</p>
            
            <div className="relative z-10">
              <JoinForm />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-kavach-cyan">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
