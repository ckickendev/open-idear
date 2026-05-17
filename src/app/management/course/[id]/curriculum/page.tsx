'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import {
    Plus, Video, FileText, Type, Trash2, Edit2, ArrowLeft,
    CloudUpload, ArrowRightLeft, ChevronDown, ChevronUp,
    GripVertical, PlayCircle, BookOpen, MoreHorizontal, X
} from 'lucide-react';
import Link from 'next/link';
import VideoUpload from '@/app/create/VideoUpload';

type Lesson = {
    _id: string;
    title: string;
    description: string;
    content: string;
    type: 'video' | 'file' | 'text';
    isFreePreview: boolean;
    order: number;
    media?: { url: string; type: string; };
};

type Chapter = {
    _id: string;
    title: string;
    order: number;
    lessons: Lesson[];
};

// ─── Video Upload Modal ─────────────────────────────────────────────────────

type VideoUploadModalProps = {
    chapterId: string;
    onClose: () => void;
    onSuccess: (chapterId: string, lesson: Lesson) => void;
};

const VideoUploadModal = ({ chapterId, onClose, onSuccess }: VideoUploadModalProps) => {
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    const handleVideoUploaded = async (mediaId: string, title: string) => {
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const lessonRes = await axios.post(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/add`,
                { chapterId, title, type: 'video', media: mediaId, order: 0 },
            );
            setType('info');
            setMessage('Video uploaded successfully!');
            onSuccess(chapterId, lessonRes.data.data);
            onClose();
        } catch (err: any) {
            setType('error');
            setMessage(err?.response?.data?.message || 'Failed to create lesson');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                onClose={onClose}
                isTitleDisplay={true}
            />
        </div>
    );
};

// ─── Lesson Type Config ─────────────────────────────────────────────────────

const LESSON_TYPE_CONFIG = {
    video: { icon: PlayCircle, label: 'Video', color: 'text-blue-600', bg: 'bg-blue-50' },
    text: { icon: Type, label: 'Bài viết', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    file: { icon: FileText, label: 'Tài liệu', color: 'text-amber-600', bg: 'bg-amber-50' },
};

// ─── Add Content Menu ───────────────────────────────────────────────────────

const AddContentMenu = ({
    onAddVideo,
    onAddText,
}: {
    onAddVideo: () => void;
    onAddText: () => void;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-sm font-bold text-[#1c1d1f] border border-[#1c1d1f] px-4 py-2 hover:bg-gray-50 transition-colors"
            >
                <Plus size={16} /> Thêm nội dung
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 shadow-xl w-56">
                        <button
                            onClick={() => { onAddVideo(); setOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                            <Video size={18} className="text-blue-600" />
                            <div>
                                <div className="text-sm font-bold text-[#1c1d1f]">Video</div>
                                <div className="text-xs text-gray-500">Tải lên bài giảng video</div>
                            </div>
                        </button>
                        <button
                            onClick={() => { onAddText(); setOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                            <Type size={18} className="text-emerald-600" />
                            <div>
                                <div className="text-sm font-bold text-[#1c1d1f]">Bài viết</div>
                                <div className="text-xs text-gray-500">Tạo bài viết dạng văn bản</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Move Lesson Modal ──────────────────────────────────────────────────────

const MoveLessonModal = ({
    lesson,
    chapters,
    sourceChapterId,
    onMove,
    onClose,
}: {
    lesson: Lesson;
    chapters: Chapter[];
    sourceChapterId: string;
    onMove: (targetChapterId: string) => void;
    onClose: () => void;
}) => {
    const otherChapters = chapters.filter(c => c._id !== sourceChapterId);

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <h3 className="text-lg font-bold text-[#1c1d1f]">Chuyển bài học</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Di chuyển "<span className="font-bold text-[#1c1d1f]">{lesson.title}</span>" đến chương:
                    </p>
                    {otherChapters.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Không có chương khác để chuyển đến.</p>
                    ) : (
                        <div className="space-y-2">
                            {otherChapters.map(c => (
                                <button
                                    key={c._id}
                                    onClick={() => onMove(c._id)}
                                    className="w-full text-left px-4 py-3 border border-gray-200 hover:border-[#1c1d1f] hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                >
                                    <span className="text-sm font-medium text-[#1c1d1f]">{c.title}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-gray-600">{c.lessons?.length || 0} bài</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Curriculum Manager ────────────────────────────────────────────────

const CurriculumManager = () => {
    const { id: courseId } = useParams();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [courseStatus, setCourseStatus] = useState<'draft' | 'published'>('draft');
    const [videoUploadModal, setVideoUploadModal] = useState<{ chapterId: string } | null>(null);
    const [moveLessonModal, setMoveLessonModal] = useState<{ lesson: Lesson; sourceChapterId: string } | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => { fetchCourseData(); }, [courseId]);

    // Expand all chapters by default once loaded
    useEffect(() => {
        if (chapters.length > 0) {
            setExpandedChapters(new Set(chapters.map(c => c._id)));
        }
    }, [chapters.length]);

    const toggleChapter = (id: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const fetchCourseData = async () => {
        try {
            changeLoad();
            const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getById?id=${courseId}`);
            setCourseTitle(response.data.data.title);
            setCourseStatus(response.data.data.status || 'draft');
            setChapters(response.data.data.chapters || []);
        } catch (error: any) {
            console.error(error);
        } finally {
            changeLoad();
        }
    };

    const handleAddChapter = async () => {
        const title = prompt('Nhập tiêu đề chương:');
        if (!title) return;
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/chapter/add`, {
                courseId, title, order: chapters.length,
            });
            const newChapter = { ...response.data.data, lessons: [] };
            setChapters((prev) => [...prev, newChapter]);
            setExpandedChapters(prev => new Set(prev).add(newChapter._id));
            setType('info'); setMessage('Đã thêm chương mới');
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi thêm chương');
        } finally { changeLoad(); }
    };

    const handleAddLesson = async (chapterId: string, type: 'text' | 'file') => {
        const title = prompt('Nhập tiêu đề bài học:');
        if (!title) return;
        changeLoad();
        try {
            const chapterIndex = chapters.findIndex(c => c._id === chapterId);
            if (chapterIndex === -1) return;
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/add`, {
                chapterId, title, type, order: chapters[chapterIndex].lessons.length,
            });
            setChapters((prev) => prev.map((c, i) =>
                i === chapterIndex ? { ...c, lessons: [...c.lessons, response.data.data] } : c
            ));
            setType('info'); setMessage('Đã thêm bài học mới');
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi thêm bài học');
        } finally { changeLoad(); }
    };

    const handleVideoUploadSuccess = (chapterId: string, lesson: Lesson) => {
        setChapters((prev) => prev.map((c) =>
            c._id === chapterId ? { ...c, lessons: [...c.lessons, lesson] } : c
        ));
    };

    const handleEditChapter = async (chapterId: string, currentTitle: string) => {
        const title = prompt('Sửa tiêu đề chương:', currentTitle);
        if (!title || title === currentTitle) return;
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/chapter/update`, {
                chapterId, title,
            });
            setChapters((prev) => prev.map(c => c._id === chapterId ? { ...c, title } : c));
            setType('info'); setMessage('Đã cập nhật chương');
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi cập nhật chương');
        } finally { changeLoad(); }
    };

    const handleMoveLesson = async (lesson: Lesson, sourceChapterId: string, targetChapterId: string) => {
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/move`, {
                lessonId: lesson._id,
                sourceChapterId,
                targetChapterId
            });

            setChapters(prev => prev.map(c => {
                if (c._id === sourceChapterId) {
                    return { ...c, lessons: c.lessons.filter(l => l._id !== lesson._id) };
                }
                if (c._id === targetChapterId) {
                    return { ...c, lessons: [...c.lessons, lesson] };
                }
                return c;
            }));

            setType('info'); setMessage('Đã chuyển bài học');
            setMoveLessonModal(null);
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi chuyển bài học');
        } finally { changeLoad(); }
    };

    const handleEditLesson = async (chapterId: string, lessonId: string, currentTitle: string) => {
        const title = prompt('Sửa tiêu đề bài học:', currentTitle);
        if (!title || title === currentTitle) return;
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/update`, {
                lessonId, title,
            });
            setChapters((prev) => prev.map(c =>
                c._id === chapterId ? {
                    ...c,
                    lessons: c.lessons.map(l => l._id === lessonId ? { ...l, title } : l)
                } : c
            ));
            setType('info'); setMessage('Đã cập nhật bài học');
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi cập nhật bài học');
        } finally { changeLoad(); }
    };

    const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài học này không?')) return;
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/lesson/delete`, {
                data: { lessonId }
            });
            setChapters((prev) => prev.map(c =>
                c._id === chapterId ? {
                    ...c,
                    lessons: c.lessons.filter(l => l._id !== lessonId)
                } : c
            ));
            setType('info'); setMessage('Đã xóa bài học');
        } catch (error: any) {
            setType('error'); setMessage(error?.response?.data?.message || 'Lỗi khi xóa bài học');
        } finally { changeLoad(); }
    };

    const handleTogglePublish = async () => {
        changeLoad();
        try {
            const token = localStorage.getItem('access_token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const newStatus = courseStatus === 'published' ? 'draft' : 'published';
            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/update`, {
                courseId,
                status: newStatus
            });
            setCourseStatus(newStatus);
            setType('info'); 
            setMessage(newStatus === 'published' ? 'Đã xuất bản khóa học' : 'Đã đưa khóa học về bản nháp');
        } catch (error: any) {
            setType('error'); 
            setMessage(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái khóa học');
        } finally { 
            changeLoad(); 
        }
    };

    const totalLessons = chapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);

    return (
        <div className="min-h-screen bg-white font-sans text-[#1c1d1f]">
            {/* Modals */}
            {videoUploadModal && (
                <VideoUploadModal
                    chapterId={videoUploadModal.chapterId}
                    onClose={() => setVideoUploadModal(null)}
                    onSuccess={handleVideoUploadSuccess}
                />
            )}
            {moveLessonModal && (
                <MoveLessonModal
                    lesson={moveLessonModal.lesson}
                    chapters={chapters}
                    sourceChapterId={moveLessonModal.sourceChapterId}
                    onMove={(targetId) => handleMoveLesson(moveLessonModal.lesson, moveLessonModal.sourceChapterId, targetId)}
                    onClose={() => setMoveLessonModal(null)}
                />
            )}

            {/* Top Bar */}
            <div className="bg-[#1c1d1f] text-white">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/management/my-courses" className="text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="h-6 w-px bg-gray-700" />
                        <div>
                            <p className="text-[13px] text-gray-400 leading-none">Chương trình học</p>
                            <p className="text-sm font-bold leading-tight mt-0.5 truncate max-w-md">
                                {courseTitle || 'Đang tải...'}
                                {courseTitle && (
                                    <span className={`ml-3 px-2 py-0.5 text-xs rounded border ${courseStatus === 'published' ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-yellow-900/40 border-yellow-700/50 text-yellow-500'}`}>
                                        {courseStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">{chapters.length} chương • {totalLessons} bài</span>
                        
                        <button
                            onClick={handleTogglePublish}
                            className={`px-4 py-2 font-bold text-sm transition-colors border ${courseStatus === 'published' ? 'bg-transparent text-white border-white hover:bg-white/10' : 'bg-white text-[#1c1d1f] border-white hover:bg-gray-200'}`}
                        >
                            {courseStatus === 'published' ? 'Hủy xuất bản' : 'Xuất bản khóa học'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Chương trình học</h1>
                        <p className="text-sm text-gray-500">
                            Sắp xếp nội dung giảng dạy của bạn theo chương và bài học. Kéo thả để thay đổi thứ tự.
                        </p>
                    </div>
                    <button
                        onClick={handleAddChapter}
                        className="bg-[#1c1d1f] text-white font-bold px-5 py-3 hover:bg-black transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Thêm chương
                    </button>
                </div>

                {/* Chapters */}
                {chapters.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 p-16 text-center bg-[#f7f9fa]">
                        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-400">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Bắt đầu xây dựng chương trình học</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Tạo chương đầu tiên cho khóa học của bạn. Mỗi chương chứa nhiều bài học với nội dung video, bài viết hoặc tài liệu.
                        </p>
                        <button
                            onClick={handleAddChapter}
                            className="bg-[#1c1d1f] text-white font-bold px-6 py-3 hover:bg-black transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={18} /> Tạo chương đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chapters.sort((a, b) => a.order - b.order).map((chapter, chapterIndex) => {
                            const isExpanded = expandedChapters.has(chapter._id);
                            return (
                                <div key={chapter._id} className="border border-gray-200 bg-white">
                                    {/* Chapter Header */}
                                    <div
                                        className="bg-[#f7f9fa] border-b border-gray-200 px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                                        onClick={() => toggleChapter(chapter._id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 text-gray-400">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="font-bold text-[#1c1d1f] text-[15px]">
                                                    Chương {chapterIndex + 1}:
                                                </span>
                                                <span className="text-[15px] text-[#1c1d1f] truncate">{chapter.title}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditChapter(chapter._id, chapter.title); }}
                                                    className="flex-shrink-0 p-1 text-gray-400 hover:text-[#1c1d1f] transition-colors"
                                                    title="Sửa tên chương"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4" onClick={e => e.stopPropagation()}>
                                            <span className="text-xs text-gray-500 font-medium">{chapter.lessons?.length || 0} bài</span>
                                            <AddContentMenu
                                                onAddVideo={() => setVideoUploadModal({ chapterId: chapter._id })}
                                                onAddText={() => handleAddLesson(chapter._id, 'text')}
                                            />
                                        </div>
                                    </div>

                                    {/* Lessons Panel */}
                                    {isExpanded && (
                                        <div>
                                            {chapter.lessons && chapter.lessons.length > 0 ? (
                                                chapter.lessons.sort((a, b) => a.order - b.order).map((lesson, index) => {
                                                    const typeConfig = LESSON_TYPE_CONFIG[lesson.type] || LESSON_TYPE_CONFIG.text;
                                                    const TypeIcon = typeConfig.icon;

                                                    return (
                                                        <div
                                                            key={lesson._id}
                                                            className="group border-b border-gray-100 last:border-0 hover:bg-[#f7f9fa] transition-colors"
                                                        >
                                                            <div className="flex items-center px-5 py-3.5">
                                                                {/* Drag handle */}
                                                                <div className="flex-shrink-0 text-gray-300 mr-3 cursor-grab">
                                                                    <GripVertical size={16} />
                                                                </div>

                                                                {/* Lesson number */}
                                                                <div className="flex-shrink-0 w-8 text-xs text-gray-400 font-mono">
                                                                    {chapterIndex + 1}.{index + 1}
                                                                </div>

                                                                {/* Type Icon */}
                                                                <div className={`flex-shrink-0 w-8 h-8 ${typeConfig.bg} flex items-center justify-center mr-3`}>
                                                                    <TypeIcon size={16} className={typeConfig.color} />
                                                                </div>

                                                                {/* Title */}
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-sm font-medium text-[#1c1d1f] truncate block">
                                                                        {lesson.title}
                                                                    </span>
                                                                </div>

                                                                {/* Badges */}
                                                                <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                                                                    {lesson.isFreePreview && (
                                                                        <span className="text-[10px] bg-[#eceb98] text-[#3d3c0a] px-2 py-0.5 font-bold uppercase tracking-wide">
                                                                            Xem trước
                                                                        </span>
                                                                    )}
                                                                    <span className={`text-[10px] ${typeConfig.bg} ${typeConfig.color} px-2 py-0.5 font-bold uppercase tracking-wide`}>
                                                                        {typeConfig.label}
                                                                    </span>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex-shrink-0 flex items-center gap-0.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => setMoveLessonModal({ lesson, sourceChapterId: chapter._id })}
                                                                        className="p-2 text-gray-400 hover:text-[#1c1d1f] hover:bg-gray-200 transition-colors"
                                                                        title="Chuyển chương"
                                                                    >
                                                                        <ArrowRightLeft size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditLesson(chapter._id, lesson._id, lesson.title)}
                                                                        className="p-2 text-gray-400 hover:text-[#1c1d1f] hover:bg-gray-200 transition-colors"
                                                                        title="Sửa tên bài học"
                                                                    >
                                                                        <Edit2 size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteLesson(chapter._id, lesson._id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                        title="Xóa bài học"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-5 py-8 text-center">
                                                    <p className="text-sm text-gray-400 mb-3">Chưa có bài học trong chương này</p>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => setVideoUploadModal({ chapterId: chapter._id })}
                                                            className="text-sm font-bold text-[#5624d0] hover:text-[#401b9c] flex items-center gap-1.5 transition-colors"
                                                        >
                                                            <Video size={16} /> Thêm Video
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button
                                                            onClick={() => handleAddLesson(chapter._id, 'text')}
                                                            className="text-sm font-bold text-[#5624d0] hover:text-[#401b9c] flex items-center gap-1.5 transition-colors"
                                                        >
                                                            <Type size={16} /> Thêm Bài viết
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add another chapter CTA */}
                        <button
                            onClick={handleAddChapter}
                            className="w-full border-2 border-dashed border-gray-300 py-4 text-sm font-bold text-gray-500 hover:text-[#1c1d1f] hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Thêm chương mới
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurriculumManager;
