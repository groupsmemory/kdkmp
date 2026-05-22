# **Laporan Riset Mendalam: Pengembangan MVP JASASAJA untuk Ekosistem Koperasi Desa dan Kelurahan Merah Putih (KDKMP) PT Agrinas Pangan Nusantara**

## **Analisis Pain Points Utama Tata Kelola Koperasi Pedesaan**

Akselerasi pembangunan Koperasi Desa dan Kelurahan Merah Putih (KDKMP) yang dimandatkan oleh Instruksi Presiden (Inpres) Nomor 17 Tahun 2025 memicu transformasi besar pada struktur kelembagaan ekonomi desa di Indonesia.1 Sebagai badan usaha yang ditugaskan memimpin proyek fisik dan operasionalisasi ini, PT Agrinas Pangan Nusantara (Persero)—yang bertransformasi dari entitas konstruksi terdahulu PT Yodya Karya (Persero) di bawah portofolio super holding Danantara—menghadapi tantangan manajerial yang masif.3 Transisi operasional dari sekadar pembangunan fisik gerai oleh aparat Tentara Nasional Indonesia (TNI) menuju pengelolaan bisnis riil yang sehat membutuhkan sistem digital yang mampu mengeliminasi berbagai hambatan operasional tradisional koperasi pedesaan.1

### **Transparansi Finansial dan Akuntabilitas Kas**

Salah satu hambatan terbesar dalam ekosistem koperasi pedesaan di Indonesia adalah lemahnya kompetensi manajerial dan akuntansi para pengurus lokal.7 Hal ini berdampak langsung pada tidak akuratnya pencatatan arus kas keuangan, laporan neraca yang terlambat disajikan, serta tingginya potensi salah saji finansial.7 Berdasarkan data pengawasan, banyak koperasi masih menggunakan pencatatan buku besar fisik yang rentan rusak atau hilang.7 Masalah ini diperparah dengan kebiasaan mencampuradukkan rekening pribadi pengurus dengan rekening operasional koperasi, serta penumpukan kas tunai di brankas gerai yang melebihi batas aman.7 Ketiadaan rekonsiliasi kas seketika (*real-time reconciliation*) menciptakan celah pengawasan yang sangat besar bagi badan pengawas internal maupun auditor eksternal.7

### **Rantai Pasok Logistik dan Manajemen Distribusi**

KDKMP memikul peran strategis sebagai penyalur kebutuhan pokok murah dan pupuk bersubsidi langsung ke kelompok tani.10 Namun, birokrasi distribusi pupuk subsidi sering kali menghadapi hambatan penyaluran akibat tidak meratanya infrastruktur digital dan lemahnya akurasi data penerima manfaat.12 Akibatnya, terjadi ketidaksesuaian alokasi kuota, kelangkaan pasokan di tingkat desa, hingga penyelewengan harga jual oleh kios-kios nakal.11 Di sisi lain, komitmen PT Agrinas dalam mendistribusikan armada logistik skala besar—termasuk rencana pengadaan armada truk logistik guna memangkas biaya distribusi—memerlukan sistem pemantauan posisi dan alokasi kendaraan yang presisi.1 Tanpa manajemen rantai pasok (*supply chain management*) digital yang terintegrasi, armada logistik berisiko tidak termobilisasi secara optimal untuk mengangkut hasil panen masyarakat.10

### **Pelaporan Birokrasi Multi-Tier ke PT Agrinas**

PT Agrinas Pangan Nusantara berkewajiban melakukan pendampingan manajemen kepada pengurus KDKMP selama dua tahun penuh sebelum diserahkan secara mandiri.1 Hambatan birokrasi yang berbelit-belit di tingkat daerah dan kementerian sering kali memperlambat koordinasi serta pengambilan keputusan strategis.17 Kasus pengunduran diri Direktur Utama Agrinas Pangan Nusantara terdahulu mengonfirmasi betapa rumitnya birokrasi lintas sektoral dalam merealisasikan ketahanan pangan di tingkat tapak.17 Pengiriman laporan operasional gerai, performa penjualan sembako, dan penyerapan panen dari ribuan KDKMP yang masih dilakukan secara manual berjenjang mengakibatkan data yang diterima manajemen pusat tidak sinkron dan terlambat untuk dievaluasi.6

### **Hambatan Izin PBG dan Legalitas Aset**

Pembangunan gerai fisik KDKMP di lapangan kerap menghadapi kendala administratif terkait penerbitan Persetujuan Bangunan Gedung (PBG).20 Hal ini terjadi karena sebagian besar lokasi gerai KDKMP memanfaatkan tanah kas desa atau aset pemerintah daerah dengan status pinjam pakai atau kerja sama pemanfaatan.2 Proses verifikasi dokumen hak atas tanah dan perjanjian pinjam pakai yang lambat dan bersifat manual di dinas pekerjaan umum setempat menyebabkan puluhan izin PBG tertunda, yang pada gilirannya menghambat kepastian operasional gerai yang telah selesai dibangun oleh TNI.1

## **Analisis Regulasi dan Kepatuhan Audit BUMN (Regulatory and Compliance)**

