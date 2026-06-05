import { ShieldAlert, Fingerprint, Lock, Globe, TerminalSquare, Search, HelpCircle } from "lucide-react";

export default function CategoryIcon({ category, size = 20 }: { category: string, size?: number }) {
  switch (category.toUpperCase()) {
    case 'WEB':
      return <Globe size={size} />;
    case 'CRYPTO':
      return <Lock size={size} />;
    case 'FORENSICS':
      return <Search size={size} />;
    case 'PWNING':
      return <TerminalSquare size={size} />;
    case 'REVERSING':
      return <Fingerprint size={size} />;
    case 'OSINT':
      return <ShieldAlert size={size} />;
    case 'MISC':
    default:
      return <HelpCircle size={size} />;
  }
}
