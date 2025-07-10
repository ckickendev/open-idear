import React, { useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';

const RawHtmlExtension = Extension.create({
    name: 'rawHtml',

    addCommands() {
        return {
            setRawHtml:
                (html: string) =>
                    ({ commands }: { commands: any }) => {
                        commands.setContent(html);
                        return true;
                    },
        } as Partial<Record<string, any>>;
    },
});



import { Editor } from '@tiptap/react';
import contentStore from '@/store/ContentStore';

const HtmlEditor = ({ editor, setRawHtml, rawHtml }: any) => {

    const showHtmlEditor = contentStore((state) => state.showHtmlEditor);
    const setShowHtmlEditor = contentStore((state) => state.setShowHtmlEditor);
    const modeHTML = contentStore((state) => state.modeHTML);
    const setModeHTML = contentStore((state) => state.setModeHTML);

    interface RawHtmlChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> { }

    const handleRawHtmlChange = (e: RawHtmlChangeEvent) => {
        setRawHtml(e.target.value);
    };

    return (
        <div className="html-editor-container w-full">
            {showHtmlEditor && (
                <div className="w-full mb-4 mt-20 flex flex-col items-center ">
                    <textarea
                        value={rawHtml}
                        onChange={handleRawHtmlChange}
                        className="w-full min-h-[300px] font-mono text-sm p-3 border border-gray-300 rounded-md 
                      whitespace-pre bg-gray-50 shadow-inner
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      hover:border-gray-400 transition-colors duration-200"
                        placeholder="Enter raw HTML..."
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                    />
                </div>
            )}
        </div>
    );
};

export default HtmlEditor;
export { RawHtmlExtension };