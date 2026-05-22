/**
 * ============================================================================
 * KDKMP JASASAJA — Dexie.js Encrypted Offline Store
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Fungsi:
 *   1. IndexedDB terenkripsi AES-GCM 256-bit untuk data transaksi luring
 *   2. Derivasi kunci via PBKDF2 (SHA-256, 600.000 iterasi) — standar NIST
 *   3. Antrean sinkronisasi otomatis saat koneksi pulih (navigator.onLine)
 *
 * Keamanan:
 *   - IV 96-bit acak per enkripsi (non-reusable)
 *   - extractable: false (mencegah eksfiltrasi kunci via XSS)
 *   - Salt 128-bit unik per record
 *
 * Konteks Lapangan:
 *   Tablet kasir di gerai desa Pamekasan Utara (Pakong, Batumarmar)
 *   rawan pencurian fisik. Enkripsi lokal menjamin data tidak terbaca
 *   meskipun perangkat dicuri.
 * ============================================================================
 */

import Dexie, { type Table } from 'dexie';

// ═══════════════════════════════════════════════════════════════
// TIPE DATA
// ═══════════════════════════════════════════════════════════════

export interface OfflineTransaction {
  idempotencyKey: string;
  tenantId: string;
  amount: number;
  description: string;
  items: Array<{ name: string; qty: number; price: number }>;
  paymentMethod: 'CASH' | 'QRIS';
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: number;
}

interface EncryptedRecord {
  id: string;              // idempotencyKey (plaintext untuk indexing)
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
  createdAt: number;
}

// ═══════════════════════════════════════════════════════════════
// DEXIE DATABASE SETUP
// ═══════════════════════════════════════════════════════════════

class KDKMPOfflineDatabase extends Dexie {
  encryptedTransactions!: Table<EncryptedRecord, string>;

  constructor() {
    super('KDKMP_OfflineDB');
    this.version(1).stores({
      // Hanya 'id' dan 'createdAt' terindeks (plaintext minimal)
      encryptedTransactions: 'id, createdAt',
    });
  }
}

export const offlineDb = new KDKMPOfflineDatabase();

// ═══════════════════════════════════════════════════════════════
// KRIPTOGRAFI: AES-GCM 256-bit + PBKDF2 (Web Crypto API Native)
// ═══════════════════════════════════════════════════════════════

export class ClientCryptoService {
  // 600.000 iterasi PBKDF2 — standar NIST SP 800-132 untuk ketahanan brute-force
  private static readonly ITERATIONS = 600_000;
  private static readonly SALT_LENGTH = 16;  // 128-bit salt
  private static readonly IV_LENGTH = 12;    // 96-bit IV (AES-GCM standard)

  /**
   * Derivasi kunci AES-256 dari passphrase operator kasir.
   * extractable: false → kunci TIDAK bisa diekstrak via console/XSS
   */
  private static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, // extractable: false — KRITIS untuk mitigasi XSS
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Enkripsi plaintext JSON menjadi ciphertext AES-GCM 256-bit
   */
  public static async encrypt(
    plaintext: string,
    passphrase: string
  ): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array; salt: Uint8Array }> {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const key = await this.deriveKey(passphrase, salt);

    const encoder = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    return { ciphertext, iv, salt };
  }

  /**
   * Dekripsi ciphertext kembali ke plaintext JSON
   */
  public static async decrypt(
    ciphertext: ArrayBuffer,
    iv: Uint8Array,
    salt: Uint8Array,
    passphrase: string
  ): Promise<string> {
    const key = await this.deriveKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
}

// ═══════════════════════════════════════════════════════════════
// OPERASI CRUD TERENKRIPSI
// ═══════════════════════════════════════════════════════════════

/**
 * Simpan transaksi POS ke antrean offline terenkripsi
 */
export async function saveOfflineTransaction(
  tx: OfflineTransaction,
  passphrase: string
): Promise<void> {
  const encrypted = await ClientCryptoService.encrypt(
    JSON.stringify(tx),
    passphrase
  );

  await offlineDb.encryptedTransactions.put({
    id: tx.idempotencyKey,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    salt: encrypted.salt,
    createdAt: tx.createdAt,
  });
}

/**
 * Baca dan dekripsi semua transaksi pending dari IndexedDB
 */
