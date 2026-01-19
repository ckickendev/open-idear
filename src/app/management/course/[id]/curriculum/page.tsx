'use client';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { Plus, Video, FileText, Type, ChevronUp, ChevronDown, Trash2, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Lesson = {
    _id: string;
    title: string;
    description: string;
    content: string;
    type: 'video' | 'file' | 'text';
    isFreePreview: boolean;
    order: number;
    media?: {
        url: string;
        type: string;
    };
};

const CurriculumManager = () => {
    const { id: courseId } = useParams();
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            changeLoad();
            const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getById?id=${courseId}`);
            setCourseTitle(response.data.data.title);
            setLessons(response.data.data.lessons || []);
        } catch (error: any) {
            console.error(error);
        } finally {
            changeLoad();
        }
    };

    const handleAddLesson = async (type: 'video' | 'file' | 'text') => {
        const title = prompt('Nhập tiêu đề bài học:');
        if (!title) return;

        changeLoad();
        try {
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/add`, {
                courseId,
                title,
                type,
                order: lessons.length
            });
            setLessons([...lessons, response.data.data]);
            setType('info');
            setMessage('Đã thêm bài học mới');
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || 'Lỗi khi thêm bài học');
        } finally {
            changeLoad();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/management" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung khóa học</h1>
                        <p className="text-gray-500">Xây dựng chương trình học của bạn</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Chương trình học</h2>
                    <div className="flex gap-2">
                        <button onClick={() => handleAddLesson('video')} className="flex items-center gap-1 text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Video size={16} /> + Video
                        </button>
                        <button onClick={() => handleAddLesson('text')} className="flex items-center gap-1 text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Type size={16} /> + Văn bản
                        </button>
                        <button onClick={() => handleAddLesson('file')} className="flex items-center gap-1 text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <FileText size={16} /> + Tài liệu
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {lessons.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            Chưa có bài học nào. Hãy bắt đầu thêm bài học đầu tiên!
                        </div>
                    ) : (
                        lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
                            <div key={lesson._id} className="p-4 hover:bg-gray-50 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <ChevronUp size={16} className="cursor-pointer hover:text-gray-600" />
                                        <span className="text-xs font-bold">{index + 1}</span>
                                        <ChevronDown size={16} className="cursor-pointer hover:text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {lesson.type === 'video' && <Video size={16} className="text-blue-500" />}
                                            {lesson.type === 'text' && <Type size={16} className="text-green-500" />}
                                            {lesson.type === 'file' && <FileText size={16} className="text-orange-500" />}
                                            <span className="font-medium text-gray-900">{lesson.title}</span>
                                            {lesson.isFreePreview && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold">Xem trước</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">{lesson.description || 'Không có mô tả'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurriculumManager;
