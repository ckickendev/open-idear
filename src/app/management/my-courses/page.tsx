'use client';
import React, { useEffect, useState } from 'react';
import {
    Plus, Edit, BookOpen, X, ArrowLeft, Search,
    Video, Loader2, LayoutDashboard, Pencil, Trash2, Filter
} from 'lucide-react';
import Link from 'next/link';
import { courseApi } from '@/features/series/api/course.api';
import alertStore from '@/store/AlertStore';
import loadingStore from '@/store/LoadingStore';
import LoadingComponent from '@/components/common/Loading';
import Notification from '@/components/common/Notification';
import HoverNote from '@/components/common/HoverNote';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    status: 'draft' | 'published';
    thumbnail?: { url: string };
    instructor: { username: string; name: string; avatar?: string };
    createdAt?: string;
};

// ─── Modal ─────────────────────────────────────────────────────────────────

type CourseModalProps = {
    course: Course | null;
    onClose: () => void;
    onSaved: (course: Course) => void;
};

const CourseModal = ({ course, onClose, onSaved }: CourseModalProps) => {
    const [formData, setFormData] = useState({
        title: course?.title ?? '',
        description: course?.description ?? '',
        price: course?.price ?? 0,
        discountPrice: course?.discountPrice ?? 0,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const setType = alertStore((s) => s.setType);
    const setMessage = alertStore((s) => s.setMessage);

    const handleSave = async () => {
        if (!formData.title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
        setSaving(true);
        setError('');
        try {
            let res;
            if (course) {
                res = await courseApi.updateCourse({ courseId: course._id, ...formData });
            } else {
                res = await courseApi.createCourse({ title: formData.title });
            }
            if (!res.success) throw new Error(res.message);
            setType('info');
            setMessage(course ? 'Cập nhật thành công' : 'Tạo khóa học thành công');
            onSaved(res.data.data);
        } catch (e: any) {
            setError(e.message || 'Đã xảy ra lỗi');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-lg overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {course ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Tiêu đề khóa học</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Vd: Lập trình ReactJS từ số 0..."
                            className="w-full px-4 py-3 border border-gray-900 rounded-none text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                    {course && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Mô tả ngắn</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    placeholder="Tóm tắt về khóa học của bạn..."
                                    className="w-full px-4 py-3 border border-gray-900 rounded-none text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Giá gốc (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-900 rounded-none text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Giá sau ưu đãi (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={formData.discountPrice}
                                        onChange={(e) => setFormData({ ...formData, discountPrice: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-900 rounded-none text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-900 text-gray-900 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors min-w-[120px]"
                        >
                            {saving ? <><Loader2 className="animate-spin" size={18} /> Đang lưu…</> : (course ? 'Lưu thay đổi' : 'Tạo khóa học')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    return (
        <span className={`inline-flex items-center text-xs font-bold px-2 py-1 uppercase tracking-wider ${status === 'published' ? 'bg-[#d1d7dc] text-gray-900' : 'bg-[#fff] border border-gray-900 text-gray-900'}`}>
            {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </span>
    );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const MyCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });

    const setType = alertStore((s) => s.setType);
    const setMessage = alertStore((s) => s.setMessage);
    const isLoading = loadingStore((s) => s.isLoading);
    const changeLoad = loadingStore((s) => s.changeLoad);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        changeLoad();
        const res = await courseApi.getCoursesByUser();
        changeLoad();
        if (res.success) {
            setCourses(res.data.courses ?? []);
        } else {
            setType('error');
            setMessage(res.message || 'Không thể tải danh sách khóa học');
        }
    };

    const handleSaved = (saved: Course) => {
        setCourses((prev) => {
            const idx = prev.findIndex((c) => c._id === saved._id);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = saved;
                return updated;
            }
            return [saved, ...prev];
        });
        setModal({ open: false, course: null });
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm('Bạn có chắc muốn xóa khóa học này? Hành động này không thể hoàn tác.')) return;
        changeLoad();
        const res = await courseApi.deleteCourse(courseId);
        changeLoad();
        if (res.success) {
            setCourses((prev) => prev.filter((c) => c._id !== courseId));
            setType('info');
            setMessage('Đã xóa khóa học');
        } else {
            setType('error');
            setMessage(res.message || 'Không thể xóa khóa học');
        }
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Notification />
            <LoadingComponent isLoading={isLoading} />

            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/courses" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Khóa học của tôi</h1>
                    </div>
                    <div>
                        <button
                            onClick={() => setModal({ open: true, course: null })}
                            className="bg-[#1c1d1f] hover:bg-black text-white font-bold px-6 py-3 transition-colors shadow-sm"
                        >
                            Tạo khóa học mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Layout Area */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav (Static for visually mimicking Udemy) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <nav className="flex flex-col space-y-1">
                            <Link href="#" className="border-l-4 border-gray-900 pl-4 py-2 font-bold text-gray-900 bg-gray-50">
                                Khóa học
                            </Link>
                            <Link href="#" className="border-l-4 border-transparent pl-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Giao tiếp
                            </Link>
                            <Link href="#" className="border-l-4 border-transparent pl-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Hiệu suất
                            </Link>
                            <Link href="#" className="border-l-4 border-transparent pl-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                Công cụ
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content Pane */}
                    <div className="lg:col-span-3">
                        {courses.length === 0 && !isLoading ? (
                            <div className="border border-gray-200 p-12 text-center flex flex-col items-center justify-center bg-gray-50">
                                <div className="w-48 h-32 bg-gray-200 mb-6 flex items-center justify-center text-gray-400">
                                    <BookOpen size={48} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Bắt tay vào khóa học của bạn</h2>
                                <p className="text-gray-600 mb-8 max-w-md">Biết đâu khóa học của bạn sẽ thay đổi cuộc đời ai đó. Bắt đầu ngay hôm nay để mang kiến thức đến với mọi người.</p>
                                <button
                                    onClick={() => setModal({ open: true, course: null })}
                                    className="bg-[#1c1d1f] hover:bg-black text-white font-bold px-8 py-4 transition-colors text-lg"
                                >
                                    Tạo khóa học ngay
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Tools / Search */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                                    <div className="relative w-full sm:w-96">
                                        <input
                                            type="text"
                                            placeholder="Tìm khóa học của bạn"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 border border-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-600"
                                        />
                                        <button className="absolute right-0 top-0 h-full px-4 bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                                            <Search size={18} />
                                        </button>
                                    </div>
                                    <div className="text-gray-600 font-bold hidden sm:block">
                                        {filteredCourses.length} khóa học
                                    </div>
                                </div>

                                {/* List View */}
                                <div className="space-y-4">
                                    {filteredCourses.map((course) => (
                                        <div
                                            key={course._id}
                                            className="group border border-gray-200 hover:border-gray-400 bg-white flex flex-col sm:flex-row cursor-pointer transition-colors"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-full sm:w-[260px] aspect-[16/9] bg-gray-100 flex-shrink-0 relative">
                                                {course.thumbnail?.url ? (
                                                    <img
                                                        src={course.thumbnail.url}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <BookOpen size={32} />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 pb-1">
                                                    <StatusBadge status={course.status} />
                                                </div>
                                            </div>

                                            {/* Middle Details */}
                                            <div className="p-4 flex flex-col flex-1 pl-6">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#5624d0] transition-colors leading-tight">
                                                    {course.title}
                                                </h3>
                                                <div className="text-sm text-gray-600 mb-3 line-clamp-2 pr-4">{course.description || 'Chưa có mô tả khóa học'}</div>

                                                <div className="mt-auto">
                                                    {course.price === 0 ? (
                                                        <span className="font-bold text-gray-900">Miễn phí</span>
                                                    ) : course.discountPrice && course.discountPrice > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900 text-lg">{course.discountPrice.toLocaleString()} VNĐ</span>
                                                            <span className="text-sm text-gray-500 line-through">{course.price.toLocaleString()} VNĐ</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-gray-900 text-lg">{course.price.toLocaleString()} VNĐ</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-full sm:w-64 p-4 flex flex-row sm:flex-col justify-end sm:justify-center items-center sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-gray-100">
                                                <Link
                                                    href={`/management/course/${course._id}/curriculum`}
                                                    className="w-full text-center border border-gray-900 hover:bg-gray-50 text-gray-900 font-bold px-4 py-2 transition-colors"
                                                >
                                                    Quản lý khóa học
                                                </Link>
                                                <div className="flex w-full gap-2">
                                                    <button
                                                        onClick={() => setModal({ open: true, course })}
                                                        className="flex-1 border border-transparent hover:border-gray-900 text-gray-900 font-bold py-2 transition-colors flex justify-center items-center"
                                                        title="Chỉnh sửa chung"
                                                    >
                                                        Cài đặt
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(course._id)}
                                                        className="flex-1 border border-transparent hover:border-gray-900 text-gray-900 font-bold py-2 transition-colors flex justify-center items-center"
                                                        title="Xóa khóa học"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredCourses.length === 0 && courses.length > 0 && (
                                        <div className="py-12 text-center text-gray-600">
                                            Không tìm thấy khóa học nào khớp với từ khóa "{searchTerm}".
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Rendering */}
            {modal.open && (
                <CourseModal
                    course={modal.course}
                    onClose={() => setModal({ open: false, course: null })}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};

export default MyCourses;
