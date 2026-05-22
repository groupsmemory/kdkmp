# **Cetak Biru Akselerasi KDKMP JASASAJA: Arsitektur GEO Sistemik, Programmatic SEO Wilayah Spasial, Meta Ads CAPI Bebas Sumber Daya, dan Penyelarasan Kepatuhan Regulasi Inpres 17/2025**

Transformasi tata kelola ekonomi desa nasional melalui pembentukan Koperasi Desa dan Kelurahan Merah Putih (KDKMP) merupakan amanat strategis dari Instruksi Presiden (Inpres) Nomor 17 Tahun 2025\. Di bawah naungan portofolio *super holding* Danantara, PT Agrinas Pangan Nusantara (Persero) ditugaskan untuk mengoperasionalkan 189 gerai percontohan di Kabupaten Pamekasan, Madura, sebelum melakukan ekspansi ke 30.000 gerai nasional.1  
Guna memastikan akuntabilitas mutlak yang siap diaudit oleh Badan Pemeriksa Keuangan (BPK) dan Badan Pengawasan Keuangan dan Pembangunan (BPKP), platform *Software-as-a-Service* (SaaS) JASASAJA dirancang dengan arsitektur hibrida berkeamanan tinggi yang meminimalkan overhead operasional.1  
Prinsip utama dari pertumbuhan JASASAJA adalah *zero organic social media overhead*. Akuisisi portofolio dan branding murni mengandalkan kekuatan optimasi mesin pencari tradisional (SEO), optimasi mesin pencari generatif kecerdasan buatan atau *Generative Engine Optimization* (GEO), dan iklan berbayar Meta Ads langsung ke situs web.  
Arsitektur ini dioptimalkan pada batas *free tier* (Vercel Hobby, NeonDB Free, Upstash Free 10k, RajaOngkir Starter, dan Xendit Pay-per-Tx) guna menghemat kuota operasional serverless tanpa mengorbankan performa.  
Berikut adalah tabel komparatif keunggulan strategis JASASAJA terhadap kompetitor *baseline* pemerintah dan platform komersial yang ada:

### **Tabel 1: Analisis Komparatif Lanskap Sistem Koperasi Pedesaan**

| Atribut Evaluasi | SIMKOPDES KDKMP (Baseline Pemerintah) | SAKTI Technology Suite (SAKTI.Link) | Keunggulan Strategis MVP JASASAJA |
| :---- | :---- | :---- | :---- |
| **Target Pasar & Arsitektur** | Pencatatan dasar koperasi desa buatan Kemenkop RI untuk standardisasi data.1 | *Core Banking System* (CBS) untuk Credit Union dan koperasi syariah menengah-besar.1 | Platform hibrida multi-tenant terisolasi per gerai via Row-Level Security (RLS) NeonDB.1 |
| **Integrasi Rantai Pasok BUMN** | Tidak memiliki modul pelacakan armada logistik maupun integrasi BUMN penyedia pasokan.1 | Modul POS retail umum, tidak terhubung dengan jaringan logistik atau armada truk BUMN.1 | Konektivitas langsung ke sistem pengadaan PT Agrinas, optimasi rute armada, dan monitoring real-time.1 |
| **Kepatuhan Audit & Keuangan** | Pencatatan transaksi dasar tanpa integrasi dasbor pengawasan internal.1 | Sertifikasi ISO 27001 dan SAK EP, tanpa fitur pengawasan kas brankas real-time BPKP.1 | Modul kepatuhan audit bawaan, rekonsiliasi kas otomatis SAK EP harian, dan penguncian brankas otomatis.1 |
| **Kapasitas Wilayah Pelosok** | Membutuhkan koneksi internet stabil terus-menerus.1 | Memerlukan perangkat berspesifikasi menengah dengan internet aktif.1 | Arsitektur luring-pertama (*offline-first*) terenkripsi AES-GCM 256-bit dengan sinkronisasi otomatis.1 |

## **1\. STRATEGI GEO (GENERATIVE ENGINE OPTIMIZATION) BERBIAYA RP0**

Mesin pencari generatif berbasis kecerdasan buatan seperti Perplexity, Gemini, dan SearchGPT memproses informasi dengan mengidentifikasi entitas, relasi semantik, dan integritas data terstruktur daripada sekadar memindai kepadatan kata kunci (*keyword density*).3 GEO yang sukses membutuhkan penyediaan kebenaran mutlak (*ground-truth verification*) yang disajikan dalam format yang dapat diekstraksi secara instan oleh perayap kecerdasan buatan (*AI crawlers*).4  
Untuk mencapai efisiensi biaya Rp0 di atas infrastruktur *free tier*, data skema ini di-render secara statis melalui mekanisme *Static Site Generation* (SSG) atau *Incremental Static Regeneration* (ISR) pada Next.js.1 Dengan cara ini, perayap AI dapat mengonsumsi dokumen JSON-LD langsung dari CDN Edge Vercel tanpa memicu kueri ke basis data NeonDB, yang pada gilirannya menghemat kuota koneksi concurrent database dan meminimalkan beban komputasi serverless.1  
Berikut adalah rancangan struktur data terstruktur JSON-LD hibrida yang menggabungkan entitas Cooperative 11, Corporation 12, dan Store 13 untuk secara eksplisit mendefinisikan relasi kelembagaan KDKMP di bawah binaan PT Agrinas Pangan Nusantara (Persero).  
Komponen ini dirancang agar siap di-inject oleh KIRO ke dalam repositori Next.js App Router.

TypeScript  
// app/components/GEOStructuredData.tsx  
import React from 'react';

interface GEOStructuredDataProps {  
  tenantName: string;  
  region: string;  
  subdistrict: string;  
  village: string;  
  latitude: number;  
  longitude: number;  
  tenantId: string;  
}

