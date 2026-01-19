'use client';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Search, Trash2, Filter, ChevronLeft, ChevronRight, Edit, X, Plus, Eye, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hook/useTranslation";
import HoverTooltip from "@/components/common/TooltipNote";
import Link from "next/link";

type CourseType = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    status: 'draft' | 'published';
    instructor: {
        username: string;
        name: string;
    };
    createdAt?: string;
};

const Courses = () => {
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CourseType | null>(null);
    const [formData, setFormData] = useState({
        _id: '',
        title: '',
        slug: '',
        description: '',
        price: 0,
    });

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const { t } = useTranslation();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            changeLoad();
            const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course`);
            setCourses(response.data.data);
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || error?.message);
        } finally {
            changeLoad();
        }
    };

    const openModal = (item: CourseType | null = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                _id: item._id,
                title: item.title,
                slug: item.slug,
                description: item.description || '',
                price: item.price || 0,
            });
        } else {
            setFormData({ _id: '', title: '', slug: '', description: '', price: 0 });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return;
        changeLoad();
        try {
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            if (selectedItem) {
                const response = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/update`, {
                    courseId: formData._id,
                    ...formData
                });
                setCourses(courses.map(c => c._id === formData._id ? response.data.data : c));
                setMessage('Cập nhật khóa học thành công');
            } else {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/create`, {
                    title: formData.title
                });
                setCourses([...courses, response.data.data]);
                setMessage('Thêm khóa học thành công');
            }
            setType('info');
            setShowModal(false);
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || error?.message);
        } finally {
            changeLoad();
        }
    };

    return (
        <div className="h-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Khóa học</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm khóa học
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảng viên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course._id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                    <div className="text-xs text-gray-500">{course.slug}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{course.instructor?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{course.price.toLocaleString()} VNĐ</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{course.status}</td>
                                <td className="px-6 py-4 text-sm font-medium flex gap-2">
                                    <button onClick={() => openModal(course)} className="text-blue-600 hover:text-blue-900"><Edit size={16} /></button>
                                    <Link href={`/management/course/${course._id}/curriculum`} className="text-green-600 hover:text-green-900"><BookOpen size={16} /></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedItem ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {selectedItem && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </>
                            )}
                            <button
                                onClick={handleSave}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
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
