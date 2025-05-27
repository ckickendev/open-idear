import { create } from 'zustand';

interface AlertState {
    isAlertDisplay: boolean;
    changeStateAlert: () => void;
}

const alertStore = create<AlertState>((set) => ({
    isAlertDisplay: false,
    changeStateAlert: () => set((state) =>
        ({ isAlertDisplay: !state.isAlertDisplay })
    ),
}));

export default alertStore;
