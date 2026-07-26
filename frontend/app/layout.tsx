import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/layout/ClientWrapper";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import { DataCacheProvider } from "@/lib/cache";
import { AuthProvider } from "@/lib/auth/context";
import { getServerUser } from "@/components/auth/AuthProvider";
import SabbathGate from "@/components/sabbath/SabbathGate";
import SessionTimer from "@/components/session/SessionTimer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/ToastProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neurosnap-vision.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NeuroSnap Vision",
  description: "Monitorizare nutrițională bazată pe viziune artificială și vârstă biologică.",
  applicationName: "NeuroSnap Vision",
  appleWebApp: {
    capable: true,
    title: "NeuroSnap Vision",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NeuroSnap Vision",
    description: "Monitorizare nutrițională bazată pe viziune artificială și vârstă biologică.",
    url: siteUrl,
    siteName: "NeuroSnap Vision",
    images: [
      {
        url: "/images/leaf.png",
        width: 1200,
        height: 630,
        alt: "NeuroSnap Vision",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroSnap Vision",
    description: "Monitorizare nutrițională bazată pe viziune artificială și vârstă biologică.",
    images: ["/images/leaf.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <body className={`${plusJakarta.className}`}>
      <SessionTimer />
      <SabbathGate>
        <AuthProvider user={user}>
          <DataCacheProvider>
            <main className="mx-auto w-full max-w-[430px] pb-20 min-h-screen bg-gradient-to-br from-[#F7FBF9] via-[#EAF7F1] to-[#DFF3EA]">
              <ToastProvider>
                <ClientWrapper>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </ClientWrapper>
              </ToastProvider>
            </main>
            <ConditionalNavbar />
          </DataCacheProvider>
        </AuthProvider>
      </SabbathGate>
    </body>
    </html>
  );
}