Sistem digital yang akan diarsitekturi oleh JASASAJA harus dirancang sebagai sistem yang siap audit (*audit-ready system*).21 Auditor pemerintah, dalam hal ini Badan Pemeriksa Keuangan (BPK) dan Badan Pengawasan Keuangan dan Pembangunan (BPKP), menerapkan standar pengawasan yang ketat terhadap pengelolaan keuangan negara dan aset BUMN yang diintegrasikan dengan koperasi pihak ketiga.21

### **Penerapan Sistem Pengendalian Intern Pemerintah (SPIP)**

Sesuai dengan amanat Peraturan Pemerintah Nomor 60 Tahun 2008, BPKP bertugas memastikan kepatuhan penerapan tata kelola, manajemen risiko, dan pengendalian intern yang terintegrasi dari level BUMN induk hingga ke unit mitra kerja sama seperti KDKMP.22 Sistem digital harus memfasilitasi rekaman jejak audit (*audit trail*) otomatis yang tidak dapat dimanipulasi (*immutable log*).24 Setiap pencatatan transaksi masuk-keluar barang di gudang KDKMP, persetujuan kredit mikro, dan penjualan retail harus mencantumkan stempel waktu (*timestamp*) dan identitas unik pelaksana transaksi.19

### **Mitigasi Transaksi Kas dan Batas Brankas Tunai**

BPK menekankan bahwa penyimpangan pengadaan dan penyalahgunaan dana operasional pada entitas publik sebagian besar disebabkan oleh tingginya volume transaksi kas tunai.25 Dalam kerangka pengawasan keuangan, auditor mewajibkan pengurangan transaksi tunai dan mengarahkan penggunaan Cash Management System (CMS) serta metode pembayaran non-tunai.9 Sistem digital JASASAJA harus menerapkan limitasi saldo kas tunai harian di tingkat gerai KDKMP.9 Sesuai dengan instruksi pengawasan keuangan BUMN, batas maksimal uang tunai fisik yang boleh disimpan di brankas gerai adalah sebesar Rp50.000.000,00.9 Sistem wajib memaksa admin melakukan penyetoran ke rekening bank resmi koperasi via CMS atau loket perbankan terdekat apabila saldo tunai harian melampaui batas tersebut, dilengkapi dengan Berita Acara Keadaan Kas otomatis.9

### **Standardisasi Akuntansi SAK EP**

Laporan keuangan yang dihasilkan oleh sistem KDKMP harus mematuhi Standar Akuntansi Keuangan Entitas Privat (SAK EP) yang menggantikan SAK ETAP per 1 Januari 2025\.21 Setiap entitas koperasi yang berjejaring dengan BUMN wajib menyajikan laporan posisi keuangan, laporan laba rugi, laporan perubahan ekuitas, dan laporan arus kas yang dihasilkan langsung dari penjurnalan berpasangan (*double-entry*) otomatis sistem.7 Hal ini krusial untuk memastikan kepatuhan saat BPK melakukan pemeriksaan semesteran atas laporan keuangan BUMN induk yang mengonsolidasikan kinerja mitra distribusi pangannya.9

### **Alokasi Pendapatan Asli Desa (PADes) dari SHU KDKMP**

Berdasarkan Instruksi Presiden Nomor 17 Tahun 2025, ekosistem KDKMP dirancang untuk memberikan dampak ekonomi langsung bagi pemerintah desa.3 Sistem pembagian hasil usaha digital wajib menerapkan kepatuhan pemotongan otomatis dari Sisa Hasil Usaha (SHU) koperasi tahunan untuk dialokasikan sebagai Pendapatan Asli Desa (PADes).3 Formula perhitungan kontribusi pembangunan desa tersebut disajikan secara matematis sebagai berikut:  
![][image1]  
Dimana kontribusi minimal sebesar 20% dari total SHU bersih tahunan KDKMP harus disalurkan ke rekening kas desa secara transparan dan tercatat dalam sistem APBDes desa setempat.3

## **Persona Pengguna dan Alur Perjalanan Pengguna (User Journey)**

Desain MVP JASASAJA harus mampu menjembatani perbedaan profil pengguna yang memiliki tingkat literasi teknologi dan kebutuhan operasional yang kontras.19

| Atribut Persona | Admin KDKMP | End-User (Anggota Koperasi) | Manajemen PT Agrinas |
| :---- | :---- | :---- | :---- |
| **Profil Faktual** | **Bapak Sukri (45 Tahun)**, Sekretaris Desa atau perangkat desa yang ditugaskan mengelola gerai fisik. 19 | **Ibu Sumiati (38 Tahun)**, petani tembakau atau buruh tani garam tradisional di pedesaan Pamekasan. 29 | **Ibu Diana (40 Tahun)**, Eksekutif Direktorat Operasional & Rantai Pasok PT Agrinas di Jakarta. 31 |
| **Literasi Digital** | Menengah. Terbiasa menggunakan aplikasi pesan instan, namun belum familier dengan aplikasi ERP atau sistem akuntansi kompleks. 19 | Rendah. Memiliki ponsel pintar dengan spesifikasi penyimpanan terbatas dan sensitif terhadap penggunaan kuota data internet. 27 | Tinggi. Menggunakan perangkat mutakhir, terbiasa mengevaluasi visualisasi data makro dan dasbor analitik bisnis. 19 |
| **Kebutuhan Utama** | Aplikasi kasir (POS) yang sederhana, pencatatan persediaan barang otomatis, pencatatan simpan-pinjam praktis, dan laporan keuangan instan tanpa rumus manual. 19 | Kemudahan pendaftaran anggota, transparansi jumlah simpanan, harga sembako murah, akses kredit modal cepat, dan kepastian harga beli panen. 10 | Dasbor pemantauan kinerja harian nasional, pelacakan armada logistik, deteksi penyimpangan keuangan gerai, dan laporan kepatuhan otomatis. 12 |

