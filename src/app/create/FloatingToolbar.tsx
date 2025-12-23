import { useState } from "react";
import { Code, Grip, Heading1, Heading2, Heading3, Image, Link, Pilcrow, Quote } from "lucide-react";

const DraggableElement = ({ type, label, icon } : { type: string; label: string; icon: React.ReactNode }) => {
    const handleDragStart = (e : React.DragEvent) => {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-300 border border-gray-300 rounded-lg cursor-move transition-all duration-200 group backdrop-blur-sm"
        >
            <div className="text-gray-700 group-hover:text-gray-800 transition-colors">
                {icon}
            </div>
            <span className="text-gray-700 group-hover:text-gray-800 text-sm font-medium transition-colors">
                {label}
            </span>
        </div>
    );
};

const FloatingToolbar = () => {
    const [isHovered, setIsHovered] = useState(false);

    const elements = [
        { type: "paragraph", label: "Paragraph", icon: <Pilcrow size={18} /> },
        { type: "heading1", label: "Heading 1", icon: <Heading1 size={18} /> },
        { type: "heading2", label: "Heading 2", icon: <Heading2 size={18} /> },
        { type: "heading3", label: "Heading 3", icon: <Heading3 size={18} /> },
        { type: "image", label: "Image", icon: <Image size={18} /> },
        { type: "link", label: "Link", icon: <Link size={18} /> },
        { type: "blockquote", label: "Blockquote", icon: <Quote size={18} /> },
        { type: "codeBlock", label: "Code Block", icon: <Code size={18} /> }
    ];

    return (
        <div
            className={`fixed bg-gray-100 right-0 top-30 z-50 transition-all rounded-lg duration-300 flex flex-col ${isHovered ? 'w-72' : 'w-12'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-full bg-gray-100 rounded-lg border-1 border-gray-300 shadow-2xl shadow-cyan-500/20">
                {!isHovered ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray border border-cyan-500/40 cursor-pointer hover:bg-slate-700/80 hover:border-cyan-400/60 transition-all duration-200">
                            <Grip className="text-cyan-400" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className="p-6 w-full h-full overflow-y-auto">
                        <div className="mb-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cyan-500/40 rounded-lg backdrop-blur-sm">
                                <Code className="text-gray-700" size={20} />
                                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gray-700">
                                    Elements
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {elements.map((element) => (
                                <DraggableElement
                                    key={element.type}
                                    type={element.type}
                                    label={element.label}
                                    icon={element.icon}
                                />
                            ))}
                        </div>

                        <div className="mt-6 p-3 bg-gray-100 border border-gray-300/70 hover:bg-gray-300 rounded-lg backdrop-blur-sm">
                            <p className="text-xs text-gray-700 text-center">
                                Drag elements to the canvas
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingToolbar;