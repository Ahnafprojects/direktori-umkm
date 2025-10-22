// src/store/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@prisma/client';

// Ini adalah tipe data produk di dalam keranjang
export type CartItem = Product & {
  quantity: number;
};

type CartState = {
  cartItems: CartItem[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  // Kita pakai `persist` agar keranjang tidak hilang saat di-refresh
  persist(
    (set, get) => ({
      cartItems: [],

      // Aksi untuk menambah produk
      addProduct: (product) => {
        const state = get();
        const existingItem = state.cartItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Jika sudah ada, tambah quantity-nya
          const updatedItems = state.cartItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ cartItems: updatedItems });
        } else {
          // Jika belum ada, tambahkan sebagai item baru
          set({ cartItems: [...state.cartItems, { ...product, quantity: 1 }] });
        }
      },

      // Aksi untuk mengurangi produk
      removeProduct: (productId) => {
        const state = get();
        const existingItem = state.cartItems.find((item) => item.id === productId);

        if (existingItem && existingItem.quantity > 1) {
          // Jika quantity > 1, kurangi 1
          const updatedItems = state.cartItems.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
          set({ cartItems: updatedItems });
        } else {
          // Jika quantity = 1, hapus item dari keranjang
          set({
            cartItems: state.cartItems.filter((item) => item.id !== productId),
          });
        }
      },

      // Aksi untuk update quantity langsung
      updateQuantity: (productId, newQuantity) => {
        const state = get();
        if (newQuantity <= 0) {
          // Jika quantity 0 atau kurang, hapus item
          set({
            cartItems: state.cartItems.filter((item) => item.id !== productId),
          });
        } else {
          // Update quantity
          const updatedItems = state.cartItems.map((item) =>
            item.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          );
          set({ cartItems: updatedItems });
        }
      },

      // Aksi untuk hapus item langsung
      removeItem: (productId) => {
        set({
          cartItems: get().cartItems.filter((item) => item.id !== productId),
        });
      },

      // Aksi untuk mengosongkan keranjang
      clearCart: () => set({ cartItems: [] }),

      // Helper untuk menghitung total item
      getTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      // Helper untuk menghitung total harga
      getTotalPrice: () => {
        return get().cartItems.reduce((total, item) => {
          const price = item.price || 0; // Anggap 0 jika harga null
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'umkm-cart', // Nama key di localStorage
    }
  )
);