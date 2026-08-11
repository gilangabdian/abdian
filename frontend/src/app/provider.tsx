"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { initConsoleFeatures } from "@/utils/consoleManager";
import NextTopLoader from "nextjs-toploader";
import NProgress from "nprogress";

function InitialProgress() {
  React.useEffect(() => {
    // Start progress bar on initial load (hard refresh)
    NProgress.start();
    // Quickly finish it since SSR is already loaded
    const t = setTimeout(() => {
      NProgress.done();
    }, 400);
    return () => {
      clearTimeout(t);
      NProgress.done();
    };
  }, []);
  return null;
}

export default function Provider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    initConsoleFeatures();
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange {...props}>
      <React.Suspense fallback={null}>
        <NextTopLoader
          color="#9ca3af"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #9ca3af,0 0 5px #9ca3af"
          zIndex={10000}
          showAtBottom={false}
        />
      </React.Suspense>
      <InitialProgress />
      {children}
    </NextThemesProvider>
  );
}
