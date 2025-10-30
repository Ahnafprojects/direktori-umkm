// src/app/_components/favorites-provider.tsx
"use client";

import { useFavoritesSync } from "@/hooks/use-favorites-sync";

type Props = {
  children: React.ReactNode;
};

export default function FavoritesProvider({ children }: Props) {
  // Hook ini akan handle sinkronisasi favorites
  useFavoritesSync();

  return <>{children}</>;
}
