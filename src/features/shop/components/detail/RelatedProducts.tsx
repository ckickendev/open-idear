// =============================================================================
//  OPENIDEAR SHOP — RELATED PRODUCTS
//  src/features/shop/components/detail/RelatedProducts.tsx
// =============================================================================

import { fetchPublicProductsServer } from "../../api/shopPublic.api";
import { ProductCard } from "../catalog/ProductCard";
import { Sparkles } from "lucide-react";

interface RelatedProductsProps {
  currentProductId: string;
  categorySlug: string;
}

export async function RelatedProducts({
  currentProductId,
  categorySlug,
}: RelatedProductsProps) {
  if (!categorySlug) return null;

  const result = await fetchPublicProductsServer({
    category: categorySlug,
    limit: 6,
  });

  const related = result.products
    .filter((p) => p._id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="pt-10 border-t border-border/80 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Complementary Hardware</span>
          </div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Related Hardware in this Category
          </h3>
          <p className="text-xs text-muted-foreground">
            Explore verified alternatives and compatible PC components
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {related.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </section>
  );
}
