// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Header from './_components/header';
import Footer from './_components/footer';
import { cn } from '@/lib/utils';
import PageTransitionWrapper from './page-transition-wrapper';
import { ThemeProvider } from './theme-provider'; // <-- 1. IMPORT
import FloatingCartButton from './_components/floating-cart-button';

// 1. IMPORT DARI 'react-hot-toast'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Direktori UMKM LokalKeren',
  description: 'Bikin Keren UMKM Lokal: Direktori Digital Lingkungan Sekitar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <PageTransitionWrapper>{children}</PageTransitionWrapper>
            </main>
            <Footer />
          </div>
          
          {/* 2. TAMBAHKAN TOASTER BARU DI SINI */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 2000, // Notifikasi hilang setelah 2 detik
            }}
          />
<FloatingCartButton />
        </ThemeProvider>
      </body>
    </html>
  );
}