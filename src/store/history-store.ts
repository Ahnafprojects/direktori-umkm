// src/store/history-store.ts
import { create } from 'zustand';

import { persist } from 'zustand/middleware';
import { CartItem } from './cart-store'; // Kita pakai ulang tipe data dari cart

// Tipe data untuk satu pesanan
export type OrderHistory = {
  id: string; // Kita pakai timestamp
  date: string;
  items: CartItem[];
  totalPrice: number;
};

type HistoryState = {
  orders: OrderHistory[];
  addOrder: (newOrder: OrderHistory) => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      orders: [], // Default-nya array kosong

      addOrder: (newOrder) => {
        const state = get();
        // Tambahkan pesanan baru di paling atas (seperti riwayat sungguhan)
        set({ orders: [newOrder, ...state.orders] });
      },
    }),
    {
      name: 'umkm-order-history', // Key di localStorage
    }
  )
);