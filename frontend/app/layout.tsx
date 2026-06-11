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
    default: "Kavach — Cybersecurity Club | Defend. Learn. Hack.",
    template: "%s | Kavach",
  },
  description:
    "Kavach is a premier college cybersecurity club. Join CTF competitions, attend workshops, and level up your security skills with our community of ethical hackers.",
  keywords: ["cybersecurity", "CTF", "ethical hacking", "college club", "Kavach", "security", "IIIT", "penetration testing"],
  authors: [{ name: "Kavach Cybersecurity Club" }],
  creator: "Kavach Cybersecurity Club",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Kavach — Cybersecurity Club",
    description: "Defend. Learn. Hack. Join the premier college cybersecurity community.",
    type: "website",
    siteName: "Kavach",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavach — Cybersecurity Club",
    description: "Defend. Learn. Hack. Join the premier college cybersecurity community.",
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
