"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { UserHistoryItem } from "../../types/aiUsage.types";

interface RecentActivityTableProps {
  readonly history: readonly UserHistoryItem[];
  readonly isLoading?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${ms}ms`;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  history,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-44 mb-1" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Recent AI Activity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Audit log of latest executions and performance benchmarks
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {history.length} {history.length === 1 ? "record" : "records"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:px-6 sm:pb-6">
        {history.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2 px-4">
            <Clock className="w-8 h-8 text-muted-foreground/40 stroke-1" />
            <p className="font-medium">No recent activity found</p>
            <p className="text-xs text-muted-foreground/80 max-w-sm">
              Any AI generation invoked from the editor will be logged here in real-time.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px]">Feature</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead className="w-[60px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const isSuccess = item.status === "SUCCESS";
                return (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-xs font-semibold">
                          {item.featureName}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.featureId}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono uppercase tracking-wider py-0 px-1.5 border-border/80 bg-muted/30"
                        >
                          {item.provider}
                        </Badge>
                        {item.model && (
                          <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]" title={item.model}>
                            {item.model}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs">
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-foreground">
                          {item.totalTokens.toLocaleString()}
                        </span>
                        {(item.inputTokens > 0 || item.outputTokens > 0) && (
                          <span className="text-[10px] text-muted-foreground">
                            {item.inputTokens} in / {item.outputTokens} out
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-foreground">
                      {formatLatency(item.latency)}
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(item.createdAt)}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {isSuccess ? (
                          <span title="Success" className="inline-flex">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </span>
                        ) : (
                          <span title="Failed" className="inline-flex">
                            <XCircle className="w-4 h-4 text-destructive" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
