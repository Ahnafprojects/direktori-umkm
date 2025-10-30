// src/store/favorites-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  favoriteIds: number[];
  isLoggedIn: boolean;
  isLoading: boolean;
  toggleFavorite: (id: number, userId?: string) => Promise<void>;
  isFavorite: (id: number) => boolean;
  loadFromDatabase: (userId: string) => Promise<void>;
  syncToDatabase: (userId: string) => Promise<void>;
  clearLocalStorage: () => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setFavorites: (favoriteIds: number[]) => void;
};

// Helper functions untuk API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isLoggedIn: false,
      isLoading: false,

      // Set login status
      setLoggedIn: (loggedIn: boolean) => {
        set({ isLoggedIn: loggedIn });
      },

      // Set favorites dari eksternal (database)
      setFavorites: (favoriteIds: number[]) => {
        set({ favoriteIds });
      },

      // Toggle favorite - berbeda untuk logged in vs guest
      toggleFavorite: async (id: number, userId?: string) => {
        const state = get();

        if (state.isLoggedIn && userId) {
          // User sudah login - gunakan API
          try {
            set({ isLoading: true });

            const result = await apiCall("/api/favorites", {
              method: "POST",
              body: JSON.stringify({ umkmId: id }),
            });

            // Update state berdasarkan response
            if (result.action === "added") {
              set({
                favoriteIds: [...state.favoriteIds, id],
                isLoading: false,
              });
            } else if (result.action === "removed") {
              set({
                favoriteIds: state.favoriteIds.filter((favId) => favId !== id),
                isLoading: false,
              });
            }
          } catch (error) {
            console.error("Error toggling favorite:", error);
            set({ isLoading: false });
            // Fallback ke localStorage jika API error
            const hasId = state.favoriteIds.includes(id);
            if (hasId) {
              set({
                favoriteIds: state.favoriteIds.filter((favId) => favId !== id),
              });
            } else {
              set({ favoriteIds: [...state.favoriteIds, id] });
            }
          }
        } else {
          // User belum login - gunakan localStorage
          const hasId = state.favoriteIds.includes(id);
          if (hasId) {
            set({
              favoriteIds: state.favoriteIds.filter((favId) => favId !== id),
            });
          } else {
            set({ favoriteIds: [...state.favoriteIds, id] });
          }
        }
      },

      // Load favorites dari database saat login
      loadFromDatabase: async (userId: string) => {
        try {
          set({ isLoading: true });

          const result = await apiCall("/api/favorites");

          set({
            favoriteIds: result.favoriteIds || [],
            isLoading: false,
            isLoggedIn: true,
          });
        } catch (error) {
          console.error("Error loading favorites from database:", error);
          set({ isLoading: false });
        }
      },

      // Sinkronisasi localStorage ke database saat login
      syncToDatabase: async (userId: string) => {
        const state = get();

        // Jika tidak ada favorites di localStorage, skip sync
        if (state.favoriteIds.length === 0) {
          // Langsung load dari database
          await get().loadFromDatabase(userId);
          return;
        }

        try {
          set({ isLoading: true });

          const result = await apiCall("/api/favorites/sync", {
            method: "POST",
            body: JSON.stringify({ favoriteIds: state.favoriteIds }),
          });

          // Update state dengan data dari database
          set({
            favoriteIds: result.favoriteIds || [],
            isLoading: false,
            isLoggedIn: true,
          });

          // Clear localStorage setelah sync berhasil
          get().clearLocalStorage();
        } catch (error) {
          console.error("Error syncing favorites:", error);
          set({ isLoading: false });
          // Jika sync gagal, tetap gunakan data localStorage
        }
      },

      // Clear localStorage
      clearLocalStorage: () => {
        // Hapus dari localStorage tanpa menghapus state
        localStorage.removeItem("umkm-favorites");
      },

      // Helper untuk cek favorite
      isFavorite: (id: number) => {
        return get().favoriteIds.includes(id);
      },
    }),
    {
      name: "umkm-favorites",
      // Hanya persist jika user belum login
      skipHydration: false,
      partialize: (state) => ({
        favoriteIds: state.isLoggedIn ? [] : state.favoriteIds, // Hanya simpan jika belum login
      }),
    }
  )
);
