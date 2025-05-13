'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authenticationStore from '@/store/AuthenticationStore';
import ProfileInfo from '@/component/authen/ProfileInfo';
import { BookHeart, BookText, ChartColumnStacked, CircleHelp, Heart, LogOut, Pen, Pencil, PencilLine, Settings, ShoppingCart, SquarePen, Star, UserRoundPen } from 'lucide-react';
import { getHeadersToken } from '@/api/authentication';
import axios from 'axios';

// Define types
interface CourseCard {
    id: string;
    title: string;
    image: string;
    rating: number;
    progress?: number;
    completedLessons?: number;
    totalLessons?: number;
}

interface PostCard {
    id: string;
    title: string;
    image: string;
    rating: number;
    progress?: number;
    completedLessons?: number;
    totalLessons?: number;
}

const ProfileDashboard: React.FC = () => {
    const authenUser = authenticationStore((state) => state.currentUser);
    const [postType, setPostType] = React.useState<number>(1);
    const [selectId, setSelectId] = React.useState<string>("profile");
    const [allPosts, setAllPosts] = React.useState<PostCard[]>([]);

    console.log("authenUser: ", authenUser);
    

    const router = useRouter();

    useEffect(() => {
        // Fetch all posts from the server
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (token) {
                    const headers = getHeadersToken();

                    const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor?userId=${authenUser._id}`, { headers });
                    if (res.status === 200) {
                        console.log("posts info: ", res.data);
                        setAllPosts(res.data.posts);
                    }
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    // Navigation items
    const navItems = [
        { id: 'profile', icon: <ChartColumnStacked />, text: 'Tổng quan' },
        { id: 'user-info', icon: <UserRoundPen />, text: 'Thông tin của tôi' },
        { id: 'posts', icon: <Pen />, text: 'Tất cả bài viết' },
        { id: 'wishlist', icon: <Heart />, text: 'Danh sách yêu thích' },
        { id: 'ratings', icon: <Star />, text: 'Đánh giá của tôi' },
        { id: 'courses', icon: <BookText />, text: 'Khóa học của tôi' },
        { id: 'orders', icon: <ShoppingCart />, text: 'Lịch sử đơn hàng' },
        { id: 'faq', icon: <CircleHelp />, text: 'Hỏi & đáp' },
        { id: 'settings', icon: <Settings />, text: 'Cài đặt' },
        { id: 'logout', icon: <LogOut />, text: 'Đăng xuất' }
    ];

    // Course stats
    const postTypeStats = [
        { id: 1, icon: <SquarePen />, count: 3, text: 'Tất cả bài viết của bạn' },
        { id: 2, icon: <PencilLine />, count: 2, text: 'Bài viết chưa hoàn thành' },
        { id: 3, icon: <BookHeart />, count: 1, text: 'Bài viết đã thích' }
    ];

    // Courses in progress
    const currentCourses: CourseCard[] = [
        {
            id: 'tiktok-affiliate',
            title: 'Workshop: 3 tháng 30 tỷ doanh thu Affiliate – Chinh phục mọi tệp khách hàng Tiktok',
            image: '/courses/tiktok-affiliate.jpg',
            rating: 5.0,
            completedLessons: 0,
            totalLessons: 13,
            progress: 0
        },
        {
            id: 'davinci-resolve',
            title: 'Khóa Học Futur Creators – Làm Chủ Davinci Resolve Cùng Kevin Mach',
            image: '/courses/davinci-resolve.jpg',
            rating: 5.0,
            completedLessons: 34,
            totalLessons: 105,
            progress: 32
        }
    ];

    // Handle click on navigation item
    const handleNavClick = (itemId: string) => {
        setSelectId(itemId);
    };

    // Handle click on course card
    const handleCourseClick = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    const handlePostTypeClick = (postTypeId: number) => {
        setPostType(postTypeId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-lg font-semibold cursor-pointer">Trang chủ</span>
                        </Link>
                        <span className="mx-2">•</span>
                        <span className="text-lg">Thông tin tài khoản</span>
                    </div>
                    <div className="flex items-center">
                        <button className="mr-4 p-2">
                            <span>🔔</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* User info */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex mb-8 h-130">
                    <ProfileInfo />
                </div>

                <div className="flex border-t-1 border-gray-500 pt-4">
                    {/* Sidebar */}
                    <div className="w-64 bg-white shadow-sm rounded-lg pt-2 mr-6">
                        <nav>
                            <ul>
                                {navItems.map(item => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleNavClick(item.id)}
                                            className={`w-full flex items-center px-4 py-3 mb-1 rounded-md cursor-pointer transition-colors
                                ${item.id === selectId ? 'bg-blue-800 text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            <span>{item.text}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold">Tổng Quan</h1>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {postTypeStats.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => handlePostTypeClick(post.id)}
                                    className="bg-white border-1 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="bg-purple-200 rounded-full text-purple-500 text-4xl p-4 mb-2 cir">{post.icon}</div>
                                    <div className="text-4xl font-bold mb-1">{post.count}</div>
                                    <div className="text-sm text-center text-gray-600">{post.text}</div>
                                </div>
                            ))}
                        </div>

                        {/* In Progress Courses */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Bài viết của bạn</h2>
                            <div className="space-y-4">
                                { }
                                {currentCourses.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseClick(course.id)}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="flex">
                                            <div className="w-48 h-32 bg-gray-200 relative">
                                                {/* Replace with actual image */}
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                    [Course Image]
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1">
                                                <div className="flex mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="text-yellow-400">★</span>
                                                    ))}
                                                    <span className="ml-1">{course.rating.toFixed(2)}</span>
                                                </div>
                                                <h3 className="font-medium mb-2">{course.title}</h3>
                                                <div className="text-sm text-gray-600">
                                                    Bài học đã hoàn thành: {course.completedLessons} của {course.totalLessons} bài học
                                                </div>
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-right text-sm text-gray-600 mt-1">
                                                    {course.progress}% hoàn thành
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;