"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import {
  Send,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Loader2,
  Ticket,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

/* ── Types ───────────────────────────────────────────── */
type Priority = "low" | "normal" | "high" | "urgent";
type Category = "account" | "content" | "payment" | "technical" | "fraud" | "other";

interface FormState {
  subject: string;
  category: Category | "";
  message: string;
  priority: Priority;
  guestEmail: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Thấp", color: "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800" },
  { value: "normal", label: "Bình thường", color: "border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50" },
  { value: "high", label: "Cao", color: "border-orange-300 text-orange-600 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/50" },
  { value: "urgent", label: "Khẩn cấp", color: "border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/50" },
];

const ACTIVE_PRIORITY: Record<Priority, string> = {
  low: "border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold",
  normal: "border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-200 font-semibold",
  high: "border-orange-500 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-200 font-semibold",
  urgent: "border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 font-semibold",
};

/* ── Input helpers ────────────────────────────────────── */
const inputCls = "w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition";

/* ── Success Banner ───────────────────────────────────── */
function SuccessBanner({ ticketId, onReset }: { ticketId: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-lg font-black text-foreground mb-1">Yêu cầu đã được gửi!</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Chúng tôi đã nhận được yêu cầu của bạn. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ.
        </p>
      </div>
      <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2 text-xs text-muted-foreground">
        <Ticket size={14} />
        Mã yêu cầu: <span className="font-mono font-bold text-foreground">{String(ticketId).slice(-8).toUpperCase()}</span>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onReset}
          className="px-5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Gửi yêu cầu khác
        </button>
        <Link href="/help/hop-thu-ho-tro?tab=history">
          <button className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            Xem lịch sử <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function SupportInboxClient() {
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [form, setForm] = useState<FormState>({
    subject: "",
    category: "",
    message: "",
    priority: "normal",
    guestEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }
    if (!isLoggedIn && !form.guestEmail.trim()) {
      setError("Vui lòng nhập email để chúng tôi có thể liên hệ với bạn.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.post(
        `${ENV.ROOT_API}/support/tickets`,
        {
          subject: form.subject,
          category: form.category || "other",
          message: form.message,
          priority: form.priority,
          guestEmail: form.guestEmail,
        },
        { headers }
      );

      if (res.data.success) {
        setSuccessTicketId(res.data.ticket._id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ subject: "", category: "", message: "", priority: "normal", guestEmail: "" });
    setSuccessTicketId(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Contact methods */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Kênh liên hệ
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, title: "Email hỗ trợ", desc: "support@openidear.xyz", detail: "Phản hồi trong 24h", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
            { icon: MessageCircle, title: "Chat trực tiếp", desc: "Chat với nhân viên hỗ trợ", detail: "8:00 – 22:00 hàng ngày", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
            { icon: Phone, title: "Hotline", desc: "1800 xxxx", detail: "Miễn phí, 8:00 – 18:00", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/40" },
            { icon: Clock, title: "Thời gian phản hồi", desc: "Thường trong 2–4 giờ", detail: "Ưu tiên theo mức độ khẩn cấp", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon size={22} className={item.color} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: "form" as const, label: "Gửi yêu cầu" },
            { id: "history" as const, label: "Lịch sử của tôi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Submit form */}
        {activeTab === "form" && (
          <div className="p-6">
            <h3 className="font-bold text-base text-foreground mb-5 flex items-center gap-2">
              <Send size={18} className="text-primary" /> Gửi yêu cầu hỗ trợ
            </h3>

            {successTicketId ? (
              <SuccessBanner ticketId={successTicketId} onReset={resetForm} />
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Guest email — only for non-logged-in */}
                {!isLoggedIn && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="guestEmail"
                      value={form.guestEmail}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={inputCls}
                      required
                    />
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Chọn chủ đề...</option>
                    <option value="account">Vấn đề tài khoản</option>
                    <option value="content">Nội dung bài viết</option>
                    <option value="payment">Thanh toán</option>
                    <option value="technical">Lỗi kỹ thuật</option>
                    <option value="fraud">Hành vi lừa đảo</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn vấn đề của bạn"
                    className={inputCls}
                    maxLength={200}
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải, bao gồm các bước để tái tạo lỗi nếu có..."
                    className={`${inputCls} resize-none`}
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {form.message.length}/5000
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mức độ ưu tiên
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITY_OPTIONS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                        className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                          form.priority === p.value
                            ? ACTIVE_PRIORITY[p.value]
                            : p.color
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                  ) : (
                    <><Send size={16} /> Gửi yêu cầu</>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab: Ticket history */}
        {activeTab === "history" && <TicketHistory isLoggedIn={isLoggedIn} />}
      </div>
    </div>
  );
}

/* ── Ticket History ───────────────────────────────────── */
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Đang chờ", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  in_review: { label: "Đang xem xét", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  resolved: { label: "Đã giải quyết", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  closed: { label: "Đã đóng", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function TicketHistory({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchMyTickets = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${ENV.ROOT_API}/support/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  // Fetch on first render of this tab
  if (!fetched && isLoggedIn && !loading) {
    fetchMyTickets();
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-6">
        <Mail size={36} className="text-muted-foreground mb-3" />
        <h4 className="font-bold text-foreground mb-1">Đăng nhập để xem lịch sử</h4>
        <p className="text-sm text-muted-foreground">Bạn cần đăng nhập để xem các yêu cầu đã gửi.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-6">
        <Ticket size={36} className="text-muted-foreground mb-3" />
        <h4 className="font-bold text-foreground mb-1">Chưa có yêu cầu nào</h4>
        <p className="text-sm text-muted-foreground">Các yêu cầu hỗ trợ của bạn sẽ hiển thị ở đây.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {tickets.map((ticket) => {
        const st = STATUS_LABEL[ticket.status] || STATUS_LABEL.pending;
        return (
          <div key={ticket._id} className="p-5 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.message}</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${st.cls}`}>
                {st.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="font-mono">{String(ticket._id).slice(-8).toUpperCase()}</span>
              <span>·</span>
              <span>{new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</span>
              {ticket.adminNote && (
                <>
                  <span>·</span>
                  <span className="text-primary">Có phản hồi từ admin</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
