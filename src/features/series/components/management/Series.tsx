'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { seriesApi } from '@/features/series/api/series.api';
import { Trash2, Edit, X, Plus, BookOpen, BookText } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from '@/app/hook/useTranslation';
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import Link from "next/link";
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminPagination from '@/components/admin/AdminPagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type SeriesType = {
    _id: string; image: { url: string; description?: string }; title: string;
    description: string; slug: string; user: { _id: string; username: string; avatar?: string };
    createdAt?: string; updatedAt?: string; price?: number;
};

const Series = () => {
    const [series, setSeries] = useState<SeriesType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState<SeriesType | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const itemsPerPage = 15;
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ _id: '', title: '', slug: '', description: '', price: 0 });

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                changeLoad(); setIsDataLoading(true);
                const response = await seriesApi.getAllSeries();
                if (response.success) setSeries(response.data.series || response.data);
                else throw new Error(response.message);
            } catch (error: any) { setType('error'); setMessage(error?.message); }
            finally { changeLoad(); setIsDataLoading(false); }
        };
        fetchSeries();
    }, []);

    const filteredSeries = series.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentSeries = filteredSeries.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setPage(1); }, [searchTerm]);

    const openModal = (type: string, item: SeriesType | null = null) => {
        setModalType(type); setSelectedItem(item);
        setFormData(item ? { _id: item._id, title: item.title || '', slug: item.slug, description: item.description || '', price: item.price || 0 }
            : { _id: '', title: '', slug: '', description: '', price: 0 });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setSelectedItem(null); setFormData({ _id: '', title: '', slug: '', description: '', price: 0 }); };

    const handleAddSeries = async () => {
        changeLoad();
        if (formData.title.trim()) {
            try {
                const newSeries = await seriesApi.createSeries({ title: formData.title, slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'), description: formData.description, price: formData.price });
                if (newSeries.success) { setSeries([...series, newSeries.data.series]); setType('info'); setMessage('Thêm series thành công'); }
                else throw new Error(newSeries.message);
            } catch (error: any) { setType('error'); setMessage(error?.message); }
            finally { setShowModal(false); changeLoad(); }
        }
    };

    const handleEditSeries = () => {
        changeLoad();
        if (!formData.title.trim()) { setType('error'); setMessage('Tiêu đề không được để trống'); changeLoad(); return; }
        seriesApi.updateSeries({ _id: selectedItem?._id, title: formData.title, slug: formData.title.toLowerCase().replace(/\s+/g, '-'), description: formData.description, price: formData.price })
            .then(response => {
                if (response.success) { setSeries(series.map(i => i._id === selectedItem?._id ? response.data.series : i)); setType('info'); setMessage('Cập nhật series thành công'); }
                else throw new Error(response.message);
            })
            .catch(error => { setType('error'); setMessage(error?.message); })
            .finally(() => { setShowModal(false); changeLoad(); });
    };

    const handleDeleteSeries = (id: string) => {
        changeLoad();
        seriesApi.deleteSeries(id)
            .then(response => { if (response.success) { setType('info'); setMessage('Xóa series thành công'); } else throw new Error(response.message); })
            .catch(error => { setType('error'); setMessage(error?.message); })
            .finally(() => changeLoad());
        setSeries(series.filter(i => i._id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Quản lý Series</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các series nội dung</p>
                </div>
                <button onClick={() => openModal('add')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
                    <Plus size={16} /> Thêm Series
                </button>
            </div>

            <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm kiếm series..." />
            <p className="text-sm text-gray-500">{filteredSeries.length} series {searchTerm && <span className="text-gray-400">(lọc từ {series.length} tổng cộng)</span>}</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? <TableSkeleton columns={5} rows={6} /> : currentSeries.length === 0 ? (
                    <EmptyState icon={BookText} title={searchTerm ? 'Không tìm thấy series' : 'Chưa có series nào'}
                        description={searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm series đầu tiên'}
                        actionLabel={!searchTerm ? 'Thêm Series' : undefined} onAction={!searchTerm ? () => openModal('add') : undefined} />
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tác giả</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tạo</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentSeries.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <Link href={`/series/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-admin-primary transition-colors line-clamp-1">{item.title}</Link>
                                                <div className="text-xs text-gray-400 mt-0.5 lg:hidden">{item.user?.username} · {item.createdAt && convertDate(item.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell"><div className="text-sm text-gray-500 max-w-xs line-clamp-2">{item.description}</div></td>
                                            <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{item.user?.username}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">{item.createdAt ? convertDate(item.createdAt) : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openModal('edit', item)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors" title="Chỉnh sửa"><Edit size={16} /></button>
                                                    <Link href={`/management/series/${item._id}/lessons`} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Quản lý bài học"><BookOpen size={16} /></Link>
                                                    <button onClick={() => setConfirmDelete(item._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Xóa"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentSeries.map((item, index) => (
                                <div key={item._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/series/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-admin-primary line-clamp-2">{item.title}</Link>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">{item.user?.username} · {item.createdAt && convertDate(item.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => openModal('edit', item)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"><Edit size={16} /></button>
                                            <button onClick={() => setConfirmDelete(item._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDeleteSeries(confirmDelete)}
                title="Xóa series" message="Bạn có chắc chắn muốn xóa series này? Hành động này không thể hoàn tác." confirmText="Xóa" variant="danger" />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{modalType === 'add' ? 'Thêm series mới' : 'Chỉnh sửa series'}</h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" placeholder="Nhập tiêu đề series" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                                <TextAreaCustom id="description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Nhập mô tả series" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Giá (VNĐ)</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" placeholder="0 nếu miễn phí" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                                <input disabled type="text" value={formData.slug} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" placeholder="Slug sẽ được tạo tự động" /></div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={modalType === 'add' ? handleAddSeries : handleEditSeries}
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

export default Series;