Penerimaan Barang & Pindai QR \-\> Update Stok Gudang Otomatis \-\> Transaksi Penjualan Sembako Nontunai \-\> Cetak Laporan Keuangan Harian SAK EP \[19, 21, 26\]

Aktivasi Anggota KDKMP \-\> Pengajuan Kredit Saprotan Murah \-\> Pencairan Kredit ke Dompet Digital \-\> Penebusan Pupuk Subsidi via QRIS 

Buka Dashboard Pusat \-\> Monitor Peta Distribusi Pangan Nasional \-\> Deteksi Batas Kas Brankas Gerai \-\> Rilis Instruksi Penjemputan Panen \[1, 9, 10\]

### **Alur Perjalanan Pengguna (User Journey) Detil**

#### **Admin KDKMP: Proses Penerimaan Stok dan Penjualan Sembako Ritel**

* **Penerimaan Komoditas**: Bapak Sukri menerima pengiriman beras dan minyak goreng murah dari truk logistik PT Agrinas.1 Ia membuka aplikasi JASASAJA, masuk ke menu "Penerimaan Logistik", dan memindai kode QR manifes pengiriman barang dari BUMN induk untuk memverifikasi volume dan jenis barang.19  
* **Pembaruan Inventaris**: Sistem secara otomatis mencatatkan barang masuk ke dalam kartu stok gudang digital, memperbarui nilai persediaan pada neraca keuangan koperasi, dan meniadakan proses pembukuan manual.7  
* **Transaksi POS Ritel**: Ibu Sumiati datang untuk membeli beras murah.10 Bapak Sukri menginput barang belanjaan pada POS digital.19 Sistem memunculkan harga khusus anggota dan mengintegrasikannya dengan pembayaran nontunai QRIS.26  
* **Penyelesaian Buku Harian**: Di akhir hari operasional, Bapak Sukri menekan tombol "Tutup Buku".19 Sistem secara otomatis memeriksa apakah total kas tunai di brankas fisik melebihi Rp50.000.000,00.9 Jika ya, sistem memblokir menu penjualan hari berikutnya dan mengeluarkan instruksi wajib setor tunai ke rekening bank via CMS.9

#### **End-User: Penebusan Pupuk Subsidi dan Penjualan Hasil Panen**

* **Pendaftaran Keanggotaan**: Ibu Sumiati melakukan aktivasi keanggotaan KDKMP melalui pemindaian KTP oleh admin desa untuk memvalidasi statusnya dalam pendaftaran kelompok tani.10  
* **Pengajuan Kredit Saprotan**: Menjelang musim tanam, Ibu Sumiati mengajukan kredit modal murah untuk membeli pupuk dan bibit tembakau melalui menu "Kredit Usaha Tani" di aplikasi.10  
* **Otorisasi dan Pencairan**: Kredit disetujui secara digital oleh pengurus koperasi berdasarkan rekam jejak historis.10 Dana dicairkan dalam bentuk saldo khusus (*closed-loop credit*) yang hanya dapat dibelanjakan di gerai KDKMP untuk menghindari penyalahgunaan dana pinjaman.10  
* **Penebusan Pupuk**: Ibu Sumiati menebus pupuk subsidi di gerai menggunakan saldo kredit digital tersebut, di mana sistem secara otomatis memotong kuota pupuk tahunan miliknya pada basis data i-Pubers.13  
* **Penjualan Hasil Panen**: Saat panen tiba, Ibu Sumiati menyerahkan hasil panen tembakau atau garamnya ke gudang KDKMP yang bertindak sebagai *off-taker*.10 Koperasi membeli hasil bumi tersebut dengan harga standar pemerintah, dan sistem langsung melakukan pemotongan otomatis atas cicilan kredit usaha tani miliknya.10

#### **Manajemen PT Agrinas: Pemantauan Logistik dan Kepatuhan Nasional**

* **Akses Dasbor Eksekutif**: Ibu Diana membuka dasbor JASASAJA di kantor pusat Jakarta untuk memantau performa operasional 30.000 gerai KDKMP secara nasional.31  
* **Analisis Persediaan**: Dasbor analitik menyajikan visualisasi tingkat ketersediaan sembako di setiap gerai percontohan, khususnya di wilayah Pamekasan.32 Sistem memberikan indikasi merah pada wilayah-wilayah yang mengalami lonjakan permintaan pangan atau penipisan stok pupuk.10  
* **Mobilisasi Armada**: Ibu Diana menggunakan fitur optimasi rute untuk mengarahkan armada truk logistik PT Agrinas melakukan pengiriman pasokan tambahan guna menjaga kestabilan harga pangan lokal.1  
* **Pengawasan Audit**: Dasbor kepatuhan menampilkan persentase transaksi non-tunai di seluruh gerai dan memberikan peringatan dini (*red flag warning*) jika terdapat unit gerai KDKMP yang menahan saldo kas fisik melebihi batas batas aman Rp50 juta selama lebih dari 48 jam.9

