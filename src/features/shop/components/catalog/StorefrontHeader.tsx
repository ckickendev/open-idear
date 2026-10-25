// =============================================================================
//  OPENIDEAR SHOP — PROFESSIONAL STOREFRONT HEADER
//  src/features/shop/components/catalog/StorefrontHeader.tsx
// =============================================================================

import Link from "next/link";
import { ShieldCheck, Cpu, CheckCircle2, MessageSquare, Home } from "lucide-react";

export function StorefrontHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xs p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Breadcrumb Context */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Shop</span>
        </div>

        {/* Main Banner Headline & Value Props */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Cpu className="h-3 w-3" />
              <span>Verified PC Hardware Storefront</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              PC Hardware & Components Catalog
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Direct technical sourcing for high-performance PC components, workstation hardware, and upgrades. Every listing discloses real physical inventory or verified authorized supplier order lead times.
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 w-full lg:w-auto shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-accent/40 border border-border/60">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">
                  Verified Hardware Specs
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Authentic OEM attributes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-accent/40 border border-border/60">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">
                  Authoritative Pricing
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Standard VAT & no hidden fees
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-accent/40 border border-border/60">
              <MessageSquare className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">
                  Engineer Consultation
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Compatibility checked before order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
