'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { postApi } from '@/features/ideas/api/post.api';
import { categoryApi } from '@/features/categories/api/category.api';
import { Eye, EyeOff, Trash2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from '@/app/hook/useTranslation';
import Link from "next/link";
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminFilterSelect from '@/components/admin/AdminFilterSelect';
import AdminPagination from '@/components/admin/AdminPagination';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type PostType = {
    _id: string;
    image: { url: string; description?: string };
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
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [listStatus, setListStatus] = useState<'all' | 'trash'>('all');

    const itemsPerPage = 15;

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                changeLoad();
                setIsDataLoading(true);
                const response = await postApi.getAllPosts(listStatus);
                const categoriesResponse = await categoryApi.getCategories();
                if (categoriesResponse.success) {
                    setAllCategories(categoriesResponse.data.categories);
                }
                if (response.success) {
                    setPosts(response.data.posts);
                } else throw new Error(response.message);
            } catch (error: any) {
                setType('error');
                setMessage(error?.message);
            } finally {
                changeLoad();
                setIsDataLoading(false);
            }
        };
        fetchPosts();
    }, [listStatus]);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof post.author === 'string' && post.author.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesPublished = statusFilter === 'all' || post.published == (statusFilter == "true");
        const matchesCategory = categoryFilter === 'all' || post.category?._id === categoryFilter;
        return matchesSearch && matchesPublished && matchesCategory;
    });

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setPage(1); }, [searchTerm, statusFilter, categoryFilter]);

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all';

    const resetFilters = () => {
        setSearchTerm('');
        setPublishedFilter('all');
        setCategoryFilter('all');
    };

    const changePostPublished = async (id: string) => {
        try {
            changeLoad();
            const post = posts.find(p => p._id === id);
            const newPublished = !post?.published;
            const res = await postApi.changePublicManager(id, newPublished);
            if (!res.success) throw new Error(res.message);
            setPosts(posts.map(p => p._id === id ? { ...p, published: newPublished } : p));
            setType('info');
            setMessage(`Đã ${newPublished ? 'duyệt' : 'ẩn'} bài viết thành công`);
        } catch (error: any) {
            setType('error');
            setMessage(error?.message);
        } finally {
            changeLoad();
        }
    };

    const handleDeletePost = (id: string) => {
        changeLoad();
        postApi.deletePost(id)
            .then(response => {
                if (response.success) {
                    setType('info');
                    setMessage('Xóa bài viết thành công');
                    const newPosts = posts.filter(post => post._id !== id);
                    setPosts(newPosts);
                } else throw new Error(response.message);
            })
            .catch(error => {
                setType('error');
                setMessage(error?.message);
            })
            .finally(() => changeLoad());
    };

    const handleRestorePost = (id: string) => {
        changeLoad();
        postApi.restorePost(id)
            .then(response => {
                if (response.success) {
                    setType('info');
                    setMessage('Khôi phục bài viết thành công');
                    const newPosts = posts.filter(post => post._id !== id);
                    setPosts(newPosts);
                } else throw new Error(response.message);
            })
            .catch(error => {
                setType('error');
                setMessage(error?.message);
            })
            .finally(() => changeLoad());
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'true', label: 'Đã duyệt' },
        { value: 'false', label: 'Chờ duyệt' },
    ];

    const categoryOptions = [
        { value: 'all', label: 'Tất cả danh mục' },
        ...allCategories.map(c => ({ value: c._id, label: c.name })),
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản lý Ý tưởng/Bài viết</h1>
                <p className="text-sm text-gray-500 mt-1">Duyệt, quản lý và theo dõi tất cả bài viết</p>
            </div>

            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setListStatus('all')}
                    className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${listStatus === 'all'
                        ? 'border-admin-primary text-admin-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setListStatus('trash')}
                    className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${listStatus === 'trash'
                        ? 'border-admin-primary text-admin-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Thùng rác
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <AdminSearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm kiếm bài viết..."
                />
                <div className="flex gap-3">
                    <AdminFilterSelect value={statusFilter} onChange={setPublishedFilter} options={statusOptions} />
                    <AdminFilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
                </div>
            </div>

            {/* Active filters info */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {filteredPosts.length} bài viết
                    {hasActiveFilters && <span className="text-gray-400"> (lọc từ {posts.length} tổng cộng)</span>}
                </p>
                {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-sm text-admin-primary hover:underline font-medium">
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? (
                    <TableSkeleton columns={6} rows={8} />
                ) : currentPosts.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={hasActiveFilters ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
                        description={hasActiveFilters ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : undefined}
                    />
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tác giả</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Danh mục</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentPosts.map((post, index) => (
                                        <tr key={post._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <Link href={`/post/${post.slug}`} className="text-sm font-medium text-gray-900 hover:text-admin-primary transition-colors line-clamp-1">
                                                        {post.title}
                                                    </Link>
                                                    <div className="text-xs text-gray-400 mt-0.5 lg:hidden">
                                                        {post.author?.username} · {post.category?.name} · {convertDate(post.createdAt)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{post.author?.username}</td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <StatusBadge variant="neutral">{post.category?.name}</StatusBadge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge variant={post.published ? 'success' : 'warning'} dot>
                                                    {post.published ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                                                {convertDate(post.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {listStatus === 'trash' ? (
                                                        <button
                                                            onClick={() => handleRestorePost(post._id)}
                                                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                                                            title="Khôi phục bài viết"
                                                        >
                                                            Khôi phục
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => changePostPublished(post._id)}
                                                                className={`p-2 rounded-lg transition-colors ${post.published
                                                                    ? 'text-amber-600 hover:bg-amber-50'
                                                                    : 'text-emerald-600 hover:bg-emerald-50'
                                                                    }`}
                                                                title={post.published ? 'Ẩn bài viết' : 'Duyệt bài viết'}
                                                            >
                                                                {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(post._id)}
                                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                                title="Xóa bài viết"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentPosts.map((post, index) => (
                                <div key={post._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/post/${post.slug}`} className="text-sm font-medium text-gray-900 hover:text-admin-primary line-clamp-2">
                                                {post.title}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                                                <span className="text-xs text-gray-500">{post.author?.username}</span>
                                                <span className="text-gray-300">·</span>
                                                <span className="text-xs text-gray-500">{convertDate(post.createdAt)}</span>
                                            </div>
                                            <div className="mt-2">
                                                <StatusBadge variant={post.published ? 'success' : 'warning'} dot>
                                                    {post.published ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {listStatus === 'trash' ? (
                                                <button
                                                    onClick={() => handleRestorePost(post._id)}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                                                >
                                                    Khôi phục
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => changePostPublished(post._id)}
                                                        className={`p-2 rounded-lg ${post.published ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                    >
                                                        {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(post._id)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && handleDeletePost(confirmDelete)}
                title="Xóa bài viết"
                message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
}

export default Post;