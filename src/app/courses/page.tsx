'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import loadingStore from "@/store/LoadingStore";
import RecentCourses from '@/features/series/components/recent_courses/RecentCourses';
import {
    Search, Star, ArrowRight, ChevronLeft, ChevronRight,
    Users, Award, BookOpen, LayoutDashboard, Clock, PlayCircle,
    TrendingUp, Zap, Globe, Code, Brain, Database, Smartphone
} from 'lucide-react';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    thumbnail: { url: string };
    instructor: { name: string; avatar: string };
    status: string;
};

// ─── Dummy data for sections that need it ───────────────────────────────────

const TOPICS = [
    { label: 'Python', learners: '47.4M' },
    { label: 'Web Development', learners: '12.8M' },
    { label: 'Machine Learning', learners: '8.1M' },
    { label: 'Data Science', learners: '7.9M' },
    { label: 'JavaScript', learners: '19.5M' },
    { label: 'React', learners: '13.2M' },
    { label: 'Java', learners: '16.3M' },
    { label: 'C#', learners: '10.5M' },
    { label: 'AWS', learners: '6.3M' },
    { label: 'SQL', learners: '11.1M' },
];

const FEATURED_TOPICS = [
    { icon: Code, label: 'Lập trình Web', count: '1,200+', color: 'text-blue-600' },
    { icon: Brain, label: 'Trí tuệ nhân tạo', count: '800+', color: 'text-purple-600' },
    { icon: Database, label: 'Khoa học dữ liệu', count: '650+', color: 'text-green-600' },
    { icon: Smartphone, label: 'Mobile Dev', count: '450+', color: 'text-orange-600' },
];

const DUMMY_COURSES: Course[] = [
    {
        _id: '1', title: 'Khóa học lập trình Python từ cơ bản đến nâng cao', slug: 'python-co-ban-nang-cao',
        description: 'Nắm vững Python với hơn 100 bài tập thực hành', price: 1499000, discountPrice: 399000,
        thumbnail: { url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80' },
        instructor: { name: 'Nguyễn Văn A', avatar: '' }, status: 'published',
    },
    {
        _id: '2', title: 'React & Next.js - Xây dựng ứng dụng Web hiện đại', slug: 'react-nextjs',
        description: 'Học React từ số 0 đến dự án thực tế', price: 1899000, discountPrice: 499000,
        thumbnail: { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80' },
        instructor: { name: 'Trần Minh B', avatar: '' }, status: 'published',
    },
    {
        _id: '3', title: 'Machine Learning A-Z: Trí tuệ nhân tạo với Python', slug: 'machine-learning-az',
        description: 'Khám phá AI, Machine Learning & Deep Learning', price: 2199000, discountPrice: 599000,
        thumbnail: { url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80' },
        instructor: { name: 'Lê Hồng C', avatar: '' }, status: 'published',
    },
    {
        _id: '4', title: 'Node.js & Express - Backend cho người mới bắt đầu', slug: 'nodejs-express',
        description: 'API RESTful, MongoDB, Authentication & Deployment', price: 1299000, discountPrice: 349000,
        thumbnail: { url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80' },
        instructor: { name: 'Phạm Đức D', avatar: '' }, status: 'published',
    },
    {
        _id: '5', title: 'Docker & Kubernetes cho DevOps Engineers', slug: 'docker-kubernetes',
        description: 'Containerization, CI/CD, Orchestration', price: 1699000, discountPrice: 449000,
        thumbnail: { url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=400&q=80' },
        instructor: { name: 'Hoàng Minh E', avatar: '' }, status: 'published',
    },
];

// ─── Rating Stars ────────────────────────────────────────────────────────────

const RatingStars = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} className={i <= Math.floor(rating) ? 'text-[#b4690e] fill-[#b4690e]' : 'text-[#b4690e] fill-[#b4690e] opacity-30'} />
            ))}
        </div>
    );
};

// ─── Course Card (Udemy Style) ──────────────────────────────────────────────

