'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

const AdminPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
}: AdminPaginationProps) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let end = Math.min(totalPages, start + maxVisiblePages - 1);
            if (end - start + 1 < maxVisiblePages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    const baseBtn =
        'flex items-center justify-center h-9 min-w-[36px] px-3 text-sm font-medium rounded-lg transition-all duration-150';
    const activeBtn = 'bg-admin-primary text-white shadow-sm cursor-pointer';
    const inactiveBtn =
        'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer';
    const disabledBtn =
        'text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed cursor-pointer';

    return (
        <div className="flex items-center justify-center gap-1.5 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`${baseBtn} ${currentPage <= 1 ? disabledBtn : inactiveBtn}`}
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`${baseBtn} ${pageNumber === currentPage ? activeBtn : inactiveBtn}`}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                    {pageNumber}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`${baseBtn} ${currentPage >= totalPages ? disabledBtn : inactiveBtn}`}
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default AdminPagination;
