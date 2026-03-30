'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { courseCategoryApi } from '@/features/categories/api/courseCategory.api';
import { Edit, Plus, Trash2, Eye, X, Folder, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminPagination from '@/components/admin/AdminPagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type CourseCategoryType = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    background_image: string;
    createdAt: string;
};

const CourseCategory = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<CourseCategoryType | null>(null);
    const [categories, setCategories] = useState<CourseCategoryType[]>([]);
    const [page, setPage] = useState(1);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const itemsPerPage = 15;
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                changeLoad();
                setIsDataLoading(true);
                const response = await courseCategoryApi.getCourseCategories();
                if (response.success) {
                    setCategories(response.data.categories || response.categories);
                } else throw new Error(response.message);
            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message);
            } finally {
                changeLoad();
                setIsDataLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({ _id: '', name: '', slug: '', description: '' });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setPage(1); }, [searchTerm]);

    const openModal = (type: string, item: CourseCategoryType | null = null) => {
        setModalType(type);
        setSelectedItem(item);
        setFormData(item
            ? { _id: item._id, name: item.name || '', slug: item.slug, description: item.description || '' }
            : { _id: '', name: '', slug: '', description: '' }
        );
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({ _id: '', name: '', slug: '', description: '' });
    };

    const handleAddCategory = async () => {
        changeLoad();
        if (formData.name.trim()) {
            try {
                const newCategory = await courseCategoryApi.createCourseCategory({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    description: formData.description,
                });
                if (newCategory.success || newCategory.category) {
                    // Adjust depending on axios interceptor wrapping structure
                    setCategories([...categories, newCategory.data?.category || newCategory.category]);
                    setType('info');
                    setMessage('Thêm danh mục khoá học thành công');
                } else throw new Error(newCategory.message);
            } catch (error: any) {
                setType('error');
                setMessage(error?.message);
            } finally {
                setShowModal(false);
                changeLoad();
            }
        }
    };

    const handleEditCategory = () => {
        changeLoad();
        if (!formData.name.trim()) {
            setType('error');
            setMessage('Tên danh mục không được để trống');
            changeLoad();
            return;
        }
        courseCategoryApi.updateCourseCategory(selectedItem?._id as string, {
            name: formData.name,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            description: formData.description,
        })
            .then(response => {
                if (response.success || response.category) {
                    const updatedCategory = response.data?.category || response.category;
                    setCategories(categories.map(cat =>
                        cat._id === selectedItem?._id ? updatedCategory : cat
                    ));
                    setType('info');
                    setMessage('Cập nhật danh mục khoá học thành công');
                } else throw new Error(response.message);
            })
            .catch(error => { setType('error'); setMessage(error?.message); })
            .finally(() => { setShowModal(false); changeLoad(); });
    };

    const handleDeleteCategory = (id: string) => {
        changeLoad();
        courseCategoryApi.deleteCourseCategory(id)
            .then(response => {
                if (response.success || response.message) {
                    setType('info');
                    setMessage('Xóa danh mục khoá học thành công');
                }
                else throw new Error(response.message || "Lỗi xóa danh mục");
            })
            .catch(error => { setType('error'); setMessage(error?.message); })
            .finally(() => changeLoad());
        setCategories(categories.filter(cat => cat._id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Danh mục khoá học</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các danh mục khoá học của hệ thống</p>
                </div>
                <button
                    onClick={() => openModal('add')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary-ring"
                >
                    <Plus size={16} />
                    Thêm danh mục
                </button>
            </div>

            <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm kiếm danh mục khoá học..." />

            <p className="text-sm text-gray-500">
                {filteredCategories.length} danh mục
                {searchTerm && <span className="text-gray-400"> (lọc từ {categories.length} tổng cộng)</span>}
            </p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? (
                    <TableSkeleton columns={5} rows={6} />
                ) : currentCategories.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title={searchTerm ? 'Không tìm thấy danh mục' : 'Chưa có danh mục khoá học nào'}
                        description={searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm danh mục đầu tiên'}
                        actionLabel={!searchTerm ? 'Thêm danh mục' : undefined}
                        onAction={!searchTerm ? () => openModal('add') : undefined}
                    />
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình nền</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentCategories.map((category, index) => (
                                        <tr key={category._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 lg:hidden truncate max-w-xs">{category.description}</div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="text-sm text-gray-500 max-w-xs truncate">{category.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a href={category.background_image || `background/category/${category._id}.png`} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-admin-primary hover:underline text-sm">
                                                    <Eye size={14} /> Xem
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                                                {convertDate(category.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openModal('edit', category)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors" title="Chỉnh sửa">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(category._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Xóa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentCategories.map((category, index) => (
                                <div key={category._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{convertDate(category.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => openModal('edit', category)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => setConfirmDelete(category._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </button>
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
                onConfirm={() => confirmDelete && handleDeleteCategory(confirmDelete)}
                title="Xóa danh mục khoá học"
                message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalType === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                            </h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                                <TextAreaCustom id="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Mô tả về danh mục khoá học này" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                                <input disabled type="text" value={formData.slug}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                    placeholder="Slug sẽ được tạo tự động" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button onClick={modalType === 'add' ? handleAddCategory : handleEditCategory}
                                className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
                                {modalType === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseCategory;
