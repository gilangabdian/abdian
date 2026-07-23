"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { initConsoleFeatures } from "@/utils/consoleManager";

export default function Provider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    initConsoleFeatures();
  }, []);

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  );
}
