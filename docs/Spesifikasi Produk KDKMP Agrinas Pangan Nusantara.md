# **Cetak Biru Arsitektur Enterprise dan Spesifikasi Produk KDKMP JASASAJA: Transformasi Tata Kelola Koperasi Desa Nasional**

## **1\. Blueprint dan Model Arsitektur Modular**

Sistem manajemen digital Koperasi Desa dan Kelurahan Merah Putih (KDKMP) dirancang sebagai arsitektur kelas dunia yang mengedepankan ketahanan tinggi, keamanan data mutlak, dan kesiapan audit menyeluruh.1 Skema tata kelola dirancang menggunakan pendekatan hibrida untuk menjembatani operasional luring di wilayah pedesaan terpencil dengan kebutuhan pengawasan waktu nyata oleh PT Agrinas Pangan Nusantara di Jakarta.1  
Aplikasi dirancang dengan model arsitektur *Isolated-Tenant per Gerai* secara logis di dalam satu klaster basis data terdistribusi NeonDB.1 Melalui konfigurasi Row-Level Security (RLS) pada PostgreSQL, data operasional setiap gerai dipisahkan secara mutlak menggunakan pengidentifikasi unik tenant\_id.3 Pendekatan ini meminimalkan risiko kebocoran data antar-gerai sekaligus menyederhanakan agregasi data nasional untuk audit BPK dan BPKP.1

### **Arsitektur Sistem Global dan Aliran Data**

Cuplikan kode  
graph TD  
    %% Client Tier  
    subgraph Client\_Tier  
        A1 \--\>|HTTPS / AES-GCM 256| B  
        A2 \--\>|HTTPS / Local State| B  
        B  
    end

    %% Network & Edge Tier  
    subgraph Edge\_Tier  
        B \--\>|Sync Queue via HTTPS| C\[Vercel Edge Middleware\]  
        C \--\>|Geo Routing & Latency Optimization| D  
        E \<--\>|DDoS Protection & API Rate Limit| D  
    end

    %% Database Tier  
    subgraph Database\_Tier  
        D \--\>|Idempotent Write Request| F  
        F \--\> G  
        subgraph Database\_Schemas  
            G1  
            G2  
        end  
        G \--\> Database\_Schemas  
        G \--\>|DB Trigger Event| H  
        G \--\>|Hash-Chaining Trigger| I  
    end

    %% Third-Party Integrations  
    subgraph Integrasi\_Eksternal  
        D \<--\>|Sync Kuota Pupuk| J\[i-Pubers API\]  
        D \<--\>|Gateway Pembayaran Kas Masuk| K\[Xendit Payment Gateway\]  
        D \<--\>|B2C E-Commerce Courier Rates| L  
    end

    %% Enterprise Consumer Tier  
    subgraph Corporate\_Tier  
        M \--\>|Analytical Queries| G2  
    end

### **Struktur Navigasi Aplikasi**

Struktur navigasi dirancang sangat intuitif dengan memisahkan hak akses secara ketat berdasarkan peran pengguna guna meminimalkan kesalahan operasional di lapangan.1

Cuplikan kode  
graph TD  
    Root \--\> Login{Pemeriksaan Peran Sesi}  
      
    %% Bapak Sukri \- Admin Koperasi  
    Login \--\>|Admin Desa \- Bapak Sukri| Admin\_Home  
    Admin\_Home \--\> POS\_Terminal  
    Admin\_Home \--\> Goods\_Rec  
    Admin\_Home \--\> Ledger\_Closing  
    Admin\_Home \--\> Local\_Audit

    %% Ibu Sumiati \- Petani  
    Login \--\>|Anggota Petani \- Ibu Sumiati| Farmer\_Portal  
    Farmer\_Portal \--\> KUT\_Balance  
    Farmer\_Portal \--\> iPubers\_Status  
    Farmer\_Portal \--\> Sell\_Crop  
    Farmer\_Portal \--\> Member\_QR

    %% Ibu Diana \- Eksekutif PT Agrinas  
    Login \--\>|Eksekutif BUMN \- Ibu Diana| HQ\_Dashboard  
    HQ\_Dashboard \--\> National\_Map  
    HQ\_Dashboard \--\> Audit\_Trail  
    HQ\_Dashboard \--\> SCM\_Fleet  
    HQ\_Dashboard \--\> Financial\_Consol

## **2\. Arsitektur Data dan Skema Database (NeonDB PostgreSQL)**

Keamanan, integritas keuangan, dan sifat anti-manipulasi dari pangkalan data dijamin melalui penerapan skema relasional terstruktur pada NeonDB.1 Basis data dilengkapi dengan tabel buku besar keuangan, data keanggotaan, pencatatan komoditas lokal, serta jejak audit terenkripsi.1

