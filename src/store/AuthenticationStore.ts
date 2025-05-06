import { create } from 'zustand';

interface AuthenState {
    currentUser: any;
    setCurrentUser: (user: any) => void;
}

const authenticationStore = create<AuthenState>((set) => ({
    currentUser: {},
    setCurrentUser: (user: any) => set(() => {
        console.log("User set to: ", user);
        return { currentUser: user };
    }),
}));

export default authenticationStore;
