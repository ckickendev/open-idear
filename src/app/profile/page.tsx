'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authenticationStore from '@/store/AuthenticationStore';
import ProfileInfo from '@/component/authen/ProfileInfo';
import { BookHeart, Bookmark, BookText, ChartColumnStacked, CircleHelp, Heart, LogOut, Pen, Pencil, PencilLine, Settings, ShoppingCart, SquarePen, Star, UserRoundPen } from 'lucide-react';
import { getHeadersToken } from '@/api/authentication';
import axios from 'axios';

// Define types
interface AllYourPost {
    // _id: string;
    title: string;
    slug?: string;
    content: string;
    author: any;
    category: string;
    published?: boolean;
    // views: number;
    // likes: number;
    readTime: string;
    // updateAt: Date;
    image: string;
}

//  updateAt, likes, views, _id, rate

const ProfileDashboard: React.FC = () => {
    const [postType, setPostType] = React.useState<number>(1);
    const [selectId, setSelectId] = React.useState<string>("profile");
    const [allPosts, setAllPosts] = React.useState<AllYourPost[]>([]);



    const router = useRouter();

    useEffect(() => {
        // Fetch all posts from the server
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (token) {
                    const headers = getHeadersToken();

                    const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor`, { headers });
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

    // Handle click on navigation item
    const handleNavClick = (itemId: string) => {
        setSelectId(itemId);
    };

    // Handle click on course card
    const handleViewPost = (postId: string) => {
        router.push(`/post/${postId}`);
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
                                {allPosts.map((post, index) => (
                                    <ArticleCard key={index} image={post.image} category='QUAN ĐIỂM · TRANH LUẬN' title={post.title} content={post.content} author={post.author} readTime="5 phut" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


function ArticleCard(data: AllYourPost) {
    const [bookmarked, setBookmarked] = useState(false);

    return (
        <div className="flex w-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
            {/* Left side - Image */}
            <div className="w-1/3">
                <img
                    src={data.image}
                    alt={data.title}
                    className="object-cover h-full w-full"
                />
            </div>

            {/* Right side - Content */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${data.category === 'primary' ? 'text-green-800' : 'text-blue-600'
                                }`}>
                                {data.category}
                            </span>
                            <span className="text-xs text-gray-500">{data.readTime}</span>
                        </div>
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <h2 className="text-lg font-bold leading-tight mb-2">{data.title}</h2>
                    {data.content && (
                        <p className="text-sm text-gray-600 line-clamp-2">"{data.content}"</p>
                    )}
                </div>

                {/* Author */}
                {data.author && (
                    <div className="flex items-center mt-2">
                        {data.author.avatarUrl && (
                            <img
                                src={data.author.avatarUrl}
                                alt={data.author.name}
                                className="w-6 h-6 rounded-full mr-2"
                            />
                        )}
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{data.author.name}</span>
                            {data.author.verified && (
                                <span className="ml-1 text-blue-500">
                                    <svg
                                        className="w-4 h-4 inline-block"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileDashboard;