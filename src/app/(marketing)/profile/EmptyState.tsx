import { Bookmark } from "lucide-react";


const EmptyState = ({ type }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Bookmark className="text-gray-400" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No {type} yet
        </h3>
        <p className="text-gray-500 max-w-md">
            Please add more {type} you want.
        </p>
    </div>
);

export default EmptyState;