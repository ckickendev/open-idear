'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { topicApi } from '@/features/topics/api/topic.api';
import { Edit, Filter, Plus, Search, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from '@/app/hook/useTranslation';
import { TextAreaCustom } from "@/components/common/TextAreaCustom";

type TopicType = {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
};

const Topic = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<TopicType | null>(null);
    const [topics, setTopics] = useState<TopicType[]>([]);
    const [page, setPage] = useState(1);

    // Pagination settings
    const itemsPerPage = 15;

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const { t } = useTranslation();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                changeLoad();
                const response = await topicApi.getTopics();
                // Depending on the backend the topics array might be directly in response.data
                if (response.success) {
                    setTopics(response.data || []);
                } else throw new Error(response.message);
            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.message || error?.message)
                console.error('Error fetching topics:', error);
            } finally {
                changeLoad();
            }
        };
        fetchTopics();
    }, []);

    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        description: '',
    });

    // Pagination logic
    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTopics = filteredTopics.slice(startIndex, endIndex);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

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

    const openModal = (type: any, item: TopicType | null = null) => {
        setModalType(type);
        setSelectedItem(item);
        if (item) {
            setFormData({
                _id: item._id,
                name: item.name || '',
                description: item.description || '',
            });
        } else {
            setFormData({ _id: '', name: '', description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({ _id: '', name: '', description: '' });
    };

    const handleAddTopic = async () => {
        if (!formData.name.trim()) {
            setType('error');
            setMessage('Tên chủ đề không được để trống');
            return;
        }
        changeLoad();
        try {
            const newTopic = await topicApi.createTopic({
                name: formData.name,
                description: formData.description,
            });
            if (newTopic.success) {
                setTopics([...topics, newTopic.data]);
                setFormData({ _id: '', name: '', description: '' });

                setType('info');
                setMessage('Thêm chủ đề thành công');
            } else throw new Error(newTopic.message);
        } catch (error: any) {
            setType('error');
            setMessage(error?.message || 'Có lỗi xảy ra');
        } finally {
            setShowModal(false);
            changeLoad();
        }
    };

    const handleEditTopic = () => {
        if (!formData.name.trim()) {
            setType('error');
            setMessage('Tên chủ đề không được để trống');
            return;
        }
        changeLoad();

        const updatedTopic = {
            name: formData.name,
            description: formData.description,
        };

        topicApi.updateTopic(selectedItem?._id as string, updatedTopic)
            .then(response => {
                if (response.success) {
                    setTopics(topics.map(t =>
                        t._id === selectedItem?._id ? { ...t, name: formData.name, description: formData.description } : t
                    ));
                    setFormData({ _id: '', name: '', description: '' });
                    setSelectedItem(null);

                    setType('info');
                    setMessage('Cập nhật chủ đề thành công');
                } else throw new Error(response.message);
            })
            .catch(error => {
                setType('error');
                setMessage(error?.message || 'Có lỗi xảy ra');
            })
            .finally(() => {
                setShowModal(false);
                changeLoad();
            });
    };

    const handleDeleteTopic = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
            changeLoad();
            topicApi.deleteTopic(id)
                .then(response => {
                    if (response.success) {
                        setType('info');
                        setMessage('Xóa chủ đề thành công');
                    } else throw new Error(response.message);
                })
                .catch(error => {
                    setType('error');
                    setMessage(error?.message || 'Có lỗi xảy ra');
                })
                .finally(() => changeLoad());

            const newTopics = topics.filter(t => t._id !== id);
            setTopics(newTopics);

            const newFilteredTopics = newTopics.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const newTotalPages = Math.ceil(newFilteredTopics.length / itemsPerPage);
            if (page > newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages);
            }
        }
    };

    return (
        <div className="h-full space-y-6 relative flex flex-col justify-between">
            <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Chủ đề</h1>
                    <button
                        onClick={() => openModal('add')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Thêm chủ đề
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chủ đề..."
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

                <div className="text-sm text-gray-600 mb-4">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredTopics.length)} / {filteredTopics.length} chủ đề
                    {searchTerm && ` (lọc từ ${topics.length} tổng cộng)`}
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Chủ đề</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentTopics.map((topic, index) => (
                                <tr key={topic._id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 border-b border-gray-100">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                                            <div className="text-xs text-gray-500 lg:hidden">
                                                <div className="truncate max-w-xs">{topic.description}</div>
                                                <div>Ngày tạo: {convertDate(topic.createdAt)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 hidden lg:table-cell border-b border-gray-100">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">{topic.description}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell border-b border-gray-100">
                                        {convertDate(topic.createdAt)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-100">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => openModal('edit', topic)}
                                                className="text-blue-600 hover:text-blue-900 p-1 sm:p-2 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTopic(topic._id)}
                                                className="text-red-600 hover:text-red-900 p-1 sm:p-2 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentTopics.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                                        {searchTerm ? 'Không tìm thấy chủ đề nào phù hợp' : 'Chưa có chủ đề nào'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="sm:hidden space-y-4 p-4">
                        {currentTopics.map((topic, index) => (
                            <div key={topic._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                            #{startIndex + index + 1} - {topic.name}
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="line-clamp-2">{topic.description}</div>
                                            <div>Ngày tạo: <span className="font-medium">{convertDate(topic.createdAt)}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => openModal('edit', topic)}
                                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTopic(topic._id)}
                                            className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {currentTopics.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                {searchTerm ? 'Không tìm thấy chủ đề nào phù hợp' : 'Chưa có chủ đề nào'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6">
                    <div className="flex items-center space-x-1">
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

            {showModal && (
                <div className="fixed inset-0 bg-gray-500/50 bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {modalType === 'add' ? 'Thêm chủ đề mới' : 'Chỉnh sửa chủ đề'}
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
                                    Tên Chủ đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập tên chủ đề"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <TextAreaCustom id="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Nhập mô tả chủ đề" />
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
                                onClick={modalType === 'add' ? handleAddTopic : handleEditTopic}
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

export default Topic;
