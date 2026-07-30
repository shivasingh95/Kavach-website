import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy — K.A.V.A.C.H. Cybersecurity Club',
  description:
    'Learn how K.A.V.A.C.H. Cybersecurity Club collects, uses, and protects your personal data. Compliant with DPDPA 2023, GDPR, CCPA, and the IT Act 2000.',
  openGraph: {
    title: 'Privacy Policy — K.A.V.A.C.H.',
    description:
      'K.A.V.A.C.H. Privacy Policy — Data protection practices, your rights, and our commitments.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
