// src/components/favorite-toggle-button.tsx
'use client';

import { useFavoritesStore } from '@/store/favorites-store';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

type Props = {
  umkmId: number;
  umkmName: string; // <-- TAMBAHKAN INI
  className?: string; // Untuk custom styling
};

export default function FavoriteToggleButton({ umkmId, umkmName, className }: Props) {
  // Ambil state dan aksi dari store
  const isFavorite = useFavoritesStore((s) => s.isFavorite(umkmId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah navigasi jika di dalam Link
    e.stopPropagation(); // Mencegah event bubbling
    toggleFavorite(umkmId);
  };

  // TAMBAHKAN FALLBACK 'UMKM ini'
  const name = umkmName || 'UMKM ini'; 

  const label = isFavorite 
    ? `Hapus ${name} dari favorit` 
    : `Simpan ${name} ke favorit`;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className={cn('shrink-0', className)}
      aria-label={label} // Sekarang ini dijamin punya nilai
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          isFavorite
            ? 'fill-red-500 text-red-500' // Tampilan jika difavoritkan
            : 'text-muted-foreground' // Tampilan default
        )}
      />
      {/* sr-only bisa dihapus jika sudah pakai aria-label */}
      {/* <span className="sr-only">Simpan ke Favorit</span> */}
    </Button>
  );
}