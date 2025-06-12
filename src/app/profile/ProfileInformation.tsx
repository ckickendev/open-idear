import convertDate from "@/common/datetime";
import authenticationStore from "@/store/AuthenticationStore";

const ProfileInformation = () => {
    const currentUser = authenticationStore((state) => state.currentUser)

    return <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <div className="w-full mx-auto p-6 bg-white">
                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Your information</h1>

                {/* Profile Information */}
                <div className="space-y-6">
                    {/* Registration Date */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Ngày đăng ký</span>
                        <span className="text-gray-800">{convertDate(currentUser.createdAt.toString())}</span>
                    </div>

                    {/* Name */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Họ Tên</span>
                        <span className="text-gray-800">{currentUser.name}</span>
                    </div>

                    {/* Username */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Tên người dùng</span>
                        <span className="text-gray-800">{currentUser.username}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Email</span>
                        <span className="text-blue-600">{currentUser.email}</span>
                    </div>

                    {/* Biography */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Tiểu sử</span>
                        <span className="text-gray-400">{currentUser.bio ? currentUser.bio : "---"}</span>
                    </div>

                    {/* Skills/Profession */}
                    <div className="flex items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium w-1/4">Trạng thái tài khoản</span>
                        <span className="text-gray-400">{currentUser.activate ? "Đã kích hoạt" : "Chưa kích hoạt"}</span>
                    </div>

                </div>

                {/* Membership Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Thông Tin Gói Hội Viên</h2>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-600 mb-4">Bạn chưa đăng ký gói hội viên nào.</p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                Đăng ký gói hội viên
                            </button>

                            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors">
                                Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default ProfileInformation;