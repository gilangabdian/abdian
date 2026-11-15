import type { Metadata } from "next";
import "@/app/globals.css";
import "highlight.js/styles/night-owl.css";
import Provider from "./provider";
import Script from "next/script";
import { Inter } from "next/font/google";
import { SITE_URL, siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
export const metadata: Metadata = {
  title: {
    template: "%s | Gilang Abdian",
    default: "Gilang Abdian",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  },
  description: siteConfig.description,
  metadataBase: new URL(SITE_URL),
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  openGraph: {
    type: "website",
    url: `${SITE_URL}/`,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  verification: siteConfig.verification,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    alternateName: ["Gilang", "Abdian", "gilangabdian", "abdian", "gilang"],
    url: `${SITE_URL}/`,
    image: siteConfig.ogImage,
    jobTitle: "Software Engineer",
    sameAs: [siteConfig.links.github],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} antialiased h-full`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>

      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
      {/* <Script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js" strategy="beforeInteractive" /> */}
      <Script src="https://cdn.jsdelivr.net/npm/iconify-icon@3.0.0/dist/iconify-icon.min.js"></Script>
    </html>
  );
}
