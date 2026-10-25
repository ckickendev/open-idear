"use client";

// =============================================================================
//  OPENIDEAR SHOP — COMMERCE ANALYTICS & LAUNCH READINESS (SPRINT S6)
//  src/features/shop/components/admin/CommerceAnalytics.tsx
// =============================================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointerClick,
  Layers,
  FileText,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  Percent,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { shopAdminApi } from "../../api/shopAdmin.api";
import type { CommerceAnalyticsOverview } from "../../types/shop.types";
import { formatVND } from "../../utils/formatters";
import { Button } from "@/components/ui/button";

type TimeRangeOption = "7d" | "30d" | "90d" | "all";

export default function CommerceAnalytics() {
  const [range, setRange] = useState<TimeRangeOption>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CommerceAnalyticsOverview | null>(null);

  const fetchAnalytics = useCallback(async (selectedRange: TimeRangeOption) => {
    try {
      setLoading(true);
      const res = await shopAdminApi.getAnalyticsOverview({ range: selectedRange });
      if (res.data) {
        setData(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load commerce analytics";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [fetchAnalytics, range]);

  return (
    <div className="space-y-8 pb-16">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Shop Commerce Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3 w-3" />
              Launch Ready
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Trustworthy funnel measurements, content attribution, and revenue breakdown.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
            {(["7d", "30d", "90d", "all"] as TimeRangeOption[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  range === r
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "All Time"}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(range)}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Range & Timezone Indicator */}
      {data && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Period:{" "}
            <strong className="text-neutral-700 dark:text-neutral-300">
              {new Date(data.timeRange.startDate).toLocaleDateString()}
            </strong>{" "}
            to{" "}
            <strong className="text-neutral-700 dark:text-neutral-300">
              {new Date(data.timeRange.endDate).toLocaleDateString()}
            </strong>{" "}
            ({data.timeRange.timezone})
          </span>
        </div>
      )}

      {/* ─── 1. TOP FINANCIAL METRICS CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Confirmed Value */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Gross Confirmed Value
            </span>
            <span className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : formatVND(data?.revenue.grossConfirmedValue || 0)}
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Confirmed + completed order commitments
            </p>
          </div>
        </div>

        {/* Completed Revenue */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Completed Sales Revenue
            </span>
            <span className="rounded-md bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : formatVND(data?.revenue.completedRevenue || 0)}
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Strictly fulfilled & delivered orders
            </p>
          </div>
        </div>

        {/* Inquiry Pipeline Value */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Inquiry Pipeline Demand
            </span>
            <span className="rounded-md bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : formatVND(data?.revenue.inquiryPipelineValue || 0)}
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Pending confirmation or negotiation
            </p>
          </div>
        </div>

        {/* Cancelled Lost Value */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Cancelled Lost Value
            </span>
            <span className="rounded-md bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {loading ? "..." : formatVND(data?.revenue.cancelledLostValue || 0)}
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Excluded from sales & revenue
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. SECONDARY CONVERSION & EFFICIENCY KPIS ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Inquiries */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Inquiries Received
            </span>
            <Layers className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : data?.funnel.inquiriesReceived || 0}
            </span>
            <span className="text-xs text-neutral-500">leads</span>
          </div>
        </div>

        {/* Inquiry to Confirm Conversion Rate */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Inquiry → Confirm Rate
            </span>
            <Percent className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : `${data?.funnel.inquiryToConfirmRatePct || 0}%`}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              ({data?.funnel.ordersConfirmed || 0} confirmed)
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Average Order Value (AOV)
            </span>
            <TrendingUp className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {loading ? "..." : formatVND(data?.revenue.averageOrderValue || 0)}
            </span>
          </div>
        </div>

        {/* Contribution Margin (Admin Only) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Est. Contribution Margin
            </span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            {data?.revenue.contributionMargin ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatVND(data.revenue.contributionMargin.estimatedContributionMargin)}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ({data.revenue.contributionMargin.contributionMarginPercentage}%)
                </span>
              </div>
            ) : (
              <span className="text-xs text-neutral-500">No cost data</span>
            )}
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Cost coverage: {data?.revenue.contributionMargin?.verifiedCostItemCoveragePct || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. COMMERCE FUNNEL VISUALIZATION ─────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Content-to-Commerce Conversion Funnel
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Journey from educational content discovery to verified order fulfillment.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500">Overall Completion Rate:</span>{" "}
            <strong className="text-sm text-neutral-900 dark:text-white">
              {data?.funnel.inquiryToCompleteRatePct || 0}%
            </strong>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* Step 1: Detail Views */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Eye className="h-3.5 w-3.5 text-sky-500" />
                1. Product Detail Page Views
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {data?.funnel.productDetailViews.toLocaleString() || 0} views
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-2 rounded-full bg-sky-500 transition-all duration-500" style={{ width: "100%" }} />
            </div>
          </div>

          {/* Step 2: Content Embed Impressions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                2. Article Product Embed Impressions
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {data?.funnel.productEmbedImpressions.toLocaleString() || 0} impressions
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    data && data.funnel.productDetailViews > 0
                      ? Math.max(10, Math.round((data.funnel.productEmbedImpressions / data.funnel.productDetailViews) * 100))
                      : 60
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Step 3: Embed Clicks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />
                3. Article Embed Clicks
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  CTR: {data?.funnel.embedClickThroughRatePct || 0}%
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {data?.funnel.productEmbedClicks.toLocaleString() || 0} clicks
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    data && data.funnel.productEmbedImpressions > 0
                      ? Math.max(5, Math.round((data.funnel.productEmbedClicks / data.funnel.productEmbedImpressions) * 100))
                      : 35
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Step 4: Inquiries Received */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                4. Customer Inquiries Submitted
              </span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {data?.funnel.inquiriesReceived || 0} inquiries
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    data && data.funnel.inquiriesReceived > 0 ? 50 : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Step 5: Orders Confirmed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                5. Orders Confirmed (Inventory Reserved)
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Conv: {data?.funnel.inquiryToConfirmRatePct || 0}%
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {data?.funnel.ordersConfirmed || 0} orders
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    data && data.funnel.inquiriesReceived > 0
                      ? Math.max(5, Math.round((data.funnel.ordersConfirmed / data.funnel.inquiriesReceived) * 100))
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Step 6: Orders Completed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
                6. Orders Completed (Fulfilled & Paid)
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  Fulfilled: {data?.funnel.ordersCompleted || 0}
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-teal-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    data && data.funnel.inquiriesReceived > 0
                      ? Math.max(5, Math.round((data.funnel.ordersCompleted / data.funnel.inquiriesReceived) * 100))
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Cancellation Metric Box */}
          <div className="flex items-center justify-between rounded-lg bg-rose-50/50 p-3 text-xs dark:bg-rose-950/20">
            <span className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
              Cancelled Inquiries / Orders: <strong>{data?.funnel.ordersCancelled || 0}</strong>
            </span>
            <span className="font-semibold text-rose-700 dark:text-rose-400">
              Cancellation Rate: {data?.funnel.cancellationRatePct || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4. CONTENT-TO-COMMERCE ATTRIBUTION SECTION ──────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Content Attribution Leaderboard
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Articles driving product discovery, customer inquiries, and realized commerce revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
              Attributed Inquiries: {data?.attribution.attributedInquiriesCount || 0} (
              {data?.attribution.attributionSharePct || 0}% share)
            </div>
          </div>
        </div>

        {/* Table of top articles */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="pb-2.5 font-medium">Article Reference</th>
                <th className="pb-2.5 text-center font-medium">Inquiries Driven</th>
                <th className="pb-2.5 text-center font-medium">Confirmed</th>
                <th className="pb-2.5 text-center font-medium">Completed</th>
                <th className="pb-2.5 text-right font-medium">Gross Confirmed</th>
                <th className="pb-2.5 text-right font-medium">Completed Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {data && data.attribution.topArticles.length > 0 ? (
                data.attribution.topArticles.map((article) => (
                  <tr key={article.articleSlug} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      <Link
                        href={`/post/${article.articleSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="max-w-[280px] truncate">{article.articleSlug}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                    </td>
                    <td className="py-3 text-center font-semibold text-neutral-800 dark:text-neutral-200">
                      {article.inquiries}
                    </td>
                    <td className="py-3 text-center text-emerald-600 dark:text-emerald-400">
                      {article.confirmed}
                    </td>
                    <td className="py-3 text-center text-teal-600 dark:text-teal-400 font-semibold">
                      {article.completed}
                    </td>
                    <td className="py-3 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {formatVND(article.grossValue)}
                    </td>
                    <td className="py-3 text-right font-bold text-teal-600 dark:text-teal-400">
                      {formatVND(article.completedRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                    No content-attributed orders recorded in this time period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. PRODUCT PERFORMANCE LEADERBOARD ───────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Product Demand & Telemetry Leaderboard
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Top products by customer order demand and content embed interactions.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="pb-2.5 font-medium">Product / SKU</th>
                <th className="pb-2.5 text-right font-medium">Selling Price</th>
                <th className="pb-2.5 text-center font-medium">Views</th>
                <th className="pb-2.5 text-center font-medium">Embed Impr.</th>
                <th className="pb-2.5 text-center font-medium">Embed Clicks</th>
                <th className="pb-2.5 text-center font-medium">Embed CTR</th>
                <th className="pb-2.5 text-center font-medium">Orders Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {data && data.productPerformance.length > 0 ? (
                data.productPerformance.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{prod.name}</div>
                      <div className="font-mono text-[11px] text-neutral-400">{prod.sku}</div>
                    </td>
                    <td className="py-3 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {formatVND(prod.sellingPrice)}
                    </td>
                    <td className="py-3 text-center text-neutral-600 dark:text-neutral-400">
                      {prod.views.toLocaleString()}
                    </td>
                    <td className="py-3 text-center text-neutral-600 dark:text-neutral-400">
                      {prod.embedImpressions.toLocaleString()}
                    </td>
                    <td className="py-3 text-center text-neutral-600 dark:text-neutral-400">
                      {prod.embedClicks.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-semibold text-purple-600 dark:text-purple-400">
                        {prod.ctr}%
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {prod.orderCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                    No product records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. DATA INTEGRITY & AUDIT DISCLOSURES ─────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
        <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-200">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          Commerce Data Integrity & Telemetry Disclosures
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <strong className="text-neutral-700 dark:text-neutral-300">Telemetry & Unique Visitors:</strong>
            <p className="mt-0.5">
              {data?.dataIntegrityNotes?.uniqueVisitorsDisclaimer ||
                "Raw counters reflect interaction events. Sessions are hashed client sessions without PII, not globally unique individuals."}
            </p>
          </div>
          <div>
            <strong className="text-neutral-700 dark:text-neutral-300">Revenue Separation Invariant:</strong>
            <p className="mt-0.5">
              {data?.dataIntegrityNotes?.cancelledOrdersDisclaimer ||
                "Cancelled orders are strictly excluded from gross confirmed value and completed sales revenue."}
            </p>
          </div>
          <div>
            <strong className="text-neutral-700 dark:text-neutral-300">Attribution Rules:</strong>
            <p className="mt-0.5">
              {data?.dataIntegrityNotes?.attributionModel ||
                "Last-touch model preserving the referring article parameter upon inquiry submission."}
            </p>
          </div>
          <div>
            <strong className="text-neutral-700 dark:text-neutral-300">Supplier Cost Isolation:</strong>
            <p className="mt-0.5">
              {data?.dataIntegrityNotes?.costPriceIsolation ||
                "Supplier costs and contribution margins are restricted to admin authorization and never exposed publicly."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
