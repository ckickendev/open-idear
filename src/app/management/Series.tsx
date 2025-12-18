'use client';
import convertDate from "@/common/datetime";
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Search, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hook/useTranslation";
import HoverTooltip from "@/component/common/TooltipNote";
import Link from "next/link";

type SeriesType = {
    _id: string;
    image: {
        url: string;
        description?: string;
    };
    title: string;
    description: string;
    slug: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
    };
    createdAt?: string;
    updatedAt?: string;
};

const Series = () => {
    const [series, setSeries] = useState<SeriesType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Pagination settings
    const itemsPerPage = 15;

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series`);
                    console.log("response", response);
                    setSeries(response.data.series || response.data);
                    changeLoad();
                } else {
                    setType('error');
                    setMessage("Authentication error !");
                    changeLoad();
                }
            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message);
                changeLoad();
                console.error('Error fetching series:', error);
            }
        };
        fetchSeries();
    }, []);

    // Filter and pagination logic
    const filteredSeries = series.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSeries = filteredSeries.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    // Pagination functions
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
        }
    };

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const goToNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);

            if (page <= 3) {
                endPage = maxVisiblePages;
            } else if (page >= totalPages - 2) {
                startPage = totalPages - maxVisiblePages + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    const handleDeleteSeries = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa series này?')) {
            changeLoad();
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/delete/${id}`)
                .then(response => {
                    setType('info');
                    setMessage('Xóa series thành công');
                    changeLoad();
                })
                .catch(error => {
                    setType('error');
                    setMessage(error?.response?.data?.message || error?.message);
                    changeLoad();
                });

            const newSeries = series.filter(item => item._id !== id);
            setSeries(newSeries);

            // Adjust current page if necessary after deletion
            const newFilteredSeries = newSeries.filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchTerm.toLowerCase());

                return matchesSearch;
            });
            const newTotalPages = Math.ceil(newFilteredSeries.length / itemsPerPage);
            if (page > newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages);
            }
        }
    };

    return (
        <div className="h-full space-y-6 relative flex flex-col justify-between">
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Series</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm series..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                        />
                    </div>
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-600 mb-4">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredSeries.length)} / {filteredSeries.length} series
                    {searchTerm &&
                        ` (lọc từ ${series.length} tổng cộng)`
                    }
                </div>

                {/* Single Responsive Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Table for larger screens */}
                    <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tác giả</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentSeries.map((item, index) => (


                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link href={`/series/${item.slug}`} className="hover:underline">
                                                    {item.title}
                                                </Link>
                                            </div>
                                            {/* Show description, author, date on mobile/tablet in subtitle */}
                                            <div className="text-xs text-gray-500 lg:hidden">
                                                <div className="line-clamp-2">{item.description}</div>
                                                <div>Tác giả: <img src={item.user?.avatar} className="h-10 w-10 rounded-full" /> {item.user?.username}</div>
                                                {item.createdAt && <div>Ngày: {convertDate(item.createdAt)}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell max-w-xs">
                                        <div className="line-clamp-2">{item.description}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                                        {item.user?.username}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                        {item.createdAt ? convertDate(item.createdAt) : 'N/A'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <HoverTooltip tooltipText="Xóa series">
                                                <button
                                                    onClick={() => handleDeleteSeries(item._id)}
                                                    className="text-red-600 hover:text-red-900 p-1 sm:p-2 rounded hover:bg-red-50 transition-colors"
                                                    title="Xóa series"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </HoverTooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentSeries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                                        {searchTerm
                                            ? 'Không tìm thấy series nào phù hợp'
                                            : 'Chưa có series nào'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-4 p-4">
                        {currentSeries.map((item, index) => (
                            <div key={item._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                            <Link href={`/series/${item.slug}`} className="hover:underline">
                                                #{startIndex + index + 1} - {item.title}
                                            </Link>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="line-clamp-2 mb-2">{item.description}</div>
                                            <div>Tác giả: <span className="font-medium">{item.user?.username}</span></div>
                                            {item.createdAt && <div>Ngày tạo: <span className="font-medium">{convertDate(item.createdAt)}</span></div>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleDeleteSeries(item._id)}
                                            className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                            title="Xóa series"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {currentSeries.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {searchTerm
                                    ? 'Không tìm thấy series nào phù hợp'
                                    : 'Chưa có series nào'
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6">
                    <div className="flex items-center space-x-1">
                        {/* Previous Button */}
                        <button
                            onClick={goToPreviousPage}
                            disabled={page === 1}
                            className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-l-lg transition-colors ${page === 1
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <ChevronLeft size={16} />
                            <span className="ml-1">Trước</span>
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => goToPage(pageNumber)}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 transition-colors ${pageNumber === page
                                    ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700'
                                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={goToNextPage}
                            disabled={page === totalPages}
                            className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-r-lg transition-colors ${page === totalPages
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-1">Sau</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Series;