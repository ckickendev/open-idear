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
}));

export default authenticationStore;
