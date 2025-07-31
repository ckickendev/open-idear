'use client';
import convertDate from "@/common/datetime";
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Edit, Eye, EyeOff, Search, Trash2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hook/useTranslation";
import HoverTooltip from "@/component/common/TooltipNote";

type PostType = {
    _id: string;
    image: {
        url: string;
        description?: string;
    };
    title: string;
    description: string;
    author: any;
    category: any;
    published: any;
    views?: number;
    likes?: number;
    createdAt: string;
    content?: string;
    slug?: string;
};

const Post = () => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setPublishedFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    // Pagination settings
    const itemsPerPage = 15;

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const { t } = useTranslation();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post`);
                    console.log("response", response);

                    const categoriesResponse = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`);
                    setAllCategories(categoriesResponse.data.categories);

                    setPosts(response.data.posts);
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
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    // Filter and pagination logic
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPublished = statusFilter === 'all' || post.published == (statusFilter == "true");
        const matchesCategory = categoryFilter === 'all' || post.category._id === categoryFilter;

        return matchesSearch && matchesPublished && matchesCategory;
    });

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, categoryFilter]);

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

    const changePostPublished = async (id: string) => {
        try {
            changeLoad();
            const post = posts.find(p => p._id === id);
            const newPublished = post?.published === true ? false : true;

            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/published/${id}`, {
                published: newPublished
            });

            setPosts(posts.map(post =>
                post._id === id ? { ...post, published: newPublished } : post
            ));

            setType('info');
            setMessage(`Đã ${newPublished === true ? 'duyệt' : 'ẩn'} bài viết thành công`);
            changeLoad();
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || error?.message);
            changeLoad();
        }
    };

    const handleDeletePost = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            changeLoad();
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/delete/${id}`)
                .then(response => {
                    setType('info');
                    setMessage('Xóa bài viết thành công');
                    changeLoad();
                })
                .catch(error => {
                    setType('error');
                    setMessage(error?.response?.data?.message || error?.message);
                    changeLoad();
                });

            const newPosts = posts.filter(post => post._id !== id);
            setPosts(newPosts);

            // Adjust current page if necessary after deletion
            const newFilteredPosts = newPosts.filter(post => {
                const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.author.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesPublished = statusFilter === 'all' || post.published === statusFilter;
                const matchesCategory = categoryFilter === 'all' || post.category._id === categoryFilter;

                return matchesSearch && matchesPublished && matchesCategory;
            });
            const newTotalPages = Math.ceil(newFilteredPosts.length / itemsPerPage);
            if (page > newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages);
            }
        }
    };

    return (
        <div className="h-full space-y-6 relative flex flex-col justify-between">
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Ý tưởng/Bài viết</h1>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setPublishedFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="true">Đã duyệt</option>
                        <option value="false">Chờ duyệt</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {allCategories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                    </select>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                        <Filter size={16} />
                        Lọc
                    </button>
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-600 mb-4">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} / {filteredPosts.length} bài viết
                    {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') &&
                        ` (lọc từ ${posts.length} tổng cộng)`
                    }
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentPosts.map((post, index) => (
                                <tr key={post._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                            {post.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {post.author?.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {post.category?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published === true
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {post.published === true ? 'Đã public' : 'Chưa public'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {convertDate(post.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <HoverTooltip tooltipText={post.published === true ? 'Ẩn bài viết' : 'Duyệt bài viết'}>
                                                <button
                                                    onClick={() => changePostPublished(post._id)}
                                                    className={`p-1 rounded hover:bg-opacity-10 transition-colors ${post.published === true
                                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={post.published === true ? 'Ẩn bài viết' : 'Duyệt bài viết'}
                                                >
                                                    {post.published === true ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </HoverTooltip >
                                            <HoverTooltip tooltipText="Xóa bài viết">
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Xóa bài viết"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </HoverTooltip>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentPosts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                                            ? 'Không tìm thấy bài viết nào phù hợp'
                                            : 'Chưa có bài viết nào'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default Post;