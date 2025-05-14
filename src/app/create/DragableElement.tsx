interface DraggableElementProps {
    type: string;
    label: string;
    icon?: any;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ type, label, icon }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center p-3 mb-2 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors"
        >
            <span className="mr-2">{icon}</span>
            <span>{label}</span>
        </div>
    );
};

export default DraggableElement;