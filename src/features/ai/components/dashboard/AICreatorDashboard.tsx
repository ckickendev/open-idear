"use client";

import React from "react";
import Link from "next/link";
import { useMyAIUsage } from "../../hooks/useAIUsage";
import { HeroMetrics } from "./HeroMetrics";
import { FeatureUsageBars } from "./FeatureUsageBars";
import { DailyActivityChart } from "./DailyActivityChart";
import { RecentActivityTable } from "./RecentActivityTable";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  PenTool,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const AICreatorDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyAIUsage();

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ─── Top Header Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Creator Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor your personal AI generation activity, model compute costs, and feature usage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-medium border-border/80 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-medium shadow-xs">
            <Link href="/create">
              <PenTool className="w-3.5 h-3.5" />
              Open AI Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Error Notification State ─────────────────────────────────────── */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Unable to load AI usage statistics</p>
              <p className="text-xs text-muted-foreground">{error?.message || "Please check your network connection and retry."}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Hero Metrics Cards ─────────────────────────────────────────── */}
      <HeroMetrics
        totalGenerations={data?.totalGenerations || 0}
        totalTokens={data?.totalTokens || 0}
        estimatedCost={data?.estimatedCost || 0}
        averageLatency={data?.averageLatency || 0}
        isLoading={isLoading}
      />

      {/* ─── Empty State (Zero Generations) ──────────────────────────────── */}
      {!isLoading && data?.totalGenerations === 0 && (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              No AI Activity Yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you use AI capabilities like Rewrite, Tone Adjustment, Summarization, or the One-Click Publisher inside the Editor, your telemetry and benchmarks will display here in real time.
            </p>
          </div>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/create">
              Start Writing with AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* ─── Feature Usage & 7-Day Daily Activity ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <FeatureUsageBars
            features={data?.featureUsage || []}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-7">
          <DailyActivityChart
            data={data?.dailyActivity || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ─── Recent Execution Activity Table ──────────────────────────────── */}
      <RecentActivityTable
        history={data?.recentHistory || []}
        isLoading={isLoading}
      />
    </div>
  );
};