const CourseCard = ({ course }: { course: Course }) => {
    const rating = (4 + Math.random() * 0.9);
    const students = Math.floor(1000 + Math.random() * 50000);
    const totalHours = Math.floor(10 + Math.random() * 40);
    const totalLectures = Math.floor(50 + Math.random() * 150);

    return (
        <Link href={`/courses/${course.slug}`} className="group block w-[260px] flex-shrink-0">
            <div className="aspect-video overflow-hidden bg-gray-200 mb-2">
                <img
                    src={course.thumbnail?.url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <h3 className="font-bold text-[15px] leading-tight text-[#1c1d1f] mb-1 line-clamp-2 group-hover:text-[#5624d0] transition-colors">
                {course.title}
            </h3>
            <p className="text-xs text-gray-500 mb-1 truncate">{course.instructor?.name}</p>
            <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-bold text-[#b4690e]">{rating.toFixed(1)}</span>
                <RatingStars rating={rating} />
                <span className="text-xs text-gray-500">({students.toLocaleString()})</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-1">{totalHours} giờ • {totalLectures} bài giảng</p>
            <div className="flex items-center gap-2">
                {course.discountPrice && course.discountPrice > 0 ? (
                    <>
                        <span className="font-extrabold text-[#1c1d1f]">₫{course.discountPrice.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 line-through">₫{course.price.toLocaleString()}</span>
                    </>
                ) : course.price === 0 ? (
                    <span className="font-extrabold text-[#1c1d1f]">Miễn phí</span>
                ) : (
                    <span className="font-extrabold text-[#1c1d1f]">₫{course.price.toLocaleString()}</span>
                )}
            </div>
        </Link>
    );
};

// ─── Scrollable Row ─────────────────────────────────────────────────────────

const CourseRow = ({ courses }: { courses: Course[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 280 * 2;
            scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group/row">
            <button
                onClick={() => scroll('left')}
                className="absolute -left-5 top-1/3 -translate-y-1/2 z-10 w-12 h-12 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black shadow-lg"
            >
                <ChevronLeft size={24} />
            </button>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {courses.map(c => <CourseCard key={c._id} course={c} />)}
            </div>
            <button
                onClick={() => scroll('right')}
                className="absolute -right-5 top-1/3 -translate-y-1/2 z-10 w-12 h-12 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black shadow-lg"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

const CourseListing = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Python');
    const router = useRouter();
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

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/courses/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const displayCourses = courses?.length > 0 ? courses : DUMMY_COURSES;

    return (
        <div className="bg-white min-h-screen font-sans text-[#1c1d1f]">
            {/* ═══════ Hero Banner ═══════ */}
            <section className="relative bg-[#1c1d1f]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
                    <div className="flex-1 py-12 lg:py-16 lg:pr-12">
                        <h1 className="text-3xl lg:text-[2.7rem] font-bold text-white leading-tight mb-4">
                            Học kỹ năng mới.<br />
                            <span className="text-[#c0c4fc]">Xây dựng tương lai.</span>
                        </h1>
                        <p className="text-[#d1d7dc] text-lg mb-8 max-w-lg">
                            Kiến thức mới mỗi ngày — từ lập trình, dữ liệu, tới AI. Học từ các chuyên gia hàng đầu Việt Nam.
                        </p>
                        <div className="flex max-w-xl">
                            <div className="flex-1 flex items-center bg-white border-2 border-white">
                                <Search className="text-gray-500 ml-4 flex-shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Bạn muốn học gì?"
                                    className="w-full py-4 px-3 text-[#1c1d1f] focus:outline-none text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-[#a435f0] text-white px-6 font-bold hover:bg-[#8710d8] transition-colors flex-shrink-0"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block flex-1 max-w-lg">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80"
                            alt="Learning"
                            className="w-full h-80 object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* ═══════ Trusted By ═══════ */}
            <section className="bg-[#f7f9fa] border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-center gap-8">
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Được tin tưởng bởi hơn 15,000 công ty và hàng triệu học viên trên toàn thế giới</span>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" className="h-6" />
                    </div>
                </div>
            </section>

            {/* ═══════ Instructor CTA (Banner) ═══════ */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        <span className="font-bold">Bạn là giảng viên?</span> Quản lý và tạo khóa học mới dễ dàng từ bảng điều khiển.
                    </p>
                    <Link
                        href="/management/my-courses"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#5624d0] hover:text-[#401b9c] transition-colors"
                    >
                        <LayoutDashboard size={16} />
                        Bảng điều khiển giảng viên
                    </Link>
                </div>
            </section>

            <RecentCourses />

            {/* ═══════ Topic Tabs + Course Carousel ═══════ */}
            <section className="py-12 max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-2">Khóa học phổ biến theo chủ đề</h2>
                <p className="text-gray-600 mb-6">Khám phá các khóa học từ hàng trăm chủ đề được yêu thích nhất.</p>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                    {TOPICS.slice(0, 6).map(topic => (
                        <button
                            key={topic.label}
                            onClick={() => setActiveTab(topic.label)}
                            className={`pb-3 px-4 text-sm font-bold transition-colors relative ${activeTab === topic.label
                                ? 'text-[#1c1d1f] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1c1d1f]'
                                : 'text-gray-500 hover:text-[#1c1d1f]'
                                }`}
                        >
                            {topic.label}
                        </button>
                    ))}
                </div>

                {/* Content for active tab */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">Khám phá {activeTab}</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {TOPICS.find(t => t.label === activeTab)?.learners || '10M+'} học viên đang theo học chủ đề này trên toàn thế giới.
                    </p>
                </div>

                <CourseRow courses={displayCourses} />
            </section>

            {/* ═══════ Featured Topics ═══════ */}
            <section className="bg-[#f7f9fa] py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-2">Chủ đề nổi bật theo danh mục</h2>
                    <p className="text-gray-600 mb-10">Những lĩnh vực được săn đón nhất trong thị trường công nghệ.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FEATURED_TOPICS.map(topic => (
                            <div key={topic.label} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                                <topic.icon size={28} className={`${topic.color} mb-4`} />
                                <h3 className="font-bold text-lg mb-1 group-hover:text-[#5624d0] transition-colors">{topic.label}</h3>
                                <p className="text-sm text-gray-500">{topic.count} khóa học</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════ Why Learn With Us ═══════ */}
            <section className="bg-[#1c1d1f] text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 text-center">Tại sao nên học tại OpenIdear?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-white/20 rounded-full">
                                <PlayCircle size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Học theo tốc độ của bạn</h3>
                            <p className="text-[#d1d7dc] text-sm leading-relaxed">Truy cập mọi lúc mọi nơi. Học trên di động hay máy tính, phù hợp với lịch trình của bạn.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-white/20 rounded-full">
                                <Award size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Chứng chỉ chuyên nghiệp</h3>
                            <p className="text-[#d1d7dc] text-sm leading-relaxed">Nhận chứng chỉ hoàn thành khóa học được công nhận bởi cộng đồng và doanh nghiệp.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-white/20 rounded-full">
                                <Users size={28} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Cộng đồng hỗ trợ</h3>
                            <p className="text-[#d1d7dc] text-sm leading-relaxed">Kết nối, thảo luận và nhận hỗ trợ từ giảng viên cùng hàng ngàn học viên khác.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ Become Instructor CTA ═══════ */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                            alt="Become an instructor"
                            className="w-full h-72 object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4">Trở thành giảng viên</h2>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            Chia sẻ kiến thức của bạn với hàng triệu học viên trên nền tảng. Tạo khóa học video, tiếp cận cộng đồng toàn cầu, và nhận thu nhập khi giảng dạy những gì bạn yêu thích.
                        </p>
                        <Link
                            href="/management/my-courses"
                            className="inline-block bg-[#1c1d1f] text-white font-bold px-8 py-4 hover:bg-black transition-colors"
                        >
                            Bắt đầu giảng dạy ngay
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════ Top Topics ═══════ */}
            <section className="bg-[#f7f9fa] py-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-8">Chủ đề hàng đầu</h2>
                    <div className="flex flex-wrap gap-3">
                        {TOPICS.map(t => (
                            <Link
                                key={t.label}
                                href={`/courses/search?q=${encodeURIComponent(t.label)}`}
                                className="bg-white border border-gray-200 px-5 py-2.5 text-sm font-bold text-[#1c1d1f] hover:bg-gray-50 transition-colors"
                            >
                                {t.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseListing;
