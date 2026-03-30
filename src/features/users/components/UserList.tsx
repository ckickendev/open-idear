'use client';
import convertDate from '@/common/datetime';
import alertStore from "@/store/AlertStore";
import loadingStore from "@/store/LoadingStore";
import { userApi } from '@/features/users/api/user.api';
import { Edit, Plus, Trash2, X, User, Shield, UserCheck, UserX, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AdminSearchInput from '@/components/admin/AdminSearchInput';
import AdminFilterSelect from '@/components/admin/AdminFilterSelect';
import AdminPagination from '@/components/admin/AdminPagination';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import TableSkeleton from '@/components/admin/TableSkeleton';

type UserType = {
    _id: string; name: string; username: string; email: string;
    role: number; joinDate: string; activate: any; avatar?: string;
    phone?: string; createdAt?: string; postsCount?: number;
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
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const itemsPerPage = 10;
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                changeLoad(); setIsDataLoading(true);
                const response = await userApi.getUsersList();
                if (response.success) { setUsers(response.data.users); }
                else { setType('error'); setMessage(response.message || "Authentication error!"); }
            } catch (error: any) { setType('error'); setMessage(error?.message); }
            finally { changeLoad(); setIsDataLoading(false); }
        };
        fetchUsers();
    }, []);

    const [formData, setFormData] = useState({ _id: '', name: '', username: '', email: '', role: 0, activate: 'false', phone: '' });

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
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    const hasActiveFilters = searchTerm || roleFilter !== 'all' || activateFilter !== 'all';

    useEffect(() => { setPage(1); }, [searchTerm, roleFilter, activateFilter]);

    const resetFilters = () => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); };

    const openModal = (type: string, item: UserType | null = null) => {
        setModalType(type); setSelectedItem(item);
        setFormData(item
            ? { _id: item._id, name: item.name || '', username: item.username, email: item.email || '', role: item.role, activate: item.activate, phone: item.phone || '' }
            : { _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setSelectedItem(null); setFormData({ _id: '', name: '', username: '', email: '', role: 0, activate: "false", phone: '' }); };

    const handleAddUser = async () => {
        changeLoad();
        if (formData.name.trim() && formData.username.trim() && formData.email.trim()) {
            try {
                const newUser = await userApi.createUser({ name: formData.name, username: formData.username, email: formData.email, role: formData.role, activate: formData.activate, phone: formData.phone });
                if (newUser.success) { setUsers([...users, newUser.data.user]); setShowModal(false); setType('info'); setMessage('Thêm người dùng thành công'); }
                else throw new Error(newUser.message);
            } catch (error: any) { setShowModal(false); setType('error'); setMessage(error?.message); }
            finally { changeLoad(); }
        }
    };

    const handleEditUser = () => {
        changeLoad();
        if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) { setType('error'); setMessage('Vui lòng điền đầy đủ thông tin bắt buộc'); changeLoad(); return; }
        userApi.updateUser(selectedItem?._id as string, { _id: selectedItem?._id, name: formData.name, username: formData.username, email: formData.email, role: formData.role, activate: formData.activate, phone: formData.phone })
            .then(response => {
                if (response.success) { setUsers(users.map(u => u._id === selectedItem?._id ? response.data.user : u)); setShowModal(false); setType('info'); setMessage('Cập nhật người dùng thành công'); }
                else throw new Error(response.message);
                changeLoad();
            })
            .catch(error => { setType('error'); setMessage(error?.message); changeLoad(); });
    };

    const handleDeleteUser = (id: string) => {
        changeLoad();
        userApi.deleteUser(id)
            .then(response => { if (response.success) { setType('info'); setMessage('Xóa người dùng thành công'); } else throw new Error(response.message); changeLoad(); })
            .catch(error => { setType('error'); setMessage(error?.message); changeLoad(); });
        setUsers(users.filter(u => u._id !== id));
    };

    const toggleUserStatus = async (userId: string, currentActivate: string) => {
        const newActivate = currentActivate === 'true' ? 'false' : 'true';
        try {
            changeLoad();
            const res = await userApi.toggleUserStatus(userId, { activate: newActivate });
            if (!res.success) throw new Error(res.message);
            setUsers(users.map(u => u._id === userId ? { ...u, activate: newActivate } : u));
            setType('info'); setMessage(`${newActivate === "true" ? 'Kích hoạt' : 'Vô hiệu hóa'} người dùng thành công`);
        } catch (error: any) { setType('error'); setMessage(error?.message); }
        finally { changeLoad(); }
    };

    const roleOptions = [{ value: 'all', label: 'Tất cả vai trò' }, { value: '0', label: 'Người dùng' }, { value: '1', label: 'Quản trị viên' }];
    const statusOptions = [{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đang hoạt động' }, { value: 'false', label: 'Đã vô hiệu hóa' }];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Quản lý Người dùng</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản và quyền truy cập</p>
                </div>
                <button onClick={() => openModal('add')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm kiếm theo tên, username hoặc email..." />
                <div className="flex gap-3">
                    <AdminFilterSelect value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
                    <AdminFilterSelect value={activateFilter} onChange={val => setStatusFilter(val)} options={statusOptions} />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{filteredUsers.length} người dùng {hasActiveFilters && <span className="text-gray-400">(lọc từ {users.length} tổng cộng)</span>}</p>
                {hasActiveFilters && <button onClick={resetFilters} className="text-sm text-admin-primary hover:underline font-medium">Xóa bộ lọc</button>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-admin-sm overflow-hidden">
                {isDataLoading ? <TableSkeleton columns={6} rows={8} /> : currentUsers.length === 0 ? (
                    <EmptyState icon={Users} title={hasActiveFilters ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'} description={hasActiveFilters ? 'Thử thay đổi bộ lọc' : undefined} />
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày tham gia</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentUsers.map((user, index) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors duration-100">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">{startIndex + index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0">
                                                        {user.avatar ? (
                                                            <Image src={user.avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-400">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                                {user.phone && <div className="text-xs text-gray-400 mt-0.5">{user.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge variant={user.role === 1 ? 'info' : 'neutral'}>
                                                    {user.role === 1 ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    <span className="ml-1">{user.role === 1 ? 'Admin' : 'User'}</span>
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge variant={user.activate === true ? 'success' : 'danger'} dot>
                                                    {user.activate === true ? 'Hoạt động' : 'Vô hiệu hóa'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">{convertDate(user.joinDate)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openModal('edit', user)} className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors" title="Chỉnh sửa"><Edit size={16} /></button>
                                                    <button onClick={() => toggleUserStatus(user._id, user.activate)}
                                                        className={`p-2 rounded-lg transition-colors ${user.activate === true ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={user.activate === true ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                        {user.activate === true ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(user._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Xóa"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentUsers.map((user, index) => (
                                <div key={user._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {user.avatar ? <Image src={user.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                                : <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"><User className="h-5 w-5 text-gray-400" /></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-400">@{user.username}</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openModal('edit', user)} className="p-1.5 rounded-lg text-admin-primary hover:bg-admin-primary-light"><Edit size={14} /></button>
                                                    <button onClick={() => setConfirmDelete(user._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <StatusBadge variant={user.role === 1 ? 'info' : 'neutral'}>{user.role === 1 ? 'Admin' : 'User'}</StatusBadge>
                                                <StatusBadge variant={user.activate === true ? 'success' : 'danger'} dot>{user.activate === true ? 'Active' : 'Disabled'}</StatusBadge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && handleDeleteUser(confirmDelete)}
                title="Xóa người dùng" message="Bạn có chắc chắn muốn xóa người dùng này?" confirmText="Xóa" variant="danger" />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
                            <h3 className="text-lg font-semibold text-gray-900">{modalType === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}</h3>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: 'Họ và tên', key: 'name', required: true, placeholder: 'Nhập họ và tên...' },
                                { label: 'Tên đăng nhập', key: 'username', required: true, placeholder: 'Nhập tên đăng nhập...' },
                                { label: 'Email', key: 'email', required: true, placeholder: 'Nhập email...', type: 'email' },
                                { label: 'Số điện thoại', key: 'phone', placeholder: 'Nhập số điện thoại...', type: 'tel' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                                    <input type={field.type || 'text'} value={(formData as any)[field.key]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                                        placeholder={field.placeholder} />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
                                <select value={formData.role} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring">
                                    <option value="user">Người dùng</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                                <select value={formData.activate} onChange={(e) => setFormData({ ...formData, activate: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring">
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Vô hiệu hóa</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 sticky bottom-0">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={modalType === 'add' ? handleAddUser : handleEditUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors">
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