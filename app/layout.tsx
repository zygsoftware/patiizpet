import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans"
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: {
    default: "Patiizpet | İzmir Pet Kuaförü",
    template: "%s"
  },
  description: site.description,
  metadataBase: new URL(site.url),
  applicationName: "Patiizpet",
  keywords: [
    "İzmir pet kuaförü",
    "İzmir köpek kuaförü",
    "İzmir kedi kuaförü",
    "pet bakım İzmir",
    "köpek tıraşı İzmir",
    "online pet kuaför randevu"
  ],
  authors: [{ name: "Patiizpet" }],
  creator: "Patiizpet",
  publisher: "Patiizpet",
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
