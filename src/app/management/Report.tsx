'use client';
import { Check, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";


const Report = () => {

    const [reports, setReports] = useState([
        { id: 1, postTitle: 'Ứng dụng AI hỗ trợ học tập', reason: 'Nội dung không phù hợp', reportCount: 3, createdAt: '2024-02-01' },
        { id: 2, postTitle: 'Nền tảng kết nối startup', reason: 'Spam', reportCount: 1, createdAt: '2024-02-02' },
    ]);

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
}

export default Report;