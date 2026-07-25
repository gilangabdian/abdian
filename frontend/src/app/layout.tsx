import type { Metadata } from "next";
import "@/app/globals.css";
import "highlight.js/styles/night-owl.css";
import Provider from "./provider";

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
    alternateName: ["Gilang", "Abdian", "gilangabdian"],
    url: "https://abdian.vercel.app/",
    image: "https://abdian.vercel.app/abdian.png",
    jobTitle: "Software Engineer",
    sameAs: ["https://github.com/gilangabdian"],
  };

  return (
    <html lang="en" suppressHydrationWarning className="antialiased h-full">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
