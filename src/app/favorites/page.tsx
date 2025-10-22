// src/app/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/store/favorites-store';
import { getUmkmsByIds } from '@/lib/actions';
import AnimatedGrid from '@/components/animated-grid';
import AnimatedGridItem from '@/components/animated-grid-item';
import UmkmCard from '@/components/umkm-card';
import UmkmGridSkeleton from '@/app/loading'; // Kita pakai ulang skeleton

// Import tipe yang sesuai dari umkm-card
type UmkmData = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  phone: string | null;
  openingHours: string | null;
  photos: string[];
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  hasPromo: boolean | null;
  isRecommended: boolean | null;
  categoryId: number;
  Category: {
    id: number;
    name: string;
    slug: string;
  };
  ProductCategory: Array<{
    id: number;
    name: string;
    Product: Array<{
      id: number;
      name: string;
      price: number | null;
      photo: string | null;
      isFeatured: boolean | null;
    }>;
  }>;
};

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const [umkms, setUmkms] = useState<UmkmData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil data dari server action berdasarkan ID di store
    async function fetchFavorites() {
      setIsLoading(true);
      if (favoriteIds.length > 0) {
        const data = await getUmkmsByIds(favoriteIds);
        setUmkms(data);
      } else {
        setUmkms([]); // Kosongkan jika tidak ada favorit
      }
      setIsLoading(false);
    }

    fetchFavorites();
  }, [favoriteIds]); // <-- Re-run saat daftar favorit berubah

  return (
    <main className="container mx-auto p-4 relative">
      <h1 className="text-3xl font-bold mb-4">Favorit Saya</h1>
      <p className="text-muted-foreground mb-6">
        Daftar UMKM yang kamu simpan untuk dikunjungi nanti.
      </p>

      {isLoading ? (
        <UmkmGridSkeleton />
      ) : umkms.length > 0 ? (
        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {umkms.map((umkm) => (
            <AnimatedGridItem key={umkm.id}>
              <UmkmCard umkm={umkm} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Kamu belum menyimpan UMKM favorit. Mulai jelajahi dan klik ikon
          hati!
        </p>
      )}
    </main>
  );
}