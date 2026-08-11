import type { Metadata } from "next";
import "@/app/globals.css";
import "highlight.js/styles/night-owl.css";
import Provider from "./provider";
import Script from "next/script";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gilang Abdian",
  description: "hello world from Gilang Abdian",
  keywords:
    "Gilang Abdian, Gilang, Abdian, gilangabdian, gilang, abdian, personal website, Personal Website, gilang abdian, software engineer, Portfolio",
  authors: [{ name: "Gilang Abdian" }],
  openGraph: {
    type: "website",
    url: "https://abdian.vercel.app/",
    title: "Gilang Abdian",
    description: "hello world from Gilang Abdian",
    images: ["https://abdian.vercel.app/abdian.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gilang Abdian - Personal Website",
    description: "hello world from Gilang Abdian",
    images: ["https://abdian.vercel.app/abdian.png"],
  },
  verification: {
    google: "Fb9M_rgQZxEhbLF4WbLPj6OBCioj5nQ0aYpKsJELsDc",
  },
  icons: {
    icon: [{ url: "/abdian.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gilang Abdian",
    alternateName: ["Gilang", "Abdian", "gilangabdian", "abdian", "gilang"],
    url: "https://abdian.vercel.app/",
    image: "https://abdian.vercel.app/abdian.png",
    jobTitle: "Software Engineer",
    sameAs: ["https://github.com/gilangabdian"],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} antialiased h-full`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* <Script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js" strategy="beforeInteractive" /> */}
        <Script src="https://cdn.jsdelivr.net/npm/iconify-icon@3.0.0/dist/iconify-icon.min.js"></Script>
      </head>

      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
