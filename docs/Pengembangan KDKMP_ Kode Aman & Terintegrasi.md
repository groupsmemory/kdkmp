# **Cetak Biru Arsitektur Enterprise KDKMP: Sistem POS Luring-Pertama, Otomatisasi Jurnal SAK EP, Keamanan Multi-Tenant NeonDB, dan Mitigasi Transaksional Finansial**

Transformasi tata kelola ekonomi desa nasional melalui pembentukan Koperasi Desa dan Kelurahan Merah Putih (KDKMP) merupakan amanat strategis dari Instruksi Presiden (Inpres) Nomor 17 Tahun 2025\.1 PT Agrinas Pangan Nusantara (Persero), di bawah naungan portofolio super holding Danantara, ditugaskan untuk mengoperasionalkan 189 gerai percontohan di Kabupaten Pamekasan, Madura, sebelum melakukan ekspansi ke 30.000 gerai nasional.1 Guna memastikan akuntabilitas mutlak yang siap diaudit oleh Badan Pemeriksa Keuangan (BPK) dan Badan Pengawasan Keuangan dan Pembangunan (BPKP), platform software-as-a-service (SaaS) JASASAJA dirancang dengan arsitektur hibrida berkeamanan tinggi.1  
Kabupaten Pamekasan menyajikan tantangan geografis yang kontras.1 Wilayah pesisir selatan (seperti Kecamatan Pademawu) memiliki konektivitas seluler yang stabil, sedangkan wilayah perbukitan utara (seperti Kecamatan Pakong, Pegantenan, dan Batumarmar) sering mengalami kendala sinyal seluler (*blank spot*).1 Oleh karena itu, sistem KDKMP diarsitekturi dengan pendekatan luring-pertama (*offline-first*) menggunakan penyimpanan terenkripsi AES-GCM 256-bit di sisi peramban klien, serta disinkronisasikan secara aman menggunakan kunci idempotensi dua-fase di sisi server.1  
Di bawah ini dipaparkan matriks parameter operasional antarmuka berdasarkan profil pengguna KDKMP untuk memitigasi latensi jaringan dan menjamin kenyamanan operasional di lapangan 1:

