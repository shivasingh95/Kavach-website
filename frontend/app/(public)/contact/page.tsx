import { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Get in touch with the K.A.V.A.C.H. team for inquiries, partnerships, or support.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Column: Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-400 mb-12">
              Have a question about our events? Want to partner with us for a workshop? Or just want to say hi? Drop us a message below.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                <p className="text-kavach-cyan hover:text-cyan-400 transition-colors">
                  <a href="mailto:hello@kavach.club">hello@kavach.club</a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Location</h3>
                <p className="text-gray-400">
                  Indian Institute of Information Technology<br />
                  Cybersecurity Lab, Academic Block A
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Socials</h3>
                <div className="flex gap-4">
                  {['Twitter', 'LinkedIn', 'Discord', 'GitHub'].map(social => (
                    <a key={social} href="#" className="text-gray-400 hover:text-kavach-cyan transition-colors">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
            <ContactForm />
          </div>

        </div>
      </div>
    </main>
  );
}
