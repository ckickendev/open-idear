// =============================================================================
//  OPENIDEAR SHOP — PRODUCT SPECIFICATIONS TABLE (SPRINT S2)
//  src/features/shop/components/detail/ProductSpecTable.tsx
// =============================================================================

import { Layers, FileText } from "lucide-react";
import type { ShopProductSpecification } from "../../types/shop.types";

interface ProductSpecTableProps {
  specifications: ShopProductSpecification[];
}

export function ProductSpecTable({ specifications }: ProductSpecTableProps) {
  if (!specifications || specifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
        <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
        <h4 className="text-sm font-semibold text-foreground">
          Specifications Pending Verification
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Detailed technical specifications for this hardware part are currently being compiled and verified by our technical team.
        </p>
      </div>
    );
  }

  // Group specs by their 'group' field
  const groupedSpecs = specifications.reduce<
    Record<string, Array<{ name: string; value: string }>>
  >((acc, spec) => {
    const groupName = spec.group?.trim() || "General";
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
    <div className="space-y-6">
      {Object.entries(groupedSpecs).map(([groupTitle, items]) => (
        <div
          key={groupTitle}
          className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs"
        >
          {/* Group Header */}
          <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {groupTitle}
            </h4>
          </div>

          {/* Specs Rows */}
          <div className="divide-y divide-border/60">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 text-xs sm:text-sm hover:bg-muted/20 transition-colors"
              >
                <span className="font-medium text-muted-foreground sm:col-span-1">
                  {item.name}
                </span>
                <span className="font-semibold text-foreground sm:col-span-2 pt-0.5 sm:pt-0">
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
