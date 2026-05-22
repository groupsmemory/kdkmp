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
import ThemeToggle from '@/components/ThemeToggle';
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

interface QrisPayment {
  invoiceId: string;
  invoiceUrl: string;
  amount: number;
  expiresAt: string;
}


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
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Terminal POS
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            KDKMP JASASAJA — Masukkan passphrase operator untuk membuka terminal kasir.
          </p>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="operator-passphrase"
            className="block text-sm font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
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
              border: '4px solid var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            aria-describedby={error ? 'login-error' : 'login-hint'}
          />
          <p id="login-hint" className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Passphrase digunakan untuk mengenkripsi data transaksi lokal (AES-GCM 256-bit).
          </p>
          {error && (
            <p id="login-error" className="text-sm font-bold" style={{ color: 'var(--accent-danger)' }} role="alert">
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
              backgroundColor: 'var(--bg-invert)',
              color: 'var(--text-invert)',
              border: '4px solid var(--border-primary)',
            }}
            aria-label="Masuk ke terminal POS"
          >
            Masuk Terminal
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Kepatuhan: Inpres 17/2025 • NIST SP 800-132
          </p>
          <ThemeToggle />
        </div>
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
  const [qrisPayment, setQrisPayment] = useState<QrisPayment | null>(null);
  const [qrisLoading, setQrisLoading] = useState(false);

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

    // QRIS: buat invoice Xendit dulu
    if (paymentMethod === 'QRIS' && isOnline) {
      setQrisLoading(true);
      try {
        const response = await fetch('/api/v1/pos/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': crypto.randomUUID(),
          },
          body: JSON.stringify({
            amount: cartTotal,
            description: cart.map((i) => `${i.name} x${i.qty}`).join(', '),
            items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setQrisPayment({
            invoiceId: data.invoiceId,
            invoiceUrl: data.invoiceUrl,
            amount: data.amount,
            expiresAt: data.expiresAt,
          });
        } else {
          // Fallback: simpan offline jika payment gateway gagal
          await saveTransactionOffline();
        }
      } catch {
        // Offline atau error: simpan lokal
        await saveTransactionOffline();
      } finally {
        setQrisLoading(false);
      }
      return;
    }

    // CASH atau QRIS offline: simpan langsung ke IndexedDB
    await saveTransactionOffline();
  }, [cart, cartTotal, paymentMethod, isProcessing, isLocked, isOnline]);

  // ─── Simpan transaksi ke IndexedDB (untuk CASH atau fallback QRIS) ───
  const saveTransactionOffline = useCallback(async () => {
    if (isProcessing) return;
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

      await saveOfflineTransaction(transaction, passphrase);

      if (paymentMethod === 'CASH') {
        addCash(cartTotal);
      }

      setPendingCount((prev) => prev + 1);

      setLastReceipt({
        total: cartTotal,
        method: paymentMethod,
        time: new Date().toLocaleTimeString('id-ID'),
      });

      setCart([]);

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
  }, [cart, cartTotal, paymentMethod, isProcessing, addCash, passphrase, isOnline]);

  // ─── Konfirmasi QRIS berhasil (setelah pembeli bayar) ───
  const confirmQrisPayment = useCallback(() => {
    setLastReceipt({
      total: qrisPayment?.amount || cartTotal,
      method: 'QRIS',
      time: new Date().toLocaleTimeString('id-ID'),
    });
    setCart([]);
    setQrisPayment(null);
  }, [qrisPayment, cartTotal]);

  // ─── Batalkan QRIS ───
  const cancelQrisPayment = useCallback(() => {
    setQrisPayment(null);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <>
      {/* POS Lockout Overlay (jika kas > Rp50jt) */}
      <POSLockout />

      {/* QRIS Payment Modal */}
      {qrisPayment && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qris-title"
        >
          <div className="w-full max-w-md p-6 space-y-4" style={{ backgroundColor: 'var(--bg-primary)', border: '4px solid var(--border-primary)' }}>
            <h2 id="qris-title" className="text-lg font-black uppercase text-center" style={{ color: 'var(--text-primary)' }}>
              Pembayaran QRIS
            </h2>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Arahkan pembeli untuk scan QR atau buka link pembayaran.
            </p>

            {/* Amount */}
            <div className="p-4 text-center" style={{ border: '3px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-faint)' }}>Total Bayar</p>
              <p className="text-3xl font-black font-mono" style={{ color: 'var(--accent-success)' }}>
                {formatRupiah(qrisPayment.amount)}
              </p>
            </div>

            {/* Invoice Link */}
            <a
              href={qrisPayment.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center font-black uppercase tracking-wider text-sm py-3 cursor-pointer"
              style={{
                minHeight: '48px',
                backgroundColor: 'var(--bg-invert)',
                color: 'var(--text-invert)',
                border: '3px solid var(--border-primary)',
              }}
            >
              Buka Halaman Pembayaran ↗
            </a>

            <p className="text-xs text-center font-mono" style={{ color: 'var(--text-faint)' }}>
              Invoice berlaku 15 menit • ID: {qrisPayment.invoiceId.slice(0, 8)}...
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={confirmQrisPayment}
                className="font-black uppercase text-sm py-3 cursor-pointer"
                style={{
                  minHeight: '48px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--accent-success)',
                  border: '3px solid var(--accent-success)',
                }}
                aria-label="Konfirmasi pembayaran QRIS berhasil"
              >
                ✓ Sudah Bayar
              </button>
              <button
                onClick={cancelQrisPayment}
                className="font-black uppercase text-sm py-3 cursor-pointer"
                style={{
                  minHeight: '48px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--accent-danger)',
                  border: '3px solid var(--accent-danger)',
                }}
                aria-label="Batalkan pembayaran QRIS"
              >
                ✗ Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '4px solid var(--border-primary)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Terminal POS
              </h1>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                KDKMP JASASAJA •{' '}
                <span
                  aria-live="polite"
                  style={{ color: isOnline ? 'var(--accent-success)' : 'var(--accent-danger)' }}
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
                    border: '2px solid var(--border-primary)',
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
                <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                  Kas Brankas
                </p>
                <p
                  className="text-sm font-black font-mono"
                  style={{ color: cashOnHand > 40_000_000 ? 'var(--accent-danger)' : 'var(--accent-success)' }}
                  aria-live="polite"
                  aria-label={`Saldo kas brankas ${formatRupiah(cashOnHand)}`}
                >
                  {formatRupiah(cashOnHand)}
                </p>
              </div>

              <ThemeToggle />

              {/* Navigasi */}
              <a
                href="/dashboard"
                className="text-xs font-mono font-bold px-3 py-2 uppercase cursor-pointer"
                style={{
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                Dashboard
              </a>
              <button
                onClick={onLogout}
                className="text-xs font-mono font-bold px-3 py-2 uppercase cursor-pointer"
                style={{
                  minHeight: '48px',
                  border: '2px solid var(--accent-danger)',
                  color: 'var(--accent-danger)',
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
                style={{ color: 'var(--text-primary)' }}
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
                      border: '3px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-card)',
                      minHeight: '48px',
                      minWidth: '48px',
                    }}
                    aria-label={`Tambah ${product.name} ke keranjang, harga ${formatRupiah(product.price)}`}
                  >
                    <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </p>
                    <p className="text-sm font-mono font-bold mt-1" style={{ color: 'var(--accent-success)' }}>
                      {formatRupiah(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ Keranjang & Pembayaran ═══ */}
            <div className="space-y-4">
              {/* Keranjang */}
              <div className="p-4" style={{ border: '4px solid var(--border-primary)' }}>
                <h2
                  className="text-sm font-black uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Keranjang ({cartItemCount} item)
                </h2>

                {cart.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: 'var(--text-faint)' }}>
                    Belum ada item. Tap produk untuk menambahkan.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: '2px solid var(--border-muted)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {item.name}
                          </p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
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
                              border: '3px solid var(--border-primary)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                            }}
                            aria-label={`Kurangi jumlah ${item.name}`}
                          >
                            −
                          </button>
                          <span
                            className="text-sm font-mono font-bold w-8 text-center"
                            style={{ color: 'var(--text-primary)' }}
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
                              border: '3px solid var(--border-primary)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-primary)',
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
                              border: '3px solid var(--accent-danger)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--accent-danger)',
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
                <div className="mt-3 pt-3" style={{ borderTop: '4px solid var(--border-primary)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase" style={{ color: 'var(--text-primary)' }}>
                      Total
                    </span>
                    <span
                      className="text-2xl font-black font-mono"
                      style={{ color: 'var(--text-primary)' }}
                      aria-live="polite"
                      aria-label={`Total belanja ${formatRupiah(cartTotal)}`}
                    >
                      {formatRupiah(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="p-4" style={{ border: '4px solid var(--border-primary)' }}>
                <h2
                  className="text-sm font-black uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-primary)' }}
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
                      border: paymentMethod === 'CASH' ? '4px solid var(--border-primary)' : '3px solid var(--border-secondary)',
                      backgroundColor: paymentMethod === 'CASH' ? 'var(--bg-invert)' : 'var(--bg-card)',
                      color: paymentMethod === 'CASH' ? 'var(--text-invert)' : 'var(--text-primary)',
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
                      border: paymentMethod === 'QRIS' ? '4px solid var(--border-primary)' : '3px solid var(--border-secondary)',
                      backgroundColor: paymentMethod === 'QRIS' ? 'var(--bg-invert)' : 'var(--bg-card)',
                      color: paymentMethod === 'QRIS' ? 'var(--text-invert)' : 'var(--text-primary)',
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
                disabled={cart.length === 0 || isProcessing || isLocked || qrisLoading}
                className="w-full font-black uppercase tracking-wider text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                style={{
                  minHeight: '56px',
                  padding: '16px',
                  backgroundColor: cart.length > 0 ? 'var(--bg-invert)' : 'var(--bg-tertiary)',
                  color: cart.length > 0 ? 'var(--text-invert)' : 'var(--text-faint)',
                  border: '4px solid var(--border-primary)',
                }}
                aria-label={cart.length > 0 ? `Bayar ${formatRupiah(cartTotal)} dengan ${paymentMethod}` : 'Keranjang kosong'}
              >
                {isProcessing || qrisLoading ? 'Memproses...' : `Bayar ${formatRupiah(cartTotal)}`}
              </button>

              {/* Receipt terakhir */}
              {lastReceipt && (
                <div
                  className="p-3"
                  style={{ border: '3px solid var(--accent-success)', backgroundColor: 'var(--bg-secondary)' }}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-xs font-mono font-bold uppercase" style={{ color: 'var(--accent-success)' }}>
                    ✓ Transaksi Berhasil — {lastReceipt.time}
                  </p>
                  <p className="text-sm font-mono font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {formatRupiah(lastReceipt.total)} • {lastReceipt.method}
                  </p>
                  {!isOnline && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Data terenkripsi di perangkat. Akan disinkronkan saat online.
                    </p>
                  )}
                </div>
              )}

              {/* Sync Status */}
              {syncStatus === 'success' && (
                <div
                  className="p-2 text-center"
                  style={{ border: '2px solid var(--accent-success)', backgroundColor: 'var(--bg-secondary)' }}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-xs font-bold" style={{ color: 'var(--accent-success)' }}>
                    ✓ Semua transaksi berhasil disinkronkan
                  </p>
                </div>
              )}
              {syncStatus === 'error' && (
                <div
                  className="p-2 text-center"
                  style={{ border: '2px solid var(--accent-danger)', backgroundColor: 'var(--bg-secondary)' }}
                  role="alert"
                >
                  <p className="text-xs font-bold" style={{ color: 'var(--accent-danger)' }}>
                    ✗ Gagal sinkronisasi. Akan dicoba lagi saat koneksi stabil.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="px-4 py-3 mt-4" style={{ borderTop: '2px solid var(--border-muted)' }}>
          <p className="text-center text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
            Kepatuhan: Inpres 17/2025 • PP 60/2008 (SPIP) • Audit BPKP • Enkripsi AES-GCM 256-bit • Batas Brankas Rp50 Juta
          </p>
        </footer>
      </div>
    </>
  );
}
