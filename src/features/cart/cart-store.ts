"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddOn = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  cartKey: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  maxQuantity?: number;
  addOns: CartAddOn[];
  notes?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.cartKey === item.cartKey,
          );

          if (!existing) {
            return { items: [...state.items, item] };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.cartKey === item.cartKey
                ? {
                    ...cartItem,
                    quantity: Math.min(
                      cartItem.maxQuantity ?? Number.POSITIVE_INFINITY,
                      cartItem.quantity + item.quantity,
                    ),
                  }
                : cartItem,
            ),
          };
        }),
      removeItem: (cartKey) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartKey !== cartKey),
        })),
      updateQuantity: (cartKey, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartKey === cartKey
              ? {
                  ...item,
                  quantity: Math.min(
                    item.maxQuantity ?? Number.POSITIVE_INFINITY,
                    Math.max(1, quantity),
                  ),
                }
              : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, item) => {
          const addOnsTotal = item.addOns.reduce(
            (addOnSum, addOn) => addOnSum + addOn.price,
            0,
          );
          return sum + (item.price + addOnsTotal) * item.quantity;
        }, 0),
    }),
    {
      name: "kanto-burger-cart",
    },
  ),
);
