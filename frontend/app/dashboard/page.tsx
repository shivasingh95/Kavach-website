"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { LogOut, User, Shield, Zap, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  totalPoints: number;
  createdAt: string;
}

import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-kavach-cyan/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span>!
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 flex items-center gap-2">
              <Shield size={16} className="text-kavach-cyan" />
              Kavach {user.role === "ADMIN" ? "Administrator" : "Member"}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogOut size={18} />
                <span className="font-medium text-sm">Sign Out</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 bg-[#0a0f1c]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-kavach-cyan/20 transition-colors duration-500"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-kavach-cyan/0 via-kavach-cyan/5 to-kavach-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
            
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <User size={20} className="text-kavach-cyan" />
              Operative Profile
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Full Name</p>
                  <p className="font-medium text-lg text-white/90">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Email Address</p>
                  <p className="font-medium text-lg text-white/90">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Account Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${user.isVerified ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`} />
                    <p className="font-medium text-white/90">{user.isVerified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar size={14} /> Joined
                  </p>
                  <p className="font-medium text-white/90">{joinDate}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center items-center text-center group hover:border-[#7c3aed]/20 transition-colors duration-500"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed]/0 via-[#7c3aed]/5 to-[#7c3aed]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kavach-cyan/20 to-[#7c3aed]/20 flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <Zap size={28} className="text-kavach-cyan" />
            </div>
            
            <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">
              {user.totalPoints.toLocaleString()}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] font-medium uppercase tracking-widest">
              Total Points
            </p>
          </motion.div>
        </div>
    </div>
  );
}