Cuplikan kode  
erDiagram  
    TENANTS ||--o{ ACCOUNTS : "has"  
    TENANTS ||--o{ TRANSACTIONS : "processes"  
    ACCOUNTS ||--o{ LEDGER\_ENTRIES : "contains"  
    TRANSACTIONS ||--o{ LEDGER\_ENTRIES : "records"  
    FARMERS ||--o{ TRANSACTIONS : "initiates"  
    FARMERS ||--o{ CROP\_SALES : "sells"  
    TRANSACTIONS ||--o{ CROP\_SALES : "offset"  
    DAILY\_CLOSINGS ||--|| TENANTS : "finalizes"

Skema tabel dirancang menggunakan tipe data yang dioptimalkan untuk performa kueri tinggi dan efisiensi penyimpanan pada platform serverless PostgreSQL.6

### **Tabel Utama Pangkalan Data**

| Nama Tabel | Kolom Utama & Tipe Data | Aturan Integritas / Constraints | Relevansi Fungsional & Kepatuhan |
| :---- | :---- | :---- | :---- |
| tenants | id UUID PK, name VARCHAR, region VARCHAR, created\_at TIMESTAMPTZ | UNIQUE(name) | Mendukung pemisahan data logis untuk 189 gerai Pamekasan hingga 30.000 gerai nasional.1 |
| accounts | id UUID PK, tenant\_id UUID FK, code VARCHAR, name VARCHAR, type VARCHAR | FOREIGN KEY(tenant\_id) REFERENCES tenants(id), CHECK(type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')) 8 | Standardisasi struktur bagan akun (*Chart of Accounts*) sesuai kepatuhan akuntansi SAK EP.1 |
| transactions | id UUID PK, tenant\_id UUID FK, idempotency\_key UUID UNIQUE, amount NUMERIC, description TEXT, status VARCHAR | FOREIGN KEY(tenant\_id) REFERENCES tenants(id) 10 | Menampung transaksi harian dengan pengaman *idempotency key* untuk mengeliminasi duplikasi data luring.10 |
| ledger\_entries | id BIGSERIAL PK, transaction\_id UUID FK, account\_id UUID FK, debit NUMERIC, credit NUMERIC, row\_hash BYTEA, prev\_hash BYTEA | CHECK((debit \> 0 AND credit \= 0\) OR (debit \= 0 AND credit \> 0)) 4, FOREIGN KEY(transaction\_id) REFERENCES transactions(id) | Implementasi pencatatan jurnal ganda anti-manipulasi menggunakan pendekatan rantaian hash kriptografis (*hash chaining*).4 |
| farmers | id UUID PK, tenant\_id UUID FK, ktp\_number VARCHAR UNIQUE, name VARCHAR, credit\_limit NUMERIC, remaining\_credit NUMERIC | CHECK(remaining\_credit \<= credit\_limit) | Registrasi profil petani anggota untuk kontrol penyaluran kredit saprotan tertutup (*closed-loop*).1 |
| crop\_sales | id UUID PK, farmer\_id UUID FK, commodity\_type VARCHAR, weight NUMERIC, purity\_nacl NUMERIC, grade\_score VARCHAR, payout\_amount NUMERIC | FOREIGN KEY(farmer\_id) REFERENCES farmers(id), CHECK(commodity\_type IN ('TOBACCO', 'SALT')) 1 | Pencatatan hasil tani (Tembakau KITMAS / Garam Pademawu) lengkap dengan metrik mutu hasil uji laboratorium.1 |
| daily\_closings | id UUID PK, tenant\_id UUID FK, closed\_at TIMESTAMPTZ, cash\_on\_hand NUMERIC, is\_locked BOOLEAN | FOREIGN KEY(tenant\_id) REFERENCES tenants(id) 1 | Perekaman penutupan kas harian untuk penegakan batas brankas tunai Rp50.000.000,00.1 |

## **3\. UI/UX Grand Design (Konsep Antarmuka Pengguna)**

Pengembangan antarmuka pengguna memprioritaskan prinsip kegunaan (*usability*) ekstrem yang disesuaikan secara presisi dengan kondisi riil di pedesaan, keterbatasan bandwidth internet, serta kebutuhan pemantauan tingkat korporat.1

### **A. Dashboard Admin Sederhana (Bapak Sukri \- Administrator Desa)**

Desain antarmuka dirancang dengan tema terang (*high-contrast light mode*) menggunakan warna dasar putih bersih (\#FFFFFF) dan teks hitam gelap (\#1A1A1A) untuk menjamin keterbacaan optimal di bawah sinar matahari langsung.1 Ukuran tombol interaktif diatur minimal 48dp x 48dp untuk mencegah salah sentuh oleh operator paruh baya yang belum terbiasa menggunakan sistem ERP modern.1  
Sistem menampilkan widget kas kasir berukuran besar di sudut kanan atas.1 Jika saldo kas fisik harian di kasir terdeteksi melampaui limit Rp50.000.000,00, sistem secara instan menampilkan modal pemblokiran penuh (*full-screen lockout overlay*).1 Seluruh tombol transaksi penjualan akan dinonaktifkan secara otomatis pada tingkat peramban lokal (IndexedDB), disertai instruksi penyetoran sisa kas ke bank melalui Cash Management System (CMS).1

### **B. Mobile Web App Hemat Kuota (Ibu Sumiati \- Anggota Petani)**

Antarmuka ini dirancang menggunakan pendekatan aplikasi web progresif (*Progressive Web App*) yang sangat ringan.1 Konsumsi data internet diminimalkan dengan meniadakan pustaka ikon pihak ketiga dan aset gambar non-esensial.1 Seluruh rendering grafis memanfaatkan font bawaan sistem operasi (*system-native fonts*) untuk menekan ukuran pengunduhan awal di bawah 100 KB.1  
Halaman utama secara vertikal menampilkan kartu digital kuota kredit usaha tani tertutup (*closed-loop*) beserta rincian sisa kuota pupuk subsidi yang terintegrasi secara real-time dengan basis data i-Pubers.1 Fitur terpenting adalah kode QR keanggotaan terenkripsi yang dapat dimunculkan meskipun dalam kondisi luring tanpa sinyal internet.1 Kode QR ini memuat data KTP dan token sesi lokal terenkripsi untuk dipindai oleh Bapak Sukri saat transaksi langsung di gerai koperasi.1

### **C. Data-Rich Analytical Dashboard (Ibu Diana \- Eksekutif PT Agrinas Jakarta)**

Dirancang khusus untuk kebutuhan pemantauan tingkat tinggi di kantor pusat Jakarta, antarmuka ini mengadopsi skema warna gelap profesional (*dark-theme dashboard*) dengan palet warna abu-abu gelap (\#121212) dan aksen hijau toska (\#00F2FE) untuk mengurangi kelelahan mata saat mengevaluasi data analitik dalam durasi lama.1  
Dasbor menyajikan peta sebaran spasial 30.000 gerai nasional secara interaktif.1 Di sisi kanan layar, terpasang panel peringatan dini (*early warning alerts*) dari BPKP yang menyala merah jika ada gerai KDKMP yang terdeteksi menahan uang tunai fisik di atas batas aman Rp50.000.000,00 selama lebih dari 48 jam.1 Visualisasi data dilengkapi dengan grafik pergerakan armada logistik PT Agrinas dan realisasi penyerapan panen tembakau KITMAS serta garam Pademawu secara real-time.1

### **Spesifikasi Teknis Komparatif Antarmuka**

| Parameter Desain | Dashboard Admin (Bapak Sukri) | Mobile Web App (Ibu Sumiati) | Analytical Dashboard (Ibu Diana) |
| :---- | :---- | :---- | :---- |
| **Tema Warna Utama** | Terang Kontras Tinggi (\#FFFFFF, \#1A1A1A) 1 | Terang Hemat Energi (\#F8F9FA, \#2D3748) 1 | Gelap Profesional (\#121212, \#00F2FE) 1 |
| **Batas Target Latensi** | **![][image1]** (Input transaksi lokal) 15 | ![][image2] (Koneksi 3G pedesaan) 15 | ![][image1] (Kueri analitik agregat) 15 |
| **Teknologi Penyimpanan** | IndexedDB lokal \+ Sinkronisasi Idempotent 1 | LocalStorage untuk token sesi \+ QR Code Generator 1 | NeonDB Read-Replicas \+ Agregasi Serverless 1 |
| **Interaksi Utama** | Pemindaian barcode kamera, tombol POS cepat 1 | Tampilan grafik sisa kuota, QR keanggotaan 1 | Peta spasial interaktif, filter kueri multi-tier 1 |
| **Penanganan Offline** | Transaksi disimpan lokal & dikunci jika kas ![][image3] 1 | Tampilan data terakhir yang tersimpan (*cached data*) 1 | Harus selalu daring (*always-online query*) 1 |

## **4\. Roadmap (3-Phase Development)**

Implementasi taktis JASASAJA dijalankan dalam tiga fase terstruktur untuk memastikan validasi produk berjalan cepat di area *pilot project* sebelum dilakukan ekspansi secara nasional.1

### **Spesifikasi Rencana Pengembangan Produk**

| Fase | Fokus Pengembangan | Target Deliverables Utama | Indikator Keberhasilan (KPI) |
| :---- | :---- | :---- | :---- |
| **Fase 1** | *Core POS Engine & Pilot Validation* | POS Ritel luring-pertama, otomatisasi akuntansi SAK EP via trigger basis data, enkripsi IndexedDB lokal, kunci kas brankas Rp50 Juta di frontend, integrasi transaksi pembayaran Xendit.1 | Sukses implementasi di 189 gerai Pamekasan (fokus 35 gerai siap operasi), zero data loss saat sinkronisasi pasca-blankspot.1 |
| **Fase 2** | *Agricultural Integration & Closed-Loop* | Sinkronisasi API i-Pubers, modul penentuan mutu tembakau KITMAS Larangan, modul pengujian NaCl garam geomembran Pademawu, sistem kredit tertutup (*closed-loop*) dengan rantaian hash.1 | Seluruh transaksi penebusan pupuk bersubsidi tercatat di Kementan secara real-time, akurasi grading tembakau meningkat 95%.1 |
| **Fase 3** | *National Scale-Up & Geo-SEO* | Dasbor analitis multi-tier PT Agrinas, optimasi GEO/SEO pada Vercel Edge Middleware, pelacakan armada truk BUMN, modul e-commerce B2C terintegrasi RajaOngkir untuk penjualan luar Madura.1 | Sistem siap mendukung 30.000 gerai nasional, kecepatan muat halaman luar Madura ![][image4] detik, zero dependency pada iklan media sosial.1 |

## **5\. Workflow Operasional dan Teknis**

Proses pemrosesan data keuangan, logistik, dan penyaluran kredit pada sistem KDKMP diatur melalui alur kerja terotomatisasi yang sangat presisi guna menjaga kepatuhan regulasi pemerintah.1

### **A. Alur Kerja Penerimaan Barang Gudang (Goods Receiving via Scan QR)**

   
              │  
              ▼

              │  
              ▼

              │  
              ▼

              │  
              ├─────────────────► \[Koneksi Online?\]  
              │                          │  
              │                          ├──► (Ya) ──►  
              │                          │                    │  
              │                          │                    ▼  
              │                          │              
              │                          │                    │  
              │                          │                    ▼  
              │                          │              
              │                          │  
              │                          └──► (Tidak) ──►  
              │                                                   │  
              │                                                   ▼  
              │                                             
              ▼

### **B. Alur Kerja Transaksi POS Ritel dan Pembayaran QRIS**

              │  
              ▼

              │  
              ▼

              │  
              ▼  
\[Kasir Memilih Metode Pembayaran\]  
              │  
              ├─────────────────►  
              │                          │  
              │                          ▼  
              │              
              │                          │  
              │                          ▼  
              │              
              │                          │  
              │                          ├──► ──►  
              │                          │  
              │                          └──► ──►  
              │                                                             │  
              │                                                             ▼  
              │                                                      
              │  
              └──►  
                                         │  
                                         ▼  
                             
                                         │  
                                         ▼  
                             
                                         │  
                                         ▼  
                             
                                         │  
                                         ▼  
                           

### **C. Alur Kerja Rekonsiliasi Otomatis dan Perhitungan PADes**

Proses penutupan hari kerja memicu serangkaian otomasi akuntansi pada pangkalan data NeonDB tanpa membebani performa aplikasi klien.1

1. **Inisiasi Tutup Buku**: Bapak Sukri menekan tombol "Tutup Buku Harian" pada aplikasi POS.1  
2. **Eksekusi Trigger Database**: Data transaksi harian dari tabel transactions diproses oleh *Database Trigger* NeonDB.1 Trigger secara otomatis melakukan penjurnalan ganda (*double-entry*) ke tabel ledger\_entries sesuai standar akuntansi SAK EP, menghindarkan terjadinya *serverless timeout* pada Vercel.1  
3. **Penyusunan Laporan Keuangan**: Neraca saldo, laporan laba rugi, dan arus kas diperbarui secara real-time di level pangkalan data.1  
4. **Alokasi Pembagian PADes Otomatis**: Pada setiap akhir tahun buku, sistem menghitung Sisa Hasil Usaha (SHU) bersih tahunan menggunakan formula berikut 1:  
   ![][image5]  
   9 Berdasarkan ketentuan hukum Instruksi Presiden Nomor 17 Tahun 2025, sistem menjalankan formula pembagian kontribusi Pendapatan Asli Desa (PADes) minimal 20% secara transparan 1:  
   ![][image6]  
   1 Sistem menerbitkan draf instruksi transfer otomatis dari rekening koperasi ke Kas Desa setempat, dan mengirimkan catatan penjurnalan transaksi tersebut langsung ke sistem APBDes.1

## **6\. Kontrak Kerjasama & Perjanjian (Legalitas)**

Berikut adalah draf hukum formal perjanjian lisensi perangkat lunak bermodel SaaS antara JASASAJA (PT Memory Groups Sejahtera) dengan PT Agrinas Pangan Nusantara.1 Draf ini disusun secara teliti guna menjamin kepemilikan penuh kekayaan intelektual sistem berada pada pihak pengembang.18

### **PERJANJIAN LISENSI PERANGKAT LUNAK (SOFTWARE-AS-A-SERVICE AGREEMENT)**

**NOMOR: 104/MGS-APN/LEGAL/V/2026** 18  
Perjanjian Lisensi Perangkat Lunak ("Perjanjian") ini dibuat dan ditandatangani pada hari Kamis, tanggal 21 Mei 2026, oleh dan antara pihak-pihak di bawah ini:

1. **PT Memory Groups Sejahtera**, sebuah perseroan terbatas yang didirikan dan tunduk pada hukum Negara Republik Indonesia, beralamat kedudukan hukum di Menara Tekno Lantai 18, Jalan Jenderal Sudirman Kav. 21, Jakarta Selatan, pemilik sah merek dan platform teknologi "JASASAJA", dalam hal ini diwakili oleh Direktur Utama yang sah, selanjutnya disebut sebagai **"PEMBERI LISENSI"**.1  
2. **PT Agrinas Pangan Nusantara (Persero)**, sebuah badan usaha milik negara yang didirikan berdasarkan hukum Negara Republik Indonesia, bertransformasi dari entitas konstruksi terdahulu PT Yodya Karya (Persero) di bawah portofolio super holding Danantara, beralamat di Gedung Ketahanan Pangan Nasional, Jalan Gatot Subroto Kav. 42, Jakarta Pusat, dalam hal ini diwakili oleh Direktur Utama yang sah, selanjutnya disebut sebagai **"PENERIMA LISENSI"**.1

Pemberi Lisensi dan Penerima Lisensi secara bersama-sama disebut sebagai **"Para Pihak"** dan masing-masing disebut sebagai **"Pihak"**.21

#### **MENIMBANG:**

* Bahwa Pemberi Lisensi memiliki seluruh hak cipta, kepemilikan, dan rahasia dagang atas sistem aplikasi "JASASAJA" yang merupakan platform digital manajemen operasional koperasi hibrida terintegrasi.1  
* Bahwa Penerima Lisensi merupakan badan usaha milik negara yang ditugaskan memimpin proyek fisik dan operasionalisasi Koperasi Desa dan Kelurahan Merah Putih (KDKMP) berdasarkan mandat Instruksi Presiden (Inpres) Nomor 17 Tahun 2025\.1  
* Bahwa Penerima Lisensi bermaksud untuk menggunakan sistem aplikasi "JASASAJA" untuk dioperasikan pada jaringan Koperasi Desa dan Kelurahan Merah Putih (KDKMP) di bawah binaan Penerima Lisensi guna mematuhi Instruksi Presiden Nomor 17 Tahun 2025\.1

Oleh karena itu, Para Pihak dengan ini sepakat untuk saling mengikatkan diri dalam Perjanjian ini dengan syarat-syarat dan ketentuan sebagai berikut:

#### **PASAL 1: DEFINISI**

1. **"Sistem JASASAJA"** berarti seluruh arsitektur perangkat lunak, termasuk namun tidak terbatas pada kode sumber (*source code*), kode objek, skema basis data (*database schema*), algoritma, dokumentasi teknis, antarmuka pengguna (UI/UX), pemicu basis data (*database triggers*), dan teknologi sinkronisasi luring-pertama (*offline-first*) yang dikembangkan oleh Pemberi Lisensi.1  
2. **"Lisensi"** berarti pemberian izin non-eksklusif, non-transferabel, terbatas, dan dapat ditarik kembali oleh Pemberi Lisensi kepada Penerima Lisensi untuk menggunakan Sistem JASASAJA per unit gerai KDKMP yang terdaftar secara sah.18

#### **PASAL 2: KEPEMILIKAN HAK KEKAYAAN INTELEKTUAL (HAKI)**

1. **Hak Cipta Mutlak**: Penerima Lisensi dengan ini mengakui secara tegas, sukarela, dan tanpa syarat bahwa seluruh Hak Cipta atas program komputer dan basis data Sistem JASASAJA, sebagaimana dilindungi oleh Undang-Undang Nomor 28 Tahun 2014 tentang Hak Cipta, adalah milik mutlak dan eksklusif dari Pemberi Lisensi.19  
2. **Nihilnya Pengalihan Hak**: Perjanjian ini merupakan perjanjian lisensi murni (SaaS) dan sama sekali tidak mengandung unsur pengalihan hak kepemilikan ciptaan (*assignment of copyright*) baik sebagian maupun seluruhnya dari Pemberi Lisensi kepada Penerima Lisensi atau gerai KDKMP individual.20  
3. **Larangan Dekompilasi**: Penerima Lisensi dan seluruh unit pengelola KDKMP di bawah binaannya dilarang keras untuk menyalin, memodifikasi, membuat karya turunan, membongkar, mendekompilasi (*decompile*), melakukan rekayasa balik (*reverse engineering*), atau berupaya mengekstrak kode sumber (*source code*) dari Sistem JASASAJA.18

#### **PASAL 3: MEKANISME REPLIKASI GERAI & SKEMA PROFIT PORTOFOLIO**

1. **Lisensi Terisolasi Per Gerai**: Lisensi penggunaan Sistem JASASAJA wajib dibeli dan didaftarkan secara mandiri untuk setiap gerai KDKMP.18 Replika sistem ke gerai baru harus didaftarkan secara tertulis kepada Pemberi Lisensi.18  
2. **Tarif Berlangganan (SaaS Fee)**: Penerima Lisensi wajib membayar biaya berlangganan bulanan sebesar Rp1.500.000,00 (satu juta lima ratus ribu rupiah) per gerai yang aktif terhubung ke pangkalan data.18  
3. **Sanksi Replikasi Tanpa Izin**: Apabila Penerima Lisensi terbukti melakukan replikasi sistem, pemindahan basis kode, atau instalasi mandiri di luar gerai yang didaftarkan secara sah, tindakan tersebut diklasifikasikan sebagai pelanggaran berat hak cipta.26 Penerima Lisensi wajib membayar ganti rugi seketika sebesar Rp500.000.000,00 (lima ratus juta rupiah) untuk setiap pelanggaran gerai ilegal.26

#### **PASAL 4: JAMINAN KEAMANAN DAN PEMBATASAN TANGGUNG JAWAB**

1. **Ketersediaan Layanan (SLA)**: Pemberi Lisensi menjamin tingkat ketersediaan sistem aplikasi (*system uptime*) rata-rata sebesar 99.9% setiap bulannya, di luar jadwal pemeliharaan berkala yang diumumkan sebelumnya.18  
2. **Batasan Tanggung Jawab**: Pemberi Lisensi tidak bertanggung jawab atas kerugian finansial yang diderita oleh Penerima Lisensi akibat hilangnya data atau kegagalan transaksi yang disebabkan oleh kerusakan perangkat keras lokal, kelalaian operator kasir, atau gangguan jaringan telekomunikasi di luar kendali teknis Pemberi Lisensi.23

#### **PASAL 5: HUKUM YANG BERLAKU DAN PENYELESAIAN SENGKETA**

1. **Yurisdiksi Hukum**: Perjanjian ini ditafsirkan, tunduk, dan dilaksanakan sepenuhnya berdasarkan ketentuan hukum Negara Republik Indonesia.26  
2. **Arbitrase**: Setiap perselisihan, sengketa, atau perbedaan penafsiran yang timbul dari pelaksanaan Perjanjian ini wajib diupayakan penyelesaiannya secara damai melalui musyawarah.26 Apabila dalam waktu 30 (tiga puluh) hari kalender sengketa tidak dapat diselesaikan, Para Pihak sepakat untuk menyerahkan penyelesaian sengketa tersebut kepada Badan Arbitrase Nasional Indonesia (BANI) Jakarta, yang keputusannya bersifat final dan mengikat bagi Para Pihak.26

Demikian Perjanjian ini dibuat dalam rangkap 2 (dua) bermeterai cukup dan memiliki kekuatan hukum yang sama bagi Para Pihak setelah ditandatangani.21  
**PEMBERI LISENSI**  
**PT MEMORY GROUPS SEJAHTERA**  
*(ditandatangani)*  
**PENERIMA LISENSI**  
**PT AGRINAS PANGAN NUSANTARA (PERSERO)**  
*(ditandatangani)*

## **7\. Fitur Website (Feature List Grid)**

Matriks fitur di bawah ini menjabarkan seluruh fungsionalitas sistem JASASAJA yang dipisahkan secara ketat berdasarkan hak akses pengguna dan tingkat kepentingan rilis MVP.1

| ID Fitur | Aktor Pengguna | Nama Fitur | Deskripsi Fungsional & Spesifikasi Teknis | Prioritas | Tech Stack Terkait | Rujukan Riset Riil |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **FT-01** | Admin Desa | POS Ritel Offline-First | Aplikasi kasir penjualan sembako harian yang berjalan luring menggunakan penyimpanan terenkripsi IndexedDB.1 | **Must-Have** | Next.js, IndexedDB, Dexie.js 6 | Kebutuhan transaksional gerai fisik Pamekasan.1 |
| **FT-02** | Admin Desa | Kunci Saldo Brankas | Blokir menu transaksi POS secara instan di peramban frontend jika kas tunai terdeteksi ![][image7].1 | **Must-Have** | Next.js Client State Engine (Zustand) | Kepatuhan mitigasi kas fisik audit BPKP.1 |
| **FT-03** | Admin Desa | Otomatisasi Akuntansi SAK EP | Penjurnalan ganda otomatis yang dipicu langsung di pangkalan data saat penutupan buku harian.1 | **Must-Have** | NeonDB (PostgreSQL) triggers, SAK EP Ledger 16 | Kewajiban kepatuhan SAK EP per 1 Jan 2025\.1 |
| **FT-04** | Petani | Dompet Kredit KUT | Manajemen limit pinjaman saprotan berbasis kredit tertutup (*closed-loop*) dengan pelacakan buku besar.1 | **Must-Have** | NeonDB Ledger Tables, Hash Chaining Engine 4 | Skema kredit modal pertanian terarah.1 |
| **FT-05** | Admin & Petani | Sinkronisasi i-Pubers | Pemotongan kuota pupuk subsidi milik petani secara otomatis saat melakukan penebusan saprotan.1 | **Should-Have** | Next.js API Routes, i-Pubers Kementan API 14 | Alokasi kuota tepat sasaran e-alokasi.1 |
| **FT-06** | Admin Desa | Standarisasi Tembakau | Pengukuran grade mutu daun tembakau objektif berbasis parameter fisik warna, elastisitas, air, dan aroma.1 | **Should-Have** | Next.js API, Modul Standarisasi Mutu Digital | Perlindungan harga tani Koperasi KITMAS.1 |
| **FT-07** | Admin Desa | Pencatatan NaCl Garam | Input dan validasi berat serta kadar NaCl garam geomembran nelayan pesisir sebelum diangkut BUMN.1 | **Should-Have** | Next.js, NeonDB Schema | Sektor pergaraman nasional Pademawu.1 |
| **FT-08** | Manajemen BUMN | Dasbor Multi-Tier | Pemantauan spasial 30.000 gerai nasional, pelacakan pengiriman stok, dan deteksi dini pelanggaran kas.1 | **Must-Have** | Next.js, Vercel Serverless, NeonDB Read Replicas | Pendampingan tata kelola 2 tahun oleh Agrinas.1 |
| **FT-09** | Manajemen BUMN | SCM & Fleet Tracking | Penjadwalan penjemputan hasil panen dari gerai menggunakan armada truk internal PT Agrinas tanpa kurir pihak ketiga.1 | **Should-Have** | Next.js API Routes, NeonDB SCM Schema | Efisiensi biaya distribusi pangan nasional.1 |
| **FT-10** | Publik | B2C E-Commerce | Pembelian ritel garam Pademawu dan tembakau KITMAS untuk pembeli luar Madura dengan kalkulasi ongkos kirim kurir.1 | **Could-Have** | Next.js, RajaOngkir API, Xendit Checkout 1 | Perluasan jangkauan pasar komoditas Madura.1 |
| **FT-11** | Admin Desa | Otomasi SHU & PADes | Perhitungan tahunan pembagian minimal 20% SHU bersih langsung menjadi Pendapatan Asli Desa secara matematis.1 | **Must-Have** | NeonDB PostgreSQL Database Triggers | Implementasi mandat Inpres No. 17 Tahun 2025\.1 |

## **8\. MVP dan PRD (Product Requirement Document) Website**

### **A. Kriteria Keberhasilan Kinerja Teknis (Vercel-Based Metrics)**

Sistem harus memenuhi standar performa web internasional (*Core Web Vitals*) saat dihosting di platform Vercel guna memastikan efisiensi kampanye periklanan Meta Ads tanpa media sosial 1:

* **Largest Contentful Paint (LCP)**: Selesai dimuat kurang dari 1.8 detik pada perangkat mobile kelas bawah di jaringan 3G Madura Utara.15  
* **First Input Delay (FID)**: Di bawah 50 milidetik untuk memastikan responsivitas transaksi kasir yang instan.15  
* **Cumulative Layout Shift (CLS)**: Kurang dari 0.05 untuk mencegah pergeseran antarmuka yang mengganggu kenyamanan pengguna.29

### **B. Protokol Sinkronisasi Luring-Pertama & Idempotensi API**

Di wilayah pegunungan terjal Pamekasan Utara yang rawan terjadi pemutusan sinyal internet seluler (seperti Pakong, Pegantenan, dan Batumarmar), aplikasi POS beralih sepenuhnya ke mode luring menggunakan basis data IndexedDB.1 Seluruh transaksi ditampung di dalam antrean sinkronisasi lokal (*local sync queue*).1  
Ketika koneksi telekomunikasi kembali pulih, peramban mengirimkan transaksi ke server melalui POST request dengan menyertakan *Idempotency Key* berbasis UUID v4 unik yang diletakkan pada tajuk HTTP x-idempotency-key.4

 Klien (IndexedDB)                                Vercel Gateway                               NeonDB PostgreSQL  
         │                                               │                                              │  
         │─── 1\. POST /api/v1/sync ─────────────────────►│                                              │  
         │    x-idempotency-key:               │                                              │  
         │                                               │─── 2\. Cek Kunci Kriptografis di Upstash ────►│  
         │                                               │                                              │  
         │                                               │◄── 3\. Respons: Kunci Belum Terdaftar ────────│  
         │                                               │                                              │  
         │                                               │─── 4\. Eksekusi Tulis Transaksi di DB ───────►│  
         │                                               │                                              │  
         │                                               │◄── 5\. Transaksi Berhasil Ditulis ────────────│  
         │◄── 6\. Konfirmasi Sukses (201 Created) ────────│                                              │  
         │                                               │                                              │  
         │─── 7\. RETRY /api/v1/sync (Koneksi Putus?) ───►│                                              │  
         │    x-idempotency-key:               │                                              │  
         │                                               │─── 8\. Cek Kunci Kriptografis di Upstash ────►│  
         │                                               │                                              │  
         │                                               │◄── 9\. Respons: KUNCi TERDETEKSI (DUPLIKAT) ──│  
         │                                               │                                              │  
         │◄── 10\. Kembalikan Respons Tersimpan ──────────│                                              │  
         │    (Tanpa menulis ulang ke pangkalan data)    │                                              │

Skema idempotensi ini mencegah terjadinya duplikasi data keuangan di pangkalan data NeonDB akibat pengiriman ulang transaksi luring yang sama.4

### **C. Spesifikasi Enkripsi Penyimpanan Lokal IndexedDB**

Data pribadi petani, rincian piutang, dan sisa kas brankas di peramban dilindungi menggunakan enkripsi tingkat militer berbasis Web Crypto API.30

* **Algoritma**: AES-GCM 256-bit dengan initialization vector (IV) sepanjang 96-bit yang dihasilkan acak setiap kali enkripsi berjalan.30  
* **Keamanan Kunci**: Kunci enkripsi diturunkan dari kata sandi akun operator menggunakan PBKDF2.32 Kunci disimpan di dalam IndexedDB dengan properti extractable: false, yang menjamin bahwa kunci tersebut tidak akan pernah bisa dibaca atau diekstraksi dari memori peramban oleh skrip jahat luar.32

### **D. Konfigurasi Laju Akses API (Upstash Rate Limiting)**

Guna melindungi serverless functions dari serangan kehabisan sumber daya (DDoS) serta penyalahgunaan kuota API, Upstash Redis dikonfigurasi sebagai pengendali laju akses (*rate limiter*) pada level middleware 1:

* **Rute API POS Ritel (/api/v1/pos/\*)**: Dibatasi maksimal 20 permintaan per menit per tenant IP.17  
* **Rute Penebusan Pupuk (/api/v1/ipubers/\*)**: Dibatasi maksimal 5 permintaan per menit per ID anggota untuk mengeliminasi manipulasi kuota pupuk subsidi.1  
* **Rute E-Commerce Publik B2C (/api/v1/commerce/\*)**: Dibatasi maksimal 60 permintaan per menit per IP untuk mencegah aktivitas scraping harga komoditas.1

## **9\. Tutorial / Panduan Manual (Outline & Code)**

### **A. Panduan Teknis untuk Pengembang (Developer Onboarding Manual)**

#### **Langkah 1: Migrasi Skema NeonDB & Penyiapan Trigger Akuntansi SAK EP**

Pengembang diwajibkan untuk menjalankan migrasi skema tabel dasar di pangkalan data NeonDB.7 Jalankan skrip PL/pgSQL berikut untuk mengaktifkan otomatisasi pencatatan akuntansi ganda (*double-entry*) SAK EP pada saat penutupan buku harian dilakukan, guna menghindari batas waktu timeout serverless Vercel.1

SQL  
\-- Trigger untuk mengotomatisasi pencatatan akuntansi SAK EP saat penutupan kas harian  
CREATE OR REPLACE FUNCTION generate\_sak\_ep\_journal\_entries()  
RETURNS TRIGGER AS $$  
DECLARE  
    v\_journal\_id UUID;  
BEGIN  
    \-- Buat baris jurnal transaksi utama  
    INSERT INTO transactions (tenant\_id, idempotency\_key, amount, description, status)  
    VALUES (NEW.tenant\_id, gen\_random\_uuid(), NEW.cash\_on\_hand, 'Penutupan Buku Harian Otomatis', 'COMPLETED')  
    RETURNING id INTO v\_journal\_id;

    \-- Entri Debit: Kas di Tangan (Asset) \[ACC-1111\]  
    INSERT INTO ledger\_entries (transaction\_id, account\_id, debit, credit)  
    VALUES (v\_journal\_id, 'a8b34e2c-1234-5678-abcd-000000001111', NEW.cash\_on\_hand, 0);

    \-- Entri Kredit: Pendapatan Penjualan Sembako (Revenue) \[ACC-4100\]  
    INSERT INTO ledger\_entries (transaction\_id, account\_id, debit, credit)  
    VALUES (v\_journal\_id, 'b9c45f3d-5678-1234-bcde-000000004100', 0, NEW.cash\_on\_hand);

    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger\_daily\_closing\_sak\_ep  
AFTER INSERT ON daily\_closings  
FOR EACH ROW  
EXECUTE FUNCTION generate\_sak\_ep\_journal\_entries();

#### **Langkah 2: Konfigurasi Webhook Xendit yang Aman pada Next.js API Routes**

Rute API Next.js harus memvalidasi setiap token verifikasi webhook dari Xendit untuk memproses pengisian kas koperasi secara instan.1

TypeScript  
// pages/api/v1/webhook/xendit.ts  
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method\!== 'POST') {  
    return res.status(405).json({ message: 'Method Not Allowed' });  
  }

  const xenditToken \= req.headers\['x-callback-token'\];  
  if (xenditToken\!== process.env.XENDIT\_CALLBACK\_TOKEN) {  
    return res.status(401).json({ message: 'Unauthorized Webhook Token Signature' });  
  }

  const { external\_id, amount, status } \= req.body;

  if (status \=== 'PAID') {  
    // Jalankan transaksi penambahan kas koperasi via top-up Xendit secara aman  
    await db.execute(  
      \`INSERT INTO transactions (id, tenant\_id, amount, description, status)   
       VALUES (gen\_random\_uuid(),?,?, 'Top-Up Saldo Koperasi via Xendit', 'COMPLETED')\`,  
      \[external\_id, amount\]  
    );  
  }

  return res.status(200).json({ status: 'SUCCESS' });  
}

### **B. Panduan Operasional Praktis untuk Admin Koperasi (Bapak Sukri)**

#### **1\. Penerimaan Logistik Menggunakan Fitur Scan QR**

* Buka tablet atau handphone operasional gerai, jalankan aplikasi JASASAJA, lalu masuk menggunakan kredensial admin KDKMP.1  
* Pilih menu **"Penerimaan Logistik BUMN"** pada antarmuka utama.1  
* Arahkan kamera belakang perangkat ke kode QR surat jalan yang diserahkan oleh sopir armada logistik PT Agrinas.1  
* Setelah data terverifikasi cocok, tekan tombol **"Terima Barang"**.1 Stok gudang digital akan langsung bertambah secara otomatis tanpa perlu melakukan pencatatan buku fisik.1

#### **2\. Menghadapi Pemblokiran POS Akibat Batas Saldo Brankas**

* Jika saldo tunai di kasir terdeteksi melebihi batas aman Rp50.000.000,00, layar aplikasi POS akan terkunci dan menampilkan modal peringatan berwarna merah.1  
* Hitung uang tunai fisik di laci kasir dan cocokkan dengan angka yang tertera di dokumen Berita Acara Keadaan Kas otomatis yang muncul di layar.1  
* Lakukan penyetoran uang kas tunai tersebut ke bank terdekat, atau setor menggunakan mesin setor tunai ke rekening bank resmi milik koperasi KDKMP.1  
* Masukkan kode referensi setoran bank atau struk bukti setoran ke dalam kolom verifikasi aplikasi JASASAJA untuk membuka blokir layar POS.1

### **C. Panduan Ringkas untuk Anggota Petani (Ibu Sumiati)**

#### **1\. Cara Penebusan Pupuk Subsidi dan Kredit Saprotan**

* Kunjungi gerai fisik KDKMP terdekat dengan membawa ponsel yang terpasang aplikasi JASASAJA.1  
* Buka halaman utama aplikasi, lalu pilih tombol **"Tampilkan Kartu Anggota"** untuk memunculkan kode QR keanggotaan unik Ibu.1  
* Tunjukkan kode QR tersebut kepada Bapak Sukri untuk dipindai.1  
* Bapak Sukri akan menginput pupuk atau bibit yang ingin Ibu beli ke dalam mesin kasir.1 Pembayaran akan langsung memotong sisa limit Kredit Usaha Tani (KUT) tertutup (*closed-loop*) Ibu secara otomatis, tanpa perlu mengeluarkan uang tunai.1

#### **2\. Cara Penjualan Hasil Panen dan Potong Cicilan Otomatis**

* Setelah panen tiba, serahkan daun tembakau Rajangan Madura atau garam rakyat hasil geomembran Ibu ke gudang koperasi.1  
* Bapak Sukri akan memeriksa mutu hasil bumi Ibu menggunakan alat uji digital yang terhubung langsung ke aplikasi JASASAJA.1  
* Nilai grade mutu daun tembakau (dari grade warna kuning keemasan, kelenturan daun, kadar air, hingga keunikan aromatik khas Madura) atau tingkat kemurnian NaCl garam akan dimasukkan ke dalam sistem.1  
* Sistem akan memunculkan harga beli adil standar pemerintah secara transparan di layar ponsel Ibu.1  
* Hasil penjualan tersebut akan dipotong secara otomatis sebesar nominal cicilan Kredit Usaha Tani Ibu yang jatuh tempo, dan sisa uang hasil penjualan akan langsung dikirimkan ke dompet digital milik Ibu secara instan.1

#### **Karya yang dikutip**

1. Riset Koperasi BUMN Pamekasan.pdf  
2. Next.js \- Sequin, diakses Mei 21, 2026, [https://sequin.io/docs/guides/nextjs](https://sequin.io/docs/guides/nextjs)  
3. DoubleEntryLedger — double\_entry\_ledger v0.4.0 \- Hexdocs, diakses Mei 21, 2026, [https://hexdocs.pm/double\_entry\_ledger/](https://hexdocs.pm/double_entry_ledger/)  
4. How to Build a Bank Ledger in Golang with PostgreSQL using the Double-Entry Accounting Principle. \- freeCodeCamp, diakses Mei 21, 2026, [https://www.freecodecamp.org/news/build-a-bank-ledger-in-go-with-postgresql-using-the-double-entry-accounting-principle/](https://www.freecodecamp.org/news/build-a-bank-ledger-in-go-with-postgresql-using-the-double-entry-accounting-principle/)  
5. n8n \+ Postgres: Audit Trails That Prove Work | by Duckweave \- Medium, diakses Mei 21, 2026, [https://medium.com/@duckweave/n8n-postgres-audit-trails-that-prove-work-20532bb8c2c5](https://medium.com/@duckweave/n8n-postgres-audit-trails-that-prove-work-20532bb8c2c5)  
6. Next.js, Background Jobs & PostgreSQL: Production in 2026 \- Render, diakses Mei 21, 2026, [https://render.com/articles/nextjs-background-jobs-postgresql-production](https://render.com/articles/nextjs-background-jobs-postgresql-production)  
7. How to Deploy a Next.js API with PostgreSQL and Sevalla \- freeCodeCamp, diakses Mei 21, 2026, [https://www.freecodecamp.org/news/how-to-deploy-a-nextjs-api-with-postgresql-and-sevalla/](https://www.freecodecamp.org/news/how-to-deploy-a-nextjs-api-with-postgresql-and-sevalla/)  
8. Double-Entry Bookkeeping in Ledger Systems | by Fatih Altuntaş | Medium, diakses Mei 21, 2026, [https://medium.com/@altuntasfatih42/how-to-build-a-double-entry-ledger-f69edcea825d](https://medium.com/@altuntasfatih42/how-to-build-a-double-entry-ledger-f69edcea825d)  
9. Implementation of Financial Accounting Standards for Private Entities (SAK EP) at Modern Cooperative to Achieve a Green Economy \- Atlantis Press, diakses Mei 21, 2026, [https://www.atlantis-press.com/article/126018023.pdf](https://www.atlantis-press.com/article/126018023.pdf)  
10. Ensuring Idempotence: A Guide to Implementing Idempotent Endpoints with NestJS Interceptors \- DEV Community, diakses Mei 21, 2026, [https://dev.to/eduardoconti/ensuring-idempotence-a-guide-to-implementing-idempotent-endpoints-with-nestjs-interceptors-lgb](https://dev.to/eduardoconti/ensuring-idempotence-a-guide-to-implementing-idempotent-endpoints-with-nestjs-interceptors-lgb)  
11. The Architecture Behind Tamper-Proof Audit Logs \- DEV Community, diakses Mei 21, 2026, [https://dev.to/robertatkinson3570/the-architecture-behind-tamper-proof-audit-logs-56ek](https://dev.to/robertatkinson3570/the-architecture-behind-tamper-proof-audit-logs-56ek)  
12. Menkop kukuhkan koperasi induk tembakau pertama di Indonesia, diakses Mei 21, 2026, [https://megapolitan.antaranews.com/berita/502110/menkop-kukuhkan-koperasi-induk-tembakau-pertama-di-indonesia](https://megapolitan.antaranews.com/berita/502110/menkop-kukuhkan-koperasi-induk-tembakau-pertama-di-indonesia)  
13. How to use indexedDB (Dexie) in NextJs \- Webkul Blog, diakses Mei 21, 2026, [https://webkul.com/blog/how-to-use-indexeddb-dexie-in-nextjs/](https://webkul.com/blog/how-to-use-indexeddb-dexie-in-nextjs/)  
14. Penyaluran Pupuk Bersubsidi Pakai Aplikasi i-Pubers, Sudah Tepat Sasaran?, diakses Mei 21, 2026, [https://www.liputan6.com/bisnis/read/5475129/penyaluran-pupuk-bersubsidi-pakai-aplikasi-i-pubers-sudah-tepat-sasaran](https://www.liputan6.com/bisnis/read/5475129/penyaluran-pupuk-bersubsidi-pakai-aplikasi-i-pubers-sudah-tepat-sasaran)  
15. Vercel vs Cloudflare Pages: Edge Deployment for Commerce in 2026 \- Contra Collective, diakses Mei 21, 2026, [https://contracollective.com/blog/vercel-vs-cloudflare-pages-edge-deployment-2026](https://contracollective.com/blog/vercel-vs-cloudflare-pages-edge-deployment-2026)  
16. Documentation: 18: CREATE TRIGGER \- PostgreSQL, diakses Mei 21, 2026, [https://www.postgresql.org/docs/current/sql-createtrigger.html](https://www.postgresql.org/docs/current/sql-createtrigger.html)  
17. Getting Started with Routing Middleware \- Vercel, diakses Mei 21, 2026, [https://vercel.com/docs/routing-middleware/getting-started](https://vercel.com/docs/routing-middleware/getting-started)  
18. SaaS Agreement: Pengertian, Komponen Penting, dan Contohnya \- Majoo, diakses Mei 21, 2026, [https://majoo.id/solusi/detail/saas-agreement-pengertian-komponen-penting-dan-contohnya](https://majoo.id/solusi/detail/saas-agreement-pengertian-komponen-penting-dan-contohnya)  
19. Terhadap Program Ciptaan Programmer \- E-Jurnal Universitas Muhammadiyah Palembang, diakses Mei 21, 2026, [https://jurnal.um-palembang.ac.id/variahukum/article/download/392/363](https://jurnal.um-palembang.ac.id/variahukum/article/download/392/363)  
20. Perjanjian Lisensi dan Royalti Sebagai Wujud Pelindungan Hak Cipta Dalam Waralaba Film, diakses Mei 21, 2026, [https://ojs.daarulhuda.or.id/index.php/MHI/article/download/808/862](https://ojs.daarulhuda.or.id/index.php/MHI/article/download/808/862)  
21. LISENSI HAK KEKAYAAN INTELEKTUAL (HKI) DALAM PERSPEKTIF HUKUM PERJANJIAN DI INDONESIA \- YARSI Academic Journal, diakses Mei 21, 2026, [https://academicjournal.yarsi.ac.id/index.php/Jurnal-ADIL/article/download/815/471/1644](https://academicjournal.yarsi.ac.id/index.php/Jurnal-ADIL/article/download/815/471/1644)  
22. 221 Jurnal Ilmu Hukum, Sosial, dan Humaniora 2985-5624 (2024), 2 (9): 221–231 http://jurnal.kolibi.org/index.php/kultura KEPAS, diakses Mei 21, 2026, [https://jurnal.kolibi.org/index.php/kultura/article/download/2516/2472/9776](https://jurnal.kolibi.org/index.php/kultura/article/download/2516/2472/9776)  
23. Perjanjian Lisensi Pengguna Akhir (End User License Agreement) \- Wondershare, diakses Mei 21, 2026, [https://www.wondershare.co.id/company/end-user-license-agreement.html](https://www.wondershare.co.id/company/end-user-license-agreement.html)  
24. KEDUDUKAN END-USER LICENSE AGREEMENT (EULA) DALAM PERLINDUNGAN HAK CIPTA FONT Muchtar Hasan Asrofi Fakultas Hukum Universitas G \- Journal UII, diakses Mei 21, 2026, [https://journal.uii.ac.id/JIPRO/article/download/42971/19272/158525](https://journal.uii.ac.id/JIPRO/article/download/42971/19272/158525)  
25. II. TINJAUAN PUSTAKA 2.1 Tinjauan Umum Hak Cipta 2.1.1 Sejarah Singkat Hak Cipta Hak cipta sejak awal kemunculannya selalu berka \- Digilib Unila, diakses Mei 21, 2026, [http://digilib.unila.ac.id/5103/12/BAB%20II.pdf](http://digilib.unila.ac.id/5103/12/BAB%20II.pdf)  
26. Memahami Jenis Lisensi dalam Perjanjian Penggunaan Perangkat Lunak \- Kontrak Hukum, diakses Mei 21, 2026, [https://kontrakhukum.com/article/memahami-jenis-lisensi-dalam-perjanjian-penggunaan-perangkat-lunak/](https://kontrakhukum.com/article/memahami-jenis-lisensi-dalam-perjanjian-penggunaan-perangkat-lunak/)  
27. PERJANJIAN LISENSI PENGGUNA AKHIR DESWIK, diakses Mei 21, 2026, [https://www.deswik.com/public-file/download/Commercial\_General\_Deswik-End-User-License-Agreement\_Nov2024\_ID](https://www.deswik.com/public-file/download/Commercial_General_Deswik-End-User-License-Agreement_Nov2024_ID)  
28. PIHC Klaim Akses Pupuk Subsidi Sudah Terintegrasi Lewat App \- Sektor Riil \- Page 2, diakses Mei 21, 2026, [https://www.bloombergtechnoz.com/detail-news/23001/pihc-klaim-akses-pupuk-subsidi-sudah-terintegrasi-lewat-app/2](https://www.bloombergtechnoz.com/detail-news/23001/pihc-klaim-akses-pupuk-subsidi-sudah-terintegrasi-lewat-app/2)  
29. Optimizing web experiences with Vercel Edge Middleware., diakses Mei 21, 2026, [https://vercel.com/resources/edge-middleware-experiments-personalization-performance](https://vercel.com/resources/edge-middleware-experiments-personalization-performance)  
30. API Encryption in Next.js: Keep Your Data Safe | by Kingson Ejikeme | Medium, diakses Mei 21, 2026, [https://medium.com/@kingsonejikeme\_31625/api-encryption-in-next-js-keep-your-data-safe-efdf94c0eae9](https://medium.com/@kingsonejikeme_31625/api-encryption-in-next-js-keep-your-data-safe-efdf94c0eae9)  
31. Can IndexedDB be encrypted for sensitive data? How would you do that? \- MindStick, diakses Mei 21, 2026, [https://www.mindstick.com/interview/34335/can-indexeddb-be-encrypted-for-sensitive-data-how-would-you-do-that](https://www.mindstick.com/interview/34335/can-indexeddb-be-encrypted-for-sensitive-data-how-would-you-do-that)  
32. How do you make End-to-End encryption as seamless as possible for the User? \- Reddit, diakses Mei 21, 2026, [https://www.reddit.com/r/webdev/comments/1qupl6m/how\_do\_you\_make\_endtoend\_encryption\_as\_seamless/](https://www.reddit.com/r/webdev/comments/1qupl6m/how_do_you_make_endtoend_encryption_as_seamless/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAWCAYAAACMq7H+AAAAc0lEQVR4Xu3WQQ2AMBBE0dGABbygBS04QAIScIADHKCD3ZQEspAsPXDiv2Qu7W3SbisBAAC80sYFnDrLdKQJe7/n5Swq5XCKgt4yi3IeeTmrZRDX6oZyEj53NssoCkpxmipcy2JoJ3j+K1BWBS+IHzeAr+zxHhN7nHzlGwAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAYAAACL6W/rAAAAbklEQVR4XmNgGAWjYBSMglEwCrACZXSBoQ7cgHglFAuhyQ1JAPLQCQaIh4ZFbGUA8U6GYeah60DcxTBMktyw8xAIgPLRMyCeyTCMPIUMhmWsIQNkDw6LggMdDLuiHh0Mew+CPDVsWh6jYBTQAQAAaYcTe7POon4AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGUAAAAWCAYAAADZylKgAAAAcUlEQVR4Xu3WwQmDUBBF0anBFlJDWrA4O0gJKSEdpKzMgAvJ0s1/i3PggeDyMmgVAADQtnMEefY+vVfv8feOxfbet/cuceJMnAkz1zPPBJlrmThzPeKEESfUNYzvzWKuJIgYQfwWBxEjzAQ5SgwA7vsB3fETXUhYSfEAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAWCAYAAAC2ew6NAAAAaUlEQVR4XmNgGAWjYBSMgmEDlNEFBhtwA+KVUCyEJjcoAMiBJxggDhyUoZkBxDsZBrkDrwNxF8MgjeJB70AQAKXDZ0A8k2EQOxIZDIlQRQbIDh6UGQkdDPqiCR0MOQeDHDloa6ZRMCwBAJqZE3vbXBegAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAAAWCAYAAADNcw4EAAAAdElEQVR4Xu3YQQmAUBBF0Z/BCmawguFsYAQj2MBYzoALcT3j6hx4ILi9DOIYAAAAAL+bnkG5JXbG9tj8eQcl1tgVO4bIaJKRZWB5zfIZyuX1ysjymomMFiKj1Tsw32OUcLUoJyrK+R1BOVHRIsPahqgAADrcuK0TXfku7oMAAAAASUVORK5CYII=>