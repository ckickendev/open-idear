// =============================================================================
//  OPENIDEAR SHOP — STOREFRONT HEADER (SPRINT S2)
//  src/features/shop/components/catalog/StorefrontHeader.tsx
// =============================================================================

import { ShieldCheck, Cpu } from "lucide-react";

export function StorefrontHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-card to-background p-6 sm:p-8 mb-8 shadow-xs">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Cpu className="h-3.5 w-3.5" />
            <span>OpenIdear Hardware & Components</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            PC Hardware & Tech Catalog
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Discover verified PC hardware components, workstations, and high-performance gear. Every product listing displays real physical inventory or clear supplier-order lead time.
          </p>
        </div>

        {/* Value badge */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/40 border border-border/60">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Authentic & Verified
              </p>
              <p className="text-[11px] text-muted-foreground">
                Zero fake ratings or artificial discounts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
