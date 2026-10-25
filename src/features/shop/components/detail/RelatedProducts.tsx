// =============================================================================
//  OPENIDEAR SHOP — RELATED PRODUCTS (SPRINT S2)
//  src/features/shop/components/detail/RelatedProducts.tsx
// =============================================================================

import { fetchPublicProductsServer } from "../../api/shopPublic.api";
import { ProductCard } from "../catalog/ProductCard";

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
    limit: 5,
  });

  const related = result.products
    .filter((p) => p._id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="pt-12 border-t border-border/80 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Related Hardware in this Category
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore verified alternatives and complementary components
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </section>
  );
}
