'use client';

/**
 * ============================================================================
 * HALAMAN LABA RUGI — Pendapatan vs Beban Operasional
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import PrintButton from '@/components/PrintButton';

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

export default function LabaRugiPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ type: 'laba-rugi', tenantId: 'default-tenant' });
      if (period) params.set('period', period);

      const res = await fetch(`/api/v1/laporan?${params}`);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      setError('Gagal memuat data laba rugi.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const revenues = accounts.filter((a) => a.account_type === 'REVENUE');
  const expenses = accounts.filter((a) => a.account_type === 'EXPENSE');

  const totalRevenue = revenues.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalExpense = expenses.reduce((sum, a) => sum + Number(a.balance), 0);
  const netIncome = totalRevenue - totalExpense;
  const isProfit = netIncome >= 0;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">Laba Rugi</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Pendapatan vs Beban • SAK EP</p>
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
            <PrintButton label="Cetak" />
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
            <p className="font-mono" style={{ color: 'var(--text-muted)' }}>Belum ada data laba rugi.</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>Data terisi otomatis setelah Tutup Buku Harian.</p>
          </div>
        ) : (
          <>
            {/* Net Income */}
            <div className="p-5 text-center" style={{ border: '4px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                {isProfit ? 'Laba Bersih' : 'Rugi Bersih'}
              </p>
              <p className="text-3xl sm:text-4xl font-black font-mono mt-2" style={{ color: isProfit ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {formatRupiah(netIncome)}
              </p>
              <p className="text-xs font-mono mt-2" style={{ color: 'var(--text-faint)' }}>
                = Pendapatan ({formatRupiah(totalRevenue)}) − Beban ({formatRupiah(totalExpense)})
              </p>
            </div>

            {/* Pendapatan */}
            <div style={{ border: '3px solid var(--border-primary)' }}>
              <div className="px-4 py-3 flex justify-between items-center" style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}>
                <h2 className="text-sm font-black uppercase tracking-widest">Pendapatan</h2>
                <span className="text-sm font-black font-mono">{formatRupiah(totalRevenue)}</span>
              </div>
              {revenues.length === 0 ? (
                <p className="px-4 py-3 text-xs" style={{ color: 'var(--text-faint)' }}>Belum ada pendapatan tercatat.</p>
              ) : (
                <div>
                  {revenues.map((acc) => (
                    <div key={acc.account_code} className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                      <div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{acc.account_code}</span>
                        <span className="ml-2 text-sm">{acc.account_name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent-success)' }}>{formatRupiah(Number(acc.balance))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Beban */}
            <div style={{ border: '3px solid var(--border-primary)' }}>
              <div className="px-4 py-3 flex justify-between items-center" style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}>
                <h2 className="text-sm font-black uppercase tracking-widest">Beban Operasional</h2>
                <span className="text-sm font-black font-mono">{formatRupiah(totalExpense)}</span>
              </div>
              {expenses.length === 0 ? (
                <p className="px-4 py-3 text-xs" style={{ color: 'var(--text-faint)' }}>Belum ada beban tercatat.</p>
              ) : (
                <div>
                  {expenses.map((acc) => (
                    <div key={acc.account_code} className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                      <div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{acc.account_code}</span>
                        <span className="ml-2 text-sm">{acc.account_name}</span>
                      </div>
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent-danger)' }}>{formatRupiah(Number(acc.balance))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <footer className="px-4 py-3" style={{ borderTop: '2px solid var(--border-muted)' }}>
        <p className="text-center text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
          SAK EP • Laba Bersih = Total Pendapatan − Total Beban Operasional
        </p>
      </footer>
    </div>
  );
}
