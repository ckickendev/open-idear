import { create } from "zustand";

interface ContentState {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  postList: any[];
  setPostList: (postList: any[]) => void;
  modeHTML: boolean;
  setModeHTML: (mode: boolean) => void;
  showHtmlEditor: boolean;
  setShowHtmlEditor: (isShow: boolean) => void;
}

const contentStore = create<ContentState>((set) => ({
  title: "",
  content: "",
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  postList: [],
  setPostList: (postList) => set({ postList }),
  modeHTML: false,
  setModeHTML: (modeHTML) => set({ modeHTML }),
  showHtmlEditor: false,
  setShowHtmlEditor: (showHtmlEditor) => set({ showHtmlEditor }),
}));

export default contentStore;
