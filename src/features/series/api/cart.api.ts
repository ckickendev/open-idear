import { api } from "@/lib/api/axios";

export const cartApi = {
  getCart: async () => {
    return await api.get("/cart");
  },
  addToCart: async (courseId: string) => {
    return await api.post("/cart/add", { courseId });
  },
  removeFromCart: async (courseId: string) => {
    return await api.delete("/cart/remove", { data: { courseId } });
  },
};
