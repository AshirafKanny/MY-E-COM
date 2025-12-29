import { create } from "zustand";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "cart-state";

function loadPersisted(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (_err) {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (_err) {
    /* ignore persist errors */
  }
}

export const useCartStore = create<CartState>((set) => ({
  items: loadPersisted(),
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      const nextItems = existing
        ? state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
          )
        : [...state.items, item];
      persist(nextItems);
      return { items: nextItems };
    }),
  removeItem: (productId) =>
    set((state) => {
      const nextItems = state.items.filter((i) => i.productId !== productId);
      persist(nextItems);
      return { items: nextItems };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const safeQuantity = Math.max(1, quantity);
      const nextItems = state.items.map((i) => (i.productId === productId ? { ...i, quantity: safeQuantity } : i));
      persist(nextItems);
      return { items: nextItems };
    }),
  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
