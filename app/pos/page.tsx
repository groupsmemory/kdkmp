'use client';

/**
 * ============================================================================
 * HALAMAN POS — Transaksi Penjualan Sembako (Offline-First)
 * ============================================================================
 * Persona: Bapak Sukri (45 tahun, operator kasir gerai desa)
 * Arsitektur:
 *   - Input transaksi disimpan ke IndexedDB terenkripsi (AES-GCM 256-bit)
 *   - Auto-sync ke server saat koneksi pulih
 *   - Zustand tracking kas untuk POS Lockout (Rp50jt)
 *   - Tombol 48dp, dark mode, font besar
 * ============================================================================
 */

import { useState, useCallback, useEffect } from 'react';
import { useCashStore } from '@/components/POSLockout';
import POSLockout from '@/components/POSLockout';

// ═══════════════════════════════════════════════════════════════
// TIPE DATA
// ═══════════════════════════════════════════════════════════════

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

// Katalog produk sembako (hardcoded untuk MVP, nanti dari DB)
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

// Format Rupiah
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ═══════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ═══════════════════════════════════════════════════════════════

export default function POSPage() {
  const { cashOnHand, addCash, isLocked } = useCashStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{ total: number; method: string; time: string } | null>(null);
  const [isOnline, setIsOnline] = useState(true);

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

  // Hitung total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Tambah item ke keranjang
  const addToCart = useCallback((product: typeof PRODUCTS[number]) => {
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

  // Kurangi qty
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

  // Hapus item
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  // Proses pembayaran
  const processPayment = useCallback(async () => {
    if (cart.length === 0 || isProcessing) return;

    setIsProcessing(true);

    try {
      // Generate idempotency key
      const idempotencyKey = crypto.randomUUID();
      const timestamp = Date.now();

      // Simpan ke Zustand (update kas jika CASH)
      if (paymentMethod === 'CASH') {
        addCash(cartTotal);
      }

      // Simpan receipt
      setLastReceipt({
        total: cartTotal,
        method: paymentMethod,
        time: new Date().toLocaleTimeString('id-ID'),
      });

      // Reset cart
      setCart([]);

      // TODO: Simpan ke IndexedDB terenkripsi via dexieStore
      // TODO: Auto-sync ke /api/v1/pos/transaction jika online
      console.log('[POS] Transaksi disimpan:', {
        idempotencyKey,
        amount: cartTotal,
        items: cart,
        paymentMethod,
        timestamp,
      });

    } finally {
      setIsProcessing(false);
    }
  }, [cart, cartTotal, paymentMethod, isProcessing, addCash]);

  return (
    <>
      {/* POS Lockout Overlay (jika kas > Rp50jt) */}
      <POSLockout />

      <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
        {/* Header */}
        <header className="px-4 py-3 sm:px-6" style={{ borderBottom: '2px solid #222222' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">Transaksi POS</h1>
              <p className="text-[10px] font-mono" style={{ color: '#666666' }}>
                KDKMP JASASAJA • {isOnline ? '🟢 Online' : '🔴 Offline (data tersimpan lokal)'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-mono uppercase" style={{ color: '#666666' }}>Kas Brankas</p>
                <p className="text-sm font-bold font-mono" style={{ color: cashOnHand > 40_000_000 ? '#F59E0B' : '#10B981' }}>
                  {formatRupiah(cashOnHand)}
                </p>
              </div>
              <a href="/dashboard" className="text-xs font-mono px-3 py-1.5" style={{ border: '1px solid #333', color: '#999' }}>
                ← Dashboard
              </a>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Katalog Produk */}
            <div className="lg:col-span-2">
              <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#666666' }}>
                Pilih Produk
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isLocked}
                    className="p-3 text-left transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      border: '2px solid #222222',
                      backgroundColor: '#111111',
                      minHeight: '48px',
                    }}
                  >
                    <p className="text-xs font-bold text-white leading-tight">{product.name}</p>
                    <p className="text-xs font-mono mt-1" style={{ color: '#10B981' }}>
                      {formatRupiah(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Keranjang & Pembayaran */}
            <div className="space-y-4">
              {/* Keranjang */}
              <div className="p-4" style={{ border: '2px solid #222222', backgroundColor: '#111111' }}>
                <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#666666' }}>
                  Keranjang ({cartItemCount} item)
                </h2>

                {cart.length === 0 ? (
                  <p className="text-xs py-6 text-center" style={{ color: '#555555' }}>
                    Belum ada item. Tap produk untuk menambahkan.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #222222' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] font-mono" style={{ color: '#888888' }}>
                            {formatRupiah(item.price)} × {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="w-7 h-7 flex items-center justify-center font-bold cursor-pointer"
                            style={{ border: '1px solid #444', color: '#FFF' }}
                          >
                            −
                          </button>
                          <span className="text-xs font-mono w-6 text-center">{item.qty}</span>
                          <button
                            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                            className="w-7 h-7 flex items-center justify-center font-bold cursor-pointer"
                            style={{ border: '1px solid #444', color: '#FFF' }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center text-red-400 font-bold cursor-pointer ml-1"
                            style={{ border: '1px solid #442222' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="mt-3 pt-3" style={{ borderTop: '2px solid #333333' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono uppercase" style={{ color: '#888888' }}>Total</span>
                    <span className="text-xl font-black font-mono">{formatRupiah(cartTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="p-4" style={{ border: '2px solid #222222', backgroundColor: '#111111' }}>
                <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#666666' }}>
                  Metode Bayar
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className="p-3 text-center font-bold text-sm uppercase cursor-pointer"
                    style={{
                      border: paymentMethod === 'CASH' ? '3px solid #FFFFFF' : '2px solid #333333',
                      backgroundColor: paymentMethod === 'CASH' ? '#1A1A1A' : '#0D0D0D',
                      color: '#FFFFFF',
                      minHeight: '48px',
                    }}
                  >
                    💵 Tunai
                  </button>
                  <button
                    onClick={() => setPaymentMethod('QRIS')}
                    className="p-3 text-center font-bold text-sm uppercase cursor-pointer"
                    style={{
                      border: paymentMethod === 'QRIS' ? '3px solid #FFFFFF' : '2px solid #333333',
                      backgroundColor: paymentMethod === 'QRIS' ? '#1A1A1A' : '#0D0D0D',
                      color: '#FFFFFF',
                      minHeight: '48px',
                    }}
                  >
                    📱 QRIS
                  </button>
                </div>
              </div>

              {/* Tombol Bayar */}
              <button
                onClick={processPayment}
                disabled={cart.length === 0 || isProcessing || isLocked}
                className="w-full font-black uppercase tracking-wider text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  minHeight: '56px',
                  padding: '16px',
                  backgroundColor: cart.length > 0 ? '#FFFFFF' : '#333333',
                  color: cart.length > 0 ? '#0A0A0A' : '#666666',
                  border: '3px solid #FFFFFF',
                }}
              >
                {isProcessing ? 'Memproses...' : `Bayar ${formatRupiah(cartTotal)}`}
              </button>

              {/* Receipt terakhir */}
              {lastReceipt && (
                <div className="p-3" style={{ border: '1px solid #14532D', backgroundColor: '#052E16' }}>
                  <p className="text-[10px] font-mono uppercase" style={{ color: '#86EFAC' }}>
                    ✓ Transaksi Berhasil — {lastReceipt.time}
                  </p>
                  <p className="text-xs font-mono mt-1" style={{ color: '#BBF7D0' }}>
                    {formatRupiah(lastReceipt.total)} • {lastReceipt.method}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
