import { useEditor, EditorContent, Editor } from '@tiptap/react';

interface ToolbarItemProps {
    icon: string;
    title: string;
    action: () => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ icon, title, action }) => {
    return (
        <button
            onClick={action}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={title}
        >
            {icon}
        </button>
    );
};


const Toolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
            <ToolbarItem
                icon="B"
                title="Bold"
                action={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarItem
                icon="I"
                title="Italic"
                action={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarItem
                icon="U"
                title="Underline"
                action={() => editor.chain().focus().toggleUnderline().run()}
            />
            <div className="border-r border-gray-300 mx-1"></div>
            <ToolbarItem
                icon="≡"
                title="Align Left"
                action={() => editor.chain().focus().setTextAlign('left').run()}
            />
            <ToolbarItem
                icon="≡"
                title="Align Center"
                action={() => editor.chain().focus().setTextAlign('center').run()}
            />
            <ToolbarItem
                icon="≡"
                title="Align Right"
                action={() => editor.chain().focus().setTextAlign('right').run()}
            />
            <div className="border-r border-gray-300 mx-1"></div>
            <ToolbarItem
                icon="•"
                title="Bullet List"
                action={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarItem
                icon="1."
                title="Ordered List"
                action={() => editor.chain().focus().toggleOrderedList().run()}
            />
        </div>
    );
};

export default Toolbar;