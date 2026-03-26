import React, { useEffect, useState } from 'react';
import { BookText, BookOpen, Clock, Settings } from "lucide-react";
import Link from 'next/link';
import { courseApi } from '@/features/series/api/course.api';
import loadingStore from '@/store/LoadingStore';

type Course = {
    _id: string;
    title: string;
    description: string;
    thumbnail?: { url: string };
    instructor: { name: string; avatar?: string };
    status: string;
};

const YourCourse = () => {
    const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchCourses = async () => {
            changeLoad();
            try {
                const [createdRes, enrolledRes] = await Promise.all([
                    courseApi.getCoursesByUser(),
                    courseApi.getEnrolledCourses()
                ]);
                
                if (createdRes.success) {
                    setCreatedCourses(createdRes.data.courses || []);
                }
                if (enrolledRes.success) {
                    setEnrolledCourses(enrolledRes.data.courses || []);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                changeLoad();
            }
        };

        fetchCourses();
    }, []);

    const renderCourseCard = (course: Course, isCreated: boolean) => (
        <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col sm:flex-row mb-4 hover:shadow-md transition-shadow bg-white">
            <div className="w-full sm:w-48 aspect-video bg-gray-100 flex-shrink-0 relative">
                {course.thumbnail?.url ? (
                    <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen size={24} />
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{course.description || 'Chưa có mô tả'}</p>
                
                {isCreated ? (
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                        <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${course.status === 'published' ? 'bg-[#d1d7dc] text-gray-900' : 'bg-gray-100 border border-gray-900 text-gray-900'}`}>
                            {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                        <Link 
                            href={`/management/course/${course._id}/curriculum`}
                            className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                        >
                            <Settings size={14} /> Quản lý
                        </Link>
                    </div>
                ) : (
                    <div className="mt-auto pt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Tiến độ học tập</span>
                            <span className="font-bold text-gray-900">0%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> Bắt đầu ngay
                            </span>
                            <Link 
                                href={`/courses/${course._id}`} // Or course.slug if available
                                className="text-sm font-bold bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                            >
                                Vào học
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="w-full mx-auto bg-white">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <BookText className="text-blue-600" size={32} />
                        Khóa học của bạn
                    </h1>
                    <p className="text-gray-600">Tổng quan về các khóa học bạn giảng dạy và theo học</p>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Khóa học đã đăng ký</h2>
                    {enrolledCourses.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {enrolledCourses.map(course => renderCourseCard(course, false))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-500 mb-3">Bạn chưa tham gia khóa học nào.</p>
                            <Link href="/courses" className="text-blue-600 font-bold hover:underline">
                                Khám phá các khóa học ngay
                            </Link>
                        </div>
                    )}
                </div>

                {/* Created Courses Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Khóa học bạn giảng dạy</h2>
                    {createdCourses.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {createdCourses.map(course => renderCourseCard(course, true))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-500 mb-3">Bạn chưa tạo khóa học nào.</p>
                            <Link href="/management/my-courses" className="text-blue-600 font-bold hover:underline">
                                Tạo khóa học mới
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default YourCourse;