| Parameter Desain | Dashboard Admin (Bapak Sukri) | Mobile Web App (Ibu Sumiati) | Analytical Dashboard (Ibu Diana) |
| :---- | :---- | :---- | :---- |
| **Tema Warna Utama** | Terang Kontras Tinggi (\#FFFFFF, \#1A1A1A) 1 | Terang Hemat Energi (\#F8F9FA, \#2D3748) 1 | Gelap Profesional (\#121212, \#00F2FE) 1 |
| **Batas Target Latensi** | \< 100 milidetik (Input transaksi lokal) 1 | \< 1,8 detik (Koneksi 3G pedesaan) 1 | \< 2,0 detik (Kueri analitik agregat) 1 |
| **Teknologi Penyimpanan** | IndexedDB lokal \+ Sinkronisasi Idempotent 1 | LocalStorage untuk token sesi \+ QR Code Generator 1 | NeonDB Read-Replicas \+ Agregasi Serverless 1 |
| **Interaksi Utama** | Pemindaian barcode kamera, tombol POS cepat 1 | Tampilan grafik sisa kuota, QR keanggotaan luring 1 | Peta spasial interaktif, filter kueri multi-tier 1 |
| **Penanganan Offline** | Transaksi disimpan lokal & dikunci jika kas \> Rp50 juta 1 | Tampilan data terakhir yang tersimpan (*cached data*) 1 | Harus selalu daring (*always-online query*) 1 |

## **Arsitektur Data Berintegritas Tinggi dan Kepatuhan Akuntansi SAK EP**

Integritas keuangan pada sistem KDKMP dijamin melalui penerapan Standar Akuntansi Keuangan Entitas Privat (SAK EP) yang mulai berlaku penuh per 1 Januari 2025\.1 Setiap mutasi keuangan wajib dicatat menggunakan metode penjurnalan ganda berpasangan (*double-entry*) secara seketika (*real-time*) di tingkat pangkalan data.1 Untuk mencegah manipulasi atau modifikasi data historis secara retrospektif, sistem menerapkan rantaian hash kriptografis (*hash chaining*).1  
Hubungan matematis rantaian hash ini dinyatakan dalam persamaan:  
![][image1]  
Dimana ![][image2] merupakan hash dari baris berjalan, ![][image3] adalah pengidentifikasi unik transaksi, ![][image4] adalah pengidentifikasi unik bagan akun (*chart of accounts*), ![][image5] adalah nilai debit, ![][image6] adalah nilai kredit, dan ![][image7] melambangkan hash kriptografis dari baris sebelumnya di dalam tabel pembukuan.1  
Berdasarkan ketentuan hukum Instruksi Presiden Nomor 17 Tahun 2025, sistem juga diwajibkan untuk mengotomatisasikan perhitungan pembagian kontribusi Pendapatan Asli Desa (PADes) minimal sebesar 20% yang diambil langsung dari Sisa Hasil Usaha (SHU) bersih tahunan koperasi.1 Formula kalkulasi kontribusi disajikan secara matematis sebagai berikut 1:  
![][image8]  
![][image9]  
Rancangan tabel database NeonDB dioptimalkan menggunakan tipe data UUID untuk mencegah kebocoran informasi antar-tenant, serta dilengkapi dengan indeks spasial guna mendukung kueri analitik berbasis wilayah geospasial.1

### **/db/schema.sql (Skema Tabel NeonDB Lengkap \+ Fungsi Trigger SAK EP)**

Skrip SQL berikut membangun seluruh tabel operasional KDKMP, mengaktifkan fitur Row-Level Security (RLS) PostgreSQL untuk memisahkan data 189 gerai Pamekasan secara mutlak, serta menyusun fungsi trigger PL/pgSQL generate\_sak\_ep\_journal\_entries().1 Fungsi trigger ini dimodifikasi secara ketat untuk mengisolasi pencarian prev\_hash menggunakan klausa WHERE tenant\_id \= NEW.tenant\_id.1 Hal ini sangat krusial untuk mengeliminasi pertikaian penguncian (*lock contention*) pada basis data saat ribuan gerai melakukan penutupan buku harian secara serempak di tingkat nasional.1

SQL  
\-- Mengaktifkan ekstensi kriptografi pgcrypto untuk kalkulasi hash SHA-256  
CREATE EXTENSION IF NOT EXISTS pgcrypto;  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\-- \==========================================  
\-- 1\. TABEL UTAMA: TENANTS (GERAI KDKMP)  
\-- \==========================================  
CREATE TABLE tenants (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    name VARCHAR(255) NOT NULL UNIQUE,  
    region VARCHAR(100) NOT NULL,        \-- Kabupaten (e.g., Pamekasan)  
    subdistrict VARCHAR(100) NOT NULL,   \-- Kecamatan (e.g., Pademawu, Larangan)  
    village VARCHAR(100) NOT NULL,       \-- Desa (e.g., Majungan)  
    latitude NUMERIC(9, 6),              \-- Koordinat spasial untuk analisis peta GEO  
    longitude NUMERIC(9, 6),             \-- Koordinat spasial untuk analisis peta GEO  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

\-- Indeks spasial regional untuk mendukung optimasi pencarian GEO/SEO  
CREATE INDEX idx\_tenants\_geography ON tenants (region, subdistrict, village);

\-- \==========================================  
\-- 2\. TABEL ACCOUNTS: CHART OF ACCOUNTS (SAK EP COMPLIANT)  
\-- \==========================================  
CREATE TABLE accounts (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  
    code VARCHAR(50) NOT NULL,  
    name VARCHAR(150) NOT NULL,  
    type VARCHAR(20) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
    CONSTRAINT unique\_tenant\_account\_code UNIQUE (tenant\_id, code)  
);

CREATE INDEX idx\_accounts\_lookup ON accounts (tenant\_id, code, type);

\-- \==========================================  
\-- 3\. TABEL TRANSACTIONS (PENGAMAN IDEMPOTENSI & AUDIT TRAIL)  
\-- \==========================================  
CREATE TABLE transactions (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  
    idempotency\_key UUID NOT NULL UNIQUE,  
    amount NUMERIC(15, 2\) NOT NULL CHECK (amount \>= 0),  
    description TEXT NOT NULL,  
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

CREATE INDEX idx\_transactions\_idempotency ON transactions (tenant\_id, idempotency\_key);

\-- \==========================================  
\-- 4\. TABEL LEDGER ENTRIES (DOUBLE-ENTRY HASH CHAINED LEDGER)  
\-- \==========================================  
CREATE TABLE ledger\_entries (  
    id BIGSERIAL PRIMARY KEY,  
    transaction\_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,  
    account\_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,  
    tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  
    debit NUMERIC(15, 2\) NOT NULL DEFAULT 0.00 CHECK (debit \>= 0),  
    credit NUMERIC(15, 2\) NOT NULL DEFAULT 0.00 CHECK (credit \>= 0),  
    prev\_hash BYTEA NOT NULL,  
    row\_hash BYTEA NOT NULL,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
    CONSTRAINT chk\_double\_entry CHECK (  
        (debit \> 0 AND credit \= 0\) OR (debit \= 0 AND credit \> 0\)  
    )  
);

\-- Indeks komposit performa tinggi untuk audit trail berantai per gerai  
CREATE INDEX idx\_ledger\_entries\_chain ON ledger\_entries (tenant\_id, id DESC);

\-- \==========================================  
\-- 5\. TABEL FARMERS (PROFIL ANGGOTA & KREDIT SAPROTAN TERTUTUP)  
\-- \==========================================  
CREATE TABLE farmers (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  
    ktp\_number VARCHAR(16) NOT NULL UNIQUE,  
    name VARCHAR(255) NOT NULL,  
    credit\_limit NUMERIC(15, 2\) NOT NULL DEFAULT 0.00 CHECK (credit\_limit \>= 0),  
    remaining\_credit NUMERIC(15, 2\) NOT NULL DEFAULT 0.00 CHECK (remaining\_credit \>= 0),  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
    CONSTRAINT chk\_credit\_limit CHECK (remaining\_credit \<= credit\_limit)  
);

CREATE INDEX idx\_farmers\_ktp ON farmers (ktp\_number, tenant\_id);

\-- \==========================================  
\-- 6\. TABEL CROP SALES (PENCATATAN HASIL BUMI LOKAL)  
\-- \==========================================  
CREATE TABLE crop\_sales (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    farmer\_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,  
    commodity\_type VARCHAR(20) NOT NULL CHECK (commodity\_type IN ('TOBACCO', 'SALT')),  
    weight NUMERIC(10, 2\) NOT NULL CHECK (weight \> 0),  
    purity\_nacl NUMERIC(5, 2\) CHECK (purity\_nacl BETWEEN 0 AND 100), \-- Spesifik Garam Pademawu  
    grade\_score VARCHAR(10),                                          \-- Spesifik Tembakau KITMAS  
    payout\_amount NUMERIC(15, 2\) NOT NULL CHECK (payout\_amount \>= 0),  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

\-- \==========================================  
\-- 7\. TABEL DAILY CLOSINGS (REKONSILIASI PENUTUPAN KAS BRANKAS)  
\-- \==========================================  
CREATE TABLE daily\_closings (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  
    closed\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP,  
    cash\_on\_hand NUMERIC(15, 2\) NOT NULL CHECK (cash\_on\_hand \>= 0),  
    is\_locked BOOLEAN NOT NULL DEFAULT FALSE,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT\_TIMESTAMP  
);

CREATE INDEX idx\_daily\_closings\_lookup ON daily\_closings (tenant\_id, closed\_at DESC);

\-- \=============================================================================  
\-- KONFIGURASI KEAMANAN: ROW-LEVEL SECURITY (RLS) MULTI-TENANT NYATA  
\-- \=============================================================================

\-- Fungsi pembantu untuk mengambil tenant\_id yang aktif dari session context Next.js  
CREATE OR REPLACE FUNCTION current\_tenant\_id() RETURNS UUID AS $$  
BEGIN  
    RETURN NULLIF(current\_setting('app.current\_tenant\_id', true), '')::UUID;  
EXCEPTION WHEN OTHERS THEN  
    RETURN NULL;  
END;  
$$ LANGUAGE plpgsql;

\-- Mengaktifkan RLS pada seluruh tabel operasional transaksional  
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;  
ALTER TABLE ledger\_entries ENABLE ROW LEVEL SECURITY;  
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;  
ALTER TABLE daily\_closings ENABLE ROW LEVEL SECURITY;

\-- Membuat policy pengisolasian data transaksional berdasarkan variabel sesi  
CREATE POLICY tenant\_isolation\_accounts ON accounts FOR ALL USING (tenant\_id \= current\_tenant\_id());  
CREATE POLICY tenant\_isolation\_transactions ON transactions FOR ALL USING (tenant\_id \= current\_tenant\_id());  
CREATE POLICY tenant\_isolation\_ledger ON ledger\_entries FOR ALL USING (tenant\_id \= current\_tenant\_id());  
CREATE POLICY tenant\_isolation\_farmers ON farmers FOR ALL USING (tenant\_id \= current\_tenant\_id());  
CREATE POLICY tenant\_isolation\_closings ON daily\_closings FOR ALL USING (tenant\_id \= current\_tenant\_id());

\-- \=============================================================================  
\-- KOREKSI MITIGASI RACE CONDITION: AUTOMATIC SAK EP LEDGER TRIGGER FUNCTION  
\-- \=============================================================================  
CREATE OR REPLACE FUNCTION generate\_sak\_ep\_journal\_entries()  
RETURNS TRIGGER AS $$  
DECLARE  
    v\_journal\_id UUID;  
    v\_prev\_hash BYTEA;  
    v\_debit\_hash BYTEA;  
    v\_credit\_hash BYTEA;  
    v\_cash\_acc\_id UUID;  
    v\_revenue\_acc\_id UUID;  
BEGIN  
    \-- Menjamin eksistensi Chart of Accounts untuk Kas (Aset)  
    SELECT id INTO v\_cash\_acc\_id   
    FROM accounts   
    WHERE tenant\_id \= NEW.tenant\_id AND code \= 'ACC-1111'   
    LIMIT 1;  
      
    IF v\_cash\_acc\_id IS NULL THEN  
        INSERT INTO accounts (tenant\_id, code, name, type)  
        VALUES (NEW.tenant\_id, 'ACC-1111', 'Kas di Tangan (Aset)', 'ASSET')  
        RETURNING id INTO v\_cash\_acc\_id;  
    END IF;

    \-- Menjamin eksistensi Chart of Accounts untuk Pendapatan Ritel (Revenue)  
    SELECT id INTO v\_revenue\_acc\_id   
    FROM accounts   
    WHERE tenant\_id \= NEW.tenant\_id AND code \= 'ACC-4100'   
    LIMIT 1;  
      
    IF v\_revenue\_acc\_id IS NULL THEN  
        INSERT INTO accounts (tenant\_id, code, name, type)  
        VALUES (NEW.tenant\_id, 'ACC-4100', 'Pendapatan Penjualan Ritel', 'REVENUE')  
        RETURNING id INTO v\_revenue\_acc\_id;  
    END IF;

    \-- Membuat entri induk transaksi penutupan buku harian  
    INSERT INTO transactions (tenant\_id, idempotency\_key, amount, description, status)  
    VALUES (NEW.tenant\_id, gen\_random\_uuid(), NEW.cash\_on\_hand, 'Penutupan Buku Harian Otomatis SAK EP', 'COMPLETED')  
    RETURNING id INTO v\_journal\_id;

    \-- \-------------------------------------------------------------------------  
    \-- ENTRI 1 (DEBIT): KAS DI TANGAN (ASSET) \[ACC-1111\]  
    \-- \-------------------------------------------------------------------------  
    \-- KOREKSI: Pencarian hash baris terakhir diisolasi ketat per gerai (tenant\_id)  
    SELECT row\_hash INTO v\_prev\_hash  
    FROM ledger\_entries  
    WHERE tenant\_id \= NEW.tenant\_id  
    ORDER BY id DESC  
    LIMIT 1;

    \-- Jika ini merupakan entri perdana untuk gerai ini, gunakan hash inisiasi (genesis)  
    IF v\_prev\_hash IS NULL THEN  
        v\_prev\_hash := decode(repeat('0', 64), 'hex');  
    END IF;

    \-- Menghitung SHA-256 hash baris Debit  
    v\_debit\_hash := digest(  
        v\_journal\_id::text || '|' || v\_cash\_acc\_id::text || '|' || NEW.cash\_on\_hand::text || '|0|' || encode(v\_prev\_hash, 'hex'),  
        'sha256'  
    );

    INSERT INTO ledger\_entries (transaction\_id, account\_id, tenant\_id, debit, credit, prev\_hash, row\_hash)  
    VALUES (v\_journal\_id, v\_cash\_acc\_id, NEW.tenant\_id, NEW.cash\_on\_hand, 0, v\_prev\_hash, v\_debit\_hash);

    \-- \-------------------------------------------------------------------------  
    \-- ENTRI 2 (KREDIT): PENDAPATAN RITEL (REVENUE) \[ACC-4100\]  
    \-- \-------------------------------------------------------------------------  
    \-- Mengambil hash baris Debit yang baru saja di-insert sebagai prev\_hash baris Kredit  
    SELECT row\_hash INTO v\_prev\_hash  
    FROM ledger\_entries  
    WHERE tenant\_id \= NEW.tenant\_id  
    ORDER BY id DESC  
    LIMIT 1;

    \-- Menghitung SHA-256 hash baris Kredit  
    v\_credit\_hash := digest(  
        v\_journal\_id::text || '|' || v\_revenue\_acc\_id::text || '|0|' || NEW.cash\_on\_hand::text || '|' || encode(v\_prev\_hash, 'hex'),  
        'sha256'  
    );

    INSERT INTO ledger\_entries (transaction\_id, account\_id, tenant\_id, debit, credit, prev\_hash, row\_hash)  
    VALUES (v\_journal\_id, v\_revenue\_acc\_id, NEW.tenant\_id, 0, NEW.cash\_on\_hand, v\_prev\_hash, v\_credit\_hash);

    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

\-- Pemicu trigger setelah baris penutupan harian berhasil dimasukkan  
CREATE TRIGGER trigger\_daily\_closing\_sak\_ep  
AFTER INSERT ON daily\_closings  
FOR EACH ROW  
EXECUTE FUNCTION generate\_sak\_ep\_journal\_entries();

## **Mekanisme Idempotensi Dua-Fase dan Kendali Laju Akses Edge**

Wilayah pegunungan terjal Pamekasan Utara seperti Pakong dan Batumarmar memiliki jaringan seluler yang tidak stabil, sehingga sering memicu pemutusan sinyal internet seluler di tengah-tengah proses pengiriman data transaksi POS.1 Tanpa pengaman idempotensi yang kokoh, pengiriman ulang (*retry*) request luring oleh browser klien dapat memicu duplikasi pencatatan keuangan ganda di NeonDB.1  
Untuk memitigasi anomali ini secara efisien, sistem mengintegrasikan Vercel Edge Middleware dengan pangkalan data terdistribusi dalam memori Upstash Redis.1 Kami menerapkan skema *2-phase lifecycle status* untuk penanganan kunci idempotensi (x-idempotency-key) 1:

* **Fase 1 (Inisiasi \- PENDING):** Di awal siklus request Next.js Middleware, kunci idempotensi diperiksa di Upstash Redis.1 Jika belum terdaftar, status diset menjadi PENDING dengan nilai *Time-to-Live* (TTL) selama 10 detik.1 Jika kunci terdeteksi dengan status PENDING, request seketika ditolak dengan kode status 409 Conflict untuk mengeliminasi thundering herd.5 Jika kunci terdeteksi dengan status COMMITTED, middleware mengembalikan salinan respon sukses yang tersimpan di cache tanpa membebani serverless function Next.js.1  
* **Fase 2 (Finalisasi \- COMMITTED / DELETED):** Jika penulisan transaksi di pangkalan data NeonDB berhasil, rute API Next.js memperbarui status kunci di Upstash menjadi COMMITTED.1 Apabila penulisan database gagal, timeout, atau mengalami interupsi koneksi, kunci tersebut dihapus dari Upstash.1 Hal ini menjamin klien aman melakukan retry tanpa risiko kehilangan data transaksi maupun duplikasi dana.1

Sistem membagi laju batasan akses (*rate limiting*) menggunakan algoritma *sliding window* berbasis IP tenant maupun ID keanggotaan untuk menjaga stabilitas ketersediaan serverless function 1:

| Segmentasi Endpoint | Parameter Rute API | Batas Laju Akses (Rate Limit) | Implikasi Proteksi |
| :---- | :---- | :---- | :---- |
| **POS Ritel Gerai** | /api/v1/pos/\* 1 | 20 permintaan per menit / IP Tenant 1 | Mencegah pemboman transaksi offline-queue.1 |
| **Penebusan Pupuk** | /api/v1/ipubers/\* 1 | 5 permintaan per menit / ID Anggota 1 | Mencegah eksploitasi manipulasi kuota subsidi.1 |
| **E-Commerce B2C** | /api/v1/commerce/\* 1 | 60 permintaan per menit / IP Publik 1 | Menangkal aktivitas scraping harga komoditas Madura.1 |

### **/middleware.ts (Next.js Edge Middleware untuk Upstash Rate Limiting & Idempotency Key 2-Phase)**

TypeScript  
import { NextRequest, NextResponse } from 'next/server';  
import { Redis } from '@upstash/redis';  
import { Ratelimit } from '@upstash/ratelimit';

// Inisialisasi koneksi aman ke Upstash Redis (Edge-compatible REST API)  
const redis \= Redis.fromEnv();

// Konfigurasi rate limiter menggunakan algoritma sliding window \[4\]  
const posLimiter \= new Ratelimit({  
  redis,  
  limiter: Ratelimit.slidingWindow(20, '1 m'),  
  prefix: 'rl:pos',  
});

const ipubersLimiter \= new Ratelimit({  
  redis,  
  limiter: Ratelimit.slidingWindow(5, '1 m'),  
  prefix: 'rl:ipubers',  
});

const commerceLimiter \= new Ratelimit({  
  redis,  
  limiter: Ratelimit.slidingWindow(60, '1 m'),  
  prefix: 'rl:commerce',  
});

export async function middleware(request: NextRequest) {  
  const ip \= request.ip?? request.headers.get('x-forwarded-for')?? 'anonymous';  
  const path \= request.nextUrl.pathname;

  // 1\. EVALUASI DAN PENEGAKAN RATE LIMITING PADA LEVEL EDGE \[4\]  
  if (path.startsWith('/api/v1/pos/')) {  
    const { success } \= await posLimiter.limit(ip);  
    if (\!success) return buildErrorResponse('Terlalu banyak permintaan transaksi POS. Batas 20/menit.', 429);  
  } else if (path.startsWith('/api/v1/ipubers/')) {  
    const memberId \= request.headers.get('x-member-id')?? ip;  
    const { success } \= await ipubersLimiter.limit(memberId);  
    if (\!success) return buildErrorResponse('Penebusan pupuk melebihi ambang batas aman. Batas 5/menit.', 429);  
  } else if (path.startsWith('/api/v1/commerce/')) {  
    const { success } \= await commerceLimiter.limit(ip);  
    if (\!success) return buildErrorResponse('Aktivasi pencarian harga dibatasi. Batas 60/menit.', 429);  
  }

  // 2\. KOREKSI ARSITEKTUR IDEMPOTENSI: 2-PHASE LIFECYCLE CONTROLLER  
  const idempotencyKey \= request.headers.get('x-idempotency-key');  
  const isWriteRequest \=.includes(request.method);

  if (isWriteRequest && idempotencyKey) {  
    const redisKey \= \`idempotency:${idempotencyKey}\`;  
      
    // Mengecek siklus hidup status kunci berjalan di Upstash  
    const cachedStatus \= await redis.get\<string\>(redisKey);

    if (cachedStatus \=== 'COMMITTED') {  
      // Fase 2 Committed: Kembalikan respon sukses yang ter-cached untuk menghemat compute server  
      const cachedResponse \= await redis.get(\`${redisKey}:response\`);  
      return new NextResponse(JSON.stringify(cachedResponse), {  
        status: 200,  
        headers: {  
          'Content-Type': 'application/json',  
          'X-Cache-Lookup': 'HIT',  
        },  
      });  
    }

    if (cachedStatus \=== 'PENDING') {  
      // Fase 1 Pending: Tolak request berulang yang dikirimkan saat proses pertama masih berjalan di DB  
      return new NextResponse(  
        JSON.stringify({ error: 'Permintaan transaksi serupa sedang diproses. Silakan tunggu.' }),  
        { status: 409, headers: { 'Content-Type': 'application/json' } }  
      );  
    }

    // Fase 1 Inisiasi: Daftarkan kunci dengan status PENDING dan TTL 10 detik di Upstash   
    await redis.set(redisKey, 'PENDING', { ex: 10 });  
  }

  return NextResponse.next();  
}

function buildErrorResponse(message: string, status: number): NextResponse {  
  return new NextResponse(JSON.stringify({ error: message }), {  
    status,  
    headers: { 'Content-Type': 'application/json' },  
  });  
}

export const config \= {  
  matcher: \['/api/v1/:path\*'\],  
};

## **Kriptografi Sisi Klien Luring-Pertama Enkripsi AES-GCM 256-Bit**

Dalam kondisi luring, tablet kasir menyimpan data transaksi anggota, sisa kas brankas, serta piutang petani ke dalam IndexedDB menggunakan Dexie.js.1 Karena tablet kasir ditaruh di lingkungan fisik gerai pedesaan yang rawan akan risiko pencurian perangkat, seluruh data sensitif wajib dienkripsi secara aman langsung di sisi klien (*client-side encryption*).1  
Sistem menolak penyimpanan plaintext dan menggunakan algoritma enkripsi Advanced Encryption Standard \- Galois/Counter Mode (AES-GCM) 256-bit dengan initialization vector (IV) sepanjang 96-bit yang dibangkitkan secara acak menggunakan fungsi entropi tinggi bawaan peramban.1  
Kunci enkripsi diturunkan secara komputasi melalui fungsi derivasi Password-Based Key Derivation Function 2 (PBKDF2) dengan hashing SHA-256 dan iterasi sebanyak 600.000 kali berdasarkan rekomendasi NIST untuk menahan serangan brute-force.1 Kunci enkripsi ini diturunkan dari passphrase akun operator kasir dan disimpan dalam memori peramban dengan status extractable: false agar terhindar dari serangan eksfiltrasi skrip jahat (*XSS*).1

                     ALUR KRIPTOGRAFI AES-GCM LURING-PERTAMA  
                       
   \+-------------------------------------------------------------------------+  
   |                        Passphrase Operator Kasir                        |  
   \+-------------------------------------------------------------------------+  
                                        |  
                                        v  
   \+-------------------------------------------------------------------------+  
   |     Derivasi Kunci Kripto PBKDF2 (SHA-256, 600.000 Iterasi, Salt)       |  
   \+-------------------------------------------------------------------------+  
                                        |  
                                        v  
   \+-------------------------------------------------------------------------+  
   |            Derived AES-GCM 256-Bit Key (extractable: false)             |  
   \+-------------------------------------------------------------------------+  
                                        |  
                                        |  
                  \+---------------------+---------------------+  
                  | Enkripsi                                  | Dekripsi  
                  v                                           v  
   \+------------------------------+            \+------------------------------+  
   | Plaintext JSON Data Transaksi|            | Encrypted Payload (IndexedDB)|  
   \+------------------------------+            \+------------------------------+  
                  |                                           ^  
                  | Enkripsi AES-GCM 256                      | Dekripsi AES-GCM 256  
                  | (IV 96-bit Acak)                          | (IV \+ Salt Terpaut)  
                  v                                           |  
   \+------------------------------+                           |  
   | Encrypted Payload (IndexedDB)| \--------------------------+  
   \+------------------------------+

### **/lib/dexieStore.ts (Setup IndexedDB Terenkripsi AES-GCM 256-bit \+ Antrean Sinkronisasi Luring)**

TypeScript  
import Dexie, { Table } from 'dexie';

export interface OfflineTransaction {  
  idempotencyKey: string;  
  tenantId: string;  
  amount: number;  
  description: string;  
  status: 'PENDING' | 'COMMITTED';  
  createdAt: number;  
}

interface EncryptedRecord {  
  id: string; // Kunci idempotensi tetap terbuka sebagai indeks pencarian primer  
  ciphertext: ArrayBuffer;  
  iv: Uint8Array;  
  salt: Uint8Array;  
}

class KDKMPDexieDatabase extends Dexie {  
  encryptedTransactions\!: Table\<EncryptedRecord, string\>;

  constructor() {  
    super('KDKMP\_OfflineDB');  
    this.version(1).stores({  
      encryptedTransactions: 'id', // Hanya field 'id' yang terindeks secara plaintext  
    });  
  }  
}

const offlineDb \= new KDKMPDexieDatabase();

/\*\*  
 \* Helper Kriptografi Native Web Crypto API untuk Proteksi Data Perangkat Lokal  
 \*/  
export class ClientCryptoService {  
  private static ITERATIONS \= 600000; // Standar kepatuhan NIST \[7\]

  private static async deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise\<CryptoKey\> {  
    const encoder \= new TextEncoder();  
    const rawKeyMaterial \= await window.crypto.subtle.importKey(  
      'raw',  
      encoder.encode(passphrase),  
      { name: 'PBKDF2' },  
      false,  
      \['deriveKey'\]  
    );

    return window.crypto.subtle.deriveKey(  
      {  
        name: 'PBKDF2',  
        salt: salt,  
        iterations: this.ITERATIONS,  
        hash: 'SHA-256',  
      },  
      rawKeyMaterial,  
      { name: 'AES-GCM', length: 256 },  
      false, // Mencegah ekstraksi kunci lewat konsol peramban   
      \['encrypt', 'decrypt'\]  
    );  
  }

  public static async encryptData(plaintext: string, passphrase: string): Promise\<Omit\<EncryptedRecord, 'id'\>\> {  
    const salt \= window.crypto.getRandomValues(new Uint8Array(16));  
    const iv \= window.crypto.getRandomValues(new Uint8Array(12)); // IV 96-bit acak \[1, 8\]  
    const derivedKey \= await this.deriveKeyFromPassphrase(passphrase, salt);  
      
    const encoder \= new TextEncoder();  
    const ciphertext \= await window.crypto.subtle.encrypt(  
      { name: 'AES-GCM', iv },  
      derivedKey,  
      encoder.encode(plaintext)  
    );

    return { ciphertext, iv, salt };  
  }

  public static async decryptData(encrypted: Omit\<EncryptedRecord, 'id'\>, passphrase: string): Promise\<string\> {  
    const derivedKey \= await this.deriveKeyFromPassphrase(passphrase, encrypted.salt);  
    const decryptedBuffer \= await window.crypto.subtle.decrypt(  
      { name: 'AES-GCM', iv: encrypted.iv },  
      derivedKey,  
      encrypted.ciphertext  
    );

    const decoder \= new TextDecoder();  
    return decoder.decode(decryptedBuffer);  
  }  
}

/\*\*  
 \* Menyimpan Transaksi POS Baru ke dalam Antrean Enkripsi Lokal  
 \*/  
export async function saveTransactionToOfflineQueue(tx: OfflineTransaction, passphrase: string): Promise\<void\> {  
  const encryptedPayload \= await ClientCryptoService.encryptData(JSON.stringify(tx), passphrase);  
  await offlineDb.encryptedTransactions.put({  
    id: tx.idempotencyKey,  
   ...encryptedPayload,  
  });  
}

/\*\*  
 \* Sinkronisasi Otomatis Antrean Offline ke Server dengan Penjagaan Kunci Idempotensi  
 \*/  
export async function synchronizeOfflineQueue(passphrase: string): Promise\<{ successCount: number; failedCount: number }\> {  
  if (\!navigator.onLine) return { successCount: 0, failedCount: 0 };

  const encryptedRecords \= await offlineDb.encryptedTransactions.toArray();  
  let successCount \= 0;  
  let failedCount \= 0;

  for (const record of encryptedRecords) {  
    try {  
      const plaintext \= await ClientCryptoService.decryptData(record, passphrase);  
      const tx: OfflineTransaction \= JSON.parse(plaintext);

      const response \= await fetch('/api/v1/pos/transaction', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          'x-idempotency-key': tx.idempotencyKey,  
        },  
        body: JSON.stringify({  
          tenantId: tx.tenantId,  
          amount: tx.amount,  
          description: tx.description,  
        }),  
      });

      if (response.status \=== 200 || response.status \=== 201\) {  
        // Hapus dari IndexedDB jika server berhasil merekam transaksi secara permanen  
        await offlineDb.encryptedTransactions.delete(record.id);  
        successCount++;  
      } else {  
        failedCount++;  
      }  
    } catch (err) {  
      console.error(\`Gagal sinkronisasi baris transaksi ID ${record.id}:\`, err);  
      failedCount++;  
    }  
  }

  return { successCount, failedCount };  
}

## **Integritas Pembayaran dan Mitigasi Pengisian Ganda Xendit**

Sebagai badan usaha di bawah Danantara, KDKMP mengintegrasikan Xendit Payment Gateway untuk menangani kas masuk berupa top-up saldo simpanan kas harian koperasi.1 Di area pedesaan dengan jangkauan internet yang sering mengalami gangguan latensi, webhook Xendit rawan mengirimkan transmisi ulang secara duplikatif (*duplicate webhook delivery*) karena kegagalan jabat tangan koneksi (*TCP Handshake timeout*).9  
Untuk mengeliminasi celah kerawanan fatal "double top-up" yang berisiko merugikan keuangan koperasi, rute API Next.js /pages/api/v1/webhook/xendit.ts menerapkan tiga lapis filter validasi 1:

1. **Otentikasi Token Webhook:** Memvalidasi header x-callback-token menggunakan token unik terenkripsi untuk menepis serangan pemalsuan payload dari luar.1  
2. **Kueri Verifikasi Status Eksistensi:** Melakukan pemeriksaan kueri seleksi (SELECT) terlebih dahulu ke basis data NeonDB dengan filter kunci transaksional external\_id untuk memastikan transaksi berstatus COMPLETED belum pernah terdaftar.1  
3. **Penyisipan Berbasis Kunci Unik (*Constraint Safeguard*):** Memanfaatkan sintaks ON CONFLICT DO NOTHING yang terikat pada indeks unik idempotency\_key di tingkat database PostgreSQL.1 Kombinasi ini menjamin integritas dana koperasi aman dari anomali race condition.1

### **/pages/api/v1/webhook/xendit.ts (API Webhook Aman & Anti-Duplikasi)**

TypeScript  
import { NextApiRequest, NextApiResponse } from 'next';  
import { Pool } from 'pg';  
import { Redis } from '@upstash/redis';

// Mengonfigurasikan pooling koneksi NeonDB PostgreSQL  
const dbPool \= new Pool({  
  connectionString: process.env.DATABASE\_URL,  
  max: 20, // Menyesuaikan batas maksimum koneksi di serverless environment  
  idleTimeoutMillis: 10000,  
});

const redis \= Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method\!== 'POST') {  
    res.setHeader('Allow', 'POST');  
    return res.status(405).json({ error: 'Metode HTTP dilarang.' });  
  }

  // KOREKSI 1: VERIFIKASI KEAMANAN WEBHOOK SENDER (X-CALLBACK-TOKEN)  
  const incomingCallbackToken \= req.headers\['x-callback-token'\];  
  if (incomingCallbackToken\!== process.env.XENDIT\_CALLBACK\_TOKEN) {  
    return res.status(401).json({ error: 'Token verifikasi tanda tangan callback tidak valid.' });  
  }

  const { external\_id, amount, status, tenant\_id, idempotency\_key } \= req.body;

  // Hanya memproses mutasi kas masuk yang telah dideklarasikan berhasil oleh Xendit  
  if (status\!== 'PAID') {  
    return res.status(200).json({ status: 'SKIPPED', message: 'Status tidak memenuhi kualifikasi rekapitulasi.' });  
  }

  const client \= await dbPool.connect();

  try {  
    // Membuka blok transaksi database terisolasi tingkat SERIALIZABLE  
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;');

    // KOREKSI 2: PREVENSI DOUBLE TOP-UP (SELECT CHECK STATUS)  
    const checkDuplicateQuery \= \`  
      SELECT status FROM transactions   
      WHERE id \= $1 AND status \= 'COMPLETED'  
      LIMIT 1 FOR UPDATE; \-- Menerapkan row-level locking untuk menghentikan race condition  
    \`;  
    const checkResult \= await client.query(checkDuplicateQuery, \[external\_id\]);

    if (checkResult.rows.length \> 0\) {  
      await client.query('ROLLBACK;');  
      return res.status(200).json({  
        status: 'ALREADY\_PROCESSED',  
        message: 'Transaksi pengisian kas ini sudah berhasil diproses sebelumnya.',  
      });  
    }

    // KOREKSI 3: PERLINDUNGAN DATABASE CONSTRAINT (ON CONFLICT DO NOTHING)  
    const insertTransactionQuery \= \`  
      INSERT INTO transactions (id, tenant\_id, idempotency\_key, amount, description, status)  
      VALUES ($1, $2, $3, $4, 'Penerimaan Kas Masuk via Webhook Xendit', 'COMPLETED')  
      ON CONFLICT (idempotency\_key) DO NOTHING  
      RETURNING id;  
    \`;  
      
    const insertResult \= await client.query(insertTransactionQuery, \[  
      external\_id,  
      tenant\_id,  
      idempotency\_key,  
      amount  
    \]);

    // Jika baris database memicu constraint key collision, insertResult tidak akan mereturn record baru  
    if (insertResult.rowCount \=== 0\) {  
      await client.query('ROLLBACK;');  
      return res.status(200).json({ status: 'CONFLICT\_PREVENTED', message: 'Konflik konkurensi dihentikan.' });  
    }

    // Mengesahkan seluruh mutasi keuangan ke NeonDB  
    await client.query('COMMIT;');

    // 4\. MEMPERBARUI STATUS LIFECYCLE IDEMPOTENSI DI UPSTASH REDIS MENJADI COMMITTED   
    const redisKey \= \`idempotency:${idempotency\_key}\`;  
    const successPayload \= { status: 'SUCCESS', transactionId: external\_id, amount };  
      
    await redis.set(redisKey, 'COMMITTED');  
    await redis.set(\`${redisKey}:response\`, successPayload);  
    await redis.expire(redisKey, 86400); // Pertahankan cache status sukses selama 24 jam \[11\]

    return res.status(200).json({ status: 'SUCCESS', transactionId: external\_id });  
  } catch (error) {  
    await client.query('ROLLBACK;');  
    console.error('Sistem Webhook Mengalami Gangguan internal. Transaksi di-Rollback:', error);  
      
    // HAPUS KUNCI PENDING DARI REDIS JIKA TRANSAKSI DB GAGAL AGAR AMAN MELAKUKAN RETRY   
    await redis.del(\`idempotency:${idempotency\_key}\`);  
      
    return res.status(500).json({ error: 'Kegagalan pemrosesan transaksi internal.' });  
  } finally {  
    client.release();  
  }  
}

## **Mekanisme Zustand & Dexie Client-Side POS Lockout Engine**

Berdasarkan mandat mitigasi risiko dari BPK dan BPKP, penumpukan uang kas tunai di brankas fisik gerai pedesaan sangat dilarang karena rentan terhadap risiko penyelewengan, kecurangan, dan perampokan fisik.1 Auditor negara menetapkan ambang batas aman penyimpanan uang kas harian di gerai maksimal sebesar Rp50.000.000,00.1  
Untuk memaksakan kepatuhan operator terhadap batasan ini, kami menyempurnakan logic *Zustand Client-Side POS Lockout Engine*.1 Logika ini bekerja secara *offline-safe* penuh 1:

* **Pengawasan Saldo Luring:** Zustand State secara berkala melakukan kueri agregasi langsung ke database IndexedDB lokal (melalui Dexie.js) untuk menjumlahkan akumulasi penjualan tunai harian berjalan tanpa bergantung pada sinyal internet.1  
* **Pemblokiran Instan:** Jika kalkulasi mendeteksi saldo kas brankas melebihi limit Rp50.000.000,00, state engine di sisi klien seketika mematikan fungsi navigasi POS secara penuh di tingkat browser.1  
* **Pembukaan Blokir Berbasis Setoran:** Sistem hanya dapat dibuka kembali ketika operator menginput kode bukti setoran tunai bank (via CMS bank) untuk mereset posisi kas di tangan kembali ke nol.1

Antarmuka dirancang dengan *Mode Terang Kontras Tinggi* menggunakan warna dominan putih bersih \#FFFFFF dan teks gelap \#1A1A1A guna menjamin keterbacaan prima saat kasir mengoperasikannya di bawah sinar terik matahari.1 Seluruh tombol interaktif dikonfigurasi dengan ukuran minimal 48dp x 48dp untuk mencegah salah sentuh oleh operator paruh baya.1

### **/components/POSLockout.tsx (Zustand State \+ Komponen Full Screen Lockout UI Terang Kontras Tinggi)**

TypeScript  
'use client';

import React, { useEffect, useState } from 'react';  
import { create } from 'zustand';  
import Dexie from 'dexie';

// Definisi skema lokal db minimum untuk keperluan verifikasi saldo kasir  
class LockoutLocalDb extends Dexie {  
  localSales\!: Dexie.Table\<{ id?: number; amount: number; description: string }, number\>;  
  constructor() {  
    super('KDKMP\_OfflineDB');  
    this.version(1).stores({  
      localSales: '++id',  
    });  
  }  
}

const db \= new LockoutLocalDb();

// ZUSTAND STATE ENGINE: SISTEM KONTROL OFFLINE-SAFE  
interface POSLockoutState {  
  cashOnHand: number;  
  isLocked: boolean;  
  limitThreshold: number;  
  evaluateLockoutState: () \=\> Promise\<void\>;  
  resetCashOnHand: (depositRef: string) \=\> Promise\<boolean\>;  
}

export const usePOSStore \= create\<POSLockoutState\>((set, get) \=\> ({  
  cashOnHand: 0,  
  isLocked: false,  
  limitThreshold: 50000000.00, // Batas maksimal kas brankas: Rp50.000.000,00 

  evaluateLockoutState: async () \=\> {  
    // KOREKSI: Evaluasi langsung ke IndexedDB lokal secara offline-safe  
    const sales \= await db.localSales.toArray();  
    const totalCash \= sales.reduce((sum, item) \=\> sum \+ item.amount, 0);  
      
    const shouldLock \= totalCash \> get().limitThreshold;  
    set({ cashOnHand: totalCash, isLocked: shouldLock });  
  },

  resetCashOnHand: async (depositRef: string) \=\> {  
    if (depositRef.trim().length \>= 8\) {  
      // Hapus seluruh transaksi kas lokal dari IndexedDB setelah dana disetorkan ke bank  
      await db.localSales.clear();  
      set({ cashOnHand: 0, isLocked: false });  
      return true;  
    }  
    return false;  
  }  
}));

export default function POSLockoutEngine() {  
  const { isLocked, cashOnHand, limitThreshold, evaluateLockoutState, resetCashOnHand } \= usePOSStore();  
  const \= useState('');  
  const \[validationError, setValidationError\] \= useState('');

  // Lakukan pengawasan mutasi kas lokal di IndexedDB secara berkala  
  useEffect(() \=\> {  
    evaluateLockoutState();  
    const interval \= setInterval(evaluateLockoutState, 5000); // Polling lokal setiap 5 detik  
    return () \=\> clearInterval(interval);  
  },);

  const handleSubmitDeposit \= async (e: React.FormEvent) \=\> {  
    e.preventDefault();  
    const isApproved \= await resetCashOnHand(depositCode);  
    if (isApproved) {  
      setDepositCode('');  
      setValidationError('');  
    } else {  
      setValidationError('Kode validasi penyerahan kas salah atau kurang dari 8 karakter.');  
    }  
  };

  if (\!isLocked) return null;

  return (  
    \<div className="fixed inset-0 z- flex flex-col items-center justify-center bg-\[\#FFFFFF\] p-6 text-\[\#1A1A1A\] font-sans"\>  
      \<div className="w-full max-w-lg border-8 border-\[\#1A1A1A\] p-8 shadow-\[12px\_12px\_0px\_0px\_\#1A1A1A\]"\>  
        {/\* Banner Peringatan Kontras Tinggi \*/}  
        \<div className="mb-6 bg-\[\#1A1A1A\] py-4 text-center text-2xl font-black tracking-widest text-\[\#FFFFFF\]"\>  
          SISTEM POS TERKUNCI (LOCKOUT)  
        \</div\>

        \<h3 className="mb-4 text-lg font-bold leading-tight"\>  
          Batas Kas Tunai Maksimum Rp{limitThreshold.toLocaleString('id-ID')} Telah Terlampaui\!  
        \</h3\>  
          
        \<p className="mb-6 text-sm leading-relaxed text-\[\#1A1A1A\]"\>  
          Berdasarkan instruksi mitigasi risiko finansial \<strong\>BPKP RI\</strong\>, operasional transaksi penjualan dihentikan luring secara instan di peramban ini.   
          Anda diwajibkan menyetorkan sisa kas brankas fisik ke Bank terdekat menggunakan CMS.  
        \</p\>

        {/\* Panel Neraca Kas \*/}  
        \<div className="mb-6 border-4 border-double border-\[\#1A1A1A\] bg-\[\#F3F4F6\] p-4 text-center"\>  
          \<span className="block text-xs font-bold uppercase tracking-wider text-gray-600"\>SALDO KAS GERAI SAAT INI\</span\>  
          \<span className="text-3xl font-black text-"\>  
            Rp {cashOnHand.toLocaleString('id-ID')}  
          \</span\>  
        \</div\>

        {/\* Form Pemulihan Layar Kasir \*/}  
        \<form onSubmit={handleSubmitDeposit} className="space-y-4"\>  
          \<div className="flex flex-col"\>  
            \<label htmlFor="depositCode" className="mb-2 text-xs font-black uppercase tracking-wider"\>  
              Masukkan Kode Referensi Setoran Bank (Minimum 8 Karakter)  
            \</label\>  
            \<input  
              id="depositCode"  
              type="text"  
              required  
              value={depositCode}  
              onChange={(e) \=\> setDepositCode(e.target.value)}  
              placeholder="CONTOH: BANK-CMS-881273"  
              className="h-12 w-full border-2 border-\[\#1A1A1A\] px-4 font-mono text-base font-bold focus:bg-gray-100 focus:outline-none"  
              style={{ minHeight: '48px' }} // Penyesuaian target sentuh ergonomis   
            /\>  
          \</div\>

          {validationError && (  
            \<div className="border border- bg-\[\#FEE2E2\] p-3 text-xs font-bold text-"\>  
              {validationError}  
            \</div\>  
          )}

          \<button  
            type="submit"  
            className="flex h-14 w-full items-center justify-center bg-\[\#1A1A1A\] text-base font-black uppercase tracking-wider text-\[\#FFFFFF\] transition-colors duration-150 hover:bg-gray-800"  
            style={{ minHeight: '48px' }} // Tombol ukuran besar mencegah salah tekan operator paruh baya   
          \>  
            Verifikasi & Aktifkan Mesin Kasir  
          \</button\>  
        \</form\>  
      \</div\>  
    \</div\>  
  );  
}

## **Panduan Langkah-Demi-Langkah Implementasi Tiga Pilar**

Buku panduan operasional terpisah ini disusun guna menyelaraskan koordinasi eksekusi antara pengembang perangkat lunak, petugas administrasi koperasi, serta masyarakat tani di lapangan.1

                     \+---------------------------------------+  
                     | SIKLUS OPERASIONAL TRANSANKSIONAL     |  
                     \+---------------------------------------+  
                                         |  
                                         v  
                      \+-------------------------------------+  
                      | 1\. KLIEN (Ibu Sumiati \- Petani)     |  
                      |    \- Menampilkan QR Code Keanggotaan|  
                      |      secara luring dari ponsel      |  
                      \+-------------------------------------+  
                                         |  
                                         v  
                      \+-------------------------------------+  
                      | 2\. KASIR (Bapak Sukri \- Admin)       |  
                      |    \- Memindai QR Code & input barang |  
                      |    \- Transaksi terenkripsi disimpan |  
                      |      di IndexedDB (Luring-Pertama)   |  
                      \+-------------------------------------+  
                                         |  
                                         v  
                      \+-------------------------------------+  
                      | 3\. VALIDASI (Zustand & Middleware)  |  
                      |    \- Cek limit brankas Rp50 juta     |  
                      |    \- Kirim via idempotensi 2-fase    |  
                      \+-------------------------------------+  
                                         |  
                                         v  
                      \+-------------------------------------+  
                      | 4\. DATABASE (NeonDB PostgreSQL)     |  
                      |    \- Verifikasi RLS Multi-Tenant    |  
                      |    \- Penjurnalan SAK EP via Trigger |  
                      \+-------------------------------------+

### **A. Panduan Teknis untuk Pengembang (Developer Onboarding Manual)**

Panduan ini disusun khusus untuk Mas Sabrun guna melakukan pemasangan (*setup*) komponen serverless, inisiasi database, hingga verifikasi kunci idempotensi.1

#### **Langkah 1: Migrasi Skema NeonDB & Penyiapan Trigger SAK EP**

Hubungkan terminal query SQL Anda ke klaster NeonDB PostgreSQL, lalu eksekusi seluruh isi file /db/schema.sql.1 Pastikan ekstensi pgcrypto terinstal dengan sukses demi kelancaran fungsi trigger hash berantai.12 Jalankan perintah berikut untuk mengonfirmasi keterbacaan skema:

SQL  
SELECT table\_name FROM information\_schema.tables WHERE table\_schema \= 'public';

#### **Langkah 2: Konfigurasi Environtment Variables Vercel**

Daftarkan variabel lingkungan berikut pada dasbor administrasi Vercel Anda untuk memastikan fungsi Upstash Redis dan webhook dapat saling berkomunikasi 1:

Cuplikan kode  
DATABASE\_URL="postgres://\[username\]:\[password\]@\[neon-host\]/kdkmp\_db?sslmode=require"  
UPSTASH\_REDIS\_REST\_URL="https://\[endpoint\].upstash.io"  
UPSTASH\_REDIS\_REST\_TOKEN="\[token\_rest\_api\_redis\_upstash\]"  
XENDIT\_CALLBACK\_TOKEN="\[token\_callback\_webhook\_dari\_dashboard\_xendit\]"

#### **Langkah 3: Pengujian Validasi Kebocoran Data (RLS Test)**

Untuk memastikan data antar-gerai terpisah secara mutlak, Mas Sabrun wajib melakukan pengujian integrasi RLS PostgreSQL menggunakan kueri berikut 1:

SQL  
\-- Mengatur session context ke gerai Pamekasan (Tenant A)  
SET app.current\_tenant\_id \= 'c4d7e9b8-1234-5678-abcd-000000000001';  
SELECT \* FROM accounts; \-- Hanya menampilkan bagan akun milik Tenant A

\-- Berpindah session context ke gerai Malang (Tenant B)  
SET app.current\_tenant\_id \= 'e1f2a3b4-5678-1234-bcde-000000000002';  
SELECT \* FROM accounts; \-- Hanya menampilkan bagan akun milik Tenant B

### **B. Panduan Operasional Praktis untuk Admin Koperasi (Bapak Sukri)**

Panduan ini ditujukan bagi Bapak Sukri untuk mempermudah operasional pencatatan harian di dalam gerai fisik KDKMP.1

#### **Langkah 1: Prosedur Pengambilan Logistik Menggunakan Kode QR**

1. Hidupkan perangkat tablet Android gerai Anda, masuk ke aplikasi **JASASAJA POS** menggunakan kata sandi operasional Anda.1  
2. Sentuh menu **Penerimaan Logistik BUMN** di halaman beranda.1  
3. Kamera tablet akan menyala otomatis. Arahkan kamera ke **Kode QR Surat Jalan** yang diserahkan oleh sopir armada truk PT Agrinas.1  
4. Aplikasi akan menampilkan daftar sembako masuk secara otomatis.1 Periksa kesesuaian fisik muatan, lalu tekan tombol **Selesaikan Penerimaan** untuk memperbarui kartu stok digital koperasi tanpa perlu menulis manual di buku fisik.1

#### **Langkah 2: Proses Rekonsiliasi Kas dan Penutupan Buku Harian**

1. Setiap sore sebelum gerai tutup, tekan tombol **Tutup Buku Harian**.1  
2. Sistem akan menghitung akumulasi penjualan kas di hari tersebut secara otomatis.1  
3. Jika kas di tangan aman (di bawah Rp50.000.000,00), buku harian langsung terkunci dan terjurnal secara otomatis ke dalam pembukuan SAK EP.1  
4. Apabila kas di tangan melebihi batas Rp50.000.000,00, tablet akan mengunci dan menampilkan **Peringatan Lockout**.1 Anda wajib membawa uang fisik tersebut ke loket bank terdekat untuk melakukan setoran.1  
5. Masukkan nomor referensi setoran bank yang tercantum di struk ATM/bukti transfer ke dalam kolom aplikasi untuk mengaktifkan kembali mesin kasir.1

### **C. Panduan Ringkas untuk Anggota Petani (Ibu Sumiati)**

Panduan ini ditujukan bagi Ibu Sumiati (anggota tani) untuk mempermudah penebusan kebutuhan tani dan penjualan hasil panen secara adil.1

#### **Langkah 1: Cara Menebus Pupuk Subsidi Tanpa Uang Tunai**

1. Kunjungi gerai KDKMP terdekat dengan membawa ponsel pintar Anda.1  
2. Jalankan aplikasi **KDKMP Mobile**, lalu pilih menu **Kartu Anggota Digital**.1  
3. Tunjukkan gambar **Kode QR** yang muncul di layar HP Anda kepada Bapak Sukri.1 Kode QR ini tetap dapat dimunculkan meskipun Anda sedang berada di sawah tanpa sinyal internet.1  
4. Bapak Sukri akan memindai Kode QR Anda, lalu memberikan pupuk subsidi sesuai kuota digital i-Pubers Anda.1 Penebusan ini langsung memotong saldo **Kredit Usaha Tani** Anda secara otomatis tanpa perlu membawa uang tunai.1

#### **Langkah 2: Cara Penjualan Panen Tembakau & Garam Melalui Koperasi**

1. Bawa hasil panen tembakau Rajangan Madura atau garam geomembran Anda ke gudang koperasi.1  
2. Petugas akan melakukan uji mutu panen menggunakan alat ukur digital.1 Kadar garam (NaCl) atau kelembutan daun tembakau Anda akan terbaca secara objektif oleh sistem.1  
3. Harga beli standar pemerintah akan langsung muncul secara transparan di layar ponsel Anda.1  
4. Hasil uang penjualan tersebut akan dipotong otomatis untuk mencicil pinjaman Kredit Usaha Tani yang jatuh tempo, dan sisa keuntungan bersih akan langsung masuk ke dompet digital Anda secara instan.1

#### **Karya yang dikutip**

1. Riset Koperasi BUMN Pamekasan.pdf  
2. Built a local-first prompt manager where your data never leaves the browser — technical breakdown after 26 beta testers \- Reddit, diakses Mei 22, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1rjnupj/built\_a\_localfirst\_prompt\_manager\_where\_your\_data/](https://www.reddit.com/r/LocalLLaMA/comments/1rjnupj/built_a_localfirst_prompt_manager_where_your_data/)  
3. How to Secure Multi-Tenant Data with Row-Level Security in PostgreSQL \- OneUptime, diakses Mei 22, 2026, [https://oneuptime.com/blog/post/2026-01-25-row-level-security-postgresql/view](https://oneuptime.com/blog/post/2026-01-25-row-level-security-postgresql/view)  
4. How to Use Redis for Next.js Rate Limiting at the Edge \- OneUptime, diakses Mei 22, 2026, [https://oneuptime.com/blog/post/2026-03-31-redis-nextjs-edge-rate-limiting/view](https://oneuptime.com/blog/post/2026-03-31-redis-nextjs-edge-rate-limiting/view)  
5. stacks0x/idempotix: idempotency library \- GitHub, diakses Mei 22, 2026, [https://github.com/stacks0x/idempotix](https://github.com/stacks0x/idempotix)  
6. pain-tracker/docs/engineering/ARCHITECTURE.md at main \- GitHub, diakses Mei 22, 2026, [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md)  
7. The Ultimate Developer's Guide to AES-GCM: Encrypt and Decrypt with JavaScript and the Web Cryptography API | by Thomas Dudek | Medium, diakses Mei 22, 2026, [https://medium.com/@thomas\_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6](https://medium.com/@thomas_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6)  
8. Handling webhooks \- Xendit Docs, diakses Mei 22, 2026, [https://docs.xendit.co/docs/handling-webhooks](https://docs.xendit.co/docs/handling-webhooks)  
9. How to validate if the webhook is sent from Xendit?, diakses Mei 22, 2026, [https://help.xendit.co/hc/en-us/articles/360038072991-How-to-validate-if-the-webhook-is-sent-from-Xendit](https://help.xendit.co/hc/en-us/articles/360038072991-How-to-validate-if-the-webhook-is-sent-from-Xendit)  
10. Idempotency in Distributed Transaction Systems | The ByteDoodle Blog, diakses Mei 22, 2026, [https://blog.bytedoodle.com/idempotency-in-distributed-transaction-systems/](https://blog.bytedoodle.com/idempotency-in-distributed-transaction-systems/)  
11. Hash a column in postgres using sha-256 \- Stack Overflow, diakses Mei 22, 2026, [https://stackoverflow.com/questions/13683533/hash-a-column-in-postgres-using-sha-256](https://stackoverflow.com/questions/13683533/hash-a-column-in-postgres-using-sha-256)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAaCAYAAABGiCfwAAAA20lEQVR4Xu2UAQ3CMBBFTwMW0IAFLGABC1jAARKQgAMc4AADEwB7aX9oLrcSRpdA0pdcsu2Pu/7+UbNO5wO2Yz2COmT9FmjXrM3mYqnRzgv2WtDZC3O5W2oYcbSk7b0wh7XVt4fn6Lz3NayYZjiIQMN5E8hCHwX5lMWzRfJiu3xJ63lVUV7k4/mJ/9dmrJOlAwCN994uiB/V8tJR5fOiOa4HSz2AHtHuTJ6HciC3ZZULYgADcSfKwc1huM5RhjT7iCJwu8rXOMQpO9PcHTGQp2CYBi6CXE3dd/6UJ0XCVzmBtAfNAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAaCAYAAADBuc72AAABMElEQVR4Xu2WbQ0CMRBEqwELaMACFrCABSzgAAlIwAEOcIABBMC9lCGbTa8HYcvxoy/ZcL1+TfemLSl1Op0mbIe4F2JnGz3Lvo2N6xDHIRbq0IpTyhNufIUDQTf/cmCdct0lNRbLJAitsUy5DYsqgVjq974iCgk4+wqHbOJtYZENmiABU5nAg7Rb+QqDPNsECeDT1Rjzp6Wp0Ah/gjzKhgon0p+HlNvwG06kP2UNFi+mxn2bKH/qQrAZ5zytWeUjIvxJllkEixb0wU6MT1ZJBO94VplQuQoTfONPMsYkiCxNhhA/Nn3YbIzJLVjq92LsfvedxtopyBZZtJ60lIQCCVLfv8AK9Yshq6VFzAJCdabar8UzWcXz/ivOgvyIGPytDaYjTOduzT4/penfvk5nLh41RXdWZKdVBgAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAaCAYAAAAe97TpAAABSUlEQVR4Xu2WYQ3CMBSEqwELaMACFrCABSzgAAlIwAEOcIABBEC/jEuaS9f9oLSB9EuaQV+33mvfrQthMBj8PfvYnpl2SAe9//uYtN1jO8e20g09uIRJzM4DBmIf3hnZhil2Cx0TQQBJlFiHaQwJ5yAR4kcPtEDirh4wVHpeaikqreZI3NIKUvOM23ggQR5pjsRRDiXm/JDSLYkafgB5AnM3paYfTmEaw7UpNf2gcmNhmlLLDzoMSzv1NWr4gd0hQRbE++ljl/00J0bZeYzDln7FFuFBn/iBiZmIBHITIk6JSyywKCwe99NUpiQgLfwu7fzs95ILmRunpu+lkgeI8RzGSSDz5BaOPtfQHYklETz3k0mwW3phUIoSSR+lIh8oSU+Okur2MSnkCcoJo3IIyhcSzFXnCoIZr5eBe7AbMu8cOT8t3TMYDIwXofuEw8LSK7YAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAZCAYAAAA8CX6UAAAAqElEQVR4Xu2TWw3DMAxFjWEUiqEURmEUSqGQBqEMymAMRmAA1py5liIr9vIxaT85kr98c/1qRQZ/Yy7xTuJVYjt1XdxFH/oHU4ld1NDnmjxFxS0uojkMU6hKN4wQgQkatCGLqGj1iQozuvpETbSfmi6jbD+GXZF9NenZz01U8/CJmm9j2XeWFfqQjcUYdEGEI0E2FpekCLnQhHbpwhbow36L9EKDwS84AE5BOLDLwSB0AAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAAAv0lEQVR4Xu2SbQ2DMBCGqwELaMACFrCAhVnAwSTMCQ4QMgHjnq3Njt61EH4SnuRNA9fedwg3e7SiXjTEM9GIOvVt4PIseoteoime/MPpEu+4PEWf8HtEJA2PsCEXomAcc4OC6MjwCP/INSiDLDeQKvWiPO0cHJj6iUp049mBJhqoCQeM6xSps3vpF6mORkGp7gLRvCMOaKBLmn+tB9wp2tMYaabXBx7XlusLteFA7z9jJe1iZA8csZXIbdjN5VgBd1suIbSymG4AAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAABFklEQVR4Xu2VYQ3CQAxGqwELaMACFrCABSzgAAlIwAEOcIABBMBebg2XprfsGNndj76kCaxb77v2u00kCILu2A/xduI05h9O7j7mmnOTJOhgE/Ld2NUmWvOUJMzjLCl3tImWbGV67Fwnz33dQAcRRUc9yDGJrsCrevjwbx5c69rP2MCG5sLPBibqvbWKtPQzYrEd9Uvru6ifKWBZ6/3MNKtE//J+3g1xkTRScty3ZGNVoll8ys/6Cbd+ZgGm8JJUA6jhTWsOs0Tr2G1oR7X7eeQbQyiL0G0l3wD1yZfCbm6W6H/AQnriEbvksK4mmu5vxt90nEWZlHa7hlVEM178riBahdfAWeE5rEW92uer0S6X/gdBMMEHZBFpg2n4TJsAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,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>