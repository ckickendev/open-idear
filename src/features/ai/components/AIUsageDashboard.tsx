// =============================================================================
//  AI FEATURE — TELEMETRY USAGE DASHBOARD
//  src/features/ai/components/AIUsageDashboard.tsx
//
//  Design Decisions:
//  - Displays visual summary cards for requests, success rates, tokens, costs, and delays.
//  - Includes interactive request tables and one-click data updates.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw, Activity, DollarSign, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TelemetryMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  totalTokens: number;
  totalCost: number;
  averageDuration: number;
}

interface TelemetryRequest {
  id: string;
  timestamp: string;
  model: string;
  success: boolean;
  durationMs: number;
  cost: number;
  promptName: string;
  error: string | null;
}

export default function AIUsageDashboard() {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [requests, setRequests] = useState<TelemetryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:5001/ai/v1/telemetry", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await res.json();
      if (resData.status === "success" && resData.data) {
        setMetrics(resData.data.metrics);
        setRequests(resData.data.recentRequests);
      } else {
        toast.error("Failed to retrieve telemetry data.");
      }
    } catch {
      toast.error("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  return (
    <div className="w-full bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl p-6 space-y-6 text-xs text-[var(--color-editor-text)] text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-editor-border)] pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="text-sm font-extrabold text-[var(--color-editor-text)]">
              AI Analytics & Telemetry
            </h3>
            <p className="text-[10px] text-[var(--color-editor-secondary)] mt-0.5">
              Real-time API executions, token budgets, and cost metrics
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchTelemetry}
          disabled={loading}
          className="p-2 rounded-lg border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-elevated)] cursor-pointer text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh analytics"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--color-editor-secondary)] text-[10px] font-semibold uppercase tracking-wider">
              <span>Total Requests</span>
              <Activity size={12} className="text-sky-400" />
            </div>
            <p className="text-xl font-extrabold">{metrics.totalRequests}</p>
            <p className="text-[9px] text-[var(--color-editor-secondary)]">
              {metrics.successfulRequests} successful / {metrics.failedRequests} failed
            </p>
          </div>

          <div className="p-4 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--color-editor-secondary)] text-[10px] font-semibold uppercase tracking-wider">
              <span>Success Rate</span>
              <CheckCircle2 size={12} className="text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold">
              {metrics.totalRequests > 0
                ? `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`
                : "100%"}
            </p>
            <p className="text-[9px] text-[var(--color-editor-secondary)]">
              Error rate: {metrics.errorRate}%
            </p>
          </div>

          <div className="p-4 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--color-editor-secondary)] text-[10px] font-semibold uppercase tracking-wider">
              <span>Tokens / Budget</span>
              <Cpu size={12} className="text-violet-400" />
            </div>
            <p className="text-xl font-extrabold">
              {metrics.totalTokens.toLocaleString()}
            </p>
            <p className="text-[9px] text-[var(--color-editor-secondary)]">
              Avg latency: {(metrics.averageDuration / 1000).toFixed(2)}s
            </p>
          </div>

          <div className="p-4 bg-[var(--color-editor-bg)] border border-[var(--color-editor-border)] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--color-editor-secondary)] text-[10px] font-semibold uppercase tracking-wider">
              <span>Estimated Cost</span>
              <DollarSign size={12} className="text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold text-emerald-400">
              ${metrics.totalCost.toFixed(4)}
            </p>
            <p className="text-[9px] text-[var(--color-editor-secondary)]">
              USD billing estimate
            </p>
          </div>
        </div>
      )}

      {/* Recent Requests Table */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase font-bold text-[var(--color-editor-secondary)] tracking-wider">
          Recent API Executions (Last 10 Runs)
        </h4>
        <div className="w-full overflow-x-auto border border-[var(--color-editor-border)] rounded-xl bg-[var(--color-editor-bg)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/60 text-[9px] font-bold text-[var(--color-editor-secondary)] uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Scope / Prompt</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Cost</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-editor-secondary)]">
                    No recent requests recorded in logs.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-[var(--color-editor-border)]/50 hover:bg-[var(--color-editor-elevated)]/30 transition-colors"
                  >
                    <td className="py-2 px-3 text-[10px] text-[var(--color-editor-secondary)] font-mono">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      {req.promptName}
                    </td>
                    <td className="py-2 px-3 text-[10px] font-mono text-[var(--color-editor-secondary)]">
                      {req.model}
                    </td>
                    <td className="py-2 px-3 font-mono text-[var(--color-editor-secondary)]">
                      {(req.durationMs / 1000).toFixed(2)}s
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-400/80">
                      ${req.cost.toFixed(5)}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          req.success
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${req.success ? "bg-emerald-400" : "bg-red-400"}`} />
                        {req.success ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
