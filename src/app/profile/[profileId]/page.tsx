'use client';
import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authenticationStore from '@/store/AuthenticationStore';
import ProfileInfo from '@/component/authen/ProfileInfo';
import { BookHeart, Bookmark, BookText, ChartColumnStacked, CircleHelp, Heart, LogOut, Pen, PencilLine, Settings, ShoppingCart, SquarePen, Star, UserRoundPen } from 'lucide-react';
import { getHeadersToken } from '@/api/authentication';
import axios from 'axios';
import loadingStore from '@/store/LoadingStore';
import LoadingComponent from '@/component/common/Loading';
import PostElement from '../PostElement';
import ProfileInformation from '../ProfileInformation';
import PostInformation from '../PostInformation';
import YourRating from '../YourRating';
import YourCourse from '../YourCourse';
import YourHistory from '../YourHistory';
import AskQuestion from '../AskQuestion';
import SettingProfile from '../Setting';
import PostMarked from '../PostMarked';

// Define types
export interface PostInterface {
    _id: string;
    title: string;
    slug?: string;
    content?: string;
    text?: string;
    author: any;
    category: string;
    published?: boolean;
    readTime: string;
    image: any;
    marked?: [any];
}

function ProfileDashboard({
    params,
}: {
    params: Promise<{ profileId: string }>;
}) {
    const { profileId } = use(params);
    const [postType, setPostType] = React.useState<number>(1);
    const [selectId, setSelectId] = React.useState<string>("overview");
    const [displayPost, setDisplayPost] = React.useState<PostInterface[]>([]);
    const [titlePost, setTitlePost] = useState("Bài viết của bạn");
    const [userInfor, setUserInfor] = useState<any>();
    const [hasRedirected, setHasRedirected] = useState(false); // Add this to prevent redirect loops

    const [allPosts, setAllPosts] = React.useState<PostInterface[]>([]);
    const [allUnfinishPosts, setAllUnfinishPosts] = React.useState<PostInterface[]>([]);
    const [allMarkedPost, setAllMarkedPost] = React.useState<PostInterface[]>([]);

    type NavItem = {
        id: string;
        icon: React.JSX.Element;
        text: string;
    };

    const [navItems, setNavItems] = useState<NavItem[]>([]);

    const isLoading = loadingStore(state => state.isLoading);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const router = useRouter();

    // Memoize the fetch function to prevent recreation on every render
    const fetchDataProfiles = useCallback(async () => {
        try {
            changeLoad();

            // Handle redirect logic first, before making API calls
            if (!profileId && !hasRedirected) {
                const currentUserId = authenticationStore.getState().currentUser?._id;
                if (currentUserId) {
                    setHasRedirected(true);
                    router.push(`/profile/${currentUserId}`);
                    return; // Exit early to prevent API calls
                }
            }

            const headers = getHeadersToken();
            const token = localStorage.getItem("access_token");

            if (!token) {
                console.error('No access token found');
                return;
            }

            // Determine which endpoint to use
            const endpoint = profileId
                ? `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor?profileId=${profileId}`
                : `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor`;

            const likeEndpoint = profileId
                ? `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser?profileId=${profileId}`
                : `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser`;

            // Fetch posts
            const res = await axios.get(endpoint, { headers });
            if (res.status === 200) {
                console.log("posts info: ", res.data);
                const posts = res.data.posts || [];
                setAllPosts(posts);
                setDisplayPost(posts);

                const unfinishedPosts = posts.filter((e: PostInterface) => e.published === false);
                setAllUnfinishPosts(unfinishedPosts);
            }

            // Fetch liked posts
            const resLike = await axios.get(likeEndpoint, { headers });
            if (resLike.status === 200) {
                setAllMarkedPost(resLike.data.likePost || []);
            }

            const resProfile = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/auth/getProfileById?id=${profileId}`, { headers });
            if (resProfile.status === 200) {
                console.log("resProfile: ", resProfile.data.userInfo);
                setUserInfor(resProfile.data.userInfo);
            }

             const navItems = [
                { id: 'overview', icon: <ChartColumnStacked />, text: 'Tổng quan' },
                { id: 'user-info', icon: <UserRoundPen />, text: 'Thông tin' },
                { id: 'posts', icon: <Pen />, text: 'Tất cả bài viết' },
                { id: 'courses', icon: <BookText />, text: 'Khóa học' },
            ];

            if (profileId === authenticationStore.getState().currentUser?._id) {
                navItems.push({ id: 'marklist', icon: <Heart />, text: 'Danh sách đánh dấu' });
                navItems.push({ id: 'ratings', icon: <Star />, text: 'Đánh giá của tôi' });
                navItems.push({ id: 'orders', icon: <ShoppingCart />, text: 'Lịch sử đơn hàng' });
                navItems.push({ id: 'faq', icon: <CircleHelp />, text: 'Hỏi & đáp' });
                navItems.push({ id: 'settings', icon: <Settings />, text: 'Cài đặt' });
                navItems.push({ id: 'logout', icon: <LogOut />, text: 'Đăng xuất' });
            }
            setNavItems(navItems);

        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            changeLoad();
        }
    }, [profileId, hasRedirected]); // Include all dependencies

    useEffect(() => {
        fetchDataProfiles();
    }, [fetchDataProfiles]); // Now depends on the memoized function

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
        if (postTypeId === 1) {
            setTitlePost("Bài viết của bạn");
            setDisplayPost(allPosts);
        } else if (postTypeId === 2) {
            setTitlePost("Bài viết chưa hoàn thành");
            setDisplayPost(allUnfinishPosts);
        } else {
            setTitlePost("Bài viết đã đánh dấu");
            setDisplayPost(allMarkedPost);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LoadingComponent isLoading={isLoading} />
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
                    <ProfileInfo userInfor={userInfor} />
                </div>

                <div className="flex border-t-1 border-gray-500 pt-4">
                    {/* Sidebar */}
                    <div className="w-64 h-full bg-white shadow-sm rounded-lg pt-2 mr-6">
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

                    {selectId === 'overview' && <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold">Tổng Quan</h1>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div
                                onClick={() => handlePostTypeClick(1)}
                                className="bg-white border-1 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="bg-purple-200 rounded-full text-purple-500 text-4xl p-4 mb-2 cir"><SquarePen /></div>
                                <div className="text-4xl font-bold mb-1">{allPosts.length}</div>
                                <div className="text-sm text-center text-gray-600">Tất cả bài viết</div>
                            </div>
                            { profileId === authenticationStore.getState().currentUser?._id &&
                                <div
                                    onClick={() => handlePostTypeClick(2)}
                                    className="bg-white border-1 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="bg-purple-200 rounded-full text-purple-500 text-4xl p-4 mb-2 cir"><PencilLine /></div>
                                    <div className="text-4xl font-bold mb-1">{allUnfinishPosts.length}</div>
                                    <div className="text-sm text-center text-gray-600">Bài viết chưa hoàn thành</div>
                                </div>
                            }
                            { profileId === authenticationStore.getState().currentUser?._id &&
                                <div
                                    onClick={() => handlePostTypeClick(3)}
                                    className="bg-white border-1 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="bg-purple-200 rounded-full text-purple-500 text-4xl p-4 mb-2 cir"><BookHeart /></div>
                                    <div className="text-4xl font-bold mb-1">{allMarkedPost.length}</div>
                                    <div className="text-sm text-center text-gray-600">Bài viết đã đánh dấu</div>
                                </div>
                            }
                        </div>

                        {/* In Progress Courses */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">{titlePost}</h2>
                            <div className="space-y-4">
                                {displayPost.length === 0 && <h1 className='text-xxl font-semibold mb-4'>No record</h1>}
                                {displayPost.map(post => (
                                    <PostElement
                                        _id={post._id}
                                        key={post._id}
                                        image={post.image}
                                        category={post.category}
                                        title={post.title}
                                        content={post.text}
                                        author={post.author}
                                        readTime="5 phut"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>}

                    {selectId === 'user-info' && <ProfileInformation />}
                    {selectId === 'posts' && <PostInformation profileId={profileId} />}
                    {selectId === 'marklist' && <PostMarked />}
                    {selectId === 'ratings' && <YourRating />}
                    {selectId === 'courses' && <YourCourse />}
                    {selectId === 'orders' && <YourHistory />}
                    {selectId === 'faq' && <AskQuestion />}
                    {selectId === 'settings' && <SettingProfile />}
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;