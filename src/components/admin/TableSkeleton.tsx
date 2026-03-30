'use client';

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
    return (
        <div className="animate-pulse">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={colIndex} className="flex-1">
                            <div
                                className={`h-4 bg-gray-200 rounded ${
                                    colIndex === 0 ? 'w-8' : colIndex === 1 ? 'w-3/4' : 'w-1/2'
                                }`}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TableSkeleton;
