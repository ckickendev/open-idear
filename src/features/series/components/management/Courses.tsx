'use client';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { courseApi } from '@/features/series/api/course.api';
import { Trash2, Edit, X, Plus, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from '@/app/hook/useTranslation';
import HoverNote from "@/components/common/HoverNote";
import Link from "next/link";
import ImageUpload from "@/app/create/ImageUpload";
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type CourseType = {
    _id: string; title: string; slug: string; description: string;
    price: number; discountPrice?: number; thumbnail: string;
    status: 'draft' | 'published'; instructor: { username: string; name: string }; createdAt?: string;
};

const Courses = () => {
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CourseType | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [formData, setFormData] = useState({ _id: '', title: '', slug: '', description: '', thumbnail: '', price: 0, discountPrice: 0 });

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);
    const { t } = useTranslation();

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            changeLoad(); setIsDataLoading(true);
            const response = await courseApi.getCoursesByUser();
            if (response.success) setCourses(response.data.courses);
            else throw new Error(response.message);
        } catch (error: any) { setType('error'); setMessage(error?.message); }
        finally { changeLoad(); setIsDataLoading(false); }
    };

    const openModal = (item: CourseType | null = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({ _id: item._id, title: item.title, slug: item.slug, description: item.description || '', price: item.price || 0, discountPrice: item.discountPrice || 0, thumbnail: item.thumbnail });
        } else {
            setSelectedItem(null);
            setFormData({ _id: '', title: '', slug: '', description: '', price: 0, discountPrice: 0, thumbnail: '' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return;
        changeLoad();
        try {
            if (selectedItem) {
                const response = await courseApi.updateCourse({ courseId: formData._id, ...formData });
                if (response.success) { setCourses(courses?.map(c => c._id === formData._id ? response.data.data : c)); setMessage('Cập nhật khóa học thành công'); }
                else throw new Error(response.message);
            } else {
                const response = await courseApi.createCourse({ title: formData.title });
                if (response.success) { setCourses(prev => prev ? [...prev, response.data.data] : [response.data.data]); setMessage('Thêm khóa học thành công'); }
                else throw new Error(response.message);
            }
            setType('info'); setShowModal(false);
        } catch (error: any) { setType('error'); setMessage(error?.message); }
        finally { changeLoad(); }
    };

    const handleImageUploadSuccess = (media: any) => { setFormData(prev => ({ ...prev, thumbnail: media._id })); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Quản lý Khóa học</h1>
                    <p className="text-sm text-gray-500 mt-1">Tạo và quản lý các khóa học</p>
                </div>
                <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
                    <Plus size={16} /> Thêm khóa học
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? <TableSkeleton columns={5} rows={4} /> : (!courses || courses.length === 0) ? (
                    <EmptyState icon={BookOpen} title="Chưa có khóa học nào" description="Bắt đầu bằng cách tạo khóa học đầu tiên" actionLabel="Thêm khóa học" onAction={() => openModal()} />
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khóa học</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr key={course._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{course.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {course.discountPrice && course.discountPrice > 0 ? (
                                                    <div>
                                                        <span className="text-gray-900 font-semibold">{course.discountPrice.toLocaleString()} VNĐ</span>
                                                        <div className="text-xs line-through text-gray-400">{course.price.toLocaleString()} VNĐ</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">{course.price.toLocaleString()} VNĐ</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge variant={course.status === 'published' ? 'success' : 'neutral'} dot>
                                                    {course.status === 'published' ? 'Published' : 'Draft'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <HoverNote note="Chỉnh sửa thông tin">
                                                        <button onClick={() => openModal(course)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors"><Edit size={16} /></button>
                                                    </HoverNote>
                                                    <HoverNote note="Chỉnh sửa chi tiết">
                                                        <Link href={`/management/course/${course._id}/curriculum`} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex"><BookOpen size={16} /></Link>
                                                    </HoverNote>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sm:hidden divide-y divide-gray-100">
                            {courses.map((course) => (
                                <div key={course._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                            <div className="text-xs text-gray-500 mt-1">{course.price.toLocaleString()} VNĐ</div>
                                            <div className="mt-2">
                                                <StatusBadge variant={course.status === 'published' ? 'success' : 'neutral'} dot>
                                                    {course.status === 'published' ? 'Published' : 'Draft'}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => openModal(course)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"><Edit size={16} /></button>
                                            <Link href={`/management/course/${course._id}/curriculum`} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 inline-flex"><BookOpen size={16} /></Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
                            <h3 className="text-lg font-semibold text-gray-900">{selectedItem ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" /></div>
                            <ImageUpload onImageUploaded={handleImageUploadSuccess} />
                            {selectedItem && (
                                <>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" rows={3} /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Giá (VNĐ)</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Giá khuyến mãi (VNĐ)</label>
                                        <input type="number" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all" /></div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 sticky bottom-0">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
                                {selectedItem ? 'Lưu thay đổi' : 'Tạo khóa học'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
