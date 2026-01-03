import { create } from "zustand";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  stock?: number;
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
    const items = Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    const isValidId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
    return items.filter((i) => isValidId(i.productId));
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
      const mergedStock = item.stock ?? existing?.stock;
      const nextItems = existing
        ? state.items.map((i) => {
            if (i.productId !== item.productId) return i;
            const desired = i.quantity + item.quantity;
            const maxQty = typeof mergedStock === "number" ? Math.min(mergedStock, desired) : desired;
            return { ...i, quantity: maxQty, stock: mergedStock };
          })
        : [...state.items, { ...item, stock: mergedStock }];
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
      const nextItems = state.items.map((i) => {
        if (i.productId !== productId) return i;
        const maxQty = typeof i.stock === "number" ? Math.min(i.stock, safeQuantity) : safeQuantity;
        return { ...i, quantity: maxQty };
      });
      persist(nextItems);
      return { items: nextItems };
    }),
  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
