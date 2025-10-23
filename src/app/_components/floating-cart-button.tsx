// src/app/_components/floating-cart-button.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import ClientHydrator from '@/components/client-hydrator';
import { ShoppingCart } from 'lucide-react';

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function FloatingCartButton() {
  const pathname = usePathname();
  
  // Ambil data real-time dari store
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  // Jika keranjang kosong, jangan tampilkan apa-apa
  if (totalItems === 0) {
    return null;
  }

  // Jika di halaman checkout, favorites, map, login, atau register, jangan tampilkan floating cart
  if (pathname === '/checkout' || pathname === '/favorites' || pathname === '/map' || 
      pathname === '/login' || pathname === '/register' || 
      pathname.startsWith('/checkout/register')) {
    return null;
  }

  return (
    // Kita bungkus dengan Hydrator agar aman di Next.js
    <ClientHydrator>
      {/* Ini adalah container mengambang */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-1/3">
        <Link href="/checkout">
          <div className="flex justify-between items-center bg-emerald-500 text-white p-4 rounded-lg shadow-lg hover:bg-emerald-600 transition-all duration-200 border border-emerald-400">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-bold">{totalItems} Item</span>
            </div>
            <div className="font-bold">{formatRupiah(totalPrice)}</div>
          </div>
        </Link>
      </div>
    </ClientHydrator>
  );
}