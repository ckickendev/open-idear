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

// Format HTML with indentation and line breaks
const formatHtml = (html: any) => {
    if (!html) return '';

    // Replace closing tags followed by opening tags with line break
    let formatted = html.replace(/>\s*</g, '>\n<');

    // Add indentation
    const indent = 2;
    const lines = formatted.split('\n');
    let indentLevel = 0;

    formatted = lines.map((line: any) => {
        // Check for closing tag
        if (line.match(/^<\//)) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        // Add indentation
        const indentation = ' '.repeat(indentLevel * indent);
        const indentedLine = indentation + line;

        // Check for opening tag (not self-closing)
        if (line.match(/<[^/][^>]*[^/]>$/)) {
            indentLevel++;
        }

        return indentedLine;
    }).join('\n');

    return formatted;
};

import { Editor } from '@tiptap/react';
import contentStore from '@/store/ContentStore';

const HtmlEditor = ({ editor }: { editor: Editor | null }) => {
    const [rawHtml, setRawHtml] = useState('');
    const [showHtmlEditor, setShowHtmlEditor] = useState(false);
    const modeHTML = contentStore((state) => state.modeHTML);
    const setModeHTML = contentStore((state) => state.setModeHTML);

    interface RawHtmlChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> { }

    const handleRawHtmlChange = (e: RawHtmlChangeEvent) => {
        setRawHtml(e.target.value);
    };

    const applyHtml = () => {
        if (editor) {
            editor.commands.setContent(rawHtml);
            setShowHtmlEditor(false);
            setModeHTML(!modeHTML);
        }
    };

    const syncWithEditor = () => {
        if (editor) {
            const html = editor.getHTML();
            setRawHtml(formatHtml(html));
        }
    };

    return (
        <div className="html-editor-container w-full">
            <div className="flex items-center gap-2 mb-2 justify-center">
                <button
                    onClick={() => {
                        syncWithEditor();
                        setShowHtmlEditor(!showHtmlEditor);
                        setModeHTML(!modeHTML);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                >
                    {showHtmlEditor ? 'Hide HTML' : 'Transfer to HTML Mode'}
                </button>

                {showHtmlEditor && (
                    <button
                        onClick={applyHtml}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                        Apply HTML
                    </button>
                )}
            </div>

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