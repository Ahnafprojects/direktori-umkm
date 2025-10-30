// src/hooks/use-favorites-sync.ts
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useFavoritesStore } from "@/store/favorites-store";

export function useFavoritesSync() {
  const { data: session, status } = useSession();
  const {
    loadFromDatabase,
    syncToDatabase,
    setLoggedIn,
    clearLocalStorage,
    isLoggedIn: storeIsLoggedIn,
  } = useFavoritesStore();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (status === "loading") return;

      if (session?.user?.id) {
        // User baru login
        if (!storeIsLoggedIn) {
          setLoggedIn(true);

          // Sync localStorage ke database, kemudian load dari database
          await syncToDatabase(session.user.id);

          // Clear localStorage setelah sync
          clearLocalStorage();
        } else {
          // User sudah login sebelumnya, load dari database
          await loadFromDatabase(session.user.id);
        }
      } else {
        // User logout atau belum login
        if (storeIsLoggedIn) {
          setLoggedIn(false);
          // Tidak perlu clear favorites karena akan kembali ke localStorage mode
        }
      }
    };

    handleAuthChange();
  }, [
    session,
    status,
    storeIsLoggedIn,
    setLoggedIn,
    syncToDatabase,
    loadFromDatabase,
    clearLocalStorage,
  ]);

  return {
    isLoading: status === "loading",
    isLoggedIn: !!session?.user?.id,
    userId: session?.user?.id,
  };
}
