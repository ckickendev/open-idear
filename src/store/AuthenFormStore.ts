import { create } from "zustand";

export interface StateAuthenForm {
    isAuthenFormDisplay: boolean;
    setIsAuthenFromDisplay: (visible: boolean) => void;
    state: number
    setState: (state: number) => void;
}

const authenFormStore = create<StateAuthenForm>((set) => ({
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

export default authenFormStore;