## **Lanskap Kompetitor dan Celah Strategis JASASAJA**

Guna merebut posisi tawar utama dalam pengadaan teknologi KDKMP di bawah kontrak PT Agrinas, JASASAJA wajib menganalisis kelemahan fatal platform kompetitor yang sudah ada di Indonesia.19

| Atribut Evaluasi | SIMKOPDES KDKMP (Baseline Pemerintah) | SAKTI Technology Suite (SAKTI.Link / SiCUNDO) | Keunggulan Strategis MVP JASASAJA |
| :---- | :---- | :---- | :---- |
| **Target Pasar & Arsitektur** | Sistem pencatatan dasar koperasi desa buatan Kemenkop RI untuk standardisasi data keanggotaan nasional. 10 | Core Banking System (CBS) yang sangat matang untuk ekosistem Credit Union (CU) dan koperasi syariah skala menengah-besar. 26 | Platform hibrida yang dirancang khusus untuk mengawinkan fungsi operasional gerai ritel pangan, logistik pupuk, dan audit BUMN. 9 |
| **Integrasi Rantai Pasok BUMN** | Tidak memiliki modul pelacakan armada logistik nasional maupun integrasi pergudangan dengan BUMN penyedia pasokan. 19 | Memiliki modul POS retail umum (LACI Mart), namun tidak terintegrasi dengan jaringan logistik atau armada truk BUMN pangan. 37 | Konektivitas langsung ke sistem pengadaan PT Agrinas, manajemen armada truk impor, serta pelacakan pengiriman secara langsung. 1 |
| **Kepatuhan Audit & Keuangan** | Hanya menyediakan pencatatan transaksi dasar tanpa adanya integrasi dasbor pengawasan kepatuhan auditor negara. 19 | Memiliki sertifikasi ISO 27001 dan SAK EP, tetapi tidak dirancang untuk integrasi sistem pengawasan kas tunai brankas BPKP. 21 | Memiliki modul kepatuhan audit bawaan, rekonsiliasi kas nontunai otomatis, dan pemblokiran otomatis batas aman kas brankas. 9 |
| **Kapasitas Wilayah Pelosok** | Membutuhkan koneksi internet yang stabil untuk melakukan input data secara berkelanjutan di aplikasi web. 19 | Aplikasi seluler memerlukan perangkat menengah dengan jangkauan internet aktif untuk menjalankan transaksi perbankan. 26 | Arsitektur luring-pertama (*offline-first*) yang dapat memproses transaksi di wilayah blank spot dan melakukan sinkronisasi otomatis. 6 |

### **Celah Fatal Kompetitor yang Menjadi Keunggulan JASASAJA**

#### **Isolasi Data Keuangan dan Fisik**

Aplikasi kompetitor seperti SAKTI.Link memisahkan ekosistem keuangan dari ekosistem logistik riil.26 Transaksi simpan-pinjam dan aktivitas perdagangan berjalan pada pilar yang terpisah, sehingga koperasi kesulitan melakukan pemotongan piutang otomatis saat petani menjual hasil panennya.7 JASASAJA menghadirkan ekosistem tertutup (*closed-loop ecosystem*) yang menyatukan arus barang fisik (input pertanian, sembako, hasil bumi) langsung dengan pencatatan pembukuan keuangan dan manajemen kredit anggota koperasi.10

#### **Ketiadaan Dasbor Mitigasi Risiko bagi BUMN Induk**

Kompetitor tidak menyediakan visibilitas data bagi PT Agrinas selaku BUMN penanggung jawab program yang menanamkan investasi sarana fisik dan pendampingan selama dua tahun.1 Koperasi dikelola secara mandiri tanpa pengawasan real-time yang dapat diakses oleh pihak eksternal penanggung jawab anggaran.7 JASASAJA menyuguhkan dasbor analitik pemantauan multi-tier yang memungkinkan manajemen PT Agrinas dan Kementerian BUMN mendeteksi dini inefisiensi, kebocoran kuota pupuk subsidi, dan penyimpangan pengelolaan keuangan di tingkat tapak desa.11

## **Konteks Lokal Wilayah Pamekasan (Pilot Project)**

Kabupaten Pamekasan, Madura, dipilih sebagai lokasi percontohan (*pilot project*) pembangunan gerai KDKMP dengan target pembangunan fisik sebanyak 189 gerai, di mana 35 gerai telah selesai 100% dan 145 lainnya sedang dalam proses penyelesaian fisik bersama Kodim setempat.36 MVP JASASAJA harus disesuaikan dengan kondisi geografis dan keunggulan komoditas lokal di wilayah Pamekasan.29

### **Geografi dan Infrastruktur Telekomunikasi Pamekasan**

