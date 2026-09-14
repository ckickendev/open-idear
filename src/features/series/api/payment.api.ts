import { api } from "@/lib/api/axios";

export const paymentApi = {
  createCheckout: async (gateway: string = "demo") => {
    return await api.post("/checkout/create", { gateway });
  },
  processDemoPayment: async (paymentId: string) => {
    return await api.post("/payment/demo-success", { paymentId });
  },
  getPaymentStatus: async (orderCode: string) => {
    return await api.get(`/payment/status/${orderCode}`);
  },
};

