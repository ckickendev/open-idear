"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import {
  Mail,
  Search,
  Filter,
  Ticket,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  X,
  Send,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

/* ── Types ───────────────────────────────────────────── */
interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "in_review" | "resolved" | "closed";
  adminNote: string;
  guestEmail?: string;
  user?: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  resolvedBy?: { name: string; username: string };
  createdAt: string;
  resolvedAt?: string;
}

interface Stats {
  pending: number;
  in_review: number;
  resolved: number;
  closed: number;
}

/* ── Constants ───────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string; badgeCls: string }> = {
  pending: { label: "Chờ xử lý", icon: Clock, cls: "text-yellow-600", badgeCls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  in_review: { label: "Đang xem xét", icon: Eye, cls: "text-blue-600", badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  resolved: { label: "Đã giải quyết", icon: CheckCircle2, cls: "text-green-600", badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  closed: { label: "Đã đóng", icon: XCircle, cls: "text-gray-500", badgeCls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  low: { label: "Thấp", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  normal: { label: "Bình thường", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  high: { label: "Cao", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  urgent: { label: "Khẩn cấp", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const CATEGORY_LABEL: Record<string, string> = {
  account: "Tài khoản", content: "Nội dung", payment: "Thanh toán",
  technical: "Kỹ thuật", fraud: "Lừa đảo", other: "Khác",
};

const inputCls = "px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition";

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Ticket Detail Modal ─────────────────────────────── */
function TicketDetailModal({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<SupportTicket>) => void;
}) {
  const [status, setStatus] = useState(ticket.status);
  const [adminNote, setAdminNote] = useState(ticket.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.patch(
        `${ENV.ROOT_API}/support/admin/tickets/${ticket._id}/status`,
        { status, adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(ticket._id, res.data.ticket);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Mail size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Chi tiết yêu cầu</h3>
              <p className="text-xs text-muted-foreground font-mono">
                #{String(ticket._id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Sender */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {ticket.user?.avatar ? (
                <Image src={ticket.user.avatar} alt={ticket.user.name} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-base">
                  {ticket.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {ticket.user ? `${ticket.user.name} (@${ticket.user.username})` : "Khách vãng lai"}
              </p>
              <p className="text-xs text-muted-foreground">
                {ticket.user?.email || ticket.guestEmail || "—"}
              </p>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_CONFIG[ticket.status].badgeCls}`}>
              {STATUS_CONFIG[ticket.status].label}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${PRIORITY_CONFIG[ticket.priority]?.cls}`}>
              {PRIORITY_CONFIG[ticket.priority]?.label}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {CATEGORY_LABEL[ticket.category] || ticket.category}
            </span>
          </div>

          {/* Subject */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Tiêu đề</p>
            <p className="text-base font-semibold text-foreground">{ticket.subject}</p>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nội dung</p>
            <div className="bg-muted/60 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Ngày gửi</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(ticket.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            {ticket.resolvedAt && (
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Ngày giải quyết</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(ticket.resolvedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Phản hồi admin
            </p>

            {/* Status change */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">Cập nhật trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={`w-full ${inputCls}`}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="in_review">Đang xem xét</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ghi chú nội bộ</label>
              <textarea
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ghi chú dành cho quản trị viên..."
                className={`w-full ${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Admin Component ────────────────────────────── */
export default function SupportTicketAdmin() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, in_review: 0, resolved: 0, closed: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params: any = { page, limit: LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;

      const res = await axios.get(`${ENV.ROOT_API}/support/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTickets(res.data.tickets || []);
      setStats(res.data.stats || { pending: 0, in_review: 0, resolved: 0, closed: 0 });
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa yêu cầu này?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${ENV.ROOT_API}/support/admin/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (id: string, updated: Partial<SupportTicket>) => {
    setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
  };

  // Client-side search filter
  const filtered = search
    ? tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.message.toLowerCase().includes(search.toLowerCase()) ||
          t.user?.name.toLowerCase().includes(search.toLowerCase()) ||
          t.user?.email.toLowerCase().includes(search.toLowerCase())
      )
    : tickets;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chờ xử lý" value={stats.pending} icon={Clock} color="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400" />
        <StatCard label="Đang xem xét" value={stats.in_review} icon={Eye} color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" />
        <StatCard label="Đã giải quyết" value={stats.resolved} icon={CheckCircle2} color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" />
        <StatCard label="Đã đóng" value={stats.closed} icon={XCircle} color="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 ${inputCls}`}
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className={inputCls}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in_review">Đang xem xét</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className={inputCls}
            >
              <option value="all">Tất cả độ ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Cao</option>
              <option value="normal">Bình thường</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchTickets}
            className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            title="Làm mới"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket size={36} className="text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Không có yêu cầu nào</p>
            <p className="text-xs text-muted-foreground">Chưa có yêu cầu hỗ trợ nào phù hợp.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_100px_120px_80px] gap-4 px-5 py-3 bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>Yêu cầu</span>
              <span>Người gửi</span>
              <span>Trạng thái</span>
              <span>Ưu tiên</span>
              <span>Ngày gửi</span>
              <span>Hành động</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((ticket) => {
                const st = STATUS_CONFIG[ticket.status];
                const pr = PRIORITY_CONFIG[ticket.priority];
                return (
                  <div
                    key={ticket._id}
                    className="px-5 py-4 hover:bg-muted/30 transition-colors grid md:grid-cols-[1fr_120px_100px_100px_120px_80px] gap-4 items-center"
                  >
                    {/* Subject + excerpt */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{String(ticket._id).slice(-6).toUpperCase()}
                        </span>
                        {ticket.adminNote && (
                          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">Đã phản hồi</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.message}</p>
                    </div>

                    {/* Sender */}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {ticket.user ? ticket.user.name : "Khách"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {ticket.user?.email || ticket.guestEmail || "—"}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.badgeCls}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Priority badge */}
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pr?.cls}`}>
                        {pr?.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket._id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng: <span className="font-semibold text-foreground">{total}</span> yêu cầu
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-sm text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
