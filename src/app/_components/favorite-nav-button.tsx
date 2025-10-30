// src/app/_components/favorite-nav-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites-store";
import { useFavoritesSync } from "@/hooks/use-favorites-sync";
import ClientHydrator from "@/components/client-hydrator";

export default function FavoriteNavButton() {
  // Sync favorites dengan database saat login/logout
  useFavoritesSync();

  // Ambil data dari store
  const favoriteCount = useFavoritesStore((s) => s.favoriteIds.length);
  const isLoading = useFavoritesStore((s) => s.isLoading);

  return (
    <ClientHydrator>
      <Button asChild variant="ghost" className="relative">
        <Link
          href="/favorites"
          aria-label={`Buka halaman favorit, ${favoriteCount} item tersimpan`}
        >
          <Heart className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""}`} />
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
