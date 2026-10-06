"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import type { DailyActivityItem } from "../../types/aiUsage.types";

interface DailyActivityChartProps {
  readonly data: readonly DailyActivityItem[];
  readonly isLoading?: boolean;
}

function formatDayLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyActivityItem;
    return (
      <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md backdrop-blur-sm text-xs space-y-1.5 min-w-[140px]">
        <p className="font-semibold text-foreground text-[11px] pb-1 border-b border-border/50">
          {label ? formatDayLabel(label) : data.date}
        </p>
        <div className="flex justify-between items-center text-muted-foreground pt-0.5">
          <span>Generations:</span>
          <span className="font-mono font-bold text-foreground">
            {data.count.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Tokens:</span>
          <span className="font-mono font-medium text-foreground">
            {data.totalTokens.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({
  data,
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <Card className="border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="h-64 flex items-end gap-3 pt-6">
          {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full rounded-md" style={{ height: `${h}%` }} />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    formattedDay: formatDayLabel(d.date),
  }));

  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <Card className="border-border/70 bg-card shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Daily Activity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              7-day generation volume and compute usage
            </CardDescription>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
            Past 7 days
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-admin-primary, #3b82f6)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-admin-primary, #3b82f6)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="formattedDay"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground, #888888)" }}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.ceil(maxCount * 1.15)]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground, #888888)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-admin-primary, #3b82f6)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#activityGradient)"
                activeDot={{ r: 5, strokeWidth: 2, fill: "var(--background, #fff)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
