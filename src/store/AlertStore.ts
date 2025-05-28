import { create } from 'zustand';

interface AlertState {
    isAlertDisplay: boolean;
    type: 'info' | 'success' | 'error' | 'warning' | '';
    setType: (type: 'info' | 'success' | 'error' | 'warning' | '') => void;
    changeStateAlert: () => void;
    message: string;
    setMessage: (message: string) => void;
}

const alertStore = create<AlertState>((set) => ({
    type: "",
    setType: (type: 'info' | 'success' | 'error' | 'warning' | '') => set(() => ({ type })),
    isAlertDisplay: false,
    changeStateAlert: () => set((state) =>
        ({ isAlertDisplay: !state.isAlertDisplay })
    ),
    message: '',
    setMessage: (message: string) => set(() => ({
        message
    }))
}));

export default alertStore;
