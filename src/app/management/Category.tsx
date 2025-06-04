'use client';
import convertDate from "@/common/datetime";
import LoadingComponent from "@/component/common/Loading";
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Edit, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { use, useEffect, useState } from "react";
import { set } from "react-hook-form";

type CategoryType = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    postCount: number;
    createdAt: string;
};

const Category = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<CategoryType | null>(null);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [page, setPage] = useState(1);

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`);
                    console.log("response", response);

                    setCategories(response.data.categories);
                    changeLoad();
                }

            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.error || error?.message)
                changeLoad();
                console.error('Error fetching categories:', error);
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
                setShowModal(false);

                setType('info');
                setMessage('Thêm danh mục thành công');
                changeLoad();
            } catch (error: any) {
                setShowModal(false);

                setType('error');
                setMessage(error?.response?.data?.error || error?.message);
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
                setShowModal(false);
                setSelectedItem(null);

                setType('info');
                setMessage('Cập nhật danh mục thành công');
                changeLoad();
            })
            .catch(error => {
                setType('error');
                setMessage(error?.response?.data?.error || error?.message);
                changeLoad();
            });

    };
    const handleDeleteCategory = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
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
                    setMessage(error?.response?.data?.error || error?.message);
                    changeLoad();
                });
            setCategories(categories.filter(cat => cat._id !== id));
        }
    };
    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
                <button
                    onClick={() => openModal('add')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    Thêm mới
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                    />
                </div>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                    <Filter size={16} />
                    Lọc
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bài viết</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.filter(cat =>
                            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((category, index) => (
                            <tr key={category._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 max-w-xs truncate">{category.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {category.postCount} bài
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{convertDate(category.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2 ">
                                        <button
                                            onClick={() => openModal('edit', category)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category._id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div aria-label="flex justify-center items-center mt-6">
                <div className="w-full flex justify-center items-center">
                    <ul className="inline-flex -space-x-px text-base h-10">
                        <li>
                            <p className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</p>
                        </li>
                        <li>
                            <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
                        </li>
                        <li>
                            <a href="#" aria-current="page" className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
                        </li>
                    </ul>
                </div>

            </div>

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
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập tên danh mục..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập mô tả cho danh mục..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Tên icon hoặc emoji..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Hủy
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