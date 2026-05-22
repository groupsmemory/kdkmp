import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'JASASAJA — Platform KDKMP Koperasi Desa Merah Putih',
    template: '%s | JASASAJA',
  },
  description: 'Platform SaaS manajemen Koperasi Desa dan Kelurahan Merah Putih (KDKMP) di bawah PT Agrinas Pangan Nusantara. POS luring-pertama, akuntansi SAK EP, audit trail kriptografis.',
  metadataBase: new URL('https://jasasaja.co.id'),
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
