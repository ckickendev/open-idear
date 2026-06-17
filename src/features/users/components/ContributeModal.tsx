"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Bug,
  TrendingUp,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

/* ── Types ───────────────────────────────────────────── */
interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTRIBUTION_TYPES = [
  { value: "feature", label: "Tính năng mới", icon: Lightbulb, color: "text-amber-500" },
  { value: "bug", label: "Báo lỗi", icon: Bug, color: "text-red-500" },
  { value: "improvement", label: "Cải thiện", icon: TrendingUp, color: "text-blue-500" },
  { value: "content", label: "Nội dung", icon: FileText, color: "text-green-500" },
  { value: "other", label: "Khác", icon: MoreHorizontal, color: "text-gray-500" },
] as const;

export default function ContributeModal({ isOpen, onClose }: ContributeModalProps) {
  const [type, setType] = useState("feature");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${ENV.ROOT_API}/contributions`,
        { type, title: title.trim(), message: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setType("feature");
    setTitle("");
    setMessage("");
    setError("");
    setSuccess(false);
    setSending(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Cảm ơn bạn đã đóng góp!
            </h3>
            <p className="text-sm text-muted-foreground">
              Ý kiến của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <MessageSquare size={20} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Đóng góp ý kiến</h3>
                  <p className="text-xs text-muted-foreground">Giúp chúng tôi cải thiện OpenIdear</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loại đóng góp
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTRIBUTION_TYPES.map((ct) => {
                    const isSelected = type === ct.value;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setType(ct.value)}
                        className={`
                          flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                          border transition-all duration-150 cursor-pointer
                          ${isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                      >
                        <ct.icon size={14} className={isSelected ? "text-primary" : ct.color} />
                        {ct.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thêm tính năng tìm kiếm nâng cao..."
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả chi tiết ý kiến đóng góp của bạn..."
                  rows={5}
                  maxLength={5000}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {message.length}/5000
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={sending || !title.trim() || !message.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Gửi đóng góp
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
