"use client";

import Link from "next/link";
import { useEffect } from "react";
import NProgress from "nprogress";

export default function NotFound() {
  // const { setTheme } = useTheme();

  useEffect(() => {
    NProgress.done();
  }, []);

  return (
    <div className="public-theme min-h-screen flex flex-col items-center justify-center transition-colors duration-300 px-6 text-center font-sans">
      {/* 404 Kecil */}
      <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2 tracking-widest">404</h1>
      {/* Deskripsi */}
      <p className="text-gray-700 text-sm md:text-base mb-10 lowercase tracking-tight">
        sorry, the page is not available
      </p>
      {/* Link Balik Home (Sangat Minimalis) */}
      <Link
        href="/"
        className="text-[10px] uppercase tracking-[0.2em] text-black dark:text-white opacity-50 hover:opacity-100 hover:underline decoration-1 underline-offset-8 transition-all duration-300">
        Back to Home
      </Link>
    </div>
  );
}
