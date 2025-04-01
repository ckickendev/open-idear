import { create } from 'zustand';

const authenticationStore = create((set) => ({
    currentUser : {},
    setCurrentUser: () => set((user) => ({ currentUser: user })),
}));

export default useStore;
