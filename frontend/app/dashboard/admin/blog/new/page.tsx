"use client";
// Redirects /dashboard/admin/blog/new → editor with isNew=true
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewBlogPage() {
  // We re-use the editor page at a fake id="new"
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/admin/blog/new/edit"); }, [router]);
  return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={24} /></div>;
}
