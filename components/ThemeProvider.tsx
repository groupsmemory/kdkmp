'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Theme Provider (next-themes)
 * ============================================================================
 * Wraps the app with next-themes ThemeProvider.
 * Default: system preference. Stores choice in localStorage.
 * ============================================================================
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
