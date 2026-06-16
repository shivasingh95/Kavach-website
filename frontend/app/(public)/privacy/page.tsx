import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy — Kavach Cybersecurity Club',
  description:
    'Learn how Kavach Cybersecurity Club collects, uses, and protects your personal data. Compliant with DPDPA 2023, GDPR, CCPA, and the IT Act 2000.',
  openGraph: {
    title: 'Privacy Policy — Kavach',
    description:
      'Kavach Privacy Policy — Data protection practices, your rights, and our commitments.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
