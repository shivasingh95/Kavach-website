import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms and Conditions — Kavach Cybersecurity Club',
  description:
    'Read the terms and conditions for using Kavach Cybersecurity Club platform, CTF, and services.',
  openGraph: {
    title: 'Terms and Conditions — Kavach',
    description:
      'Kavach Terms and Conditions — Rules and guidelines for platform usage.',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
