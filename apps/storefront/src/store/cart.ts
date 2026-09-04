"use client";

import { create } from "zustand";
import type { Cart, CartItem } from "@/types";
import {
  addLineItem,
  getCart,
  removeLineItem,
  updateLineItem,
  clearLocalCart,
} from "@/lib/medusa/cart-client";
import type { ReorderSubscriptionLineItemMetadataInput } from "@/types/subscription";
import { toast } from "sonner";

// ----------------------------- Types --------------------------------------

type OptimisticCartLineItem = Partial<CartItem> & {
  __optimistic?: true;
  inventory?: number;
};

type StoreCart = Cart & {
  items: OptimisticCartLineItem[];
  subtotal?: number;
  itemCount?: number;
};

type ActionLocks = Record<string, boolean>;

interface CartState {
  // State
  cart: StoreCart | null;
  isOpen: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  pendingMutations: number;
  actionLocks: ActionLocks;

  // UI Actions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Server-backed operations
  hydrate: () => Promise<void>;
  addItem: (
    variantId: string,
    quantity?: number,
    price?: number,
    inventory?: number,
    countryCode?: string,
    metadata?: ReorderSubscriptionLineItemMetadataInput,
  ) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

// ----------------------------- Helper Functions -----------------------------

function createEmptyCart(): Partial<StoreCart> {
  return {
    items: [],
    subtotal: 0,
    itemCount: 0,
  };
}

function recalcCartTotals(cart: StoreCart): StoreCart {
  const itemCount = cart.items.reduce((acc, i) => acc + (i.quantity ?? 0), 0);
  const subtotal = cart.items.reduce(
    (acc, i) => acc + ((i.price ?? 0) * (i.quantity ?? 0)),
    0,
  );

  return {
    ...cart,
    itemCount,
    subtotal,
  };
}

function makeOptimisticLine(
  variantId: string,
  quantity: number,
  price?: number,
  inventory?: number,
): OptimisticCartLineItem {
  return {
    id: `optimistic_${variantId}_${Date.now()}`,
    variantId: variantId,
    quantity,
    price: price ?? 0,
    inventory: inventory ?? 0,
    __optimistic: true,
  };
}

function lockKeyForAdd(variantId: string) {
  return `add:${variantId}`;
}

function lockKeyForLine(lineItemId: string, action: "update" | "remove") {
  return `${action}:${lineItemId}`;
}

function asStoreCart(cart: Cart): StoreCart {
  return { ...cart } as StoreCart;
}

// ----------------------------- Quantity Debouncer -----------------------------

type PendingQuantityCall = {
  lineItemId: string;
  quantity: number;
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
};

function createCartQuantityDebouncer(delay = 700) {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingCalls: PendingQuantityCall[] = [];
  let latestLineItemId: string | null = null;
  let latestQuantity: number | null = null;

  const flush = (callback: (lineItemId: string, quantity: number) => Promise<any>) => {
    if (pendingCalls.length === 0 || latestLineItemId === null || latestQuantity === null) {
      return;
    }

    const callsToProcess = pendingCalls;
    const lineItemId = latestLineItemId;
    const quantity = latestQuantity;

    pendingCalls = [];
    latestLineItemId = null;
    latestQuantity = null;
    timeoutId = null;

    callback(lineItemId, quantity)
      .then((result) => {
        callsToProcess.forEach((call) => call.resolve(result));
      })
      .catch((error) => {
        callsToProcess.forEach((call) => call.reject(error));
      });
  };

  return {
    debounce: (
      lineItemId: string,
      quantity: number,
      callback: (lineItemId: string, quantity: number) => Promise<any>
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Store the latest values
        latestLineItemId = lineItemId;
        latestQuantity = quantity;

        // Add this call to pending
        pendingCalls.push({ lineItemId, quantity, resolve, reject });

        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Set new timeout
        timeoutId = setTimeout(() => {
          flush(callback);
        }, delay);
      });
    },

    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      pendingCalls.forEach((call) => call.reject(new Error('Cancelled')));
      pendingCalls = [];
      latestLineItemId = null;
      latestQuantity = null;
    },

    flush: (callback: (lineItemId: string, quantity: number) => Promise<any>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      flush(callback);
    }
  };
}

