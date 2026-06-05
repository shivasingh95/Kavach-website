"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

export default function RSVPButton({ eventId, isPast }: { eventId: string; isPast: boolean }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRSVPd, setIsRSVPd] = useState(false);

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events`); // Could redirect to event, but simple for now
      return;
    }

    setIsLoading(true);
    try {
      if (isRSVPd) {
        await api.delete(`/events/${eventId}/rsvp`);
        setIsRSVPd(false);
        toast.success("RSVP Cancelled");
      } else {
        await api.post(`/events/${eventId}/rsvp`);
        setIsRSVPd(true);
        toast.success("RSVP Successful!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPast) {
    return (
      <button 
        disabled
        className="w-full py-4 bg-white/5 text-gray-500 font-bold rounded-xl cursor-not-allowed border border-white/5"
      >
        Event has ended
      </button>
    );
  }

  return (
    <button
      onClick={handleRSVP}
      disabled={isLoading}
      className={`w-full py-4 font-bold rounded-xl transition-all ${
        isRSVPd 
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
          : "bg-kavach-cyan text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
      }`}
    >
      {!isAuthenticated 
        ? "Login to RSVP" 
        : isLoading 
          ? "Processing..." 
          : isRSVPd 
            ? "Cancel RSVP" 
            : "RSVP Now"}
    </button>
  );
}

export function RSVPShareButtons({ title }: { title: string }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this event: ${title}`);
    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
  };

  return (
    <>
      <button 
        onClick={handleCopyLink}
        className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
        title="Copy Link"
      >
        <Copy size={18} />
      </button>
      <button 
        onClick={handleWhatsApp}
        className="p-3 bg-white/5 rounded-xl text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors border border-white/5"
        title="Share on WhatsApp"
      >
        <Share2 size={18} />
      </button>
    </>
  );
}
