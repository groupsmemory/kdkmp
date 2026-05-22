'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Theme Toggle Button
 * ============================================================================
 * Tombol 48dp untuk switch dark/light mode.
 * Menggunakan next-themes useTheme hook.
 * ============================================================================
 */

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '2px solid var(--border-secondary)',
          backgroundColor: 'var(--bg-card)',
        }}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center cursor-pointer transition-colors"
      style={{
        width: '48px',
        height: '48px',
        minWidth: '48px',
        minHeight: '48px',
        border: '2px solid var(--border-primary)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
      }}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
    >
      <span className="text-xl" aria-hidden="true">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