// ----------------------------- Store --------------------------------------

const quantityDebouncer = createCartQuantityDebouncer();

export const useCartStore = create<CartState>()((set, get) => ({
  // -------- State --------
  cart: null,
  isOpen: false,
  isLoading: false,
  hasHydrated: false,
  pendingMutations: 0,
  actionLocks: {},

  // -------- UI Actions --------
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // -------- Hydration --------
  hydrate: async () => {
    if (get().hasHydrated) return;

    set({ isLoading: true });
    try {
      const serverCart = await getCart();

      if (get().pendingMutations > 0) {
        set({ hasHydrated: true });
        return;
      }

      set({
        cart: serverCart ? asStoreCart(serverCart) : null,
        hasHydrated: true,
      });
    } finally {
      set({ isLoading: get().pendingMutations > 0 });
    }
  },

  // -------- Add Item --------
  addItem: async (variantId, quantity = 1, price, invntory, countryCode, metadata) => {
    const key = lockKeyForAdd(variantId);
    if (get().actionLocks[key]) return;

    const prevCart = get().cart;

    set((s) => ({
      actionLocks: { ...s.actionLocks, [key]: true },
    }));

    // Optimistically add item
    set((s) => {
      const base = s.cart ?? createEmptyCart();
      const items = base.items ?? [];
      const next = {
        ...base,
        items: [...items, makeOptimisticLine(variantId, quantity, price, invntory)],
      };
      return {
        cart: recalcCartTotals(next as StoreCart),
        hasHydrated: true,
        pendingMutations: s.pendingMutations + 1,
        isLoading: true,
      };
    });

    try {
      const serverCart = await addLineItem(
        variantId,
        quantity,
        countryCode,
        metadata,
      );
      console.log(serverCart)
      set((s) => ({
        cart: asStoreCart(serverCart),
        hasHydrated: true,
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
    } catch (error) {
      set((s) => ({
        cart: prevCart,
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
      throw error;
    } finally {
      set((s) => {
        const nextLocks = { ...s.actionLocks };
        delete nextLocks[key];
        return {
          actionLocks: nextLocks,
          isLoading: s.pendingMutations > 0,
        };
      });
    }
  },

  // -------- Update Quantity (with debounce) --------
  updateQuantity: async (lineItemId, quantity) => {
    const key = lockKeyForLine(lineItemId, "update");

    // Validate inventory
    const cart = get().cart;
    const currentItem = cart?.items?.find((i) => i.id === lineItemId);
    if (!currentItem) return;

    if (currentItem && currentItem.inventory && quantity > currentItem.inventory) {
      console.warn(`Cannot set quantity above inventory limit of ${currentItem.inventory}`);
      toast.error(`نمی‌توان تعداد را بالاتر از موجودی ${currentItem.inventory} تنظیم کرد.`)
      quantity = currentItem.inventory;
    }

    // If quantity is 0 or less, remove the item instead
    if (quantity <= 0) {
      await get().removeItem(lineItemId);
      return;
    }


    // If there's already a lock, we're in the middle of a server sync
    // Still update UI immediately with latest quantity
    if (get().actionLocks[key]) {
      set((s) => {
        const current = s.cart;
        if (!current) return { cart: null };

        const next: StoreCart = {
          ...current,
          items: current.items.map((item) =>
            item.id === lineItemId ? { ...item, quantity, lineTotal: item.price * quantity } : item,
          ),
        };

        return {
          cart: recalcCartTotals(next),
        };
      });

      // Store pending update to be sent after lock releases
      // The debouncer will handle this naturally
      return quantityDebouncer.debounce(lineItemId, quantity, async (id, qty) => {
        const serverCart = await updateLineItem(id, qty);
        set((s) => ({
          cart: asStoreCart(serverCart),
          pendingMutations: Math.max(0, s.pendingMutations - 1),
        }));
      });
    }

    // No lock exists - acquire it
    set((s) => ({
      actionLocks: { ...s.actionLocks, [key]: true },
    }));

    // Optimistically update UI immediately
    set((s) => {
      const current = s.cart;
      if (!current) {
        return {
          pendingMutations: s.pendingMutations + 1,
          isLoading: true,
        };
      }

      const next: StoreCart = {
        ...current,
        items: current.items.map((item) =>
          item.id === lineItemId ? { ...item, quantity, lineTotal: item.price * quantity } : item,
        ),
      };

      return {
        cart: recalcCartTotals(next),
        pendingMutations: s.pendingMutations + 1,
        isLoading: true,
      };
    });

    // Debounce the server call - only the last quantity in the window will be sent
    try {
      await quantityDebouncer.debounce(lineItemId, quantity, async (id, qty) => {
        const serverCart = await updateLineItem(id, qty);
        set((s) => ({
          cart: asStoreCart(serverCart),
          pendingMutations: Math.max(0, s.pendingMutations - 1),
        }));
      });
    } catch (error) {
      // Only revert if there was an actual error (not cancellation)
      if (error !== 'Cancelled') {
        // Rollback on error
        const prevCart = get().cart;
        const originalItem = prevCart?.items?.find((i) => i.id === lineItemId);
        if (originalItem) {
          set((s) => ({
            cart: prevCart,
            pendingMutations: Math.max(0, s.pendingMutations - 1),
          }));
        }
        throw error;
      }
    } finally {
      // Release the lock
      set((s) => {
        const nextLocks = { ...s.actionLocks };
        delete nextLocks[key];
        return {
          actionLocks: nextLocks,
          isLoading: s.pendingMutations > 0,
        };
      });
    }
  },

  // -------- Remove Item --------
  removeItem: async (lineItemId) => {
    const key = lockKeyForLine(lineItemId, "remove");
    if (get().actionLocks[key]) return;

    // Cancel any pending quantity updates for this item
    quantityDebouncer.cancel();

    const prevCart = get().cart;

    set((s) => ({
      actionLocks: { ...s.actionLocks, [key]: true },
    }));

    // Optimistically remove item
    set((s) => {
      const current = s.cart;
      if (!current) {
        return {
          pendingMutations: s.pendingMutations + 1,
          isLoading: true,
        };
      }

      const next: StoreCart = {
        ...current,
        items: current.items.filter((item) => item.id !== lineItemId),
      };

      return {
        cart: recalcCartTotals(next),
        pendingMutations: s.pendingMutations + 1,
        isLoading: true,
      };
    });

    try {
      const serverCart = await removeLineItem(lineItemId);
      set((s) => ({
        cart: asStoreCart(serverCart),
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
    } catch (error) {
      set((s) => ({
        cart: prevCart,
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
      throw error;
    } finally {
      set((s) => {
        const nextLocks = { ...s.actionLocks };
        delete nextLocks[key];
        return {
          actionLocks: nextLocks,
          isLoading: s.pendingMutations > 0,
        };
      });
    }
  },

  // -------- Clear Cart --------
  clear: async () => {
    const key = "clear";
    if (get().actionLocks[key]) return;

    // Cancel all pending updates
    quantityDebouncer.cancel();

    const prevCart = get().cart;

    set((s) => ({
      actionLocks: { ...s.actionLocks, [key]: true },
      cart: null,
      pendingMutations: s.pendingMutations + 1,
      isLoading: true,
    }));

    try {
      clearLocalCart();
      set((s) => ({
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
    } catch (error) {
      set((s) => ({
        cart: prevCart,
        pendingMutations: Math.max(0, s.pendingMutations - 1),
      }));
      throw error;
    } finally {
      set((s) => {
        const nextLocks = { ...s.actionLocks };
        delete nextLocks[key];
        return {
          actionLocks: nextLocks,
          isLoading: s.pendingMutations > 0,
        };
      });
    }
  }

}));