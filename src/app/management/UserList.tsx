'use client';
import convertDate from "@/common/datetime";
import LoadingComponent from "@/component/common/Loading";
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { Edit, Filter, Plus, Search, Trash2, X, ChevronLeft, ChevronRight, User, Shield, UserCheck, UserX } from "lucide-react";
import { use, useEffect, useState } from "react";

type UserType = {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: number;
    joinDate: string;
    activate: any;
    avatar?: string;
    phone?: string;
    createdAt?: string;
    postsCount?: number;
};

const UserList = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<UserType | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('all');
    const [activateFilter, setStatusFilter] = useState('all');

    // Pagination settings
    const itemsPerPage = 10; // You can adjust this number

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user`);
                    console.log("response", response);

                    setUsers(response.data.users);
                    changeLoad();
                } else {
                    setType('error');
                    setMessage("Authentication error !");
                    changeLoad();
                }

            } catch (error: any) {
                setType('error');
                setMessage(error?.response?.data?.error || error?.message)
                changeLoad();
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        username: '',
        email: '',
        role: 0,
        activate: 'false',
        phone: '',
    });

    // Enhanced filtering logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role.toString() === roleFilter;
        const matchesActivate = activateFilter === 'all' || user.activate.toString() === activateFilter;

        return matchesSearch && matchesRole && matchesActivate;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to first page when search term or filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter, activateFilter]);

    // Pagination functions
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
        }
    };

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const goToNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);

            if (page <= 3) {
                endPage = maxVisiblePages;
            } else if (page >= totalPages - 2) {
                startPage = totalPages - maxVisiblePages + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    const openModal = (type: any, item: UserType | null = null) => {
        setModalType(type);
        setSelectedItem(item);
        if (item) {
            setFormData({
                _id: item._id,
                name: item.name || '',
                username: item.username,
                email: item.email || '',
                role: item.role,
                activate: item.activate,
                phone: item.phone || '',
            });
        } else {
            setFormData({ _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({ _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' });
    };

    const handleAddUser = async () => {
        changeLoad();
        if (formData.name.trim() && formData.username.trim() && formData.email.trim()) {
            try {
                const token = localStorage.getItem("access_token");
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const newUser = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/create`, {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    activate: formData.activate,
                    phone: formData.phone,
                });
                setUsers([...users, newUser.data.user]);
                setFormData({ _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' });
                setShowModal(false);

                setType('info');
                setMessage('Thêm người dùng thành công');
                changeLoad();
            } catch (error: any) {
                setShowModal(false);
                setType('error');
                setMessage(error?.response?.data?.error || error?.message);
                changeLoad();
            }
        }
    };

    const handleEditUser = () => {
        changeLoad();
        if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
            setType('error');
            setMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
            changeLoad();
            return;
        }

        const updatedUser = {
            _id: selectedItem?._id,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            activate: formData.activate,
            phone: formData.phone,
        };

        const token = localStorage.getItem("access_token");
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/update/${selectedItem?._id}`, updatedUser)
            .then(response => {
                setUsers(users.map(user =>
                    user._id === selectedItem?._id ? response.data.user : user
                ));
                setFormData({ _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' });
                setShowModal(false);
                setSelectedItem(null);

                setType('info');
                setMessage('Cập nhật người dùng thành công');
                changeLoad();
            })
            .catch(error => {
                setType('error');
                setMessage(error?.response?.data?.error || error?.message);
                changeLoad();
            });
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            changeLoad();
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.delete(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/delete/${id}`)
                .then(response => {
                    setType('info');
                    setMessage('Xóa người dùng thành công');
                    changeLoad();
                })
                .catch(error => {
                    setType('error');
                    setMessage(error?.response?.data?.error || error?.message);
                    changeLoad();
                });

            const newUsers = users.filter(user => user._id !== id);
            setUsers(newUsers);

            // Adjust current page if necessary after deletion
            const newFilteredUsers = newUsers.filter(user => {
                const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRole = roleFilter === 'all' || user.role.toString() === roleFilter;
                const matchesActivate = activateFilter === 'all' || user.activate == (activateFilter === 'true');
                return matchesSearch && matchesRole && matchesActivate;
            });
            const newTotalPages = Math.ceil(newFilteredUsers.length / itemsPerPage);
            if (page > newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages);
            }
        }
    };

    const toggleUserStatus = async (userId: string, currentActivate: string) => {
        const newActivate = currentActivate === 'true' ? 'false' : 'true';
        try {
            changeLoad();
            const token = localStorage.getItem("access_token");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/toggle-status/${userId}`, {
                activate: newActivate
            });

            setUsers(users.map(user =>
                user._id === userId ? { ...user, activate: newActivate } : user
            ));

            setType('info');
            setMessage(`${newActivate === "true" ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
            changeLoad();
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.error || error?.message);
            changeLoad();
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
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
                        placeholder="Tìm kiếm theo tên, username hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="0">Người dùng</option>
                    <option value="1">Quản trị viên</option>
                </select>
                <select
                    value={activateFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Đã vô hiệu hóa</option>
                </select>
            </div>

            {/* Results info */}
            <div className="text-sm text-gray-600">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} của {filteredUsers.length} người dùng
                {(searchTerm || roleFilter !== 'all' || activateFilter !== 'all') && ` (lọc từ ${users.length} tổng cộng)`}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số bài viết</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsers.map((user, index) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {startIndex + index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {user.avatar ? (
                                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 1
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.role === 1 ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                        {user.role === 1 ? 'Quản trị viên' : 'Người dùng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.activate === true
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.activate === true ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                                        {user.activate === true ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {user.postsCount || 0} bài
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {convertDate(user.joinDate)}
                                    {user.createdAt && (
                                        <div className="text-xs text-gray-400">
                                            {convertDate(user.createdAt)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openModal('edit', user)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(user._id, user.activate)}
                                            className={`p-1 rounded cursor-pointer ${user.activate === true
                                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                                }`}
                                        >
                                            {user.activate === true ? <UserX size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentUsers.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    {searchTerm || roleFilter !== 'all' || activateFilter !== 'all' ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6">
                    <div className="flex items-center space-x-1">
                        {/* Previous Button */}
                        <button
                            onClick={goToPreviousPage}
                            disabled={page === 1}
                            className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-l-lg transition-colors ${page === 1
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <ChevronLeft size={16} />
                            <span className="ml-1">Previous</span>
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => goToPage(pageNumber)}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 transition-colors ${pageNumber === page
                                    ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700'
                                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={goToNextPage}
                            disabled={page === totalPages}
                            className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 rounded-r-lg transition-colors ${page === totalPages
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-1">Next</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-500/50 bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {modalType === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
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
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập họ và tên..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên đăng nhập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập tên đăng nhập..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập địa chỉ email..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                    placeholder="Nhập số điện thoại..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <select
                                    value={formData.role}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                >
                                    <option value="user">Người dùng</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.activate}
                                    onChange={(e) => setFormData({ ...formData, activate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-500 focus:outline-none focus:border-red-500 rounded-lg"
                                >
                                    <option value={"true"}>Hoạt động</option>
                                    <option value={"false"}>Vô hiệu hóa</option>
                                </select>
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
                                onClick={modalType === 'add' ? handleAddUser : handleEditUser}
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
}

export default UserList;