"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquare, Mail, User, Clock, CheckCircle2, Trash2, XCircle, ShieldCheck } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/contact");
      setMessages(res.data?.data ?? []);
    } catch (err: any) {
      toast.error("Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchMessages();
    }
  }, [isAdmin, fetchMessages]);

  const handleUpdateStatus = async (id: string, newStatus: "READ" | "RESOLVED") => {
    setProcessingId(id);
    try {
      await api.patch(`/contact/${id}`, { status: newStatus });
      toast.success(`Message marked as ${newStatus.toLowerCase()}`);
      setMessages((prev) => 
        prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message permanently?")) return;
    
    setProcessingId(id);
    try {
      await api.delete(`/contact/${id}`);
      toast.success("Message deleted successfully");
      setMessages((prev) => prev.filter(msg => msg.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setProcessingId(null);
    }
  };

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "text-kavach-cyan bg-kavach-cyan/10 border-kavach-cyan/20";
      case "READ": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "RESOLVED": return "text-kavach-green bg-kavach-green/10 border-kavach-green/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">
            Contact Messages
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage inquiries, partnerships, and support requests.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-kavach-cyan bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-full px-3 py-1.5">
          <MessageSquare size={13} />
          <span className="font-medium">{messages.length} Total</span>
        </div>
      </div>

      {/* ── Messages List ── */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1224]/80 backdrop-blur-sm border border-white/5 rounded-2xl">
            <Mail size={48} className="mx-auto text-white/10 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Inbox Empty</h3>
            <p className="text-[var(--text-secondary)]">You have no messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`relative overflow-hidden rounded-2xl border bg-[#0d1224]/80 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5
                ${msg.status === "NEW" ? "border-kavach-cyan/30 shadow-[0_4px_24px_rgba(0,240,255,0.05)]" : "border-white/5"}`}
            >
              {msg.status === "NEW" && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-kavach-cyan/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              )}
              
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                {/* User Info Column */}
                <div className="md:w-1/4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {msg.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[150px]">{msg.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-kavach-cyan" /> {msg.email}
                    </p>
                    <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                  </div>
                </div>

                {/* Message Content Column */}
                <div className="md:w-2/4 border-l-0 md:border-l border-white/5 md:pl-6">
                  <h4 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5">
                    {msg.subject}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                {/* Actions Column */}
                <div className="md:w-1/4 flex flex-row md:flex-col items-center md:items-end justify-center md:justify-start gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  {msg.status === "NEW" && (
                    <button 
                      disabled={processingId === msg.id}
                      onClick={() => handleUpdateStatus(msg.id, "READ")}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/5 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.status !== "RESOLVED" && (
                    <button 
                      disabled={processingId === msg.id}
                      onClick={() => handleUpdateStatus(msg.id, "RESOLVED")}
                      className="w-full py-2 px-3 rounded-xl bg-kavach-green/10 hover:bg-kavach-green/20 text-xs font-bold text-kavach-green border border-kavach-green/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  )}
                  <button 
                    disabled={processingId === msg.id}
                    onClick={() => handleDelete(msg.id)}
                    className="w-full py-2 px-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 border border-transparent hover:border-red-500/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-auto md:mt-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