Kabupaten Pamekasan memiliki kontur wilayah yang sangat kontras.30 Wilayah pesisir selatan (Kecamatan Pademawu, Larangan, Tlanakan) relatif datar dan memiliki jangkauan sinyal internet 4G yang sangat baik.29 Sebaliknya, wilayah dataran tinggi utara (Kecamatan Pakong, Pegantenan, Batumarmar) didominasi oleh perbukitan terjal yang masih memiliki banyak area blank spot seluler.6 Kondisi ini mengharuskan aplikasi JASASAJA menerapkan teknologi sinkronisasi pangkalan data lokal (*local database synchronization*) agar operasional transaksi di gerai KDKMP utara Pamekasan tidak lumpuh saat terjadi gangguan jaringan internet.6

### **Karakteristik Komoditas Unggulan Lokal Pamekasan**

#### **Tata Niaga Tembakau Madura**

Pamekasan merupakan episentrum penanaman tembakau rajangan dan krosok berkualitas tinggi di Pulau Madura, dengan pusat perdagangan utama terkonsentrasi di Kecamatan Larangan.30 Pendirian Koperasi Induk Tembakau Madura Sejahtera (KITMAS) oleh Kementerian Koperasi merupakan langkah strategis untuk meningkatkan posisi tawar petani dari cengkeraman tengkulak lokal (*bandol*).30  
Tengkulak sering kali mengeksploitasi petani melalui penilaian mutu (*grading*) daun tembakau secara subjektif dan tidak transparan.30 JASASAJA harus mengintegrasikan modul standarisasi mutu tembakau digital ke dalam MVP-nya.41 Fitur ini memandu admin KDKMP melakukan penilaian mutu daun tembakau berdasarkan parameter fisik objektif, seperti kecerahan warna (kuning kehijauan hingga merah bata), elastisitas lembaran daun, dan keunikan aroma aromatis khas Madura.41

Warna Fisik Daun (Kuning/Merah Bata) \+ Penilaian Elastisitas Daun \+ Pengujian Kadar Air & Aroma \-\> Grading Mutu Objektif Sistem \-\> Harga Jual Adil Terintegrasi Pabrik \[30, 41\]

#### **Sektor Pergaraman Nasional Pademawu**

Pesisir selatan Pamekasan, khususnya di Desa Majungan, Kecamatan Pademawu, merupakan sentra produksi garam rakyat utama yang telah terintegrasi dengan teknologi geomembran di bawah payung Perpres Nomor 126 Tahun 2022\.29 KDKMP Pademawu bertindak sebagai *off-taker* garam rakyat yang menyerap hasil produksi langsung dari nelayan garam setempat.29  
Sistem digital JASASAJA wajib memfasilitasi pencatatan berat timbangan garam yang akurat, pengujian tingkat kemurnian NaCl, dan pemesanan otomatis armada truk logistik PT Agrinas untuk mengangkut garam dari gudang desa menuju pelabuhan atau pabrik pengolahan guna memangkas biaya perantara.1

## **Ringkasan Eksekutif**

Laporan riset mendalam ini menyusun cetak biru pengembangan MVP JASASAJA guna mendukung operasionalisasi digital 189 unit Koperasi Desa dan Kelurahan Merah Putih (KDKMP) percontohan di Kabupaten Pamekasan, Madura.3 Melalui integrasi rantai pasok logistik PT Agrinas Pangan Nusantara dan pemenuhan ketat standar kepatuhan audit kas non-tunai BPKP, platform JASASAJA dirancang untuk memecahkan kelemahan fatal transparansi finansial dan birokrasi manual yang ada pada platform kompetitor.19 Pemanfaatan teknologi sinkronisasi luring (*offline-first*) serta digitalisasi standardisasi mutu komoditas lokal (tembakau KITMAS dan garam geomembran Pademawu) memosisikan JASASAJA sebagai solusi teknologi tunggal yang siap dikonsumsi oleh Gem Product Architect.19  
Silakan bawa hasil analisis ini ke Master Validator untuk penyelarasan strategis.

#### **Karya yang dikutip**

