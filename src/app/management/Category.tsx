'use client';
import convertDate from "@/common/datetime";
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Edit, Filter, Plus, Search, Trash2, X, ChevronLeft, ChevronRight, Eye, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hook/useTranslation";
import ImageUpload from "../create/ImageUpload";
import { TextAreaCustom } from "@/component/common/TextAreaCustom";

type CategoryType = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    background_image: string;
    createdAt: string;
};

const Category = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<CategoryType | null>(null);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [page, setPage] = useState(1);

    // Pagination settings
    const itemsPerPage = 15; // You can adjust this number

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const { t } = useTranslation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`);
                    console.log('Fetched categories:', response.data.categories);
                    setCategories(response.data.categories);
                } else {
                    setType('error');
                    setMessage("Authentication error !");
                }

            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message)
                console.error('Error fetching categories:', error);
            } finally {
                changeLoad();
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        slug: '',
        description: '',
    });

    // Pagination logic
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, endIndex);

    // Reset to first page when search term changes
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
            // Show all pages if total pages is less than or equal to max visible pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Show pages around current page
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);

            // Adjust if we're near the beginning or end
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

    const openModal = (type: any, item: CategoryType | null = null) => {
        setModalType(type);
        setSelectedItem(item);
        if (item) {
            setFormData({
                _id: item._id,
                name: item.name || '',
                slug: item.slug,
                description: item.description || '',
            });
        } else {
            setFormData({ _id: '', name: '', slug: '', description: '' });
        }
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
                const token = localStorage.getItem("access_token");
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const newCategory = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/create`, {
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    description: formData.description,
                });
                setCategories([...categories, newCategory.data.category]);
                setFormData({ _id: '', name: '', slug: '', description: '' });

                setType('info');
                setMessage(t('management.category.add_success'));
            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message);
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
            setMessage(t('management.category.no_name_empty'));
            changeLoad();
            return;
        }

        const updatedCategory = {
            _id: selectedItem?._id,
            name: formData.name,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            description: formData.description,
        };

        const token = localStorage.getItem("access_token");
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/update/${selectedItem?._id}`, updatedCategory)
            .then(response => {
                setCategories(categories.map(cat =>
                    cat._id === selectedItem?._id ? response.data.category : cat
                ));
                setFormData({ _id: '', name: '', slug: '', description: '' });
                setSelectedItem(null);

                setType('info');
                setMessage(t('management.category.update_success'));
            })
            .catch(error => {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message);
            });
        setShowModal(false);
        changeLoad();
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm(t('management.category.are_you_sure_delete'))) {
            changeLoad();
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/delete/${id}`)
                .then(response => {
                    setType('info');
                    setMessage('Xóa danh mục thành công');
                    changeLoad();
                })
                .catch(error => {
                    setType('error');
                    setMessage(error?.response?.data?.message || error?.message);
                    changeLoad();
                });

            const newCategories = categories.filter(cat => cat._id !== id);
            setCategories(newCategories);

            // Adjust current page if necessary after deletion
            const newFilteredCategories = newCategories.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const newTotalPages = Math.ceil(newFilteredCategories.length / itemsPerPage);
            if (page > newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages);
            }
        }
    };

    return (
        <div className="h-full space-y-6 relative flex flex-col justify-between">
            <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{t('management.category.title')}</h1>
                    <button
                        onClick={() => openModal('add')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        {t('management.category.add')}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('management.category.find')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                        />
                    </div>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Lọc</span>
                    </button>
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-600 mb-4">
                    {t('management.category.display')} {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} / {filteredCategories.length} {t('management.category.cate')}
                    {searchTerm && ` (filter from ${categories.length} total)`}
                </div>

                {/* Single Responsive Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Table for larger screens */}
                    <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('management.category.number')}</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('management.category.name')}</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('management.category.description')}</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('management.category.background_image')}</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('management.category.createDate')}</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('management.category.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentCategories.map((category, index) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            {/* Show description and date on mobile/tablet in subtitle */}
                                            <div className="text-xs text-gray-500 lg:hidden">
                                                <div className="truncate max-w-xs">{category.description}</div>
                                                <div>Ngày tạo: {convertDate(category.createdAt)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">{category.description}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800">
                                            <a href={`${category.background_image || `background/category/${category._id}.png`}`} target="_blank" rel="noopener noreferrer">
                                                <Eye size={14} className="mr-1" />
                                            </a>
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                        {convertDate(category.createdAt)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => openModal('edit', category)}
                                                className="text-blue-600 hover:text-blue-900 p-1 sm:p-2 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category._id)}
                                                className="text-red-600 hover:text-red-900 p-1 sm:p-2 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentCategories.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                                        {searchTerm ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-4 p-4">
                        {currentCategories.map((category, index) => (
                            <div key={category._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                            #{startIndex + index + 1} - {category.name}
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="line-clamp-2">{category.description}</div>
                                            <div>Ngày tạo: <span className="font-medium">{convertDate(category.createdAt)}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => openModal('edit', category)}
                                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category._id)}
                                            className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-800">
                                        <a href={`${category.background_image}`} target="_blank" rel="noopener noreferrer">
                                            <Eye size={14} className="mr-1" />
                                        </a>
                                    </span>
                                </div>
                            </div>
                        ))}
                        {currentCategories.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {searchTerm ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
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
                            <span className="ml-1">{t('management.category.previous')}</span>
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
                            <span className="mr-1">{t('management.category.next')}</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-500/50 bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {modalType === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('management.category.name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder={t('management.category.input_name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('management.category.description')}
                                </label>
                                <TextAreaCustom id="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder={t('management.category.input_description')} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    disabled={true}
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 border bg-gray-200 border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Default slug will be generated from name"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {t('management.category.cancel')}
                            </button>
                            <button
                                onClick={modalType === 'add' ? handleAddCategory : handleEditCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {modalType === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Category;