// src/store/favorites-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <-- Import middleware persist

type FavoritesState = {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

// Ini adalah 'store' kita.
// Kita pakai `persist` untuk auto-save ke localStorage
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [], // State default

      // Aksi untuk menambah/menghapus
      toggleFavorite: (id: number) => {
        const state = get();
        const hasId = state.favoriteIds.includes(id);
        if (hasId) {
          // Jika sudah ada, hapus
          set({
            favoriteIds: state.favoriteIds.filter((favId) => favId !== id),
          });
        } else {
          // Jika belum ada, tambahkan
          set({ favoriteIds: [...state.favoriteIds, id] });
        }
      },

      // Helper untuk cek
      isFavorite: (id: number) => {
        return get().favoriteIds.includes(id);
      }
    }),
    {
      name: 'umkm-favorites', // Nama key di localStorage
    }
  )
);