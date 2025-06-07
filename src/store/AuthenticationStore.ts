import { create } from 'zustand';

interface UserData {
    _id: String,
    username: String,
    email: String,
    role: Number,
    activate: Boolean,
    createdAt: Date,
    bio: String,
    avatar: string,
}

interface AuthenState {
    currentUserID: string;
    setCurrentUserID: (userID: string) => void;
    currentUser: UserData;
    setCurrentUser: (user: any) => void;
    isAuthenFormDisplay: boolean;
    setIsAuthenFromDisplay: (visible: boolean) => void;
    state: number
    setState: (state: number) => void;
}

const authenticationStore = create<AuthenState>((set) => ({
    currentUser: {
        _id: "",
        username: "",
        email: "",
        role: 0,
        activate: false,
        createdAt: new Date(),
        bio: "",
        avatar: "",
    },
    currentUserID: "",
    setCurrentUserID: (userID: string) => set(() => {
        console.log("User ID set to: ", userID);
        return { currentUserID: userID };
    }),
    setCurrentUser: (user: UserData) => set(() => {
        console.log("User set to: ", user);
        return { currentUser: user };
    }),
    isAuthenFormDisplay: false,
    setIsAuthenFromDisplay: (visible: boolean) => set(() => {
        console.log("isAuthenFormDisplay set to: ", visible);
        return { isAuthenFormDisplay: visible };
    }),
    state: 1,
    setState: (state: number) => set(() => {
        console.log("state set to: ", state);
        return { state: state };
    })
}));

export default authenticationStore;
