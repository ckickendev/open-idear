"use client";

import React from "react";
import { Sparkles, Zap, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroMetricsProps {
  readonly totalGenerations: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly averageLatency: number;
  readonly isLoading?: boolean;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}k`;
  }
  return tokens.toLocaleString();
}

function formatLatency(ms: number): string {
  if (!ms || ms <= 0) return "0ms";
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

function formatCost(cost: number): string {
  if (!cost || cost <= 0) return "$0.000";
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(3)}`;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
  totalGenerations,
  totalTokens,
  estimatedCost,
  averageLatency,
  isLoading = false,
}) => {
  const cards = [
    {
      id: "generations",
      label: "Total Generations",
      value: totalGenerations.toLocaleString(),
      subtext: "AI requests executed",
      icon: Sparkles,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200/50 dark:border-blue-800/40",
    },
    {
      id: "tokens",
      label: "Total Tokens",
      value: formatTokens(totalTokens),
      subtext: `${totalTokens.toLocaleString()} tokens processed`,
      icon: Zap,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200/50 dark:border-amber-800/40",
    },
    {
      id: "cost",
      label: "Estimated Cost",
      value: formatCost(estimatedCost),
      subtext: "USD equivalent compute",
      icon: DollarSign,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/40",
    },
    {
      id: "latency",
      label: "Average Response Time",
      value: formatLatency(averageLatency),
      subtext: "Roundtrip pipeline latency",
      icon: Clock,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/50 border-purple-200/50 dark:border-purple-800/40",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="group relative overflow-hidden border-border/70 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono">
                  {card.value}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground truncate" title={card.subtext}>
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
