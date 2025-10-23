// src/app/theme-provider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      // --- UPDATED CONFIG ---
      attribute="class"
      defaultTheme="light" // Default jadi terang bukan sistem
      enableSystem={false} // Matikan sistem detection
      disableTransitionOnChange
      // Hanya tema yang kita mau
      themes={['light', 'theme-rose', 'theme-ocean']}
      // ---------------------------------
    >
      {children}
    </NextThemesProvider>
  );
}