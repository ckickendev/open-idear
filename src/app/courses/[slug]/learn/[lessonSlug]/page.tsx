'use client';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import loadingStore from "@/store/LoadingStore";
import { ChevronLeft, ChevronRight, Menu, CheckCircle, Lock, Play, FileText, Download, X } from 'lucide-react';

type Lesson = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    type: 'video' | 'file' | 'text';
    isFreePreview: boolean;
    order: number;
    media?: { url: string; type: string };
};

type Course = {
    _id: string;
    title: string;
    slug: string;
    lessons: Lesson[];
};

const WatchPage = () => {
    const { slug, lessonSlug } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchData = async () => {
            try {
                changeLoad();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getBySlug?slug=${slug}`);
                const courseData = response.data.data;
                setCourse(courseData);

                // Set current lesson based on URL or first lesson
                const lesson = courseData.lessons.find((l: any) => l.slug === lessonSlug) || courseData.lessons[0];
                setCurrentLesson(lesson);

                // If no lesson slug in URL, redirect to first lesson
                if (!lessonSlug && courseData.lessons[0]) {
                    router.replace(`/courses/${slug}/learn/${courseData.lessons[0].slug}`);
                }
            } catch (error) {
                console.error(error);
                router.push(`/courses/${slug}`);
            } finally {
                changeLoad();
            }
        };
        fetchData();
    }, [slug, lessonSlug]);

    if (!course || !currentLesson) return null;

    return (
        <div className="flex h-screen bg-white">
            {/* Main Player Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/courses/${slug}`)} className="p-1 hover:bg-gray-800 rounded">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="font-bold line-clamp-1">{course.title} - {currentLesson.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                            <CheckCircle size={14} />
                            <span>0/24 bài đã học</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="h-full flex flex-col">
                        {/* Player Container */}
                        <div className="w-full bg-black aspect-video flex-shrink-0">
                            {currentLesson.type === 'video' && (
                                <video
                                    src={currentLesson.media?.url}
                                    controls
                                    className="w-full h-full"
                                    controlsList="nodownload"
                                />
                            )}
                            {currentLesson.type === 'text' && (
                                <div className="w-full h-full bg-white p-12 overflow-auto">
                                    <h2 className="text-3xl font-bold mb-6">{currentLesson.title}</h2>
                                    <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: currentLesson.content }}></div>
                                </div>
                            )}
                            {currentLesson.type === 'file' && (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8">
                                    <FileText size={64} className="text-gray-400 mb-4" />
                                    <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                                    <p className="text-gray-500 mb-6">Tài liệu đính kèm: {currentLesson.media?.url.split('/').pop()}</p>
                                    <a
                                        href={currentLesson.media?.url}
                                        download
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
                                    >
                                        <Download size={20} /> Tải xuống tài liệu
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Lesson Info Tab View */}
                        <div className="p-8 max-w-4xl mx-auto w-full">
                            <div className="flex border-b border-gray-200 mb-6">
                                <button className="px-6 py-3 border-b-2 border-gray-900 font-bold text-sm">Tổng quan</button>
                                <button className="px-6 py-3 text-gray-500 text-sm hover:text-gray-700">Ghi chú</button>
                                <button className="px-6 py-3 text-gray-500 text-sm hover:text-gray-700">Q&A</button>
                                <button className="px-6 py-3 text-gray-500 text-sm hover:text-gray-700">Đánh giá</button>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
                                <p className="text-gray-700 leading-relaxed">{currentLesson.description || 'Không có mô tả cho bài học này.'}</p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Fixed Footer Navigation */}
                <footer className="bg-white border-t p-2 flex items-center justify-between shadow-lg px-8">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-bold px-4 py-2 border rounded hover:bg-gray-50">
                        <ChevronLeft size={18} /> Lesson trước
                    </button>
                    <button className="flex items-center gap-1 bg-gray-900 text-white font-bold px-6 py-2 rounded hover:bg-gray-800">
                        Lesson tiếp theo <ChevronRight size={18} />
                    </button>
                </footer>
            </div>

            {/* Curriculum Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} border-l flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}>
                <div className="p-4 border-b flex items-center justify-between font-bold text-gray-900">
                    <span>Nội dung khóa học</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-auto divide-y divide-gray-100">
                    {course.lessons.map((lesson, idx) => (
                        <div
                            key={lesson._id}
                            onClick={() => router.push(`/courses/${slug}/learn/${lesson.slug}`)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${currentLesson._id === lesson._id ? 'bg-gray-100' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {lesson.type === 'video' ? <Play size={14} /> : <FileText size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {idx + 1}. {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400">05:20</span>
                                        {!lesson.isFreePreview && <Lock size={10} className="text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar toggle for closed state */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 rounded-l-lg shadow-lg z-50 hover:bg-black"
                >
                    <Menu size={20} />
                </button>
            )}
        </div>
    );
};

export default WatchPage;
