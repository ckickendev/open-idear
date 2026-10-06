"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Sparkles } from "lucide-react";
import type { FeatureUsageItem } from "../../types/aiUsage.types";

interface FeatureUsageBarsProps {
  readonly features: readonly FeatureUsageItem[];
  readonly isLoading?: boolean;
}

export const FeatureUsageBars: React.FC<FeatureUsageBarsProps> = ({
  features,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-36 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const sortedFeatures = [...features].sort((a, b) => b.count - a.count);

  return (
    <Card className="border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Feature Usage
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Proportional distribution of AI capabilities used
            </CardDescription>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {features.length} {features.length === 1 ? "feature" : "features"}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {sortedFeatures.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-muted-foreground/50 stroke-1" />
            <p className="font-medium">No feature usage recorded yet</p>
            <p className="text-xs text-muted-foreground/80 max-w-xs">
              Actions like Rewrite, Summarize, and FAQ Generation will display here once executed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFeatures.map((item) => (
              <div key={item.featureId} className="group space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-foreground truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground font-mono">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {item.count} {item.count === 1 ? "run" : "runs"}
                    </span>
                    <span className="font-mono font-semibold text-foreground w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(2, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
