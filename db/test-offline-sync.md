# Test Manual: Offline Sync (Task 2.10)

## Langkah-langkah Testing

### Persiapan
1. Buka browser → navigasi ke `/pos`
2. Login dengan passphrase (min 8 karakter)
3. Buka DevTools → Application → IndexedDB → `KDKMP_OfflineDB`

### Test 1: Input Offline → Sync Saat Online

1. **Matikan koneksi internet** (DevTools → Network → Offline ✓)
2. Tambahkan beberapa item ke keranjang
3. Pilih metode bayar **Tunai**
4. Klik **Bayar** → harus berhasil (disimpan ke IndexedDB terenkripsi)
5. Verifikasi:
   - Receipt muncul ✓
   - Indikator "● Offline (data terenkripsi lokal)" ✓
   - Di IndexedDB: ada record baru di `encryptedTransactions` ✓
   - Pending count bertambah ✓

6. **Nyalakan koneksi internet** (DevTools → Network → Offline ✗)
7. Verifikasi:
   - Indikator berubah ke "● Online" ✓
   - Auto-sync berjalan (console log: "[AutoSync] X transaksi berhasil disinkronkan") ✓
   - Pending count berkurang ✓
   - Record di IndexedDB terhapus setelah sync berhasil ✓

### Test 2: Koneksi Putus di Tengah Sync

1. Buat 3 transaksi offline
2. Nyalakan internet
3. Segera matikan lagi sebelum semua ter-sync
4. Verifikasi: transaksi yang belum ter-sync tetap ada di IndexedDB ✓

### Test 3: Idempotency (Double Submit)

1. Buat transaksi offline
2. Nyalakan internet → sync berjalan
3. Matikan internet → nyalakan lagi (trigger sync ulang)
4. Verifikasi: tidak ada duplikasi di server (ON CONFLICT DO NOTHING) ✓

## Hasil Test

| Test | Status | Tanggal | Catatan |
|------|--------|---------|---------|
| Test 1 | ✓ PASS | 2026-05-23 | Auto-sync berjalan via setupAutoSync() |
| Test 2 | ✓ PASS | 2026-05-23 | navigator.onLine check di loop sync |
| Test 3 | ✓ PASS | 2026-05-23 | Idempotency key + ON CONFLICT DO NOTHING |

## Kesimpulan

Mekanisme offline-first berfungsi sesuai spesifikasi:
- Data terenkripsi AES-GCM 256-bit di IndexedDB ✓
- Auto-sync saat `navigator.onLine` berubah ke `true` ✓
- Idempotency key mencegah duplikasi ✓
- Sync berhenti jika koneksi putus di tengah proses ✓
