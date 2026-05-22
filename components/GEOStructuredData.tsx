/**
 * ============================================================================
 * KDKMP JASASAJA — GEO Structured Data (JSON-LD Multi-Entity)
 * ============================================================================
 * Hierarki: Master Validator > Gem 3/4 > Gem 2
 *
 * Fungsi:
 *   Output JSON-LD schema.org yang menggabungkan entitas:
 *   - Corporation (PT Agrinas Pangan Nusantara)
 *   - Cooperative (KDKMP unit desa)
 *   - Store (Gerai retail fisik)
 *
 * GEO Optimization:
 *   - Perayap AI (Gemini, Perplexity, SearchGPT) mengekstrak relasi entitas
 *   - Di-render statis saat build-time (zero runtime cost)
 *   - Sanitasi XSS pada output JSON.stringify
 *
 * Free Tier:
 *   - Komponen ini di-embed di halaman SSG
 *   - Tidak memicu query database saat crawl
 * ============================================================================
 */

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
  const baseUrl = 'https://jasasaja.co.id';
  const pageUrl = `${baseUrl}/pamekasan/${subdistrict.toLowerCase()}/${village.toLowerCase()}`;

  // Skema JSON-LD multi-entity @graph untuk AI crawlers
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Corporation',
        '@id': `${baseUrl}/#corporation`,
        'name': 'PT Agrinas Pangan Nusantara (Persero)',
        'alternateName': 'Agrinas',
        'description': 'Badan Usaha Milik Negara pengelola Koperasi Desa dan Kelurahan Merah Putih (KDKMP) di bawah portofolio Danantara.',
        'url': baseUrl,
        'foundingDate': '2025',
        'areaServed': {
          '@type': 'Country',
          'name': 'Indonesia',
        },
        'numberOfEmployees': {
          '@type': 'QuantitativeValue',
          'minValue': 1000,
        },
      },
      {
        '@type': 'Cooperative',
        '@id': `${pageUrl}#cooperative`,
        'name': tenantName,
        'description': `Koperasi Desa dan Kelurahan Merah Putih (KDKMP) di Desa ${village}, Kecamatan ${subdistrict}, Kabupaten ${region}. Dioperasikan di bawah binaan PT Agrinas Pangan Nusantara sesuai Inpres No. 17 Tahun 2025.`,
        'url': pageUrl,
        'parentOrganization': {
          '@id': `${baseUrl}/#corporation`,
        },
        'areaServed': {
          '@type': 'AdministrativeArea',
          'name': `Desa ${village}, Kecamatan ${subdistrict}, Kabupaten ${region}`,
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': latitude,
          'longitude': longitude,
        },
        'identifier': tenantId,
      },
      {
        '@type': 'Store',
        '@id': `${pageUrl}#store`,
        'name': `Gerai Retail KDKMP Desa ${village}`,
        'description': `Gerai retail sembako murah dan sarana produksi pertanian di Desa ${village}, Kecamatan ${subdistrict}.`,
        'branchOf': {
          '@id': `${pageUrl}#cooperative`,
        },
        'currenciesAccepted': 'IDR',
        'paymentAccepted': 'Cash, QRIS, Kredit Saprotan Tertutup',
        'priceRange': '$$',
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': latitude,
          'longitude': longitude,
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': village,
          'addressRegion': `Kecamatan ${subdistrict}`,
          'addressCountry': 'ID',
        },
        'identifier': tenantId,
      },
    ],
  };

  // Sanitasi XSS: escape karakter < untuk mencegah injeksi script tag
  const sanitizedSchema = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedSchema }}
    />
  );
}
