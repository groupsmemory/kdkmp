'use client';

/**
 * ============================================================================
 * KDKMP JASASAJA — Print/Export PDF Button
 * ============================================================================
 * Menggunakan native window.print() + CSS @media print.
 * Zero dependency, zero server cost.
 * Operator desa bisa langsung "Save as PDF" dari dialog print browser.
 * ============================================================================
 */

import { useCallback } from 'react';

export default function PrintButton({ label = 'Cetak / Export PDF' }: { label?: string }) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <button
      onClick={handlePrint}
      className="text-xs font-mono font-bold px-3 py-2 uppercase cursor-pointer print:hidden"
      style={{
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: '2px solid var(--border-primary)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
      }}
      aria-label={label}
    >
      🖨️ {label}
    </button>
  );
}