1. Sinergi Kodim 0818 dan PT Agrinas, 127 Gerai KDKMP di Kabupaten Malang Rampung 100 Persen, diakses Mei 21, 2026, [https://jatim.tribunnews.com/malang/545075/sinergi-kodim-0818-dan-pt-agrinas-127-gerai-kdkmp-di-kabupaten-malang-rampung-100-persen](https://jatim.tribunnews.com/malang/545075/sinergi-kodim-0818-dan-pt-agrinas-127-gerai-kdkmp-di-kabupaten-malang-rampung-100-persen)  
2. Inpres No. 17 Tahun 2025 Tentang Percepatan Pembangunan Fisik Gerai, Pergudangan dan Perlengkapan Koperasi Desa/Kelurahan Merah Putih, diakses Mei 21, 2026, [https://puusangi.desa.id/artikel/2025/10/25/inpres-no-17-tahun-2025-tentang-percepatan-pembangunan-fisik-gerai-pergudangan-dan-perlengkapan-koperasi-desakelurahan-merah-putih](https://puusangi.desa.id/artikel/2025/10/25/inpres-no-17-tahun-2025-tentang-percepatan-pembangunan-fisik-gerai-pergudangan-dan-perlengkapan-koperasi-desakelurahan-merah-putih)  
3. presiden \- republik indonesia, diakses Mei 21, 2026, [https://jdih.kop.go.id/admin/uploads/INSTRUKSI\_PRESIDEN\_REPUBLIK\_INDONESIA\_NOMOR\_17\_TAHUN\_2025\_TENTANG\_PERCEPATAN\_PEMBANGUNAN\_FISIK\_GERAI,\_PERGUDANGAN\_DAN\_PERLENGKAPAN\_KOPERASI\_DESA,\_KELURAHAN\_MERAH\_PUTIH.pdf](https://jdih.kop.go.id/admin/uploads/INSTRUKSI_PRESIDEN_REPUBLIK_INDONESIA_NOMOR_17_TAHUN_2025_TENTANG_PERCEPATAN_PEMBANGUNAN_FISIK_GERAI,_PERGUDANGAN_DAN_PERLENGKAPAN_KOPERASI_DESA,_KELURAHAN_MERAH_PUTIH.pdf)  
4. Fakta-fakta Agrinas: Perubahan Bisnis, Suntikan Modal, dan Lingkaran Kemenhan \- Industri Katadata.co.id, diakses Mei 21, 2026, [https://katadata.co.id/berita/industri/67e20f9424b6b/fakta-fakta-agrinas-perubahan-bisnis-suntikan-modal-dan-lingkaran-kemenhan](https://katadata.co.id/berita/industri/67e20f9424b6b/fakta-fakta-agrinas-perubahan-bisnis-suntikan-modal-dan-lingkaran-kemenhan)  
5. Agrinas Pangan Nusantara \- Wikipedia bahasa Indonesia, ensiklopedia bebas, diakses Mei 21, 2026, [https://id.wikipedia.org/wiki/Agrinas\_Pangan\_Nusantara](https://id.wikipedia.org/wiki/Agrinas_Pangan_Nusantara)  
6. Menkop: 1.061 Kopdes Merah Putih siap serap produk desa, diakses Mei 21, 2026, [https://www.antaranews.com/berita/5571023/menkop-1061-kopdes-merah-putih-siap-serap-produk-desa](https://www.antaranews.com/berita/5571023/menkop-1061-kopdes-merah-putih-siap-serap-produk-desa)  
7. 5 Kendala Umum Pengelolaan Koperasi dan Solusinya di Era Digital \- Elkopra, diakses Mei 21, 2026, [https://elkopra.com/5-kendala-umum-pengelolaan-koperasi-solusi-digital/](https://elkopra.com/5-kendala-umum-pengelolaan-koperasi-solusi-digital/)  
8. Rudy C Tarumingkeng: Mengapa Koperasi di Indonesia Kurang Berkembang?, diakses Mei 21, 2026, [https://rudyct.com/ab/Mengapa.KOPERASI.di.Indonesia.Kurang.Berkembang.pdf](https://rudyct.com/ab/Mengapa.KOPERASI.di.Indonesia.Kurang.Berkembang.pdf)  
9. Auditoria \- AMS | KKP \- Kementerian Kelautan dan Perikanan, diakses Mei 21, 2026, [https://ams.kkp.go.id/tagline](https://ams.kkp.go.id/tagline)  
10. Koperasi Merah Putih, diakses Mei 21, 2026, [https://simkopdes.go.id/](https://simkopdes.go.id/)  
11. Menteri Koperasi Soroti 'Biang Kerok' Pupuk Bersubsidi Tak Sampai ke Petani di Pedesaan, diakses Mei 21, 2026, [https://investortrust.id/business/83308/menteri-koperasi-soroti-biang-kerok-pupuk-bersubsidi-tak-sampai-ke-petani-di-pedesaan](https://investortrust.id/business/83308/menteri-koperasi-soroti-biang-kerok-pupuk-bersubsidi-tak-sampai-ke-petani-di-pedesaan)  
12. Optimalisasi Tata Kelola Pupuk Bersubsidi: Strategi Pencegahan Maladministrasi Berbasis Analisis SWOT dan PESTEL \- URINDO, diakses Mei 21, 2026, [https://ejournal.urindo.ac.id/index.php/administrasimanajemen/article/download/7393/2482](https://ejournal.urindo.ac.id/index.php/administrasimanajemen/article/download/7393/2482)  
13. ANALISIS KINERJA MANAJEMEN RANTAI PASOK PUPUK SUBSIDI (STUDI KASUS \- PoltradaBali, diakses Mei 21, 2026, [https://digilib.poltradabali.ac.id/437/1/COVER-BAB%20III.pdf](https://digilib.poltradabali.ac.id/437/1/COVER-BAB%20III.pdf)  
14. Koperasi Merah Putih: Solusi Prabowo Atasi Masalah Petani Indonesia \- Merdeka.com, diakses Mei 21, 2026, [https://www.merdeka.com/politik/koperasi-merah-putih-solusi-prabowo-atasi-masalah-petani-indonesia-573525-mvk.html](https://www.merdeka.com/politik/koperasi-merah-putih-solusi-prabowo-atasi-masalah-petani-indonesia-573525-mvk.html)  
15. Review Website Agrinas Pangan Nusantara \- Importir Pikup India 24,66 TRILIUN \- YouTube, diakses Mei 21, 2026, [https://www.youtube.com/watch?v=YiXhuwqIWPM](https://www.youtube.com/watch?v=YiXhuwqIWPM)  
16. Agrinas Buka Suara soal Proyek Kopdes Merah Putih \- detikFinance \- detikcom, diakses Mei 21, 2026, [https://finance.detik.com/berita-ekonomi-bisnis/d-8395885/agrinas-buka-suara-soal-proyek-kopdes-merah-putih](https://finance.detik.com/berita-ekonomi-bisnis/d-8395885/agrinas-buka-suara-soal-proyek-kopdes-merah-putih)  
17. Profil Dirut Agrinas Pangan yang Mundur Meski Baru 6 Bulan Menjabat \- Tempo.co, diakses Mei 21, 2026, [https://tempo.co/ekonomi/profil-dirut-agrinas-pangan-yang-mundur-meski-baru-6-bulan-menjabat-2057550](https://tempo.co/ekonomi/profil-dirut-agrinas-pangan-yang-mundur-meski-baru-6-bulan-menjabat-2057550)  
18. Profil Agrinas Pangan: BUMN yang Urus 425 Ribu Ha Sawah, Dirutnya Kini Mundur, diakses Mei 21, 2026, [https://m.kumparan.com/kumparanbisnis/profil-agrinas-pangan-bumn-yang-urus-425-ribu-ha-sawah-dirutnya-kini-mundur-25diWmikuuE](https://m.kumparan.com/kumparanbisnis/profil-agrinas-pangan-bumn-yang-urus-425-ribu-ha-sawah-dirutnya-kini-mundur-25diWmikuuE)  
19. Aplikasi Mobile SIMKOPDES KDKMP untuk Digitalisasi Koperasi Desa dan Kelurahan, diakses Mei 21, 2026, [https://www.harapanrakyat.com/2026/05/aplikasi-mobile-simkopdes-kdkmp-untuk-digitalisasi-koperasi-desa-dan-kelurahan/](https://www.harapanrakyat.com/2026/05/aplikasi-mobile-simkopdes-kdkmp-untuk-digitalisasi-koperasi-desa-dan-kelurahan/)  
20. Tunggu Regulasi Pusat, DPUPR Magetan Berhati-hati Terbitkan PBG Proyek KDKMP, diakses Mei 21, 2026, [https://bidiknasional.com/2026/05/20/tunggu-regulasi-pusat-dpupr-magetan-berhati-hati-terbitkan-pbg-proyek-kdkmp/](https://bidiknasional.com/2026/05/20/tunggu-regulasi-pusat-dpupr-magetan-berhati-hati-terbitkan-pbg-proyek-kdkmp/)  
21. Audit Keuangan BPK Indonesia dan Reformasi | PDF \- Scribd, diakses Mei 21, 2026, [https://id.scribd.com/document/756155784/indonesian-Financial-Audit-Agency-INDON](https://id.scribd.com/document/756155784/indonesian-Financial-Audit-Agency-INDON)  
22. BPKP Berperan dalam Memperkuat Tata Kelola BUMN, diakses Mei 21, 2026, [https://bpkp.go.id/id/berita/zawj/bpkp-berperan-dalam-memperkuat-tata-kelola-bumn](https://bpkp.go.id/id/berita/zawj/bpkp-berperan-dalam-memperkuat-tata-kelola-bumn)  
23. Majalah CogniView \- BPKP, diakses Mei 21, 2026, [https://www.bpkp.go.id/assets/majalah/file/10/202409130539CogniView%202%202024%20Cetak.pdf](https://www.bpkp.go.id/assets/majalah/file/10/202409130539CogniView%202%202024%20Cetak.pdf)  
24. Luncurkan Fitur e-Audit Baru, KPK dan BPKP-LKPP Perkuat Akurasi dan Transparansi Pengadaan, diakses Mei 21, 2026, [https://www.kpk.go.id/id/ruang-informasi/berita/luncurkan-fitur-e-audit-baru-kpk-dan-bpkp-lkpp-perkuat-akurasi-dan-transparansi-pengadaan](https://www.kpk.go.id/id/ruang-informasi/berita/luncurkan-fitur-e-audit-baru-kpk-dan-bpkp-lkpp-perkuat-akurasi-dan-transparansi-pengadaan)  
25. BPK : transaksi nontunai dalam pengadaan tekan korupsi \- ANTARA News Yogyakarta, diakses Mei 21, 2026, [https://jogja.antaranews.com/berita/317278/bpk--transaksi-nontunai-dalam-pengadaan-tekan-korupsi](https://jogja.antaranews.com/berita/317278/bpk--transaksi-nontunai-dalam-pengadaan-tekan-korupsi)  
26. SAKTI.Link: Home, diakses Mei 21, 2026, [https://sakti.link/](https://sakti.link/)  
27. Pentingnya Koperasi Digital di Era Modern Saat Ini \- Telkomsel, diakses Mei 21, 2026, [https://www.telkomsel.com/enterprise/insight/blog/solusi-koperasi-digital](https://www.telkomsel.com/enterprise/insight/blog/solusi-koperasi-digital)  
28. Wabup Pamekasan Tegaskan Komitmen Percepatan Pembangunan Koperasi Merah Putih, diakses Mei 21, 2026, [https://wartaumum.com/wabup-pamekasan-tegaskan-komitmen-percepatan-pembangunan-koperasi-merah-putih/](https://wartaumum.com/wabup-pamekasan-tegaskan-komitmen-percepatan-pembangunan-koperasi-merah-putih/)  
29. Pemkab Pamekasan Bantu Petani Garam dengan Teknologi Geomembran \- GOnews.id, diakses Mei 21, 2026, [https://www.gonews.id/pemkab-pamekasan-bantu-petani-garam-dengan-teknologi-geomembran/](https://www.gonews.id/pemkab-pamekasan-bantu-petani-garam-dengan-teknologi-geomembran/)  
30. (PDF) TATA NIAGA TEMBAKAU DI MADURA \- ResearchGate, diakses Mei 21, 2026, [https://www.researchgate.net/publication/50434635\_TATA\_NIAGA\_TEMBAKAU\_DI\_MADURA](https://www.researchgate.net/publication/50434635_TATA_NIAGA_TEMBAKAU_DI_MADURA)  
31. Visi Misi \- PT Agrinas Jaladri Nusantara, diakses Mei 21, 2026, [https://agrinasjaladri.co.id/tentang-kami](https://agrinasjaladri.co.id/tentang-kami)  
32. SIMKOPDES \- Apl di Google Play, diakses Mei 21, 2026, [https://play.google.com/store/apps/details?id=id.kop.merahputih.kdmp\_mobile\_app\&hl=ms](https://play.google.com/store/apps/details?id=id.kop.merahputih.kdmp_mobile_app&hl=ms)  
33. Pertama di Indonesia, Menkop RI Resmikan Koperasi Tembakau Pamekasan, diakses Mei 21, 2026, [https://detektifjatim.com/2026/02/pertama-di-indonesia-menkop-ri-resmikan-koperasi-tembakau-pamekasan/](https://detektifjatim.com/2026/02/pertama-di-indonesia-menkop-ri-resmikan-koperasi-tembakau-pamekasan/)  
34. Transformasi Kelembagaan Tani: Jalan Menuju Kemandirian Ekonomi Petani Tembakau di Kabupaten Pamekasan Halaman 1 \- Kompasiana.com, diakses Mei 21, 2026, [https://www.kompasiana.com/fara24476/68512c60ed641530fd5490d2/transformasi-kelembagaan-tani-jalan-menuju-kemandirian-ekonomi-petani-tembakau-di-kabupaten-pamekasan](https://www.kompasiana.com/fara24476/68512c60ed641530fd5490d2/transformasi-kelembagaan-tani-jalan-menuju-kemandirian-ekonomi-petani-tembakau-di-kabupaten-pamekasan)  
35. Prabowo resmikan operasional 1.061 Koperasi Desa/Kelurahan Merah Putih, diakses Mei 21, 2026, [https://www.antaranews.com/berita/5569561/prabowo-resmikan-operasional-1061-koperasi-desa-kelurahan-merah-putih](https://www.antaranews.com/berita/5569561/prabowo-resmikan-operasional-1061-koperasi-desa-kelurahan-merah-putih)  
36. Progres Pembangunan Gerai Koperasi Merah Putih di Pamekasan Capai 95 Persen, diakses Mei 21, 2026, [https://rri.co.id/sampang/asta-cita/2353569/progres-pembangunan-gerai-koperasi-merah-putih-di-pamekasan-capai-95-persen](https://rri.co.id/sampang/asta-cita/2353569/progres-pembangunan-gerai-koperasi-merah-putih-di-pamekasan-capai-95-persen)  
37. SAKTI.Technology, diakses Mei 21, 2026, [https://sakti.technology/](https://sakti.technology/)  
38. KMP Aset Digital Nusantara Gunakan Aplikasi Sakti, diakses Mei 21, 2026, [https://asetdigital.coop.id/blog/detail/kmp-aset-digital-nusantara-gunakan-aplikasi-sakti](https://asetdigital.coop.id/blog/detail/kmp-aset-digital-nusantara-gunakan-aplikasi-sakti)  
39. Menkop kukuhkan koperasi tembakau pertama di Indonesia \- ANTARA News Jawa Timur, diakses Mei 21, 2026, [https://jatim.antaranews.com/berita/1037982/menkop-kukuhkan-koperasi-tembakau-pertama-di-indonesia](https://jatim.antaranews.com/berita/1037982/menkop-kukuhkan-koperasi-tembakau-pertama-di-indonesia)  
40. REFORMASI USAHA TANI MASYARAKAT MADURA (Studi Tentang Prilaku Petani Tembakau ke Pertanian Tebu Lahan Kering di Kabupaten Pamekasan) \- Neliti, diakses Mei 21, 2026, [https://media.neliti.com/media/publications/90706-ID-reformasi-usaha-tani-masyarakat-madura-s.pdf](https://media.neliti.com/media/publications/90706-ID-reformasi-usaha-tani-masyarakat-madura-s.pdf)  
41. Tata Niaga Tembakau di Madura, diakses Mei 21, 2026, [https://ced.petra.ac.id/index.php/man/article/view/15612/15604](https://ced.petra.ac.id/index.php/man/article/view/15612/15604)

[image1]: <data:image/png;base64,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>