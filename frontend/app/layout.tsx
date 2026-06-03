import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Kavach — Cybersecurity Club | Defend. Learn. Hack.",
  description:
    "Kavach is a premier college cybersecurity club. Join CTF competitions, attend workshops, and level up your security skills with our community of ethical hackers.",
  keywords: ["cybersecurity", "CTF", "ethical hacking", "college club", "Kavach", "security"],
  authors: [{ name: "Kavach Cybersecurity Club" }],
  openGraph: {
    title: "Kavach — Cybersecurity Club",
    description: "Defend. Learn. Hack. Join the premier college cybersecurity community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* Ambient background effects */}
        <div className="grid-bg" />
        <div className="scan-line" />

        {/* Main content */}
        <AuthProvider>
          <div className="relative z-10">{children}</div>
        </AuthProvider>
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
