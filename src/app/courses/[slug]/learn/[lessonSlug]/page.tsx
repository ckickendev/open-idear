'use client';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import loadingStore from "@/store/LoadingStore";
import { ChevronLeft, ChevronRight, Menu, CheckCircle, Lock, Play, FileText, Download, X, ChevronDown, ChevronUp } from 'lucide-react';

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

type Chapter = {
    _id: string;
    title: string;
    order: number;
    lessons: Lesson[];
};

type Course = {
    _id: string;
    title: string;
    slug: string;
    chapters: Chapter[];
};

const WatchPage = () => {
    const { slug, lessonSlug } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchData = async () => {
            try {
                changeLoad();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getBySlug?slug=${slug}`);
                const courseData = response.data.data;
                setCourse(courseData);

                // Flatten lessons from chapters
                const lessons = courseData.chapters?.flatMap((ch: Chapter) => ch.lessons || []) || [];
                setAllLessons(lessons);

                // Find current lesson
                const lesson = lessons.find((l: Lesson) => l.slug === lessonSlug) || lessons[0];
                setCurrentLesson(lesson);

                // Expand the chapter containing the current lesson
                if (lesson && courseData.chapters) {
                    const parentChapter = courseData.chapters.find((ch: Chapter) => 
                        ch.lessons?.some((l: Lesson) => l._id === lesson._id)
                    );
                    if (parentChapter) {
                        setExpandedChapters([parentChapter._id]);
                    }
                }

                // Redirect if no lessonSlug in URL
                if (!lessonSlug && lessons[0]) {
                    router.replace(`/courses/${slug}/learn/${lessons[0].slug}`);
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

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev => 
            prev.includes(chapterId) 
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    };

    if (!course || !currentLesson) return null;

    const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const goToPrev = () => {
        if (prevLesson) router.push(`/courses/${slug}/learn/${prevLesson.slug}`);
    };

    const goToNext = () => {
        if (nextLesson) router.push(`/courses/${slug}/learn/${nextLesson.slug}`);
    };

    // Calculate total progress
    const totalLessonsCount = allLessons.length;
    // Mocking progress for now
    const completedLessonsCount = 0; 

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Main Player Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-[#1c1d1f] text-white p-3 flex items-center justify-between border-b border-gray-800 shadow-md z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/courses/${slug}`)} className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-sm font-bold">
                            <ChevronLeft size={20} /> Quay lại khóa học
                        </button>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <h1 className="font-bold line-clamp-1">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Progress */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs text-gray-300">
                                <Play size={12} className="ml-0.5" />
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-400">Tiến trình của bạn</span>
                                <div className="font-bold">{completedLessonsCount} / {totalLessonsCount} bài</div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-white flex flex-col">
                    {/* Player Container */}
                    <div className="w-full bg-black aspect-video flex-shrink-0 flex items-center justify-center relative">
                        {currentLesson.type === 'video' && (
                            <video
                                src={currentLesson.media?.url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                                controlsList="nodownload"
                                onEnded={goToNext}
                            />
                        )}
                        {currentLesson.type === 'text' && (
                            <div className="w-full h-full bg-white p-12 overflow-auto">
                                <h2 className="text-3xl font-bold mb-6">{currentLesson.title}</h2>
                                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: currentLesson.content }}></div>
                            </div>
                        )}
                        {currentLesson.type === 'file' && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
                                <FileText size={64} className="text-gray-400 mb-4" />
                                <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                                <p className="text-gray-400 mb-6">Tài liệu đính kèm: {currentLesson.media?.url?.split('/').pop() || 'Tài liệu'}</p>
                                <a
                                    href={currentLesson.media?.url}
                                    download
                                    className="bg-[var(--color-admin-primary)] text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[var(--color-admin-primary-hover)] transition-colors shadow-lg font-bold"
                                >
                                    <Download size={20} /> Tải xuống tài liệu
                                </a>
                            </div>
                        )}
                        
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="absolute right-0 top-6 bg-gray-900 bg-opacity-75 text-white p-2 rounded-l-md hover:bg-opacity-100 transition-all z-20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                    </div>

                    {/* Lesson Info Tab View */}
                    <div className="p-8 max-w-5xl mx-auto w-full flex-1">
                        <div className="flex border-b border-gray-200 mb-6">
                            <button className="px-6 py-4 border-b-2 border-black font-bold text-sm text-black">Tổng quan</button>
                            <button className="px-6 py-4 text-gray-500 text-sm hover:text-black font-bold transition-colors">Q&A</button>
                            <button className="px-6 py-4 text-gray-500 text-sm hover:text-black font-bold transition-colors">Ghi chú</button>
                            <button className="px-6 py-4 text-gray-500 text-sm hover:text-black font-bold transition-colors">Đánh giá</button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
                            <div className="text-gray-700 leading-relaxed text-sm max-w-3xl">
                                {currentLesson.description || 'Không có mô tả cho bài học này.'}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer Navigation */}
                    <footer className="bg-white border-t p-3 flex items-center justify-between shadow-sm sticky bottom-0">
                        <button 
                            onClick={goToPrev}
                            disabled={!prevLesson}
                            className={`flex items-center gap-1 font-bold px-4 py-2 border border-black rounded hover:bg-gray-100 transition-colors ${!prevLesson ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' : 'text-black'}`}
                        >
                            <ChevronLeft size={18} /> Bài trước
                        </button>
                        <button 
                            onClick={goToNext}
                            disabled={!nextLesson}
                            className={`flex items-center gap-1 font-bold px-6 py-2 rounded transition-colors ${!nextLesson ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)]'}`}
                        >
                            Bài tiếp theo <ChevronRight size={18} />
                        </button>
                    </footer>
                </main>
            </div>

            {/* Curriculum Sidebar */}
            <div className={`${sidebarOpen ? 'w-[360px]' : 'w-0'} border-l flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden bg-white shadow-xl z-20`}>
                <div className="p-4 border-b flex items-center justify-between text-gray-900 flex-shrink-0">
                    <span className="font-bold text-lg">Nội dung khóa học</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {course.chapters?.map((chapter, chapterIdx) => (
                        <div key={chapter._id} className="border-b border-gray-200">
                            {/* Chapter Header */}
                            <button 
                                onClick={() => toggleChapter(chapter._id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        Phần {chapterIdx + 1}: {chapter.title}
                                    </h3>
                                    <div className="text-xs text-gray-500 mt-1">
                                        0 / {chapter.lessons?.length || 0} | 10min
                                    </div>
                                </div>
                                {expandedChapters.includes(chapter._id) ? (
                                    <ChevronUp size={16} className="text-gray-500 ml-2" />
                                ) : (
                                    <ChevronDown size={16} className="text-gray-500 ml-2" />
                                )}
                            </button>

                            {/* Lessons List */}
                            {expandedChapters.includes(chapter._id) && (
                                <div className="bg-white py-1">
                                    {chapter.lessons?.map((lesson, lessonIdx) => {
                                        const isCurrent = currentLesson._id === lesson._id;
                                        return (
                                            <div
                                                key={lesson._id}
                                                onClick={() => router.push(`/courses/${slug}/learn/${lesson.slug}`)}
                                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 group ${isCurrent ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div className="mt-1 flex-shrink-0">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-admin-primary)] focus:ring-[var(--color-admin-primary)] cursor-pointer" readOnly checked={false} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm leading-tight ${isCurrent ? 'font-bold text-black' : 'text-gray-800'}`}>
                                                        {lessonIdx + 1}. {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {lesson.type === 'video' ? (
                                                            <Play size={12} className="text-gray-500" />
                                                        ) : (
                                                            <FileText size={12} className="text-gray-500" />
                                                        )}
                                                        <span className="text-xs text-gray-500">05:20</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!chapter.lessons || chapter.lessons.length === 0) && (
                                        <div className="px-4 py-3 text-sm text-gray-500 italic">
                                            Chưa có bài giảng
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WatchPage;
