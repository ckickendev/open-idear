import { api } from '@/lib/api/axios';

export const paymentApi = {
    createCheckout: async () => {
        return await api.post('/checkout/create');
    },
    processDemoPayment: async (paymentId: string) => {
        return await api.post('/payment/demo-success', { paymentId });
    },
};