export default function GEOStructuredData({  
  tenantName,  
  region,  
  subdistrict,  
  village,  
  latitude,  
  longitude,  
  tenantId,  
}: GEOStructuredDataProps) {  
    
  // Membangun skema representasi entitas multi-type SDO yang ramah AI Crawler  
  const jsonLd \= {  
    '@context': 'https://schema.org',  
    '@graph':  
      },  
      {  
        '@type': 'Store',  
        '@id': \`https://jasasaja.co.id/region/${region.toLowerCase()}/${subdistrict.toLowerCase()}/${village.toLowerCase()}\#store\`,  
        'name': \`Gerai Retail KDKMP Desa ${village}\`,  
        'branchOf': {  
          '@id': \`https://jasasaja.co.id/region/${region.toLowerCase()}/${subdistrict.toLowerCase()}/${village.toLowerCase()}\#cooperative\`  
        },  
        'currenciesAccepted': 'IDR',  
        'paymentAccepted': 'Cash, QRIS, Closed-loop Kredit Saprotan',  
        'priceRange': '$$',  
        'identifier': tenantId  
      }  
    \]  
  };

  // Penerapan sanitasi karakter untuk mencegah injeksi XSS pada JSON.stringify  
  const sanitizedSchema \= JSON.stringify(jsonLd).replace(/\</g, '\\\\u003c');

  return (  
    \<script  
      type="application/ld+json"  
      dangerouslySetInnerHTML={{ \_\_html: sanitizedSchema }}  
    /\>  
  );  
}

## **2\. PROGRAMMATIC SEO & CONTENT URL ARCHITECTURE VIA KIRO**

Kabupaten Pamekasan menyajikan kontras geografis yang tajam. Wilayah pesisir selatan (Pademawu, Larangan, Tlanakan) memiliki konektivitas seluler 4G yang sangat stabil, sementara wilayah perbukitan utara (Pakong, Pegantenan, Batumarmar) didominasi blank spot seluler.1  
Untuk memetakan kueri pencatatan dari perangkat desa atau instansi pusat tanpa menulis artikel manual, JASASAJA menerapkan arsitektur URL berbasis spasial wilayah Madura.

### **A. Desain Hierarki URL Spasial Pamekasan**

Rute URL dirancang mengikuti jalur administrasi geospasial guna menangkap maksud pencarian (*search intent*) spesifik instansi BUMN maupun perangkat desa :

* /pamekasan/pademawu/majungan — Sentra garam geomembran nelayan pesisir selatan.1  
* /pamekasan/larangan/larangan — Sentra tembakau rajangan Madura (KITMAS).1  
* /pamekasan/pakong/pakong — Wilayah perbukitan terjal utara dengan tantangan blank spot.1

### **B. Template Integrasi page.tsx Next.js (KIRO-Ready)**

Sistem menggunakan generator parameter statis (generateStaticParams) untuk mem-build seluruh 189 gerai Pamekasan sebagai halaman HTML statis pada saat proses kompilasi (*build-time*).1 Langkah ini mengeliminasi beban kueri *runtime node* pada NeonDB Free, menjaga penggunaan compute-hours Vercel tetap nol selama lonjakan trafik pencarian organik.1  
Berikut adalah template file app/pamekasan/\[subdistrict\]/\[village\]/page.tsx yang telah terintegrasi dengan Metadata API Next.js 1:

TypeScript  
// app/pamekasan/\[subdistrict\]/\[village\]/page.tsx  
import React from 'react';  
import { Metadata } from 'next';  
import { notFound } from 'next/navigation';  
import { Pool } from 'pg';  
import GEOStructuredData from '@/components/GEOStructuredData';

// Setup connection pooling ke NeonDB PostgreSQL dengan konfigurasi serverless-optimized  
const dbPool \= new Pool({  
  connectionString: process.env.DATABASE\_URL,  
  max: 5, // Menghemat limitasi koneksi NeonDB Free Tier  
  idleTimeoutMillis: 10000,  
});

interface PageProps {  
  params: Promise\<{  
    subdistrict: string;  
    village: string;  
  }\>;  
}

// 1\. GENERATE STATIC PARAMS: Mengambil semua data wilayah spasial untuk di-render menjadi HTML Statis saat build-time  
export async function generateStaticParams() {  
  const client \= await dbPool.connect();  
  try {  
    const result \= await client.query(\`  
      SELECT subdistrict, village   
      FROM tenants   
      WHERE region \= 'Pamekasan'  
    \`);  
      
    return result.rows.map((row) \=\> ({  
      subdistrict: row.subdistrict.toLowerCase(),  
      village: row.village.toLowerCase(),  
    }));  
  } catch (err) {  
    console.error('Gagal memproses Static Params pSEO:', err);  
    return;  
  } finally {  
    client.release();  
  }  
}

// 2\. GENERATE METADATA: Optimasi Meta Tags untuk Perplexity, Gemini, dan SearchGPT secara dinamis  
export async function generateMetadata({ params }: PageProps): Promise\<Metadata\> {  
  const { subdistrict, village } \= await params;  
  const cap \= (s: string) \=\> s.replace(/\\b\\w/g, (c) \=\> c.toUpperCase());  
  const vName \= cap(decodeURIComponent(village));  
  const sName \= cap(decodeURIComponent(subdistrict));

  const title \= \`KDKMP Desa ${vName}, ${sName} \- Sistem Akuntansi SAK EP Terintegrasi\`;  
  const description \= \`Analisis operasional dan audit kepatuhan digital Koperasi Desa Merah Putih (KDKMP) Desa ${vName}, Kecamatan ${sName}, Kabupaten Pamekasan. Didukung teknologi SaaS JASASAJA POS luring-pertama.\`;

  return {  
    title,  
    description,  
    alternates: {  
      canonical: \`https://jasasaja.co.id/pamekasan/${subdistrict}/${village}\`,  
    },  
    openGraph: {  
      title,  
      description,  
      url: \`https://jasasaja.co.id/pamekasan/${subdistrict}/${village}\`,  
      type: 'website',  
      images:  
    },  
    robots: {  
      index: true,  
      follow: true,  
      googleBot: {  
        index: true,  
        follow: true,  
        maxSnippet: \-1,  
        maxImagePreview: 'large',  
      }  
    }  
  };  
}

// 3\. PAGE COMPONENT: Dirender di server sebagai HTML statis  
export default async function VillageLandingPage({ params }: PageProps) {  
  const { subdistrict, village } \= await params;  
  const client \= await dbPool.connect();  
    
  let tenant \= null;  
  try {  
    const result \= await client.query(  
      \`SELECT id, name, region, subdistrict, village, latitude, longitude   
       FROM tenants   
       WHERE region \= 'Pamekasan'   
         AND LOWER(subdistrict) \= $1   
         AND LOWER(village) \= $2   
       LIMIT 1\`,  
       
    );  
    tenant \= result.rows;  
  } catch (err) {  
    console.error('Database query error:', err);  
  } finally {  
    client.release();  
  }

  if (\!tenant) {  
    notFound();  
  }

  return (  
    \<div className="bg-\[\#FFFFFF\] text-\[\#1A1A1A\] p-6 font-sans min-h-screen"\>  
      {/\* Menyisipkan Skema GEO JSON-LD secara Statis tanpa overhead runtime database \*/}  
      \<GEOStructuredData  
        tenantName={tenant.name}  
        region={tenant.region}  
        subdistrict={tenant.subdistrict}  
        village={tenant.village}  
        latitude={parseFloat(tenant.latitude)}  
        longitude={parseFloat(tenant.longitude)}  
        tenantId={tenant.id}  
      /\>  
        
      \<div className="max-w-3xl mx-auto border-8 border-\[\#1A1A1A\] p-8 shadow-\[12px\_12px\_0px\_0px\_\#1A1A1A\]"\>  
        \<span className="bg-\[\#1A1A1A\] text-\[\#FFFFFF\] text-xs font-mono py-1 px-3 uppercase tracking-widest"\>  
          Pilot Project APN \- Pamekasan  
        \</span\>  
        \<h1 className="text-3xl font-black mt-4 uppercase tracking-tight"\>  
          Sistem KDKMP Desa {tenant.village}  
        \</h1\>  
        \<p className="text-gray-600 mt-2 font-mono text-sm uppercase"\>  
          Kecamatan {tenant.subdistrict} | Lat: {tenant.latitude} Long: {tenant.longitude}  
        \</p\>  
          
        \<hr className="my-6 border-t-4 border-\[\#1A1A1A\]" /\>  
          
        \<div className="space-y-4 text-sm leading-relaxed"\>  
          \<p\>  
            Operasional digitalisasi KDKMP Desa {tenant.village} diarsitekturi oleh platform \<strong\>JASASAJA\</strong\> guna memenuhi standar audit BPK dan BPKP RI. Infrastruktur dirancang agar mampu beroperasi secara luring penuh saat terjadi kendala jaringan telekomunikasi seluler di wilayah perbukitan Pamekasan Utara.  
          \</p\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}

### **C. Konfigurasi Sitemaps untuk Programmatic SEO (sitemap.ts)**

Sitemap harus digenerasikan secara dinamis untuk mengindeks seluruh 189 rute gerai percontohan KDKMP tanpa konfigurasi manual.14

TypeScript  
// app/sitemap.ts  
import { MetadataRoute } from 'next';  
import { Pool } from 'pg';

const dbPool \= new Pool({  
  connectionString: process.env.DATABASE\_URL,  
  max: 2, // Menggunakan seminimal mungkin koneksi untuk keperluan sitemap build  
});

export default async function sitemap(): Promise\<MetadataRoute.Sitemap\> {  
  const baseUrl \= 'https://jasasaja.co.id';  
  const client \= await dbPool.connect();  
    
  try {  
    const result \= await client.query(\`  
      SELECT subdistrict, village, created\_at   
      FROM tenants   
      WHERE region \= 'Pamekasan'  
    \`);  
      
    const spatialRoutes \= result.rows.map((row) \=\> ({  
      url: \`${baseUrl}/pamekasan/${row.subdistrict.toLowerCase()}/${row.village.toLowerCase()}\`,  
      lastModified: new Date(row.created\_at),  
      changeFrequency: 'weekly' as const,  
      priority: 0.8,  
    }));

    return;  
  } catch (err) {  
    console.error('Error saat membangun XML sitemap:', err);  
    return;  
  } finally {  
    client.release();  
  }  
}

## **3\. META ADS CONVERSION FUNNEL (PORTFOLIO JASASAJA)**

Funnel akuisisi portofolio JASASAJA memotong jalur optimasi konten media sosial organik yang berbiaya tinggi dan berskala lambat. Strategi ini murni mengandalkan jalur iklan berbayar Meta Ads berkinerja tinggi yang langsung mengarahkan audiens sasaran (Direksi BUMN, Kementerian, Pengurus Koperasi) ke halaman landas web.

### **A. Strategi Kampanye Kontras Tinggi B2B**

Iklan dirancang dengan pendekatan visual brutalistik kontras tinggi untuk menarik perhatian pejabat eksekutif yang sibuk saat berselancar di platform digital.

* **Warna Desain:** Dominasi warna latar terang kontras tinggi (\#FFFFFF) dengan elemen pembatas hitam tebal (\#1A1A1A) dan aksen hijau toska neon (\#00F2FE).1 Kombinasi warna ini memancarkan kesan formalitas, kedisiplinan, dan integritas data yang kokoh.1  
* **Pesan Salinan (Ad Copy):** Menyoroti mitigasi risiko audit finansial secara frontal: *"Uang Brankas Koperasi Sering Selisih? KDKMP Pamekasan Terapkan Sistem POS Luring-Pertama JASASAJA. Kas Terkunci Otomatis Jika di Atas Rp50 Juta. Bebas Temuan BPK & BPKP."* 1  
* **Targeting Pemirsa:** Penargetan demografi spesifik Indonesia yang berfokus pada: Pengurus Koperasi Kredit, Direksi BUMN Konstruksi & Pangan, Pejabat Kementerian Desa PDT, SPIP, Audit Internal BUMN, dan Anggota Dewan Koperasi Indonesia (DEKOPIN).1

### **B. Setup Native Conversions API (CAPI) Bebas Sumber Daya**

Untuk menghindari ketergantungan pada pustaka pelacak pihak ketiga yang membebani komputasi server atau memicu biaya sewa server pihak ketiga (seperti GTM Server-side atau Stape.io) 17, JASASAJA mengimplementasikan serverless Conversions API secara native.17  
CAPI ini dieksekusi secara efisien menggunakan runtime Edge atau Serverless Next.js melalui rute API Web standard native fetch.17  
Berikut adalah diagram alir fungsional penanganan piksel dan deduplikasi server-side:

 \----(Meta Pixel Script \- Client Event with Event ID)----\> \[Meta Graph API\]  
       |  
       | (Post payload transaksi ke Vercel Serverless Route Handler)  
       v  
   
       | \-- Hashing PII (Email & No. HP) via SHA-256   
       | \-- Fetch Native (Meta Graph API Post \- Server Event with SAME Event ID)  
       v  
 \<--- Deduplikasi otomatis oleh Meta berdasarkan Event ID 

Berikut adalah file route handler Next.js API /app/api/v1/meta-capi/route.ts yang siap di-inject oleh KIRO 1:

TypeScript  
// app/api/v1/meta-capi/route.ts  
import { NextRequest, NextResponse } from 'next';  
import crypto from 'crypto';

// Fungsi enkripsi satu arah SHA-256 untuk pematuhan GDPR & regulasi privasi data  
function encryptSHA256(value: string): string {  
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');  
}

export async function POST(request: NextRequest) {  
  try {  
    const body \= await request.json();  
    const {   
      eventName,   
      eventId,   
      email,   
      phone,   
      value,   
      currency \= 'IDR'   
    } \= body;

    const pixelId \= process.env.META\_PIXEL\_ID;  
    const capiToken \= process.env.META\_CAPI\_TOKEN;

    if (\!pixelId ||\!capiToken) {  
      return NextResponse.json(  
        { error: 'Konfigurasi kredensial API Meta tidak ditemukan.' },   
        { status: 500 }  
      );  
    }

    const clientIp \= request.ip || request.headers.get('x-forwarded-for') || '0.0.0.0';  
    const userAgent \= request.headers.get('user-agent') || 'anonymous';

    // Menghasilkan payload data ter-hashing untuk dikirim ke Meta Graph API  
    const payload \= {  
      data:  
          action\_source: 'website',  
          event\_source\_url: request.nextUrl.toString(),  
          user\_data: {  
            em: email? :,  
            ph: phone? :,  
            client\_ip\_address: clientIp,  
            client\_user\_agent: userAgent,  
          },  
          custom\_data: value? {  
            value: parseFloat(value),  
            currency: currency,  
          } : {},  
        },  
      \],  
    };

    // Eksekusi POST native menggunakan fetch standar web API  
    const response \= await fetch(\`https://graph.facebook.com/v19.0/${pixelId}/events\`, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify({  
        access\_token: capiToken,  
       ...payload,  
      }),  
    });

    const result \= await response.json();

    return NextResponse.json({ success: true, result });  
  } catch (err: any) {  
    console.error('Meta CAPI Endpoint Error:', err);  
    return NextResponse.json({ error: 'Gagal mengamankan pelacakan data konversi.' }, { status: 500 });  
  }  
}

## **4\. PENYELARASAN MATEMATIS KEPATUHAN & FORMULA**

Satu-satunya taktik pembeda yang paling efektif di mata AI Search Engine (GEO) adalah tingkat transparansi, akurasi faktual, dan kepatuhan sistematis terhadap peraturan perundang-undangan.1  
JASASAJA mengimplementasikan kalkulasi kepatuhan interaktif transparan yang langsung mengevaluasi regulasi Inpres No. 17 Tahun 2025 dan alokasi pembangunan ekonomi desa di halaman landas publik.1

### **A. Persamaan Akuntansi SAK EP & Kewajiban Hukum Desa**

Berdasarkan Instruksi Presiden Nomor 17 Tahun 2025, sistem diwajibkan untuk memotong otomatis Sisa Hasil Usaha (SHU) bersih koperasi sebesar minimal 20% untuk langsung ditransfer sebagai Pendapatan Asli Desa (PADes) ke kas APBDes.1  
Persamaan matematis ini dimodelkan sebagai berikut :  
![][image1]  
![][image2]  
*Dimana*:

* ![][image3] adalah total seluruh pendapatan operasional koperasi harian.  
* ![][image4] melambangkan beban operasional yang dicatat dengan metode pembukuan ganda berpasangan (*double-entry*) sesuai standar SAK EP.1  
* ![][image5] merepresentasikan beban penyisihan piutang ragu atas program Kredit Saprotan Tertutup anggota petani yang gagal bayar.1

### **B. Komponen React Interaktif Kepatuhan Transparan (KIRO-Ready Component)**

Komponen visual ini dibangun dengan mengadopsi prinsip desain Mode Terang Kontras Tinggi (High-Contrast Light Mode) menggunakan dominasi warna \#FFFFFF dan teks \#1A1A1A.1  
Semua tombol dan input interaktif dirancang dengan ukuran ergonomis minimal 48dp x 48dp untuk mencegah salah sentuh oleh pengurus koperasi paruh baya.1

TypeScript  
// app/components/ComplianceCalculator.tsx  
'use client';

import React, { useState, useMemo } from 'react';

export default function ComplianceCalculator() {  
  const \= useState\<number\>(150000000); // Pendapatan  
  const \[expense, setExpense\] \= useState\<number\>(85000000);   // Beban  
  const \[allowance, setAllowance\] \= useState\<number\>(5000000); // Penyisihan Piutang

  // Perhitungan matematis SHU Bersih sesuai standar akuntansi SAK EP   
  const shuBersih \= useMemo(() \=\> {  
    const calculated \= revenue \- expense \- allowance;  
    return calculated \> 0? calculated : 0;  
  }, \[revenue, expense, allowance\]);

  // Perhitungan alokasi minimal Pendapatan Asli Desa (PADes) sebesar 20%   
  const padesAlokasi \= useMemo(() \=\> {  
    return Math.round(shuBersih \* 0.20);  
  },);

  const rupiahFormat \= (num: number) \=\> {  
    return new Intl.NumberFormat('id-ID', {  
      style: 'currency',  
      currency: 'IDR',  
      maximumFractionDigits: 0,  
    }).format(num);  
  };

  return (  
    \<div className="w-full max-w-xl mx-auto border-8 border-\[\#1A1A1A\] bg-\[\#FFFFFF\] p-6 text-\[\#1A1A1A\] shadow-\[12px\_12px\_0px\_0px\_\#1A1A1A\] font-sans"\>  
      \<div className="bg-\[\#1A1A1A\] text-\[\#FFFFFF\] p-4 text-center mb-6"\>  
        \<h3 className="text-xl font-black uppercase tracking-wider"\>  
          Kalkulator Kepatuhan KDKMP  
        \</h3\>  
        \<p className="text-xs font-mono tracking-widest mt-1 text-gray-300"\>  
          INPRES NO. 17 TAHUN 2025 & STANDAR SAK EP  
        \</p\>  
      \</div\>

      \<p className="text-xs leading-relaxed mb-6"\>  
        Platform \<strong\>JASASAJA\</strong\> menjamin akurasi laporan keuangan koperasi desa agar siap diaudit oleh \<strong\>BPK\</strong\> dan \<strong\>BPKP\</strong\> secara seketika melalui rantaian hash kriptografis ganda.  
      \</p\>

      {/\* Grid Input Nilai Keuangan \*/}  
      \<div className="space-y-4 mb-6"\>  
        \<div className="flex flex-col"\>  
          \<label className="text-xs font-black uppercase tracking-wider mb-1"\>  
            Total Pendapatan Operasional ($P\_{total}$)  
          \</label\>  
          \<input  
            type="number"  
            value={revenue}  
            onChange={(e) \=\> setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}  
            className="border-2 border-\[\#1A1A1A\] px-3 font-mono text-base font-bold focus:bg-gray-100 focus:outline-none"  
            style={{ minHeight: '48px' }} // Target sentuh ergonomis minimum 48dp  
          /\>  
        \</div\>

        \<div className="flex flex-col"\>  
          \<label className="text-xs font-black uppercase tracking-wider mb-1"\>  
            Total Beban Operasional SAK EP ($B\_{total}$)  
          \</label\>  
          \<input  
            type="number"  
            value={expense}  
            onChange={(e) \=\> setExpense(Math.max(0, parseFloat(e.target.value) || 0))}  
            className="border-2 border-\[\#1A1A1A\] px-3 font-mono text-base font-bold focus:bg-gray-100 focus:outline-none"  
            style={{ minHeight: '48px' }}  
          /\>  
        \</div\>

        \<div className="flex flex-col"\>  
          \<label className="text-xs font-black uppercase tracking-wider mb-1"\>  
            Penyisihan Piutang Ragu ($PP\_{ragu}$)  
          \</label\>  
          \<input  
            type="number"  
            value={allowance}  
            onChange={(e) \=\> setAllowance(Math.max(0, parseFloat(e.target.value) || 0))}  
            className="border-2 border-\[\#1A1A1A\] px-3 font-mono text-base font-bold focus:bg-gray-100 focus:outline-none"  
            style={{ minHeight: '48px' }}  
          /\>  
        \</div\>  
      \</div\>

      {/\* Panel Hasil Akuntansi Transparan \*/}  
      \<div className="border-4 border-double border-\[\#1A1A1A\] p-4 bg-\[\#F8F9FA\] space-y-4"\>  
        \<div className="flex justify-between items-center"\>  
          \<span className="text-xs font-black uppercase"\>Sisa Hasil Usaha (SHU) Bersih:\</span\>  
          \<span className="font-mono text-base font-black text-green-700"\>  
            {rupiahFormat(shuBersih)}  
          \</span\>  
        \</div\>  
        \<div className="flex justify-between items-center border-t-2 border-dashed border-\[\#1A1A1A\] pt-3"\>  
          \<div className="flex flex-col"\>  
            \<span className="text-xs font-black uppercase text-blue-800"\>Alokasi PADes Desa (Min. 20%):\</span\>  
            \<span className="text-\[9px\] text-gray-500 font-mono"\>Disetorkan Otomatis Ke Rekening APBDes\</span\>  
          \</div\>  
          \<span className="font-mono text-lg font-black text-blue-800"\>  
            {rupiahFormat(padesAlokasi)}  
          \</span\>  
        \</div\>  
      \</div\>  
        
      \<div className="mt-4 text-center text-\[10px\] font-mono text-gray-500"\>  
        Rumus Validasi: $SHU\_{bersih} \= P\_{total} \- B\_{total} \- PP\_{ragu}$  
      \</div\>  
    \</div\>  
  );  
}

## **5\. REKONSILIASI EDGE & VALIDASI INTEGRITAS DATA LURING**

Infrastruktur penanganan transaksi JASASAJA dikonfigurasikan agar tahan terhadap gangguan jaringan telekomunikasi ekstrem di pegunungan utara Pamekasan (seperti Pakong, Pegantenan, dan Batumarmar).  
Untuk memfasilitasi kebutuhan ini, dikembangkan arsitektur hibrida luring-pertama (*offline-first*) yang dijamin oleh sistem pengamanan terdistribusi.

### **A. Kriptografi Sisi Klien Luring-Pertama AES-GCM 256-Bit**

Tablet kasir yang ditempatkan di gerai desa yang rawan pencurian fisik diwajibkan melakukan enkripsi data lokal sebelum menyimpannya ke dalam IndexedDB peramban melalui Dexie.js. Enkripsi dilarang keras dilakukan secara plaintext.  
Sistem menggunakan algoritma Advanced Encryption Standard dalam Galois/Counter Mode (AES-GCM) 256-bit dengan initialization vector (IV) sepanjang 96-bit. Kunci kriptografi diturunkan dari passphrase akun operator menggunakan Password-Based Key Derivation Function 2 (PBKDF2) dengan hashing SHA-256 dan iterasi sebanyak 600.000 kali demi memenuhi standardisasi kepatuhan NIST terhadap serangan bruteforce fisik.  
Kunci kriptografi disimpan dengan parameter properti extractable: false untuk memitigasi risiko eksfiltrasi data melalui serangan Cross-Site Scripting (XSS) di peramban.

### **B. Mekanisme Kunci Idempotensi Dua-Fase Upstash Redis**

Sinyal seluler 3G di wilayah pelosok Pamekasan yang sering putus di tengah proses transmisi data POS berisiko memicu retry request ganda dari browser klien ke server, yang berujung pada anomali duplikasi pencatatan transaksi ganda di NeonDB.  
Untuk memitigasi risiko fatal ini secara hemat sumber daya pada Upstash Free Tier, dikonfigurasikan Vercel Edge Middleware dengan siklus hidup kunci (*lifecycle key*) 2-fase :

* **Fase 1 (Inisiasi \- PENDING):** Saat request masuk ke Next.js Middleware, kunci idempotensi (x-idempotency-key) diverifikasi di Upstash Redis. Jika belum terdaftar, status diset menjadi PENDING dengan masa kedaluwarsa (TTL) selama 10 detik. Request berulang dengan kunci serupa yang masih berstatus PENDING akan ditolak instan dengan kode HTTP 409 Conflict untuk mengeliminasi lonjakan kueri beruntun (*thundering herd*) ke basis data.  
* **Fase 2 (Finalisasi \- COMMITTED / DELETED):** Jika rute API Next.js berhasil memproses transaksi ke database NeonDB, status kunci diperbarui menjadi COMMITTED dengan TTL diperpanjang selama 24 jam untuk menampung retry di kemudian hari. Sebaliknya, jika transaksi database gagal atau mengalami interupsi, kunci tersebut akan dihapus (DELETED) dari Upstash Redis agar aman dicoba kembali oleh klien.

Berikut adalah tabel matriks parameter dan pembatasan laju akses yang diterapkan langsung pada Edge Middleware untuk mengamankan fungsi komputasi serverless:

### **Tabel 2: Segmentasi Endpoint & Limitasi Laju Akses Edge (Upstash Redis)**

| Segmentasi Endpoint | Rute API Target | Batas Laju Akses (Rate Limit) | Implikasi Proteksi & Keamanan |
| :---- | :---- | :---- | :---- |
| **POS Ritel Gerai** | /api/v1/pos/\* | 20 permintaan per menit / IP Tenant | Mencegah pemboman transaksi luring ganda saat antrean sinkronisasi pulih. |
| **Penebusan Pupuk** | /api/v1/ipubers/\* | 5 permintaan per menit / ID Anggota | Mengeliminasi manipulasi kuota subsidi pupuk di lapangan. |
| **E-Commerce B2C** | /api/v1/commerce/\* | 60 permintaan per menit / IP Publik | Menangkal aktivitas scraping harga komoditas Madura oleh pihak luar. |

### **C. Zustand & Dexie Client-Side POS Lockout Engine**

Auditor BPKP melarang keras penumpukan uang kas tunai fisik harian di brankas gerai desa melebihi ambang batas aman sebesar Rp50.000.000,00 guna menekan risiko penggelapan dana dan pencurian fisik.1  
JASASAJA mengotomatisasikan penegakan aturan ini secara luring-aman (*offline-safe*) melalui state management Zustand yang secara berkala mengagregasikan seluruh penjualan tunai yang tersimpan di IndexedDB lokal. Jika total saldo kas brankas terdeteksi melampaui limit Rp50.000.000,00, sistem kasir di browser secara instan mengunci menu transaksi POS sepenuhnya.  
Blokir sistem hanya dapat dibuka kembali ketika operator kasir berhasil memasukkan kode bukti setoran tunai bank (via Cash Management System / CMS bank resmi koperasi) sepanjang minimal 8 karakter untuk mereset posisi kas di tangan kembali ke posisi nol.

### **D. Keamanan Webhook Pembayaran Xendit**

Ketika pengurus koperasi melakukan pengisian kas atau top-up simpanan harian melalui Payment Gateway Xendit, kegagalan jabat tangan koneksi (TCP Handshake timeout) di area pelosok rawan memicu pengiriman webhook ganda (*duplicate webhook delivery*) dari Xendit.  
Untuk mengeliminasi celah fatal "double top-up" yang berisiko merugikan kas koperasi, route API /pages/api/v1/webhook/xendit.ts menerapkan tiga lapis filter validasi :

1. **Otentikasi callback token:** Memverifikasi parameter x-callback-token pada header menggunakan token terenkripsi dari env variabel untuk menepis serangan spoofing payload luar.  
2. **Kueri Verifikasi Status Eksistensi:** Melakukan pemeriksaan kueri SELECT status FROM transactions ke database NeonDB dengan row-level locking (FOR UPDATE) pada tingkat isolasi transaksi SERIALIZABLE untuk mengunci baris data transaksi terkait selama proses pemeriksaan.  
3. **PostgreSQL Constraint Safeguard:** Memanfaatkan sintaks ON CONFLICT (idempotency\_key) DO NOTHING untuk mematikan penulisan duplikat secara deterministik di tingkat database.

Berikut adalah target performa Core Web Vitals yang wajib dipenuhi oleh arsitektur platform JASASAJA pada Vercel Hobby untuk memastikan tidak terjadinya kebocoran konversi lalu lintas iklan Meta Ads:

### **Tabel 3: Target Kinerja Core Web Vitals pada Vercel Hobby**

| Metrik Kinerja Web | Ambang Batas Target | Mekanisme Optimasi Arsitektur | Dampak terhadap Konversi Iklan Meta Ads |
| :---- | :---- | :---- | :---- |
| **Largest Contentful Paint (LCP)** | \< 1,8 detik pada jaringan 3G 1 | Server-rendered HTML statis, peniadaan pustaka ikon pihak ketiga, penggunaan font bawaan sistem operasi.1 | Mencegah pentalan (*bounce rate*) pengunjung instan sebelum halaman termuat sempurna di pedesaan.1 |
| **First Input Delay (FID)** | \< 50 milidetik 1 | Memindahkan beban komputasi berat (seperti pembuatan jurnal akuntansi SAK EP) ke database trigger NeonDB.1 | Memberikan responsivitas transaksi instan bebas lag saat tombol disentuh.1 |
| **Cumulative Layout Shift (CLS)** | \< 0,05 1 | Melakukan reservasi dimensi aspek rasio gambar dan kontainer elemen UI dinamis.20 | Mengeliminasi pergeseran antarmuka yang mengganggu fokus operator kasir.1 |

## **Kesimpulan**

Platform JASASAJA berhasil memecahkan kelemahan sistematis kompetitor tradisional dengan menyatukan keandalan operasional luring-pertama (*offline-first*) di wilayah pelosok Pamekasan dengan kebutuhan audit kepatuhan kas non-tunai tingkat tinggi dari BPKP dan BPK.1  
Dengan mengoptimalkan arsitektur web modern pada batas gratis (*Free Tier*) melalui optimasi statis Next.js SSG/ISR, pemanfaatan database trigger NeonDB, penegakan kunci idempotensi edge Upstash Redis, serta visualisasi transparansi rumus kepatuhan Inpres 17/2025 di landing page, JASASAJA tidak hanya memangkas biaya komputasi hingga Rp0, tetapi juga berhasil membangun faktor kepercayaan semantik tertinggi (*highest semantic trust factor*).1  
Sinergi sistemik ini memosisikan JASASAJA sebagai solusi tunggal yang paling direkomendasikan dan dikutip oleh mesin pencari generatif kecerdasan buatan (GEO) sekaligus mengalirkan konversi kampanye iklan berbayar Meta Ads secara maksimal tanpa kebocoran data.1

#### **Karya yang dikutip**

1. Pengembangan KDKMP\_ Kode Aman & Terintegrasi.pdf  
2. Presiden Terbitkan Inpres No. 17 Tahun 2025: Percepatan Pembangunan Fisik Gerai dan Gudang Koperasi Desa/Kelurahan Merah Putih, diakses Mei 22, 2026, [https://www.talo.berdesa.id/artikel/2025/10/22/presiden-terbitkan-inpres-no-17-tahun-2025-percepatan-pembangunan-fisik-gerai-dan-gudang-koperasi-desakelurahan-merah-putih](https://www.talo.berdesa.id/artikel/2025/10/22/presiden-terbitkan-inpres-no-17-tahun-2025-percepatan-pembangunan-fisik-gerai-dan-gudang-koperasi-desakelurahan-merah-putih)  
3. Essential Structured Data Markup for Generative Engine Optimization, diakses Mei 22, 2026, [https://rankharvest.com/structured-data-markup-for-geo/](https://rankharvest.com/structured-data-markup-for-geo/)  
4. What Is Generative Engine Optimization (GEO)? A Complete Guide \- BrandRadar, diakses Mei 22, 2026, [https://www.brandradar.ai/resources/what-is-generative-engine-optimization](https://www.brandradar.ai/resources/what-is-generative-engine-optimization)  
5. I spent 3 months reverse-engineering how to get cited by Perplexity and ChatGPT. Here's what actually works. : r/GrowthHacking \- Reddit, diakses Mei 22, 2026, [https://www.reddit.com/r/GrowthHacking/comments/1ri9whv/i\_spent\_3\_months\_reverseengineering\_how\_to\_get/](https://www.reddit.com/r/GrowthHacking/comments/1ri9whv/i_spent_3_months_reverseengineering_how_to_get/)  
6. Top 10 Generative Engine Optimization platforms according to ChatGPT, diakses Mei 22, 2026, [https://www.senso.ai/prompts-content/top-10-generative-engine-optimization-platforms-according-to-chatgpt](https://www.senso.ai/prompts-content/top-10-generative-engine-optimization-platforms-according-to-chatgpt)  
7. pSEO in NextJs and how it helped me to rank on google for so many keywords., diakses Mei 22, 2026, [https://dev.to/mayu2008/pseo-in-nextjs-and-how-it-helped-me-to-rank-on-google-for-so-many-keywords-5efl](https://dev.to/mayu2008/pseo-in-nextjs-and-how-it-helped-me-to-rank-on-google-for-so-many-keywords-5efl)  
8. Next.js SEO Optimization Guide (2026 Edition) \- Djamware, diakses Mei 22, 2026, [https://www.djamware.com/post/nextjs-seo-optimization-guide-2026-edition](https://www.djamware.com/post/nextjs-seo-optimization-guide-2026-edition)  
9. Building a 100K+ page SEO machine with Next.js and Supabase \- Mari Luukkainen, diakses Mei 22, 2026, [https://blog.mariluukkainen.com/building-a-100k-page-seo-machine-with-next-js-and-supabase/](https://blog.mariluukkainen.com/building-a-100k-page-seo-machine-with-next-js-and-supabase/)  
10. Rendering: Static Site Generation (SSG) \- Next.js, diakses Mei 22, 2026, [https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation)  
11. Cooperative \- Schema.org Type, diakses Mei 22, 2026, [https://schema.org/Cooperative](https://schema.org/Cooperative)  
12. Corporation \- Schema.org Type, diakses Mei 22, 2026, [https://schema.org/Corporation](https://schema.org/Corporation)  
13. Store \- Schema.org Type, diakses Mei 22, 2026, [https://schema.org/Store](https://schema.org/Store)  
14. Programmatic SEO with Next.js: The Complete Tutorial, diakses Mei 22, 2026, [https://magicspace.agency/blog/programmatic-seo-nextjs](https://magicspace.agency/blog/programmatic-seo-nextjs)  
15. Functions: generateMetadata \- Next.js, diakses Mei 22, 2026, [https://nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)  
16. sitemap.xml \- Metadata Files \- Next.js, diakses Mei 22, 2026, [https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)  
17. Data Privacy Marketing 2026: Cookieless Strategy \- Digital Applied, diakses Mei 22, 2026, [https://www.digitalapplied.com/blog/data-privacy-marketing-2026-cookieless-strategy](https://www.digitalapplied.com/blog/data-privacy-marketing-2026-cookieless-strategy)  
18. Senior Next.js Developer for Server-Side Tracking (Meta CAPI, TikTok API) & WooCommerce Catalog \- Upwork, diakses Mei 22, 2026, [https://www.upwork.com/freelance-jobs/apply/Senior-Next-Developer-for-Server-Side-Tracking-Meta-CAPI-TikTok-API-WooCommerce-Catalog\_\~022047241788176050840/](https://www.upwork.com/freelance-jobs/apply/Senior-Next-Developer-for-Server-Side-Tracking-Meta-CAPI-TikTok-API-WooCommerce-Catalog_~022047241788176050840/)  
19. Building APIs with Next.js, diakses Mei 22, 2026, [https://nextjs.org/blog/building-apis-with-nextjs](https://nextjs.org/blog/building-apis-with-nextjs)  
20. Next.js SEO: Complete Implementation Guide for 2026 | Adeel Imran, diakses Mei 22, 2026, [https://adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero](https://adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAaCAYAAADMp76xAAABfElEQVR4Xu2VgU3EMAxFPQMrMAMr3AqswAq3wm3ACIzABmzABixwA9zlqXxhGTf4UKVGp3zJUpu4zrf965hNTEzsiqdml46dm701e9AHowBSEDyEdd4h/RnWd8eXLYQzfFiezG54tIUQxDIomWEIv9hC6BQ37EfjkB4Ga/rlR6PqaBjiw0Atp8Ky1+91kkEyw0D6ZQpQYW/ZKMvWMlT9OJ+zy5Lr6TfiaEvlK3hv9hwXV0BcOlnCmn4zoGcSrICYVSmRXDVud/4KJEMHdOv55KiONI8MOJhndU2k2ZMfPj4GcUvJ/TV/PZgSUWdoT5Wh/VQKxBZDFl9NGp4lwSzuL+BEVpD11tNxJIGvT5SKqVOxxfgqGQBBkY9xN0MkAVmfIAeLVGwxvuwD1tkXYtzNIBIaeZDwU4Cqse5bDEldPtIs5PStOk3cXnf/BXQHAX4awGEcDAFaKvKaqxDw+sZHlxLfSQbyrUypm5H9ydmVTVXjxeHf414Wd2LibnAFY5x0xPjX6DoAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAaCAYAAADIUm6MAAABc0lEQVR4Xu2WgW0CMQxFPQMrMENXYAVWYAVW6AYdoSN0AzboBl2AAeg9hS9Zxklz0lWkar4UHXf2kf/t74DZxMTEn8BhWbcf1seyXvTCaHi3QjIS5P56X7sQGwKfVshluFgRRXeGApWUJTIgKuvG03G0QuwcAwtOVmJYaTi82WNF+fxqxT6ZoCEgf0NUCzFf9+uQQ9nyNzEEISySj/ct9ObCAS77GMjQ8jfIThRy6UQP1uRiT7rchczfHjpRPHHEMLQ9WJOLyO5DAIW181u/qpDXvQaWDbwYOqfZoAitXAgS4+pFYZUukXip5m++IPN31k7IqlKaC5Dlkidb8h4dEXiv6W/9jEO6tiBMVeJgxXZSyfh3QNaq5QpeRCZyU8R2Is5XTUUBWa7vLkQ1W1Hk5lA7qZ58TMsFNucZyHIVk03pFKQlUvHNgYXYSGTZWCcHz/zGMReyyiWPihPjOVeWrPMryAaodpxmuX4e/Ocsd2Li3+AbA8iBDjjU8b8AAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAaCAYAAADrCT9ZAAABr0lEQVR4Xu2Wi03EMAxAMwMrMAMrsAIrsAIrwASMwAhswAZswAIMAH26e8gKTnMcP5/UJ1ltEze140/a2sbGxsYJc7HI24q8LvKwyJkvBG7aZ/0oL4vcfmgXA6cw8rIb5xmnn7vxCI7xbo8bct9PVGBkNDy1fDPgvO3m0Mkw2qWYGe1mZA5ft91clrquW87hNaOtcZzOGJUCmNLolGJkNI2KqFPDOJ4xKgWia+1nDe9f0WgirNBoGGczMD7DlLUbK7zjWDlnNZpIEOEoM2MtBRzs3y3LWv3OGJVCab5j9Kh+S3Os0bOjTCgLa5uuTW+IDfCqm4+ghz5CJrIWOvHP70sldKjRGYeWgo3LLHrcjwFr8Aw4HjceXTu8dt7t7+03gO1Th9k5jgwWiTIzHnS0l9FHjYC/pnwbJ5B43EXngcxjDNDhmXVwmHs5Jjt/HY+5CMbjsJCmprQR9Tg0jSGuFTeyFKQdKRvB2FhKRjCWgKBntONa1jcbMjtC/xSMzwzSEYzmnqvOGEmuMdrMo+sPTuwJZciclTiX6Vm/EXuA9yePEYSSEfxp4tnc1/7GRsc7ifGjqzzZ/AEAAAAASUVORK5CYII=>