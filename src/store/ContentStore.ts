import { create } from "zustand";

interface ContentState {
    title: String,
    content: String,
    setTitle: (title: String) => void,
    setContent: (content: String) => void
}


const contentStore = create<ContentState>((set) => ({
    title: "",
    content: "",
    setTitle: (title) => set(() => {
        console.log("Title set to: ", title);

        return (
            { title: title }
        )
    }),
    setContent: (content) => set(() => ({ content: content })),
}));

export default contentStore;
