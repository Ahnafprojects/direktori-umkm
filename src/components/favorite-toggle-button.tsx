// src/components/favorite-toggle-button.tsx
"use client";

import { useFavoritesStore } from "@/store/favorites-store";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  umkmId: number;
  umkmName: string;
  className?: string;
};

export default function FavoriteToggleButton({
  umkmId,
  umkmName,
  className,
}: Props) {
  const { data: session } = useSession();

  // Ambil state dan aksi dari store
  const isFavorite = useFavoritesStore((s) => s.isFavorite(umkmId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isLoading = useFavoritesStore((s) => s.isLoading);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah navigasi jika di dalam Link
    e.stopPropagation(); // Mencegah event bubbling

    // Pass userId jika user sudah login
    await toggleFavorite(umkmId, session?.user?.id);
  };

  // TAMBAHKAN FALLBACK 'UMKM ini'
  const name = umkmName || "UMKM ini";

  const label = isFavorite
    ? `Hapus ${name} dari favorit`
    : `Simpan ${name} ke favorit`;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn("shrink-0", className)}
      aria-label={label}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isLoading && "animate-pulse",
          isFavorite
            ? "fill-red-500 text-red-500" // Tampilan jika difavoritkan
            : "text-muted-foreground" // Tampilan default
        )}
      />
    </Button>
  );
}
