'use client';

/**
 * ============================================================================
 * HALAMAN JURNAL UMUM — Entri Debit/Kredit Hash-Chained
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

interface JournalEntry {
  id: number;
  transaction_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  created_at: string;
  transaction_description: string;
}

export default function JurnalUmumPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ type: 'jurnal', tenantId: 'default-tenant' });
      if (period) params.set('period', period);

      const res = await fetch(`/api/v1/laporan?${params}`);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setError('Gagal memuat data jurnal. Periksa koneksi.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit), 0);
  const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit), 0);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight">Jurnal Umum</h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Entri debit/kredit berantai hash SHA-256</p>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--text-muted)' }}>Memuat data...</p>
        ) : error ? (
          <p className="text-center py-12 font-mono" style={{ color: 'var(--accent-danger)' }}>{error}</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono" style={{ color: 'var(--text-muted)' }}>Belum ada entri jurnal untuk periode ini.</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>Entri jurnal otomatis dibuat saat Tutup Buku Harian.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3" style={{ border: '2px solid var(--border-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Total Debit</p>
                <p className="text-lg font-black font-mono" style={{ color: 'var(--accent-success)' }}>{formatRupiah(totalDebit)}</p>
              </div>
              <div className="p-3" style={{ border: '2px solid var(--border-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Total Kredit</p>
                <p className="text-lg font-black font-mono" style={{ color: 'var(--accent-info)' }}>{formatRupiah(totalCredit)}</p>
              </div>
              <div className="p-3" style={{ border: `2px solid ${totalDebit === totalCredit ? 'var(--accent-success)' : 'var(--accent-danger)'}`, backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Balance</p>
                <p className="text-lg font-black font-mono" style={{ color: totalDebit === totalCredit ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {totalDebit === totalCredit ? '✓ Seimbang' : formatRupiah(totalDebit - totalCredit)}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto" style={{ border: '3px solid var(--border-primary)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-invert)', color: 'var(--text-invert)' }}>
                    <th className="px-3 py-2 text-left font-mono text-xs uppercase">#</th>
                    <th className="px-3 py-2 text-left font-mono text-xs uppercase">Tanggal</th>
                    <th className="px-3 py-2 text-left font-mono text-xs uppercase">Akun</th>
                    <th className="px-3 py-2 text-left font-mono text-xs uppercase">Keterangan</th>
                    <th className="px-3 py-2 text-right font-mono text-xs uppercase">Debit</th>
                    <th className="px-3 py-2 text-right font-mono text-xs uppercase">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                      <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--text-faint)' }}>{entry.id}</td>
                      <td className="px-3 py-2 font-mono text-xs">{new Date(entry.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs" style={{ color: 'var(--text-faint)' }}>{entry.account_code}</span>
                        <span className="ml-2 text-xs font-bold">{entry.account_name}</span>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>{entry.transaction_description}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: Number(entry.debit) > 0 ? 'var(--accent-success)' : 'var(--text-faint)' }}>
                        {Number(entry.debit) > 0 ? formatRupiah(Number(entry.debit)) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: Number(entry.credit) > 0 ? 'var(--accent-info)' : 'var(--text-faint)' }}>
                        {Number(entry.credit) > 0 ? formatRupiah(Number(entry.credit)) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs font-mono mt-3" style={{ color: 'var(--text-faint)' }}>
              Menampilkan {entries.length} entri • Data bersifat append-only (imutabel)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
