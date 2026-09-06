import { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms and Conditions — K.A.V.A.C.H. Cybersecurity Club',
  description:
    'Read the terms and conditions for using K.A.V.A.C.H. Cybersecurity Club platform, CTF, and services.',
  openGraph: {
    title: 'Terms and Conditions — K.A.V.A.C.H.',
    description:
      'K.A.V.A.C.H. Terms and Conditions — Rules and guidelines for platform usage.',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
