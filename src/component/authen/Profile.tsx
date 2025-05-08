import { useState } from 'react';
import { User, Settings, HelpCircle, Moon, MessageSquare, LogOut } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';

export default function Profile() {
    const [isOpen, setIsOpen] = useState(false);
    const userInfo = authenticationStore((state) => state.currentUser);

    return (
        <div className="text-white p-6 flex flex-col items-center cursor-pointer relative">
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
                <div className="mt-2 min-w-72 max-w-80 bg-gray-800 rounded-lg shadow-lg absolute top-16 right-6 overflow-hidden">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-medium">Nguyễn Văn Đức Độ</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                <img src="/api/placeholder/24/24" alt="Group" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm text-gray-300">Better Future</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <User size={20} className="text-gray-400" />
                            <span>Xem tất cả trang cá nhân</span>
                        </button>

                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <Settings size={20} className="text-gray-400" />
                            <span>Cài đặt và quyền riêng tư</span>
                            <span className="ml-auto text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        </button>

                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <HelpCircle size={20} className="text-gray-400" />
                            <span>Trợ giúp và hỗ trợ</span>
                            <span className="ml-auto text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        </button>

                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <Moon size={20} className="text-gray-400" />
                            <span>Màn hình & trợ năng</span>
                            <span className="ml-auto text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        </button>

                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <MessageSquare size={20} className="text-gray-400" />
                            <div>
                                <span>Đóng góp ý kiến</span>
                                <span className="block text-xs text-gray-400">CTRL B</span>
                            </div>
                        </button>

                        <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700">
                            <LogOut size={20} className="text-gray-400" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-700">
                        <p>Quyền riêng tư · Điều khoản · Quảng cáo · Lựa chọn quảng cáo · Cookie · Xem thêm · Meta © 2025</p>
                    </div>
                </div>
            )}
        </div>
    );
}