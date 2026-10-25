"use client";

// =============================================================================
//  OPENIDEAR SHOP — PC HARDWARE CATEGORY SHORTCUTS
//  src/features/shop/components/catalog/CategoryShortcuts.tsx
// =============================================================================

import React, { useMemo } from "react";
import type { ShopCategory } from "../../types/shop.types";
import {
  Cpu,
  CircuitBoard,
  HardDrive,
  Zap,
  Box,
  Fan,
  Layers,
  Sparkles,
} from "lucide-react";

interface CategoryShortcutsProps {
  categories: ShopCategory[];
  activeCategory?: string;
  onSelectCategory: (categorySlug?: string) => void;
}

interface PresetDefinition {
  id: string;
  label: string;
  shortLabel: string;
  aliases: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const PRESET_CATEGORIES: PresetDefinition[] = [
  {
    id: "gpu",
    label: "Graphics Cards",
    shortLabel: "GPU",
    aliases: ["gpu", "vga", "graphics", "graphics-card", "graphics-cards", "card-man-hinh", "card-do-hoa"],
    icon: CircuitBoard,
  },
  {
    id: "cpu",
    label: "Processors",
    shortLabel: "CPU",
    aliases: ["cpu", "processors", "processor", "bo-vi-xu-ly", "chip"],
    icon: Cpu,
  },
  {
    id: "motherboard",
    label: "Motherboards",
    shortLabel: "Mainboard",
    aliases: ["motherboard", "motherboards", "mainboard", "mainboards", "bo-mach-chu"],
    icon: CircuitBoard,
  },
  {
    id: "ram",
    label: "RAM / Memory",
    shortLabel: "RAM",
    aliases: ["ram", "memory", "ddr4", "ddr5", "bo-nho-trong"],
    icon: Layers,
  },
  {
    id: "storage",
    label: "SSD & Storage",
    shortLabel: "Storage",
    aliases: ["ssd", "storage", "hdd", "nvme", "o-cung"],
    icon: HardDrive,
  },
  {
    id: "psu",
    label: "Power Supplies",
    shortLabel: "PSU",
    aliases: ["psu", "power-supply", "power-supplies", "nguon-may-tinh", "nguon"],
    icon: Zap,
  },
  {
    id: "case",
    label: "PC Cases",
    shortLabel: "Cases",
    aliases: ["case", "cases", "chassis", "vo-case", "thung-may"],
    icon: Box,
  },
  {
    id: "cooling",
    label: "Cooling & Fans",
    shortLabel: "Cooling",
    aliases: ["cooling", "cpu-cooler", "fans", "tan-nhiet", "quat-tan-nhiet", "aio"],
    icon: Fan,
  },
];

export function CategoryShortcuts({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryShortcutsProps) {
  // Map presets to real categories, and track extra categories created in DB
  const { matchedShortcuts, unmappedDbCategories } = useMemo(() => {
    const matched: Array<{
      preset: PresetDefinition;
      realCategory?: ShopCategory;
      count?: number;
    }> = [];

    const claimedDbIds = new Set<string>();

    for (const preset of PRESET_CATEGORIES) {
      const real = categories.find((cat) => {
        const slug = (cat.slug || "").toLowerCase();
        const name = (cat.name || "").toLowerCase();
        return (
          preset.aliases.includes(slug) ||
          preset.aliases.some((alias) => name.includes(alias))
        );
      });

      if (real) {
        claimedDbIds.add(real._id);
        matched.push({
          preset,
          realCategory: real,
          count: real.productCount,
        });
      } else {
        matched.push({
          preset,
          realCategory: undefined,
          count: undefined,
        });
      }
    }

    const unmapped = categories.filter((cat) => !claimedDbIds.has(cat._id));

    return { matchedShortcuts: matched, unmappedDbCategories: unmapped };
  }, [categories]);

  const isAllActive = !activeCategory;

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Hardware Component Categories
        </span>
        {activeCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Clear category filter
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* All Products Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            isAllActive
              ? "bg-blue-600 text-white shadow-xs border border-blue-600"
              : "bg-card text-foreground border border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-accent/40"
          }`}
          aria-pressed={isAllActive}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Hardware</span>
        </button>

        {/* Preset Shortcuts */}
        {matchedShortcuts.map(({ preset, realCategory, count }) => {
          const Icon = preset.icon;
          const targetSlug = realCategory?.slug;
          const isSelected = Boolean(targetSlug && activeCategory === targetSlug);
          const isAvailableInDb = Boolean(realCategory);

          return (
            <button
              key={preset.id}
              type="button"
              disabled={!isAvailableInDb}
              onClick={() => {
                if (targetSlug) {
                  onSelectCategory(isSelected ? undefined : targetSlug);
                }
              }}
              title={
                isAvailableInDb
                  ? `Filter by ${realCategory?.name || preset.label}`
                  : `${preset.label} (Stock catalog updating)`
              }
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white font-semibold shadow-xs border border-blue-600"
                  : isAvailableInDb
                  ? "bg-card text-foreground border border-border hover:border-blue-500/50 hover:bg-accent/40"
                  : "bg-muted/40 text-muted-foreground/60 border border-border/40 cursor-not-allowed opacity-60"
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{realCategory?.name || preset.shortLabel}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
              {!isAvailableInDb && (
                <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                  (Upcoming)
                </span>
              )}
            </button>
          );
        })}

        {/* Any additional unmapped database categories */}
        {unmappedDbCategories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? undefined : cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white font-semibold shadow-xs border border-blue-600"
                  : "bg-card text-foreground border border-border hover:border-blue-500/50 hover:bg-accent/40"
              }`}
              aria-pressed={isSelected}
            >
              <CircuitBoard className="h-3.5 w-3.5 shrink-0" />
              <span>{cat.name}</span>
              {cat.productCount !== undefined && cat.productCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.productCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