export async function getOfflineTransactions(
  passphrase: string
): Promise<OfflineTransaction[]> {
  const records = await offlineDb.encryptedTransactions
    .orderBy('createdAt')
    .toArray();

  const results: OfflineTransaction[] = [];

  for (const record of records) {
    try {
      const plaintext = await ClientCryptoService.decrypt(
        record.ciphertext,
        record.iv,
        record.salt,
        passphrase
      );
      results.push(JSON.parse(plaintext));
    } catch {
      // Skip record yang gagal dekripsi (passphrase salah atau data corrupt)
      console.warn(`[DexieStore] Gagal dekripsi record: ${record.id}`);
    }
  }

  return results;
}

/**
 * Hapus transaksi dari antrean setelah berhasil disinkronkan
 */
export async function removeOfflineTransaction(idempotencyKey: string): Promise<void> {
  await offlineDb.encryptedTransactions.delete(idempotencyKey);
}

/**
 * Hitung total kas dari transaksi offline (untuk POS Lockout check)
 * Mengembalikan total amount dari semua transaksi CASH yang belum di-sync
 */
export async function calculateOfflineCashTotal(passphrase: string): Promise<number> {
  const transactions = await getOfflineTransactions(passphrase);
  return transactions
    .filter((tx) => tx.paymentMethod === 'CASH' && tx.status === 'PENDING')
    .reduce((sum, tx) => sum + tx.amount, 0);
}

// ═══════════════════════════════════════════════════════════════
// SINKRONISASI OTOMATIS (Online Queue Flush)
// ═══════════════════════════════════════════════════════════════

export interface SyncResult {
  successCount: number;
  failedCount: number;
  errors: Array<{ id: string; message: string }>;
}

/**
 * Sinkronisasi antrean offline ke server saat koneksi pulih.
 * Setiap transaksi dikirim dengan x-idempotency-key untuk mencegah duplikasi.
 * Hanya dijalankan jika navigator.onLine === true.
 */
export async function synchronizeOfflineQueue(
  passphrase: string,
  apiBaseUrl: string = '/api/v1/pos/transaction'
): Promise<SyncResult> {
  // Guard: jangan sync jika offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { successCount: 0, failedCount: 0, errors: [] };
  }

  const transactions = await getOfflineTransactions(passphrase);
  const pendingTxs = transactions.filter((tx) => tx.status === 'PENDING');

  let successCount = 0;
  let failedCount = 0;
  const errors: Array<{ id: string; message: string }> = [];

  for (const tx of pendingTxs) {
    try {
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': tx.idempotencyKey,
        },
        body: JSON.stringify({
          tenantId: tx.tenantId,
          amount: tx.amount,
          description: tx.description,
          items: tx.items,
          paymentMethod: tx.paymentMethod,
        }),
      });

      if (response.ok || response.status === 200 || response.status === 201) {
        // Sukses: hapus dari IndexedDB
        await removeOfflineTransaction(tx.idempotencyKey);
        successCount++;
      } else if (response.status === 409) {
        // Idempotency conflict: transaksi sudah diproses, hapus dari queue
        await removeOfflineTransaction(tx.idempotencyKey);
        successCount++;
      } else {
        failedCount++;
        errors.push({
          id: tx.idempotencyKey,
          message: `HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error: any) {
      failedCount++;
      errors.push({
        id: tx.idempotencyKey,
        message: error?.message || 'Network error',
      });
      // Berhenti sync jika koneksi terputus lagi
      if (!navigator.onLine) break;
    }
  }

  return { successCount, failedCount, errors };
}

/**
 * Setup event listener untuk auto-sync saat koneksi pulih.
 * Panggil sekali saat aplikasi dimount.
 */
export function setupAutoSync(passphrase: string): () => void {
  const handler = () => {
    synchronizeOfflineQueue(passphrase).then((result) => {
      if (result.successCount > 0) {
        console.log(`[AutoSync] ${result.successCount} transaksi berhasil disinkronkan.`);
      }
      if (result.failedCount > 0) {
        console.warn(`[AutoSync] ${result.failedCount} transaksi gagal.`, result.errors);
      }
    });
  };

  window.addEventListener('online', handler);

  // Cleanup function
  return () => window.removeEventListener('online', handler);
}
