import { create } from "zustand";

interface UserData {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: number;
  activate: boolean;
  createdAt: Date;
  bio: string;
  background: string;
  avatar: string;
}

interface AuthenState {
  currentUserID: string;
  setCurrentUserID: (userID: string) => void;
  currentUser: UserData;
  setCurrentUser: (user: UserData) => void;
  updateCurrentUser: (data: Partial<UserData>) => void;
  isAuthenFormDisplay: boolean;
  setIsAuthenFromDisplay: (visible: boolean) => void;
  state: number;
  setState: (state: number) => void;
}

const authenticationStore = create<AuthenState>((set) => ({
  currentUser: {
    _id: "",
    username: "",
    name: "",
    email: "",
    role: 0,
    activate: false,
    createdAt: new Date(),
    bio: "",
    background: "",
    avatar: "",
  },
  currentUserID: "",
  setCurrentUserID: (currentUserID: string) => set({ currentUserID }),
  updateCurrentUser: (data: Partial<UserData>) =>
    set((state) => ({ currentUser: { ...state.currentUser, ...data } })),
  setCurrentUser: (currentUser: UserData) => set({ currentUser }),
  isAuthenFormDisplay: false,
  setIsAuthenFromDisplay: (isAuthenFormDisplay: boolean) => set({ isAuthenFormDisplay }),
  state: 1,
  setState: (state: number) => set({ state }),
}));

export default authenticationStore;
