import { useState } from "react";
import DraggableElement from "./DragableElement";
import Logo from "@/component/common/Logo";

const FloatingToolbar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const elements = [
        { type: "paragraph", label: "Paragraph", icon: "¶" },
        { type: "heading1", label: "Heading 1", icon: "H1" },
        { type: "heading2", label: "Heading 2", icon: "H2" },
        { type: "heading3", label: "Heading 3", icon: "H3" },
        { type: "image", label: "Image", icon: "🖼️" },
        { type: "link", label: "Link", icon: "🔗" },
        { type: "blockquote", label: "Blockquote", icon: "❝" },
        { type: "codeBlock", label: "Code Block", icon: "<>" }
    ];

    return (
        <div
            className="fixed left-4 top-1/4 z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                {!isExpanded ? (
                    <div className="flex items-center justify-center w-full h-full rounded-full cursor-pointer">
                        <Logo className="w-12 h-full" />
                        <h1 className='text-xl text-gray-600'>Select elements</h1>
                    </div>
                ) : (
                    <div className="p-2 min-w-[180px] w-full">
                        <div className='d-flex items-center justify-center'>
                            <h3 className="mb-2 text-gray-700 text-center">Elements</h3>
                        </div>

                        <div className="space-y-2">
                            {elements.map((element) => (
                                <DraggableElement
                                    key={element.type}
                                    type={element.type}
                                    label={element.label}
                                    icon={element.icon}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingToolbar;