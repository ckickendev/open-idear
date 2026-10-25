// =============================================================================
//  OPENIDEAR SHOP — PC HARDWARE SPECIFICATIONS TABLE
//  src/features/shop/components/detail/ProductSpecTable.tsx
// =============================================================================

import { Layers, FileText, CheckCircle2 } from "lucide-react";
import type { ShopProductSpecification } from "../../types/shop.types";

interface ProductSpecTableProps {
  specifications: ShopProductSpecification[];
}

export function ProductSpecTable({ specifications }: ProductSpecTableProps) {
  if (!specifications || specifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
        <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
        <h4 className="text-sm font-bold text-foreground">
          Technical Specifications Pending Verification
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          OEM technical specifications for this hardware part are currently being compiled and verified by our engineering team. Contact consultation for custom build compatibility.
        </p>
      </div>
    );
  }

  // Group specs by their 'group' field
  const groupedSpecs = specifications.reduce<
    Record<string, Array<{ name: string; value: string }>>
  >((acc, spec) => {
    const groupName = spec.group?.trim() || "General Specifications";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push({
      name: spec.name.trim(),
      value: spec.value.trim(),
    });
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedSpecs).map(([groupTitle, items]) => (
        <div
          key={groupTitle}
          className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs"
        >
          {/* Group Header */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {groupTitle}
              </h4>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {items.length} {items.length === 1 ? "spec" : "specs"}
            </span>
          </div>

          {/* Specs Rows */}
          <div className="divide-y divide-border/60">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 text-xs sm:text-sm hover:bg-muted/30 transition-colors"
              >
                <span className="font-semibold text-muted-foreground sm:col-span-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-blue-500/60 shrink-0 hidden sm:inline" />
                  <span>{item.name}</span>
                </span>
                <span className="font-medium text-foreground sm:col-span-2 pt-0.5 sm:pt-0 font-mono text-xs sm:text-[13px] break-words">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
