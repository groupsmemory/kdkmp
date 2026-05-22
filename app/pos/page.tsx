'use client';

/**
 * ============================================================================
 * HALAMAN POS — Transaksi Penjualan Sembako (Offline-First, Encrypted)
 * ============================================================================
 * Persona: Bapak Sukri (45 tahun, operator kasir gerai desa)
 * Arsitektur:
 *   - Input transaksi disimpan ke IndexedDB terenkripsi (AES-GCM 256-bit)
 *   - Auto-sync ke server saat koneksi pulih
 *   - Zustand tracking kas untuk POS Lockout (Rp50jt BPKP)
 *   - Tema: High-Contrast Light Mode (#FFFFFF, #1A1A1A)
 *   - Tombol 48dp, font besar, aksesibilitas penuh
 *
 * Kepatuhan:
 *   - PP 60/2008 (SPIP) — batas brankas Rp50.000.000
 *   - Inpres 17/2025 — KDKMP Koperasi Desa Merah Putih
 *   - NIST SP 800-132 — PBKDF2 600.000 iterasi
 * ============================================================================
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCashStore } from '@/components/POSLockout';
import POSLockout from '@/components/POSLockout';
import {
  saveOfflineTransaction,
  synchronizeOfflineQueue,
  setupAutoSync,
  calculateOfflineCashTotal,
  type OfflineTransaction,
} from '@/lib/dexieStore';

// ═══════════════════════════════════════════════════════════════
// TIPE DATA
// ═══════════════════════════════════════════════════════════════

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';


// ═══════════════════════════════════════════════════════════════
// KATALOG PRODUK SEMBAKO (MVP hardcoded, nanti dari DB)
// ═══════════════════════════════════════════════════════════════

const PRODUCTS = [
  { id: 'beras-5kg', name: 'Beras Premium 5kg', price: 65000 },
  { id: 'beras-10kg', name: 'Beras Premium 10kg', price: 125000 },
  { id: 'minyak-1l', name: 'Minyak Goreng 1L', price: 18000 },
  { id: 'minyak-2l', name: 'Minyak Goreng 2L', price: 34000 },
  { id: 'gula-1kg', name: 'Gula Pasir 1kg', price: 16000 },
  { id: 'tepung-1kg', name: 'Tepung Terigu 1kg', price: 12000 },
  { id: 'telur-1kg', name: 'Telur Ayam 1kg', price: 28000 },
  { id: 'mie-instan', name: 'Mie Instan (5 pcs)', price: 14000 },
  { id: 'kopi-sachet', name: 'Kopi Sachet (10 pcs)', price: 15000 },
  { id: 'sabun-mandi', name: 'Sabun Mandi', price: 5000 },
  { id: 'deterjen', name: 'Deterjen 800g', price: 12000 },
  { id: 'gas-3kg', name: 'Gas LPG 3kg', price: 22000 },
] as const;

// ═══════════════════════════════════════════════════════════════
// HELPER: Format Rupiah
// ═══════════════════════════════════════════════════════════════

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ═══════════════════════════════════════════════════════════════
// KOMPONEN: Login Operator (Passphrase untuk Enkripsi)
// ═══════════════════════════════════════════════════════════════

function OperatorLogin({ onLogin }: { onLogin: (passphrase: string) => void }) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (passphrase.length < 8) {
      setError('Passphrase minimal 8 karakter.');
      return;
    }
    onLogin(passphrase);
  }, [passphrase, onLogin]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: '#1A1A1A' }}
          >
            Terminal POS
          </h1>
          <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
            KDKMP JASASAJA — Masukkan passphrase operator untuk membuka terminal kasir.
          </p>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="operator-passphrase"
            className="block text-sm font-bold uppercase tracking-wider"
            style={{ color: '#1A1A1A' }}
          >
            Passphrase Operator
          </label>
          <input
            id="operator-passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => { setPassphrase(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Minimal 8 karakter"
            autoComplete="current-password"
            className="w-full text-lg font-mono"
            style={{
              minHeight: '48px',
              padding: '12px 16px',
              border: '4px solid #1A1A1A',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              outline: 'none',
            }}
            aria-describedby={error ? 'login-error' : 'login-hint'}
          />
          <p id="login-hint" className="text-xs" style={{ color: '#6B7280' }}>
            Passphrase digunakan untuk mengenkripsi data transaksi lokal (AES-GCM 256-bit).
          </p>
          {error && (
            <p id="login-error" className="text-sm font-bold" style={{ color: '#DC2626' }} role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={passphrase.length < 8}
            className="w-full font-black uppercase tracking-wider text-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              minHeight: '48px',
              padding: '14px 24px',
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              border: '4px solid #1A1A1A',
            }}
            aria-label="Masuk ke terminal POS"
          >
            Masuk Terminal
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
          Kepatuhan: Inpres 17/2025 • NIST SP 800-132 • PP 60/2008
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// KOMPONEN UTAMA: POS Terminal
// ═══════════════════════════════════════════════════════════════

export default function POSPage() {
  const [passphrase, setPassphrase] = useState<string | null>(null);

  if (!passphrase) {
    return <OperatorLogin onLogin={setPassphrase} />;
  }

  return <POSTerminal passphrase={passphrase} onLogout={() => setPassphrase(null)} />;
}

function POSTerminal({ passphrase, onLogout }: { passphrase: string; onLogout: () => void }) {
  const { cashOnHand, addCash, isLocked, setCashOnHand } = useCashStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    total: number;
    method: string;
    time: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);

  // ─── Online/Offline listener ───────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // ─── Auto-sync saat koneksi pulih ─────────────────────────
  useEffect(() => {
    const cleanup = setupAutoSync(passphrase);
    return cleanup;
  }, [passphrase]);

  // ─── Hitung kas dari IndexedDB saat mount ─────────────────
  useEffect(() => {
    calculateOfflineCashTotal(passphrase).then((total) => {
      if (total > 0) {
        setCashOnHand(total);
      }
    });
  }, [passphrase, setCashOnHand]);

  // ─── Hitung total keranjang ────────────────────────────────
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  // ─── Tambah item ke keranjang ──────────────────────────────
  const addToCart = useCallback((product: { id: string; name: string; price: number; }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  // ─── Kurangi qty ───────────────────────────────────────────
  const decreaseQty = useCallback((productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item && item.qty <= 1) {
        return prev.filter((i) => i.id !== productId);
      }
      return prev.map((i) =>
        i.id === productId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }, []);

  // ─── Hapus item ────────────────────────────────────────────
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  // ─── Manual sync ───────────────────────────────────────────
  const handleManualSync = useCallback(async () => {
    if (!isOnline) return;
    setSyncStatus('syncing');
    try {
      const result = await synchronizeOfflineQueue(passphrase);
      if (result.failedCount === 0) {
        setSyncStatus('success');
        setPendingCount(0);
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 3000);
  }, [isOnline, passphrase]);


  // ─── Proses pembayaran (simpan ke IndexedDB terenkripsi) ───
  const processPayment = useCallback(async () => {
    if (cart.length === 0 || isProcessing || isLocked) return;

    setIsProcessing(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const timestamp = Date.now();

      const transaction: OfflineTransaction = {
        idempotencyKey,
        tenantId: 'default-tenant',
        amount: cartTotal,
        description: cart.map((i) => `${i.name} x${i.qty}`).join(', '),
        items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        paymentMethod,
        status: 'PENDING',
        createdAt: timestamp,
      };

      // Simpan ke IndexedDB terenkripsi (AES-GCM 256-bit)
      await saveOfflineTransaction(transaction, passphrase);

      // Update Zustand kas jika CASH
      if (paymentMethod === 'CASH') {
        addCash(cartTotal);
      }

      // Update pending count
      setPendingCount((prev) => prev + 1);

      // Simpan receipt
      setLastReceipt({
        total: cartTotal,
        method: paymentMethod,
        time: new Date().toLocaleTimeString('id-ID'),
      });

      // Reset cart
      setCart([]);

      // Auto-sync jika online
      if (isOnline) {
        synchronizeOfflineQueue(passphrase).then((result) => {
          if (result.successCount > 0) {
            setPendingCount((prev) => Math.max(0, prev - result.successCount));
          }
        });
      }
    } catch (error) {
      console.error('[POS] Gagal menyimpan transaksi:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cart, cartTotal, paymentMethod, isProcessing, isLocked, addCash, passphrase, isOnline]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <>
      {/* POS Lockout Overlay (jika kas > Rp50jt) */}
      <POSLockout />

      <div className="min-h-screen font-sans" style={{ backgroundColor: '#FFFFFF', color: '#1A1A1A' }}>
        {/* Header */}
        <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid #1A1A1A' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: '#1A1A1A' }}>
                Terminal POS
              </h1>
              <p className="text-xs font-mono" style={{ color: '#6B7280' }}>
                KDKMP JASASAJA •{' '}
                <span
                  aria-live="polite"
                  style={{ color: isOnline ? '#059669' : '#DC2626' }}
                >
                  {isOnline ? '● Online' : '● Offline (data terenkripsi lokal)'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Sync */}
              {pendingCount > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncStatus === 'syncing'}
                  className="text-xs font-mono px-3 py-2 font-bold uppercase cursor-pointer disabled:opacity-40"
                  style={{
                    minHeight: '48px',
                    border: '2px solid #1A1A1A',
                    backgroundColor: '#FEF3C7',
                    color: '#1A1A1A',
                  }}
                  aria-label={`Sinkronkan ${pendingCount} transaksi tertunda`}
                >
                  {syncStatus === 'syncing' ? 'Sync...' : `↑ ${pendingCount} Pending`}
                </button>
              )}

              {/* Kas Brankas */}
              <div className="text-right">
                <p className="text-xs font-mono uppercase" style={{ color: '#6B7280' }}>
                  Kas Brankas
                </p>
                <p
                  className="text-sm font-black font-mono"
                  style={{ color: cashOnHand > 40_000_000 ? '#DC2626' : '#059669' }}
                  aria-live="polite"
                  aria-label={`Saldo kas brankas ${formatRupiah(cashOnHand)}`}
                >
                  {formatRupiah(cashOnHand)}
                </p>
              </div>

              {/* Navigasi */}
              <a
                href="/dashboard"
                className="text-xs font-mono font-bold px-3 py-2 uppercase cursor-pointer"
                style={{
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid #1A1A1A',
                  color: '#1A1A1A',
                }}
              >
                Dashboard
              </a>
              <button
                onClick={onLogout}
                className="text-xs font-mono font-bold px-3 py-2 uppercase cursor-pointer"
                style={{
                  minHeight: '48px',
                  border: '2px solid #DC2626',
                  color: '#DC2626',
                }}
                aria-label="Keluar dari terminal POS"
              >
                Keluar
              </button>
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ═══ Katalog Produk ═══ */}
            <div className="lg:col-span-2">
              <h2
                className="text-sm font-black uppercase tracking-widest mb-3"
                style={{ color: '#1A1A1A' }}
              >
                Pilih Produk Sembako
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isLocked}
                    className="p-3 text-left transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    style={{
                      border: '3px solid #1A1A1A',
                      backgroundColor: '#FFFFFF',
                      minHeight: '48px',
                      minWidth: '48px',
                    }}
                    aria-label={`Tambah ${product.name} ke keranjang, harga ${formatRupiah(product.price)}`}
                  >
                    <p className="text-sm font-bold leading-tight" style={{ color: '#1A1A1A' }}>
                      {product.name}
                    </p>
                    <p className="text-sm font-mono font-bold mt-1" style={{ color: '#059669' }}>
                      {formatRupiah(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ Keranjang & Pembayaran ═══ */}
            <div className="space-y-4">
              {/* Keranjang */}
              <div className="p-4" style={{ border: '4px solid #1A1A1A' }}>
                <h2
                  className="text-sm font-black uppercase tracking-widest mb-3"
                  style={{ color: '#1A1A1A' }}
                >
                  Keranjang ({cartItemCount} item)
                </h2>

                {cart.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: '#9CA3AF' }}>
                    Belum ada item. Tap produk untuk menambahkan.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: '2px solid #E5E7EB' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#1A1A1A' }}>
                            {item.name}
                          </p>
                          <p className="text-xs font-mono" style={{ color: '#6B7280' }}>
                            {formatRupiah(item.price)} × {item.qty} = {formatRupiah(item.price * item.qty)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="flex items-center justify-center font-black text-lg cursor-pointer"
                            style={{
                              width: '48px',
                              height: '48px',
                              border: '3px solid #1A1A1A',
                              backgroundColor: '#FFFFFF',
                              color: '#1A1A1A',
                            }}
                            aria-label={`Kurangi jumlah ${item.name}`}
                          >
                            −
                          </button>
                          <span
                            className="text-sm font-mono font-bold w-8 text-center"
                            style={{ color: '#1A1A1A' }}
                            aria-label={`Jumlah ${item.name}: ${item.qty}`}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                            className="flex items-center justify-center font-black text-lg cursor-pointer"
                            style={{
                              width: '48px',
                              height: '48px',
                              border: '3px solid #1A1A1A',
                              backgroundColor: '#FFFFFF',
                              color: '#1A1A1A',
                            }}
                            aria-label={`Tambah jumlah ${item.name}`}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center justify-center font-black text-lg cursor-pointer ml-1"
                            style={{
                              width: '48px',
                              height: '48px',
                              border: '3px solid #DC2626',
                              backgroundColor: '#FFFFFF',
                              color: '#DC2626',
                            }}
                            aria-label={`Hapus ${item.name} dari keranjang`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="mt-3 pt-3" style={{ borderTop: '4px solid #1A1A1A' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase" style={{ color: '#1A1A1A' }}>
                      Total
                    </span>
                    <span
                      className="text-2xl font-black font-mono"
                      style={{ color: '#1A1A1A' }}
                      aria-live="polite"
                      aria-label={`Total belanja ${formatRupiah(cartTotal)}`}
                    >
                      {formatRupiah(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="p-4" style={{ border: '4px solid #1A1A1A' }}>
                <h2
                  className="text-sm font-black uppercase tracking-widest mb-3"
                  style={{ color: '#1A1A1A' }}
                >
                  Metode Bayar
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className="p-3 text-center font-black text-sm uppercase cursor-pointer"
                    style={{
                      minHeight: '48px',
                      minWidth: '48px',
                      border: paymentMethod === 'CASH' ? '4px solid #1A1A1A' : '3px solid #D1D5DB',
                      backgroundColor: paymentMethod === 'CASH' ? '#1A1A1A' : '#FFFFFF',
                      color: paymentMethod === 'CASH' ? '#FFFFFF' : '#1A1A1A',
                    }}
                    aria-pressed={paymentMethod === 'CASH'}
                    aria-label="Pilih metode pembayaran tunai"
                  >
                    💵 Tunai
                  </button>
                  <button
                    onClick={() => setPaymentMethod('QRIS')}
                    className="p-3 text-center font-black text-sm uppercase cursor-pointer"
                    style={{
                      minHeight: '48px',
                      minWidth: '48px',
                      border: paymentMethod === 'QRIS' ? '4px solid #1A1A1A' : '3px solid #D1D5DB',
                      backgroundColor: paymentMethod === 'QRIS' ? '#1A1A1A' : '#FFFFFF',
                      color: paymentMethod === 'QRIS' ? '#FFFFFF' : '#1A1A1A',
                    }}
                    aria-pressed={paymentMethod === 'QRIS'}
                    aria-label="Pilih metode pembayaran QRIS"
                  >
                    📱 QRIS
                  </button>
                </div>
              </div>

              {/* Tombol Bayar */}
              <button
                onClick={processPayment}
                disabled={cart.length === 0 || isProcessing || isLocked}
                className="w-full font-black uppercase tracking-wider text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                style={{
                  minHeight: '56px',
                  padding: '16px',
                  backgroundColor: cart.length > 0 ? '#1A1A1A' : '#E5E7EB',
                  color: cart.length > 0 ? '#FFFFFF' : '#9CA3AF',
                  border: '4px solid #1A1A1A',
                }}
                aria-label={cart.length > 0 ? `Bayar ${formatRupiah(cartTotal)} dengan ${paymentMethod}` : 'Keranjang kosong'}
              >
                {isProcessing ? 'Memproses...' : `Bayar ${formatRupiah(cartTotal)}`}
              </button>

              {/* Receipt terakhir */}
              {lastReceipt && (
                <div
                  className="p-3"
                  style={{ border: '3px solid #059669', backgroundColor: '#ECFDF5' }}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-xs font-mono font-bold uppercase" style={{ color: '#059669' }}>
                    ✓ Transaksi Berhasil — {lastReceipt.time}
                  </p>
                  <p className="text-sm font-mono font-bold mt-1" style={{ color: '#1A1A1A' }}>
                    {formatRupiah(lastReceipt.total)} • {lastReceipt.method}
                  </p>
                  {!isOnline && (
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      Data terenkripsi di perangkat. Akan disinkronkan saat online.
                    </p>
                  )}
                </div>
              )}

              {/* Sync Status */}
              {syncStatus === 'success' && (
                <div
                  className="p-2 text-center"
                  style={{ border: '2px solid #059669', backgroundColor: '#ECFDF5' }}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-xs font-bold" style={{ color: '#059669' }}>
                    ✓ Semua transaksi berhasil disinkronkan
                  </p>
                </div>
              )}
              {syncStatus === 'error' && (
                <div
                  className="p-2 text-center"
                  style={{ border: '2px solid #DC2626', backgroundColor: '#FEF2F2' }}
                  role="alert"
                >
                  <p className="text-xs font-bold" style={{ color: '#DC2626' }}>
                    ✗ Gagal sinkronisasi. Akan dicoba lagi saat koneksi stabil.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="px-4 py-3 mt-4" style={{ borderTop: '2px solid #E5E7EB' }}>
          <p className="text-center text-xs font-mono" style={{ color: '#9CA3AF' }}>
            Kepatuhan: Inpres 17/2025 • PP 60/2008 (SPIP) • Audit BPKP • Enkripsi AES-GCM 256-bit • Batas Brankas Rp50 Juta
          </p>
        </footer>
      </div>
    </>
  );
}
