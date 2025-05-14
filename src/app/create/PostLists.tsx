import { useEffect, useState } from 'react';
import { Home, Library, Compass, Clock, Calendar, NotebookPen, BadgePlus } from 'lucide-react';
import Logo from '@/component/common/Logo';
import { getHeadersToken } from '@/api/authentication';
import axios from 'axios';
import Link from 'next/link';
import contentStore from '@/store/ContentStore';

export default function PostLists() {
    const [isHovered, setIsHovered] = useState(false);
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const title = contentStore((state) => state.title);
    const setTitle = contentStore((state) => state.setTitle);
    const setContent = contentStore((state) => state.setContent);

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
    }, [title]);

    const handleCreateNewPost = async () => {
        setTitle("");
        setContent("");
    }

    return (
        <>
            <div
                className={`fixed left-0 top-1/4 z-50 bg-white shadow-lg transition-all duration-300 flex flex-col h-full ${isHovered ? 'w-64' : 'w-12'} relative`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Main menu icons */}
                <div className="flex flex-col mt-4">
                    <div
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <div className="text-gray-700 flex-shrink-0">
                            <BadgePlus />
                        </div>
                        {isHovered && (
                            <Link href={`/create`} className="transition-colors" onClick={handleCreateNewPost}>
                                <div className="flex justify-between items-center w-full">
                                    <span className="ml-3 text-sm text-gray-700">Create new post</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    <div
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <div className="text-gray-700 flex-shrink-0">
                            <NotebookPen />
                        </div>
                        {isHovered && (
                            <div className="flex justify-between items-center w-full">
                                <span className="ml-3 text-sm text-gray-700">All your post</span>
                                {/* <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                    All your posts
                                </span> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent items - only show when expanded */}
                {isHovered && (
                    <div className="flex-1 overflow-y-auto">
                        {allPosts.map((item, index) => (
                            <Link href={`/create?id=${item._id}`} className="transition-colors" key={index} >
                                <div key={index} className="py-4 px-4 hover:bg-gray-100 cursor-pointer truncate border-t-2 border-b-2 border-gray-200">
                                    {item.title}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-center mt-4">
                    <Logo className="w-[150px] p-4" />
                </div>
            </div>
        </>
    );
}