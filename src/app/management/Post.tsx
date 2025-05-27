'use client';
import { Edit, Eye, EyeOff, Search, Trash2 } from "lucide-react";
import { useState } from "react";

const Post = () => {
    const togglePostStatus = (id: string) => {
        setPosts(posts.map(post =>
            post.id === id
                ? { ...post, status: post.status === 'approved' ? 'pending' : 'approved' }
                : post
        ));
    };

    const [posts, setPosts] = useState([
        { id: "1", title: 'Ứng dụng AI hỗ trợ học tập', author: 'Nguyễn Văn A', category: 'Công nghệ', status: 'approved', createdAt: '2024-02-01' },
        { id: "2", title: 'Nền tảng kết nối startup', author: 'Trần Thị B', category: 'Kinh doanh', status: 'pending', createdAt: '2024-02-02' },
        { id: "3", title: 'Hệ thống giảng dạy trực tuyến', author: 'Lê Văn C', category: 'Giáo dục', status: 'approved', createdAt: '2024-02-03' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Ý tưởng/Bài viết</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Tất cả trạng thái</option>
                    <option>Đã duyệt</option>
                    <option>Chờ duyệt</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {post.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => togglePostStatus(post.id)}
                                            className={`p-1 rounded hover:bg-opacity-10 ${post.status === 'approved'
                                                ? 'text-yellow-600 hover:bg-yellow-600'
                                                : 'text-green-600 hover:bg-green-600'
                                                }`}
                                        >
                                            {post.status === 'approved' ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Post;