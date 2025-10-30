// src/app/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      // --- UPDATED CONFIG ---
      attribute="class"
      storageKey="ui-theme-v2" // new key to avoid old stored value
      defaultTheme="light" // Default jadi terang bukan sistem
      enableSystem={false} // Matikan sistem detection
      disableTransitionOnChange
      // Hanya tema yang kita mau
      themes={["light", "dark", "theme-rose", "theme-ocean"]}
      enableColorScheme
      // ---------------------------------
    >
      {children}
    </NextThemesProvider>
  );
}
