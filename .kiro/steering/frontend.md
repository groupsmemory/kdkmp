---
inclusion: always
---

# Aturan Frontend & State Management — KDKMP JASASAJA

## Hierarki Kebenaran

Instruksi Master Validator dan implementasi Gem 3/4 WAJIB menang atas draf awal Gem 2 dalam segala kontradiksi arsitektural.

## 1. Keamanan Penyimpanan Lokal (Enkripsi AES-GCM 256-bit)

- Dalam kondisi luring (offline), data transaksi POS WAJIB disimpan di IndexedDB browser menggunakan Dexie.js.
- Data DILARANG KERAS disimpan dalam bentuk plaintext di IndexedDB, LocalStorage, atau SessionStorage.
- Enkripsi WAJIB menggunakan native Web Crypto API dengan algoritma AES-GCM 256-bit.
- Initialization Vector (IV): 96-bit (12 bytes) yang dibangkitkan secara acak menggunakan `crypto.getRandomValues()` untuk setiap operasi enkripsi. IV TIDAK BOLEH digunakan ulang.
- Salt: 128-bit (16 bytes) unik per record untuk derivasi kunci.
- Derivasi kunci WAJIB menggunakan PBKDF2 dengan parameter:
  - Hash: SHA-256
  - Iterasi: 600.000 (standar NIST SP 800-132)
  - Panjang kunci output: 256-bit
  - Sumber: passphrase akun operator kasir yang sedang login
- Parameter `extractable` pada `deriveKey()` WAJIB di-set `false` untuk menetralisir serangan eksfiltrasi kunci melalui Cross-Site Scripting (XSS) di konsol browser.
- Hanya field `id` (idempotency key) yang boleh disimpan sebagai plaintext di IndexedDB untuk keperluan indexing pencarian.

## 2. Kepatuhan Batas Kas Brankas BPKP (POS Lockout)

- Sistem WAJIB memiliki Zustand store yang melacak `cash_on_hand` secara reaktif dari agregasi penjualan tunai lokal di IndexedDB.
- Batas kas tunai brankas gerai: **Rp50.000.000** (lima puluh juta rupiah) — sesuai ketentuan audit BPKP.
- Jika `cash_on_hand > 50.000.000`:
  - Aktifkan komponen lockout full-screen secara INSTAN (reaktif, bukan polling).
  - NONAKTIFKAN seluruh navigasi dan menu POS di level browser.
  - Blokir TOTAL antarmuka terminal kasir.
- Lockout HANYA dapat dibuka ketika operator memasukkan kode bukti setor bank dari jaringan CMS bank resmi koperasi:
  - Panjang minimum: 8 karakter
  - Format: alfanumerik
  - Setelah validasi berhasil: reset `cash_on_hand` ke 0
- Mekanisme lockout WAJIB berfungsi secara luring-aman (offline-safe) — tidak bergantung pada koneksi internet.
- Alasan regulasi: PP 60/2008 (SPIP), kepatuhan audit BPKP, mitigasi risiko penggelapan dana dan pencurian fisik di gerai desa.

## 3. Ergonomi Antarmuka untuk Operator Desa (Paruh Baya)

- Tema warna WAJIB menggunakan Mode Terang Kontras Tinggi (High-Contrast Light Mode):
  - Background: `#FFFFFF` (putih bersih)
  - Teks dan border: `#1A1A1A` (hitam pekat)
  - Alasan: keterbacaan optimal di bawah sinar matahari langsung di lingkungan gerai pedesaan terbuka.
- Semua tombol interaktif dan target input WAJIB memiliki dimensi minimum **48dp × 48dp** (48 device-independent pixels).
  - Alasan: mengeliminasi kesalahan sentuh ganda (double-press) oleh administrator desa paruh baya yang belum terbiasa menggunakan sistem ERP modern.
- Font size minimum untuk label: `text-sm` (14px). Untuk nilai moneter: `text-lg` atau lebih besar.
- Input moneter WAJIB menggunakan `inputMode="numeric"` dan menampilkan format titik ribuan Indonesia secara otomatis.
- Setiap form WAJIB memiliki label yang jelas dan deskripsi singkat dalam bahasa Indonesia sederhana.
- Gunakan `aria-live="polite"` pada elemen hasil kalkulasi yang berubah secara reaktif.
- Gunakan `aria-label` dan `aria-describedby` pada semua input dan tombol untuk aksesibilitas.

## 4. Sinkronisasi Antrean Offline

- Saat `navigator.onLine` berubah ke `true`, sistem WAJIB secara otomatis memulai sinkronisasi antrean transaksi offline ke server.
- Setiap transaksi dikirim dengan header `x-idempotency-key` yang sama dengan yang disimpan di IndexedDB.
- Jika server merespons HTTP 200 atau 201: hapus record dari IndexedDB.
- Jika server merespons HTTP 409 (idempotency conflict): hapus record dari IndexedDB (transaksi sudah diproses).
- Jika server merespons error lain atau koneksi terputus: pertahankan record di IndexedDB untuk retry berikutnya.
- Jika `navigator.onLine` berubah ke `false` di tengah proses sync: hentikan loop sync segera.
- Setup event listener `window.addEventListener('online', handler)` saat komponen dimount, dan cleanup saat unmount.

## 5. State Management (Zustand)

- Gunakan Zustand untuk state global yang bersifat reaktif dan perlu diakses lintas komponen:
  - `cash_on_hand` (POS Lockout)
  - `isLocked` (status blokir terminal)
  - `syncStatus` (status sinkronisasi offline)
- DILARANG menggunakan React Context untuk state yang memerlukan update frekuensi tinggi (performa).
- DILARANG menyimpan data sensitif (passphrase, kunci enkripsi) di Zustand store — hanya di memori lokal komponen.

## 6. Komponen Kalkulator Kepatuhan (SHU & PADes)

- Kalkulasi WAJIB dilakukan 100% client-side menggunakan React `useMemo`.
- Formula legal yang WAJIB diimplementasikan:
  ```
  SHU_bersih = Total Pendapatan - Total Beban - Penyisihan Piutang Ragu
  PADes >= 0.20 × SHU_bersih
  ```
- Komponen WAJIB menampilkan dasar hukum secara eksplisit: Inpres 17/2025, PP 11/2021 Pasal 40(2).
- Desain WAJIB mengikuti aturan brutalistik kontras tinggi (#FFFFFF, #1A1A1A) dengan tombol 48dp.
- DILARANG melakukan server round-trip untuk kalkulasi ini — zero compute cost.

## 7. Larangan Umum Frontend

- DILARANG menggunakan `alert()`, `confirm()`, atau `prompt()` — gunakan komponen UI custom.
- DILARANG menyimpan token autentikasi di LocalStorage — gunakan httpOnly cookie atau memori.
- DILARANG menggunakan `dangerouslySetInnerHTML` kecuali untuk JSON-LD schema yang sudah disanitasi.
- DILARANG menggunakan library UI pihak ketiga yang berat (Material UI, Chakra, Ant Design) — gunakan Tailwind CSS v4 native.
- DILARANG menggunakan `// TODO` atau placeholder code — semua output harus production-ready.
