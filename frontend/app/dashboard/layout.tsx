"use client";

import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Flag, Calendar, User, Newspaper, BookOpen, Trophy, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth resolved and no user — redirect to login immediately
  if (!isAuthenticated) {
    router.replace("/login");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "CTF Challenges", href: "/dashboard/ctf", icon: Flag },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "100 Days of Hacking", href: "/dashboard/100-days", icon: BookOpen },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  if (isAdmin) {
    // Add Admin Panel link at the bottom of the list or near the top
    navItems.push({ name: "Admin Panel", href: "/dashboard/admin", icon: LayoutDashboard });
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col md:flex-row relative z-10">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0f1c]/80 backdrop-blur-md border-r border-white/5 h-[calc(100vh-5rem)] sticky top-20">
        <div className="p-6">
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-6">
            Dashboard Menu
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-kavach-cyan/10 text-kavach-cyan font-medium border border-kavach-cyan/20"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Logout Button */}
        <div className="mt-auto p-6 border-t border-white/5">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto min-h-[calc(100vh-5rem)] pb-24 md:pb-12">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0f1c]/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around p-3 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? "text-kavach-cyan" : "text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={20} className={isActive ? "mb-1" : "mb-1 opacity-70"} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center p-2 rounded-lg transition-colors text-red-400"
        >
          <LogOut size={20} className="mb-1 opacity-80" />
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
