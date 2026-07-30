// frontend/components/shared/EmptyState.tsx
import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Icon className="text-white/30" size={28} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-5 py-2.5 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 text-kavach-cyan text-sm font-medium hover:bg-kavach-cyan/20 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-5 py-2.5 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 text-kavach-cyan text-sm font-medium hover:bg-kavach-cyan/20 transition-colors"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
