import { create } from "zustand";

interface ContentState {
    title: String,
    content: String,
    setTitle: (title: String) => void,
    setContent: (content: String) => void
    postList: any[],
    setPostList: (postList: any[]) => void,
    modeHTML: boolean,
    setModeHTML: (mode: boolean) => void,
    showHtmlEditor: boolean,
    setShowHtmlEditor: (isShow: boolean) => void,
}


const contentStore = create<ContentState>((set) => ({
    title: "",
    content: "",
    setTitle: (title) => set(() => {
        return (
            { title: title }
        )
    }),
    setContent: (content) => set(() => {
        return (
            { content: content }
        )
    }),
    postList: [],
    setPostList: (postList) => set(() => ({ postList: postList })),
    modeHTML: false,
    setModeHTML: (mode) => set(() => ({ modeHTML: mode })),
    showHtmlEditor: false,
    setShowHtmlEditor: (isShow) => set(() => ({ showHtmlEditor: isShow })),
}));

export default contentStore;
