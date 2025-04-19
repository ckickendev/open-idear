import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: 'html' | 'css' | 'javascript';
    className?: string;
}

const CodeEditor = ({ value, onChange, language, className = '' }: CodeEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (editorRef.current) {
            monacoEditorRef.current = monaco.editor.create(editorRef.current, {
                value,
                language,
                theme: 'vs-dark',
                minimap: {
                    enabled: false
                },
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
            });

            // Handle onChange event
            monacoEditorRef.current.onDidChangeModelContent(() => {
                if (monacoEditorRef.current) {
                    const updatedValue = monacoEditorRef.current.getValue();
                    onChange(updatedValue);
                }
            });
        }

        return () => {
            if (monacoEditorRef.current) {
                monacoEditorRef.current.dispose();
            }
        };
    }, [language]);

    // Update editor content when value prop changes
    useEffect(() => {
        if (monacoEditorRef.current) {
            const editorValue = monacoEditorRef.current.getValue();
            if (value !== editorValue) {
                monacoEditorRef.current.setValue(value);
            }
        }
    }, [value]);

    return (
        <div ref={editorRef} className={`w-full h-full ${className}`} />
    );
};