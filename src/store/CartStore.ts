import { create } from "zustand";
import { api } from "@/lib/api/axios";

export interface CartItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnail?: { url: string };
  instructor?: { username: string; name: string; avatar?: string };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (
    courseId: string,
  ) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (
    courseId: string,
  ) => Promise<{ success: boolean; message?: string }>;
  clearLocalCart: () => void;
}

const cartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/cart");
      if (res.success) {
        const items = res.data?.data?.items || [];
        set({ items, itemCount: items.length });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (courseId: string) => {
    try {
      const res = await api.post("/cart/add", { courseId });
      if (res.success) {
        // Refresh cart from server to get populated data
        await get().fetchCart();
        return { success: true };
      }
      return {
        success: false,
        message: res.message || "Failed to add to cart",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to add to cart",
      };
    }
  },

  removeFromCart: async (courseId: string) => {
    // Optimistic update
    const prevItems = get().items;
    set((state) => ({
      items: state.items.filter((item) => item._id !== courseId),
      itemCount: state.itemCount - 1,
    }));

    try {
      const res = await api.delete("/cart/remove", { data: { courseId } });
      if (!res.success) {
        // Revert on failure
        set({ items: prevItems, itemCount: prevItems.length });
        return {
          success: false,
          message: res.message || "Failed to remove from cart",
        };
      }
      return { success: true };
    } catch (error: any) {
      // Revert on error
      set({ items: prevItems, itemCount: prevItems.length });
      return {
        success: false,
        message: error?.message || "Failed to remove from cart",
      };
    }
  },

  clearLocalCart: () => {
    set({ items: [], itemCount: 0 });
  },
}));

export default cartStore;
