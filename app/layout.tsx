import type {Metadata} from 'next';
import ThemeProvider from '@/components/ThemeProvider';
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
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
