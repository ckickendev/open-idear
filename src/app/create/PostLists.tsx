import { useEffect, useState } from 'react';
import { BadgePlus, FileText, Clock, Sparkles } from 'lucide-react';
import { getHeadersToken } from '@/api/authentication';
import axios from 'axios';
import Logo from '@/component/common/Logo';

interface PostListInterface {
    _id: string;
    title: string;
    createdAt: string;
};

// Mock components for demonstration
const LogoComponent = ({ className }: { className?: string }) => (
    <div className={`${className} flex items-center justify-center`}>
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            <Logo className="ml-2 mr-2 h-14" /> Open<span className="text-cyan-500">Idear</span>
        </div>
    </div>
);

const Link = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={href} onClick={onClick} className="no-underline">
        {children}
    </a>
);

export default function PostLists() {
    const [isHovered, setIsHovered] = useState(false);
    const [allPosts, setAllPosts] = useState([] as PostListInterface[]);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("access_token");
            console.log(process.env.NEXT_PUBLIC_ROOT_BACKEND);

            if (token) {
                const headers = getHeadersToken();

                const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor`, { headers });
                if (res.status === 200) {
                    console.log("posts info: ", res.data.posts);
                    setAllPosts(res.data.posts);
                }
            }
        };
        fetchUser();
    }, []);

    const handleCreateNewPost = async () => {
        console.log("Creating new post");
    }

    return (
        <>
            <div
                className={`fixed left-0 z-51 bg-gray-100 transition-all duration-300 flex flex-col ${isHovered ? 'w-80 h-full top-0' : 'w-24 top-20'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="h-full border-1 border-gray-500/50 shadow-2xl shadow-cyan-500/20 flex flex-col">

                    {/* Header */}
                    {isHovered && (
                        <div className="p-6 border-b border-cyan-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                    <FileText className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gray-700">
                                        My Posts
                                    </h2>
                                    <p className="text-xs text-gray-700">{allPosts.length} documents</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create New Post Button */}
                    <div className="p-4">
                        <Link href="/create" onClick={handleCreateNewPost}>
                            <div className="flex items-center justify-center gap-3 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg cursor-pointer transition-all duration-200 shadow-lg shadow-cyan-500/30 group">
                                <BadgePlus className="text-white flex-shrink-0" size={20} />
                                {isHovered && (
                                    <span className="text-sm font-semibold text-white">
                                        Create New Post
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Recent Posts List */}
                    {isHovered && (
                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                            <div className="mb-3 flex items-center gap-2 px-2">
                                <Clock className="text-gray-700" size={16} />
                                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Recent Posts
                                </h3>
                            </div>

                            <div className="space-y-2">
                                {allPosts.map((item, index) => (
                                    <Link href={`/create?id=${item._id}`} key={index}>
                                        <div className="group p-3 text-gray-700 hover:bg-gray-300/70 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm text-gray-700 font-medium truncate transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-700 mt-1">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collapsed state icon */}
                    {!isHovered && (
                        <div className="flex-1 flex flex-col items-center justify-start pt-2 pb-2 gap-6">
                            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-cyan-500/40 flex items-center justify-center hover:bg-slate-700/80 hover:border-cyan-400/60 transition-all duration-200 cursor-pointer">
                                <FileText className="text-cyan-400" size={20} />
                            </div>
                        </div>
                    )}

                    {/* Logo Footer */}
                    <div className="border-t border-cyan-500/30 p-4">
                        <div className="flex items-center justify-center">
                            {isHovered ? (
                                <LogoComponent className="w-full" />
                            ) : (
                                <Logo className="ml-2 mr-2 h-14" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}