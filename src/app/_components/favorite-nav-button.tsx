// src/app/_components/favorite-nav-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useFavoritesStore } from '@/store/favorites-store';
import ClientHydrator from '@/components/client-hydrator';

export default function FavoriteNavButton() {
  // Kita pakai store HANYA untuk menghitung jumlah
  const favoriteCount = useFavoritesStore((s) => s.favoriteIds.length);

  return (
    // Kita bungkus dengan Hydrator agar jumlahnya akurat
    <ClientHydrator>
      <Button asChild variant="ghost" className="relative">
        <Link href="/favorites" aria-label={`Buka halaman favorit, ${favoriteCount} item tersimpan`}>
          <Heart className="h-5 w-5" />
          <span className="sr-only">Favorit</span>
          {/* Badge Angka */}
          {favoriteCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {favoriteCount}
            </Badge>
          )}
        </Link>
      </Button>
    </ClientHydrator>
  );
}