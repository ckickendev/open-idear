'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import loadingStore from "@/store/LoadingStore";
import {
    Search,
    Code,
    Brain,
    Database,
    Lock,
    Cloud,
    Terminal,
    Smartphone,
    Layout,
    CheckCircle,
    ArrowRight,
    PlayCircle,
    Star,
    Award,
    BookOpen,
    User,
    Users
} from 'lucide-react';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: { url: string };
    instructor: { name: string; avatar: string };
    status: string;
};

const CourseListing = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                changeLoad();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course`);
                setCourses(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                changeLoad();
            }
        };
        fetchCourses();
    }, []);

    const categories = [
        { icon: Code, label: 'Lập trình Web', color: 'bg-blue-100 text-blue-600' },
        { icon: Brain, label: 'Trí tuệ nhân tạo', color: 'bg-purple-100 text-purple-600' },
        { icon: Database, label: 'Khoa học dữ liệu', color: 'bg-green-100 text-green-600' },
        { icon: Lock, label: 'An ninh mạng', color: 'bg-red-100 text-red-600' },
        { icon: Cloud, label: 'Điện toán đám mây', color: 'bg-cyan-100 text-cyan-600' },
        { icon: Terminal, label: 'DevOps', color: 'bg-gray-100 text-gray-600' },
        { icon: Smartphone, label: 'Mobile App', color: 'bg-orange-100 text-orange-600' },
        { icon: Layout, label: 'UI/UX Design', color: 'bg-pink-100 text-pink-600' },
    ];

    const techLogos = [
        { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
        { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
        { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
        { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Nâng Tầm Kỹ Năng Công Nghệ <br />
                        <span className="text-yellow-400">Hoàn Toàn Miễn Phí</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Khám phá hàng ngàn khóa học lập trình và công nghệ chất lượng cao từ các chuyên gia hàng đầu.
                    </p>

                    <div className="max-w-2xl mx-auto flex p-1 bg-white rounded-2xl shadow-2xl">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Bạn muốn học gì hôm nay?"
                                className="w-full py-4 text-gray-800 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg">
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-12 bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">HỢP TÁC CÙNG CÁC ĐỐI TÁC CÔNG NGHỆ</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {techLogos.map((logo) => (
                            <img key={logo.name} src={logo.url} alt={logo.name} className="h-8 md:h-10" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Khám phá theo lĩnh vực</h2>
                    <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.label} className="group cursor-pointer">
                            <div className={`${cat.color} aspect-square rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                                {<cat.icon size={32} />}
                            </div>
                            <p className="text-sm font-bold text-gray-700 text-center group-hover:text-blue-600 transition-colors">{cat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Premium Courses Banner */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-10 md:mb-0">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Bạn đã sẵn sàng trở thành <br /> Fullstack Developer?</h2>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3"><CheckCircle className="text-green-500" /> Lộ trình học bài bản từ Zero đến Hero</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-green-500" /> Thực hành với các dự án thực tế</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-green-500" /> Hỗ trợ 24/7 từ đội ngũ giảng viên</li>
                        </ul>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full inline-flex items-center gap-2 transition-all transform hover:scale-105">
                            Bắt đầu ngay <ArrowRight size={20} />
                        </button>
                    </div>
                    <div className="w-full md:w-1/2">
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Coding" className="rounded-3xl shadow-2xl border-4 border-white/10" />
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Khóa Học Phổ Biến</h2>
                            <p className="text-gray-500 text-lg italic">Những khóa học được nhiều học viên tham gia nhất trong tháng này.</p>
                        </div>
                        <Link href="/courses/all" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                            Xem tất cả <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {courses.length > 0 ? courses.map((course) => (
                            <Link
                                key={course._id}
                                href={`/courses/${course.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={course.thumbnail?.url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div className="flex items-center gap-2 text-white text-xs font-bold bg-blue-600/80 px-2 py-1 rounded">
                                            <PlayCircle size={14} /> 24 Lessons
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-200">
                                            <img src={course.instructor?.avatar} className="w-full h-full rounded-full object-cover" />
                                        </div>
                                        <div className="text-sm text-gray-600 font-medium">{course.instructor?.name}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 mb-6">
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <span className="text-xs text-gray-400 font-bold ml-1">(4.9)</span>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t">
                                        <div className="text-2xl font-black text-gray-900">
                                            {course.price === 0 ? 'MIỄN PHÍ' : `${course.price.toLocaleString()} VNĐ`}
                                        </div>
                                        <button className="bg-red-50 text-red-600 p-2 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            // Placeholder cards if no courses
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-gray-50 rounded-2xl aspect-[4/5] border border-gray-100"></div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-sans text-gray-900 mb-4">Tại sao học tại OpenIdear?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Chúng tôi cung cấp môi trường học tập tốt nhất để bạn phát triển sự nghiệp.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Award size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Chứng chỉ uy tín</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Nhận chứng chỉ hoàn thành khóa học được công nhận bởi các đối tác tuyển dụng hàng đầu.</p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Nội dung thực tế</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Chương trình học luôn được cập nhật theo xu hướng công nghệ mới nhất của thị trường.</p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Cộng đồng sôi động</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Tham gia diễn đàn thảo luận cùng hàng ngàn học viên khác để cùng nhau phát triển.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseListing;
