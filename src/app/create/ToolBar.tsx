import HoverTooltip from '@/component/common/TooltipNote';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, LucideCloudMoonRain, Underline } from 'lucide-react';

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
                className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
            >
                {children}
            </button>
        </HoverTooltip>

    );
};


const Toolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="w-full border-b border-gray-200 p-2 flex justify-center items-center flex-wrap gap-1">
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
            <ToolbarItem
                title="Color: RED"
                action={() => editor.chain().focus().setColor('#F98181').run()}
            >
                <div className='bg-red-900 w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>

            <ToolbarItem
                title="Color: BLACK"
                action={() => editor.chain().focus().setColor('#171717').run()}
            >
                <div className='bg-black w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>
            <ToolbarItem
                title="Color: WHITE"
                action={() => editor.chain().focus().setColor('#FFFFFF').run()}
            >
                <div className='bg-white rouder border w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>
            <ToolbarItem
                title="Color: BLUE"
                action={() => editor.chain().focus().setColor('#0000FF').run()}
            >
                <div className='bg-blue-900 w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>
            <ToolbarItem
                title="Color: GREEN"
                action={() => editor.chain().focus().setColor('#B9F18D').run()}
            >
                <div className='bg-green-900 w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>
            <ToolbarItem
                title="Color: GRAY"
                action={() => editor.chain().focus().setColor('#808080').run()}
            >
                <div className='bg-gray-900 w-[24px] h-[24px]'>
                </div>
            </ToolbarItem>
        </div>
    );
};

export default Toolbar;