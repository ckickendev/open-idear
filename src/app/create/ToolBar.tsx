import HoverTooltip from '@/component/common/TooltipNote';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';

interface ToolbarItemProps {
    title: string;
    action: () => void;
    children?: React.ReactNode;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ children, title, action }) => {
    return (
        <HoverTooltip tooltipText={title}>
            <button
                onClick={action}
                className="p-2 rounded transition-colors cursor-pointer"
            // title={title}
            >
                {children}
            </button>
        </HoverTooltip>

    );
};


const Toolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
            <ToolbarItem
                title="Bold"
                action={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold />
            </ToolbarItem>
            <ToolbarItem
                title="Italic"
                action={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic />
            </ToolbarItem>
            <ToolbarItem
                title="Underline"
                action={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline />
            </ToolbarItem>
            <div className="border-r border-gray-300 mx-1"></div>
            <ToolbarItem
                title="Align Left"
                action={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <AlignLeft />
            </ToolbarItem>
            <ToolbarItem
                title="Align Center"
                action={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <AlignCenter />
            </ToolbarItem>
            <ToolbarItem
                title="Align Right"
                action={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <AlignRight />
            </ToolbarItem>
            <div className="border-r border-gray-300 mx-1"></div>
            <ToolbarItem
                title="Bullet List"
                action={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List />
            </ToolbarItem>
            <ToolbarItem
                title="Ordered List"
                action={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered />
            </ToolbarItem>
        </div>
    );
};

export default Toolbar;