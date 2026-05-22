'use client';

/**
 * ============================================================================
 * HALAMAN LOGIN — Autentikasi Operator Kasir KDKMP
 * ============================================================================
 * Desain: Brutalistik kontras tinggi, tombol 48dp, dark/light mode
 * Setelah login berhasil: redirect ke /dashboard
 * Session disimpan di httpOnly cookie (bukan localStorage)
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!username || password.length < 8) {
      setError('Username wajib diisi dan password minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login gagal. Periksa kembali credentials.');
      }
    } catch {
      setError('Koneksi gagal. Periksa jaringan internet.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-3xl font-black uppercase tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            JASASAJA
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Platform KDKMP — Masuk ke sistem
          </p>
        </div>

        {/* Form */}
        <div
          className="p-6 space-y-5"
          style={{ border: '4px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}
        >
          {/* Username */}
          <div className="space-y-2">
            <label
              htmlFor="login-username"
              className="block text-sm font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('login-password')?.focus(); }}
              placeholder="Contoh: kasir"
              autoComplete="username"
              className="w-full text-lg font-mono"
              style={{
                minHeight: '48px',
                padding: '12px 16px',
                border: '3px solid var(--border-primary)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="block text-sm font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="Minimal 8 karakter"
              autoComplete="current-password"
              className="w-full text-lg font-mono"
              style={{
                minHeight: '48px',
                padding: '12px 16px',
                border: '3px solid var(--border-primary)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-bold" style={{ color: 'var(--accent-danger)' }} role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading || !username || password.length < 8}
            className="w-full font-black uppercase tracking-wider text-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-transform"
            style={{
              minHeight: '48px',
              padding: '14px 24px',
              backgroundColor: 'var(--bg-invert)',
              color: 'var(--text-invert)',
              border: '4px solid var(--border-primary)',
            }}
            aria-label="Masuk ke sistem KDKMP"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Kepatuhan: Inpres 17/2025 • SAK EP
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
