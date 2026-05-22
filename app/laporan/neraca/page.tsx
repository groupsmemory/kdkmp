'use client';

/**
 * ============================================================================
 * HALAMAN NERACA — Posisi Keuangan (Aset, Liabilitas, Ekuitas)
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface AccountRow {
  account_type: string;
  account_code: string;
  account_name: string;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export default function NeracaPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ type: 'neraca', tenantId: 'default-tenant' });
      if (period) params.set('period', period);

      const res = await fetch(`/api/v1/laporan?${params}`);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      setError('Gagal memuat data neraca.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const assets = accounts.filter((a) => a.account_type === 'ASSET');
  const liabilities = accounts.filter((a) => a.account_type === 'LIABILITY');
  const equity = accounts.filter((a) => a.account_type === 'EQUITY');

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">Neraca</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Posisi Keuangan • SAK EP</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-mono px-2 py-1"
              style={{ minHeight: '48px', border: '2px solid var(--border-secondary)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Filter periode"
            />
            <ThemeToggle />
            <a href="/laporan" className="text-xs font-mono font-bold px-3 py-2 uppercase" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', border: '2px solid var(--border-secondary)', color: 'var(--text-muted)' }}>
              ← Laporan
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoading ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--text-muted)' }}>Memuat data...</p>
        ) : error ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--accent-danger)' }}>{error}</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono" style={{ color: 'var(--text-muted)' }}>Belum ada data neraca.</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>Data neraca terisi otomatis setelah Tutup Buku Harian.</p>
          </div>
        ) : (
          <>
            {/* Balance Check */}
            <div className="p-3 text-center" style={{ border: `3px solid ${isBalanced ? 'var(--accent-success)' : 'var(--accent-danger)'}`, backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm font-black" style={{ color: isBalanced ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {isBalanced ? '✓ Neraca Seimbang (Aset = Liabilitas + Ekuitas)' : '✗ Neraca Tidak Seimbang — Periksa entri jurnal'}
              </p>
            </div>

            {/* Aset */}
            <AccountSection title="ASET" accounts={assets} total={totalAssets} color="var(--accent-success)" />

            {/* Liabilitas */}
            <AccountSection title="LIABILITAS" accounts={liabilities} total={totalLiabilities} color="var(--accent-warning)" />

            {/* Ekuitas */}
            <AccountSection title="EKUITAS" accounts={equity} total={totalEquity} color="var(--accent-info)" />
          </>
        )}
      </div>
    </div>
  );
}

function AccountSection({ title, accounts, total, color }: { title: string; accounts: AccountRow[]; total: number; color: string }) {
  return (
    <div style={{ border: '3px solid var(--border-primary)' }}>
      <div className="px-4 py-3 flex justify-between items-center" style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}>
        <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
        <span className="text-sm font-black font-mono">{formatRupiah(total)}</span>
      </div>
      {accounts.length === 0 ? (
        <p className="px-4 py-3 text-xs" style={{ color: 'var(--text-faint)' }}>Belum ada akun {title.toLowerCase()}.</p>
      ) : (
        <div>
          {accounts.map((acc) => (
            <div key={acc.account_code} className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{acc.account_code}</span>
                <span className="ml-2 text-sm">{acc.account_name}</span>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color }}>{formatRupiah(Number(acc.balance))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
