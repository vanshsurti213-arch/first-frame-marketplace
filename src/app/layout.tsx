import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    default: "Firstframe — Creator Campaign Management",
    template: "%s | Firstframe",
  },
  description:
    "Firstframe is the operational layer between brands and student content creators in India. Manage campaigns, track submissions, and coordinate with creators — all in one place.",
  keywords: ["UGC", "creator management", "brand campaigns", "content creation", "India"],
  openGraph: {
    title: "Firstframe",
    description: "Creator Campaign Management Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load fonts via CDN — non-blocking, avoids server-side fetch timeouts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <NextTopLoader color="#CAFF4C" height={3} showSpinner={false} />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#141418",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              color: "#F2F2F3",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
