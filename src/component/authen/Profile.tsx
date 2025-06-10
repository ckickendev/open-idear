import { useState } from 'react';
import { User, Settings, HelpCircle, Moon, MessageSquare, LogOut } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import Link from 'next/link';

export default function Profile() {
    const [isOpen, setIsOpen] = useState(false);
    const userInfo = authenticationStore((state) => state.currentUser);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        authenticationStore.setState({
            currentUser: {
                _id: "",
                username: "",
                name: "",
                email: "",
                role: 0,
                activate: false,
                createdAt: new Date(),
                bio: "",
                background: "",
                avatar: "",
            }
        });
        setIsOpen(false);
        window.location.href = '/';
    }

    return (
        <div className="text-white p-6 flex flex-col items-center relative">
            {/* Profile Circle Icon */}
            <div className="relative cursor-pointer">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-blue-500 hover:opacity-90"
                >
                    <img src={userInfo.avatar} alt="Profile" className="cursor-pointer w-full h-full object-cover" />
                </button>

                {/* Badge - can be used for notifications */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    1
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="mt-2 min-w-72 max-w-80 bg-gray-800 rounded-lg shadow-lg absolute top-16 right-6 overflow-hidden" onClick={() => setIsOpen(false)}>
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-xl font-medium">{userInfo.username}</p>
                                <p className="text-sm text-gray-300">{userInfo.email}</p>

                            </div>
                        </div>

                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link href={`/profile`}>
                            <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer">
                                <User size={20} className="text-gray-400" />
                                <span>Trang cá nhân</span>
                            </button>
                        </Link>

                        <Link href="/settings">
                            <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer">
                                <Settings size={20} className="text-gray-400" />
                                <span>Cài đặt và quyền riêng tư</span>
                                <span className="ml-auto text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </span>
                            </button>
                        </Link>

                        <Link href="/help">
                            <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer">
                                <HelpCircle size={20} className="text-gray-400" />
                                <span>Trợ giúp và hỗ trợ</span>
                                <span className="ml-auto text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </span>
                            </button>
                        </Link >
                        <Link href="/support">
                            <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer">
                                <Moon size={20} className="text-gray-400" />
                                <span>Màn hình & trợ năng</span>
                                <span className="ml-auto text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </span>
                            </button>
                        </Link>
                        <Link href="/contribute">
                            <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer">
                                <MessageSquare size={20} className="text-gray-400" />
                                <div>
                                    <span>Đóng góp ý kiến</span>
                                </div>
                            </button>
                        </Link>
                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 cursor-pointer" onClick={logout}>
                            <LogOut size={20} className="text-gray-400" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-700">
                        <p>Quyền riêng tư · Điều khoản · Quảng cáo · Lựa chọn quảng cáo · Cookie · Đăng bài </p>
                    </div>
                </div>
            )}
        </div>
    );
}