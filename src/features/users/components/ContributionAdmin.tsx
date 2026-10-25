"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import {
  MessageSquare,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Send,
  Trash2,
  RefreshCw,
  Lightbulb,
  Bug,
  TrendingUp,
  FileText,
  MoreHorizontal,
  Inbox,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

/* ── Types ───────────────────────────────────────────── */
interface Contribution {
  _id: string;
  title: string;
  type: string;
  message: string;
  status: "new" | "reviewed" | "accepted" | "rejected";
  adminNote: string;
  user?: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  reviewedBy?: { name: string; username: string };
  createdAt: string;
  reviewedAt?: string;
}

interface Stats {
  new: number;
  reviewed: number;
  accepted: number;
  rejected: number;
}

/* ── Constants ───────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; badgeCls: string }> = {
  new: { label: "New", icon: Inbox, badgeCls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  reviewed: { label: "Reviewed", icon: Eye, badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  accepted: { label: "Accepted", icon: CheckCircle2, badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  rejected: { label: "Rejected", icon: XCircle, badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  feature: { label: "Feature", icon: Lightbulb, cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  bug: { label: "Bug Report", icon: Bug, cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  improvement: { label: "Improvement", icon: TrendingUp, cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  content: { label: "Content", icon: FileText, cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  other: { label: "Other", icon: MoreHorizontal, cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
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

/* ── Contribution Detail Modal ───────────────────────── */
function ContributionDetailModal({
  contribution,
  onClose,
  onUpdate,
}: {
  contribution: Contribution;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Contribution>) => void;
}) {
  const [status, setStatus] = useState(contribution.status);
  const [adminNote, setAdminNote] = useState(contribution.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.patch(
        `${ENV.ROOT_API}/contributions/admin/${contribution._id}/status`,
        { status, adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(contribution._id, res.data.contribution);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const typeInfo = TYPE_CONFIG[contribution.type] || TYPE_CONFIG.other;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <MessageSquare size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Contribution Details</h3>
              <p className="text-xs text-muted-foreground font-mono">
                #{String(contribution._id).slice(-8).toUpperCase()}
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
              {contribution.user?.avatar ? (
                <Image src={contribution.user.avatar} alt={contribution.user.name} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-base">
                  {contribution.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {contribution.user ? `${contribution.user.name} (@${contribution.user.username})` : "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {contribution.user?.email || "—"}
              </p>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_CONFIG[contribution.status].badgeCls}`}>
              {STATUS_CONFIG[contribution.status].label}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeInfo.cls}`}>
              {typeInfo.label}
            </span>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Title</p>
            <p className="text-base font-semibold text-foreground">{contribution.title}</p>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Message</p>
            <div className="bg-muted/60 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {contribution.message}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Submitted Date</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(contribution.createdAt).toLocaleString("en-US")}
              </p>
            </div>
            {contribution.reviewedAt && (
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Reviewed Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(contribution.reviewedAt).toLocaleString("en-US")}
                </p>
              </div>
            )}
          </div>

          {/* Admin response */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Admin Response
            </p>

            {/* Status change */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Contribution["status"])}
                className={`w-full ${inputCls}`}
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Internal Note</label>
              <textarea
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Notes for administrator..."
                className={`w-full ${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Admin Component ────────────────────────────── */
export default function ContributionAdmin() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<Stats>({ new: 0, reviewed: 0, accepted: 0, rejected: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;

      const res = await axios.get(`${ENV.ROOT_API}/contributions/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setContributions(res.data.contributions || []);
      setStats(res.data.stats || { new: 0, reviewed: 0, accepted: 0, rejected: 0 });
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contribution?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${ENV.ROOT_API}/contributions/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContributions((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (id: string, updated: Partial<Contribution>) => {
    setContributions((prev) => prev.map((c) => (c._id === id ? { ...c, ...updated } : c)));
  };

  // Client-side search filter
  const filtered = search
    ? contributions.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.message.toLowerCase().includes(search.toLowerCase()) ||
        c.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        c.user?.email.toLowerCase().includes(search.toLowerCase())
    )
    : contributions;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New" value={stats.new} icon={Inbox} color="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" />
        <StatCard label="Reviewed" value={stats.reviewed} icon={Eye} color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle2} color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 ${inputCls}`}
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="all">All types</option>
            <option value="feature">Feature</option>
            <option value="bug">Bug Report</option>
            <option value="improvement">Improvement</option>
            <option value="content">Content</option>
            <option value="other">Other</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchContributions}
            className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            title="Refresh"
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
            <MessageSquare size={36} className="text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No contributions found</p>
            <p className="text-xs text-muted-foreground">No feedback or contributions match the current criteria.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_100px_120px_80px] gap-4 px-5 py-3 bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>Contribution</span>
              <span>Sender</span>
              <span>Status</span>
              <span>Type</span>
              <span>Submitted</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((contribution) => {
                const st = STATUS_CONFIG[contribution.status];
                const tp = TYPE_CONFIG[contribution.type] || TYPE_CONFIG.other;
                return (
                  <div
                    key={contribution._id}
                    className="px-5 py-4 hover:bg-muted/30 transition-colors grid md:grid-cols-[1fr_120px_100px_100px_120px_80px] gap-4 items-center"
                  >
                    {/* Title + excerpt */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{String(contribution._id).slice(-6).toUpperCase()}
                        </span>
                        {contribution.adminNote && (
                          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">Responded</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{contribution.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{contribution.message}</p>
                    </div>

                    {/* Sender */}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {contribution.user ? contribution.user.name : "Anonymous"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {contribution.user?.email || "—"}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.badgeCls}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tp.cls}`}>
                        {tp.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {new Date(contribution.createdAt).toLocaleDateString("en-US")}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedContribution(contribution)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(contribution._id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        title="Delete"
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
            Total: <span className="font-semibold text-foreground">{total}</span> contributions
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedContribution && (
        <ContributionDetailModal
          contribution={selectedContribution}
          onClose={() => setSelectedContribution(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
