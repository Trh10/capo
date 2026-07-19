import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { NativeAwareFooter } from "@/components/layout/NativeAwareFooter";
import { MobileNavProvider } from "@/components/mobile/MobileNavProvider";
import { MobileBackBar } from "@/components/mobile/MobileBackBar";
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
});

export const metadata: Metadata = {
  title: "CAPO Studio — Cours créatifs en ligne",
  description:
    "Apprenez illustration, artisanat, design et plus encore auprès de professionnels passionnés. Cours guidés, accès illimité.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${archivo.variable} antialiased`}>
        <MobileNavProvider>
          <Header />
          <MobileBackBar />
          <main className="min-h-screen">{children}</main>
          <NativeAwareFooter />
        </MobileNavProvider>
      </body>    </html>
  );
}
