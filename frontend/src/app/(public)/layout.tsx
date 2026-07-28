import React from "react";
import "iconify-icon";
import Navbar from "@/components/layouts/public/Navbar";
import Footer from "@/components/layouts/public/Footer";
import ScrollToTop from "@/components/global/ScrollToTop";
import ProgressBarProvider from "@/components/global/ProgressBarProvider";
import GenerativeArtEffect from "@/components/global/GenerativeArtEffect";
import Script from "next/script";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <React.Suspense fallback={null}>
        <Navbar />
      </React.Suspense>
      <div className="public-theme flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white w-full pt-14 lg:pt-0">
        <Script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js" strategy="beforeInteractive" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />

        <GenerativeArtEffect />
        <main className="flex-grow relative ">{children}</main>
        <div className="relative z-10">
          <Footer />
        </div>
        <ScrollToTop />
        <ProgressBarProvider />
      </div>
    </>
  );
}
