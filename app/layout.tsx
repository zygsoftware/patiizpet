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
  },
  alternates: {
    canonical: site.url
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.name,
    url: site.url,
    title: "Patiizpet | İzmir Pet Kuaförü",
    description: site.description,
    images: [
      {
        url: "/slider-1.png",
        width: 1200,
        height: 630,
        alt: "Patiizpet İzmir pet kuaförü salon görseli"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Patiizpet | İzmir Pet Kuaförü",
    description: site.description,
    images: ["/slider-1.png"]
  },
  category: "pet grooming"
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
