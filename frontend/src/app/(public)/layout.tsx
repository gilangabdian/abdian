import React from "react";
import "iconify-icon";
import Navbar from "@/components/layouts/public/Navbar";
import Footer from "@/components/layouts/public/Footer";
import ScrollToTop from "@/components/global/ScrollToTop";
import ProgressBarProvider from "@/components/global/ProgressBarProvider";
import GenerativeArtEffect from "@/components/global/GenerativeArtEffect";

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
