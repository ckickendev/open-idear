'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { topicApi } from '@/features/topics/api/topic.api';
import { Edit, Plus, Trash2, X, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from '@/app/hook/useTranslation';
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminPagination from '@/components/admin/AdminPagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type TopicType = { _id: string; name: string; description: string; createdAt: string };

const Topic = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<TopicType | null>(null);
    const [topics, setTopics] = useState<TopicType[]>([]);
    const [page, setPage] = useState(1);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const itemsPerPage = 15;
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                changeLoad(); setIsDataLoading(true);
                const response = await topicApi.getTopics();
                if (response.success) {
                    const topicsList = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
                    setTopics(topicsList);
                } else throw new Error(response.message);
            } catch (error: any) {
                setType('error'); setMessage(error?.response?.data?.message || error?.message);
            } finally { changeLoad(); setIsDataLoading(false); }
        };
        fetchTopics();
    }, []);

    const [formData, setFormData] = useState({ _id: '', name: '', description: '' });
    const filteredTopics = (Array.isArray(topics) ? topics : []).filter(topic =>
        (topic?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );
    const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentTopics = filteredTopics.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setPage(1); }, [searchTerm]);

    const openModal = (type: string, item: TopicType | null = null) => {
        setModalType(type); setSelectedItem(item);
        setFormData(item ? { _id: item._id, name: item.name || '', description: item.description || '' } : { _id: '', name: '', description: '' });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setSelectedItem(null); setFormData({ _id: '', name: '', description: '' }); };

    const handleAddTopic = async () => {
        if (!formData.name.trim()) { setType('error'); setMessage('Tên chủ đề không được để trống'); return; }
        changeLoad();
        try {
            const newTopic = await topicApi.createTopic({ name: formData.name, description: formData.description });
            if (newTopic.success) {
                setTopics([...topics, newTopic.data?.data || newTopic.data]);
                setType('info'); setMessage('Thêm chủ đề thành công');
            } else throw new Error(newTopic.message);
        } catch (error: any) { setType('error'); setMessage(error?.message || 'Có lỗi xảy ra'); }
        finally { setShowModal(false); changeLoad(); }
    };

    const handleEditTopic = () => {
        if (!formData.name.trim()) { setType('error'); setMessage('Tên chủ đề không được để trống'); return; }
        changeLoad();
        topicApi.updateTopic(selectedItem?._id as string, { name: formData.name, description: formData.description })
            .then(response => {
                if (response.success) {
                    setTopics(topics.map(t => t._id === selectedItem?._id ? { ...t, name: formData.name, description: formData.description } : t));
                    setType('info'); setMessage('Cập nhật chủ đề thành công');
                } else throw new Error(response.message);
            })
            .catch(error => { setType('error'); setMessage(error?.message || 'Có lỗi xảy ra'); })
            .finally(() => { setShowModal(false); changeLoad(); });
    };

    const handleDeleteTopic = (id: string) => {
        changeLoad();
        topicApi.deleteTopic(id)
            .then(response => { if (response.success) { setType('info'); setMessage('Xóa chủ đề thành công'); } else throw new Error(response.message); })
            .catch(error => { setType('error'); setMessage(error?.message || 'Có lỗi xảy ra'); })
            .finally(() => changeLoad());
        setTopics(topics.filter(t => t._id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Quản lý Chủ đề</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các chủ đề phân loại nội dung</p>
                </div>
                <button onClick={() => openModal('add')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary-ring">
                    <Plus size={16} /> Thêm chủ đề
                </button>
            </div>

            <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm kiếm chủ đề..." />
            <p className="text-sm text-gray-500">{filteredTopics.length} chủ đề {searchTerm && <span className="text-gray-400">(lọc từ {topics.length} tổng cộng)</span>}</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? <TableSkeleton columns={4} rows={6} /> : currentTopics.length === 0 ? (
                    <EmptyState icon={Hash} title={searchTerm ? 'Không tìm thấy chủ đề' : 'Chưa có chủ đề nào'}
                        description={searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm chủ đề đầu tiên'}
                        actionLabel={!searchTerm ? 'Thêm chủ đề' : undefined} onAction={!searchTerm ? () => openModal('add') : undefined} />
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Chủ đề</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentTopics.map((topic, index) => (
                                        <tr key={topic._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 lg:hidden truncate max-w-xs">{topic.description}</div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell"><div className="text-sm text-gray-500 max-w-xs truncate">{topic.description}</div></td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">{convertDate(topic.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openModal('edit', topic)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => setConfirmDelete(topic._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentTopics.map((topic, index) => (
                                <div key={topic._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{convertDate(topic.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => openModal('edit', topic)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"><Edit size={16} /></button>
                                            <button onClick={() => setConfirmDelete(topic._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDeleteTopic(confirmDelete)}
                title="Xóa chủ đề" message="Bạn có chắc chắn muốn xóa chủ đề này? Hành động này không thể hoàn tác." confirmText="Xóa" variant="danger" />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{modalType === 'add' ? 'Thêm chủ đề mới' : 'Chỉnh sửa chủ đề'}</h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên Chủ đề <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                                    placeholder="Nhập tên chủ đề" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                                <TextAreaCustom id="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} rows={5} placeholder="Nhập mô tả chủ đề" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={modalType === 'add' ? handleAddTopic : handleEditTopic}
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

export default Topic;
