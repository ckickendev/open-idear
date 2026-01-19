'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import loadingStore from "@/store/LoadingStore";
import { Play, Check, ChevronDown, ChevronUp, Globe, Info, Clock, Smartphone, Infinity, Award } from 'lucide-react';
import Link from 'next/link';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: { url: string };
    instructor: { name: string; avatar: string; bio: string };
    lessons: {
        _id: string;
        title: string;
        type: string;
        isFreePreview: boolean;
        order: number;
    }[];
};

const CourseDetail = () => {
    const { slug } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                changeLoad();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course/getBySlug?slug=${slug}`);
                setCourse(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                changeLoad();
            }
        };
        fetchCourse();
    }, [slug]);

    if (!course) return null;

    return (
        <div className="bg-white min-h-screen relative pb-20">
            {/* Header / Intro */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:w-2/3">
                        <div className="flex items-center gap-2 mb-4">
                            <Link href="/courses" className="text-blue-400 font-bold hover:underline">Phát triển phần mềm</Link>
                            <span className="text-gray-500">{'>'}</span>
                            <span className="text-gray-300">{course.title}</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-xl text-gray-300 mb-6">{course.description}</p>

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <span className="font-bold underline">4.8</span>
                                <div className="flex">★★★★★</div>
                                <span className="text-blue-400">(2,456 xếp hạng)</span>
                            </div>
                            <div>6,789 học viên</div>
                            <div className="flex items-center gap-2">
                                <span>Giảng viên:</span>
                                <Link href="#" className="text-blue-400 underline">{course.instructor?.name}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* What you'll learn */}
                    <div className="border border-gray-200 p-6 rounded-lg mb-8 bg-gray-50">
                        <h2 className="text-2xl font-bold mb-4">Nội dung bài học</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Check size={18} className="mt-1 flex-shrink-0 text-gray-600" />
                                    <span className="text-gray-700 text-sm">Kiến thức quan trọng số {i} bạn sẽ đạt được sau khóa học này.</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{course.lessons?.length || 0} bài giảng • Tổng thời lượng 12h 34m</span>
                            <button className="text-blue-600 font-bold hover:text-blue-800">Mở rộng tất cả</button>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {course.lessons?.map((lesson, idx) => (
                                <div key={lesson._id} className="border-b border-gray-200 last:border-0 p-4 hover:bg-gray-50 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Play size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-800">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {lesson.isFreePreview && <button className="text-blue-600 font-bold text-xs underline">Xem trước</button>}
                                        <span className="text-xs text-gray-400">05:20</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructor */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Giảng viên</h2>
                        <div className="flex gap-4 items-center mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0">
                                <img src={course.instructor?.avatar} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-600 underline">{course.instructor?.name}</h3>
                                <p className="text-sm text-gray-500">Chuyên gia đào tạo Fullstack Developer</p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{course.instructor?.bio || 'Chưa có thông tin tiểu sử.'}</p>
                    </div>
                </div>

                {/* Sidebar Purchase Card */}
                <div className="lg:relative">
                    <div className="sticky top-8 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
                        <div className="aspect-video relative group cursor-pointer">
                            <img src={course.thumbnail?.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg">
                                    <Play fill="currentColor" size={24} className="text-gray-900 ml-1" />
                                </div>
                                <span className="text-white font-bold">Xem trước khóa học</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl font-bold">{course.price.toLocaleString()} VNĐ</span>
                                <span className="text-gray-500 line-through text-lg">{(course.price * 1.5).toLocaleString()} VNĐ</span>
                                <span className="text-red-500 font-bold text-sm">33% Discount</span>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <button className="w-full bg-purple-600 text-white font-bold py-3 rounded hover:bg-purple-700 transition-colors">
                                    Thêm vào giỏ hàng
                                </button>
                                <button className="w-full border border-gray-900 font-bold py-3 rounded hover:bg-gray-50 transition-colors">
                                    Mua ngay
                                </button>
                            </div>

                            <div className="text-center text-xs text-gray-500 mb-6">30-Day Money-Back Guarantee</div>

                            <div className="space-y-3">
                                <div className="font-bold text-sm">Khóa học này bao gồm:</div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Clock size={16} /> <span>12.5 giờ video yêu cầu</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Smartphone size={16} /> <span>Truy cập trên di động và TV</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Infinity size={16} /> <span>Quyền truy cập đầy đủ suốt đời</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Award size={16} /> <span>Giấy chứng nhận hoàn thành</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
