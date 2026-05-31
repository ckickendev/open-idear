"use client";
import { Check, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const Report = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      postTitle: "Ứng dụng AI hỗ trợ học tập",
      reason: "Nội dung không phù hợp",
      reportCount: 3,
      createdAt: "2024-02-01",
    },
    {
      id: 2,
      postTitle: "Nền tảng kết nối startup",
      reason: "Spam",
      reportCount: 1,
      createdAt: "2024-02-02",
    },
  ]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Báo cáo Vi phạm
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem xét và xử lý các báo cáo vi phạm
        </p>
      </div>

      <div className="bg-background rounded-xl border border-border shadow-admin-sm overflow-hidden">
        {reports.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Không có báo cáo nào"
            description="Hiện tại chưa có báo cáo vi phạm nào cần xử lý"
          />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30/80 border-b border-border">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tiêu đề bài viết
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Lý do báo cáo
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Số lượt báo
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ngày báo cáo
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-muted/30/50 transition-colors duration-100"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground max-w-xs truncate">
                          {report.postTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {report.reason}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge variant="danger">
                          {report.reportCount} lượt
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {report.createdAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Đã xử lý"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(report.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-muted-foreground transition-colors"
                            title="Thêm"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-border">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 hover:bg-muted/30/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {report.postTitle}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {report.reason}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge variant="danger">
                          {report.reportCount} lượt
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">
                          {report.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50">
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(report.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Xóa báo cáo"
        message="Bạn có chắc chắn muốn xóa báo cáo này?"
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
};

export default Report;
