import React, { useState } from 'react';
import { Extension } from '@tiptap/core';
import contentStore from '@/store/ContentStore';

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

const HtmlEditor = ({ editor, setRawHtml, rawHtml }: any) => {

    const showHtmlEditor = contentStore((state) => state.showHtmlEditor);

    interface RawHtmlChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> { }

    const handleRawHtmlChange = (e: RawHtmlChangeEvent) => {
        setRawHtml(e.target.value);
    };

    return (
        <div className="html-editor-container w-full min-w-5xl">
            {showHtmlEditor && (
                <div className="w-full mb-4 mt-20 flex flex-col items-center ">
                    <textarea
                        value={rawHtml}
                        onChange={handleRawHtmlChange}
                        className="w-full min-h-[760px] h-full font-mono text-sm p-3 border border-gray-300 rounded-md 
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