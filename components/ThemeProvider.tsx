'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Theme Provider (next-themes)
 * ============================================================================
 * Wraps the app with next-themes ThemeProvider.
 * Default: light mode. Stores choice in localStorage.
 * ============================================================================
 */

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render children without theme provider during SSR to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

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
