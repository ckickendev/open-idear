import { useState } from "react";
import DraggableElement from "./DragableElement";
import { Code, Grip, Heading1, Heading2, Heading3, Image, Link, Pilcrow, Quote } from "lucide-react";

const FloatingToolbar: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    const elements = [
        { type: "paragraph", label: "Paragraph", icon: <Pilcrow /> },
        { type: "heading1", label: "Heading 1", icon: <Heading1 /> },
        { type: "heading2", label: "Heading 2", icon: <Heading2 /> },
        { type: "heading3", label: "Heading 3", icon: <Heading3 /> },
        { type: "image", label: "Image", icon: <Image /> },
        { type: "link", label: "Link", icon: <Link /> },
        { type: "blockquote", label: "Blockquote", icon: <Quote /> },
        { type: "codeBlock", label: "Code Block", icon: <Code /> }
    ];

    return (
        <div
            className={`fixed right-0 top-0 z-50 bg-white shadow-lg transition-all duration-300 flex flex-col h-full ${isHovered ? 'w-64' : 'w-12'} relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 transition-colors">
                {!isHovered ? (
                    <div className="flex items-center justify-center w-full h-full rounded-full cursor-pointer">
                        <Grip />
                    </div>
                ) : (
                    <div className="p-2 min-w-[300px] w-full">
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