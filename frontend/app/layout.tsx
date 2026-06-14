import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
    { media: "(prefers-color-scheme: light)", color: "#050816" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "K.A.V.A.C.H. — Cybersecurity Club | Defend. Learn. Hack.",
     template: "%s | K.A.V.A.C.H.",
  },
 description:
  "Knights of Advanced Vigilance, Attack Prevention, Cybersecurity, and Hardening. LEARN · INNOVATE · SECURE THE FUTURE.",
keywords: [
  "K.A.V.A.C.H.",
  "cybersecurity",
  "ethical hacking",
  "CTF",
  "attack prevention",
  "digital security",
  "penetration testing"
],
  authors: [{ name: "K.A.V.A.C.H. Cybersecurity Club" }],
  creator: "K.A.V.A.C.H. Cybersecurity Club",
  robots: { index: true, follow: true },
  openGraph: {
    title: "K.A.V.A.C.H. — Cybersecurity Club",
description:
  "Knights of Advanced Vigilance, Attack Prevention, Cybersecurity, and Hardening.",
    type: "website",
  siteName: "K.A.V.A.C.H.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "K.A.V.A.C.H. — Cybersecurity Club",
 description:
  "LEARN · INNOVATE · SECURE THE FUTURE",
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
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* Ambient background effects */}
        <div className="grid-bg" aria-hidden="true" />
        <div className="scan-line" aria-hidden="true" />

        {/* Main content */}
        <AuthProvider>
          <div className="relative z-10">{children}</div>
        </AuthProvider>
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
