'use client';
import React, { useState, useEffect } from 'react';
import {
    Menu,
    X,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Users,
    FileText,
    Folder,
    AlertTriangle,
    Settings,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Filter,
    MoreHorizontal,
    Check,
    Ban
} from 'lucide-react';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    // Mock data
    const [categories, setCategories] = useState([
        { id: 1, name: 'Công nghệ', description: 'Ý tưởng về công nghệ và đổi mới', postCount: 25, createdAt: '2024-01-15' },
        { id: 2, name: 'Kinh doanh', description: 'Ý tưởng khởi nghiệp và kinh doanh', postCount: 18, createdAt: '2024-01-10' },
        { id: 3, name: 'Giáo dục', description: 'Cải tiến trong giáo dục', postCount: 12, createdAt: '2024-01-20' },
        { id: 4, name: 'Y tế', description: 'Ý tưởng về sức khỏe và y tế', postCount: 8, createdAt: '2024-01-25' },
    ]);

    const [posts, setPosts] = useState([
        { id: 1, title: 'Ứng dụng AI hỗ trợ học tập', author: 'Nguyễn Văn A', category: 'Công nghệ', status: 'approved', createdAt: '2024-02-01' },
        { id: 2, title: 'Nền tảng kết nối startup', author: 'Trần Thị B', category: 'Kinh doanh', status: 'pending', createdAt: '2024-02-02' },
        { id: 3, title: 'Hệ thống giảng dạy trực tuyến', author: 'Lê Văn C', category: 'Giáo dục', status: 'approved', createdAt: '2024-02-03' },
    ]);

    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', joinDate: '2024-01-01', status: 'active' },
        { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'user', joinDate: '2024-01-05', status: 'active' },
        { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'admin', joinDate: '2024-01-10', status: 'active' },
    ]);

    const [reports, setReports] = useState([
        { id: 1, postTitle: 'Ứng dụng AI hỗ trợ học tập', reason: 'Nội dung không phù hợp', reportCount: 3, createdAt: '2024-02-01' },
        { id: 2, postTitle: 'Nền tảng kết nối startup', reason: 'Spam', reportCount: 1, createdAt: '2024-02-02' },
    ]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: ''
    });

    const menuItems = [
        { id: 'categories', label: 'Danh mục', icon: Folder },
        { id: 'posts', label: 'Ý tưởng/Bài viết', icon: FileText },
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'reports', label: 'Báo cáo vi phạm', icon: AlertTriangle },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    const handleAddCategory = () => {
        if (formData.name.trim()) {
            const newCategory = {
                id: Date.now(),
                name: formData.name,
                description: formData.description,
                postCount: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setCategories([...categories, newCategory]);
            setFormData({ name: '', description: '', icon: '' });
            setShowModal(false);
        }
    };

    const handleEditCategory = () => {
        setCategories(categories.map(cat =>
            cat.id === selectedItem.id
                ? { ...cat, name: formData.name, description: formData.description }
                : cat
        ));
        setFormData({ name: '', description: '', icon: '' });
        setShowModal(false);
        setSelectedItem(null);
    };

    const handleDeleteCategory = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                icon: item.icon || ''
            });
        } else {
            setFormData({ name: '', description: '', icon: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({ name: '', description: '', icon: '' });
    };

    const togglePostStatus = (id) => {
        setPosts(posts.map(post =>
            post.id === id
                ? { ...post, status: post.status === 'approved' ? 'pending' : 'approved' }
                : post
        ));
    };

    const toggleUserStatus = (id) => {
        setUsers(users.map(user =>
            user.id === id
                ? { ...user, status: user.status === 'active' ? 'banned' : 'active' }
                : user
        ));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
                            <button
                                onClick={() => openModal('add')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                Thêm mới
                            </button>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm danh mục..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                <Filter size={16} />
                                Lọc
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bài viết</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.filter(cat =>
                                        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((category, index) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate">{category.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {category.postCount} bài
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.createdAt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openModal('edit', category)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    >
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

            case 'posts':
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

            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm người dùng..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option>Tất cả vai trò</option>
                                <option>Admin</option>
                                <option>User</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <User size={20} className="text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className={`p-1 rounded hover:bg-opacity-10 ${user.status === 'active'
                                                                ? 'text-red-600 hover:bg-red-600'
                                                                : 'text-green-600 hover:bg-green-600'
                                                            }`}
                                                    >
                                                        {user.status === 'active' ? <Ban size={16} /> : <Check size={16} />}
                                                    </button>
                                                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                                                        <Edit size={16} />
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

            case 'reports':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Báo cáo Vi phạm</h1>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề bài viết</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do báo cáo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượt báo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày báo cáo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{report.postTitle}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reason}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {report.reportCount} lượt
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdAt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50">
                                                        <MoreHorizontal size={16} />
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

            default:
                return <div>Chọn một mục từ menu</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">OI</span>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h1 className="font-bold text-lg text-gray-900">OpenIdear</h1>
                                <p className="text-xs text-gray-500">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {menuItems.find(item => item.id === activeTab)?.label}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">Admin</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {modalType === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập tên danh mục..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập mô tả cho danh mục..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tên icon hoặc emoji..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={modalType === 'add' ? handleAddCategory : handleEditCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {modalType === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;