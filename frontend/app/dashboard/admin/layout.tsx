"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, Flag, FileText, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/events", label: "Events", icon: Calendar },
  { href: "/dashboard/admin/ctf", label: "CTF", icon: Flag },
  { href: "/dashboard/admin/blog", label: "Blog", icon: FileText },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/join-requests", label: "Join Requests", icon: UserPlus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Simple breadcrumb logic based on pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[pathSegments.length - 1];
  const sectionTitle = currentSection === 'admin' ? 'Overview' 
    : currentSection.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  return (
    <div className="flex flex-col space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-kavach-cyan to-kavach-violet bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <div className="text-sm text-muted-foreground mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>Admin</span>
          <span>/</span>
          <span className="text-foreground font-medium">{sectionTitle}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Admin Sidebar Navigation */}
        <aside className="w-full lg:w-[200px] flex-shrink-0">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-4 lg:pb-0">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-kavach-cyan/10 text-kavach-cyan"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
