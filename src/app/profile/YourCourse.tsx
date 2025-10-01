import { BookText } from "lucide-react";

const YourCourse = () => {
    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="w-full mx-auto bg-white">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <BookText className="text-blue-600" size={32} />
                            Your Courses
                        </h1>
                        <p className="text-gray-600">Overview about your courses</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YourCourse;