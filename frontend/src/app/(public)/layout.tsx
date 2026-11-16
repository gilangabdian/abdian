import React from "react";
import "iconify-icon";
import Navbar from "@/components/layouts/public/Navbar";
import Footer from "@/components/layouts/public/Footer";
import ScrollToTop from "@/components/global/ScrollToTop";
import ProgressBarProvider from "@/components/global/ProgressBarProvider";

import { getProfile } from "@/lib/api/profile";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile().catch(() => null);

  return (
    <>
      <React.Suspense fallback={null}>
        <Navbar profile={profile} />
      </React.Suspense>
      <div className="public-theme flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white w-full pt-14 lg:pt-0">
        <main className="flex-grow flex flex-col relative ">{children}</main>
        <div className="relative z-10 overflow-hidden">
          <Footer />
        </div>
        <ScrollToTop />
        <ProgressBarProvider />
      </div>
    </>
  );
}
