"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { User as UserIcon, Github, Linkedin, Settings, Save, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  // Local state for form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "", // Bio is not in User type right now, but we can send it to the backend and it will store it
    github: "",
    linkedin: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // If user is missing from context (hydrating), just return a loader
  if (!user) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.patch("/users/profile", formData);
      // Update local context
      updateUser({ ...user, name: formData.name });
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-12 relative z-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Settings className="text-kavach-cyan" size={32} />
          Profile <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your account details and public presence.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
      >
        {message && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Read Only Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/10">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white/50 cursor-not-allowed">
                {user.email}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">
                Account Role
              </label>
              <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white/50 cursor-not-allowed">
                {user.role}
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2 flex items-center gap-2">
              <UserIcon size={14} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us a bit about your hacking journey..."
              className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2 flex items-center gap-2">
                <Github size={14} /> GitHub URL
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2 flex items-center gap-2">
                <Linkedin size={14} /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
