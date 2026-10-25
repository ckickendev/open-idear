// =============================================================================
//  PRODUCT EMBED NODE VIEW (REACT) — SPRINT S5 CONTENT COMMERCE
//  src/features/editor/components/ProductEmbedNodeView.tsx
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  ShoppingBag,
  Trash2,
  ExternalLink,
  PackageCheck,
  PackageX,
  Clock,
  AlertTriangle,
  Loader2,
  Tag,
  Edit3,
  Check,
} from "lucide-react";
import { shopPublicApi } from "@/features/shop/api/shopPublic.api";
import type { PublicShopProduct } from "@/features/shop/types/shop.types";
import { formatVND } from "@/features/shop/utils/formatters";

export const ProductEmbedNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const { productId, contextualLabel = "", layout = "card" } = node.attrs;

  const [product, setProduct] = useState<PublicShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(contextualLabel);

  useEffect(() => {
    let isMounted = true;
    if (!productId) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    shopPublicApi
      .getProductBySlug(productId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProduct(data);
          setError(false);
        } else {
          setProduct(null);
          setError(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleSaveNote = () => {
    updateAttributes({ contextualLabel: noteDraft.trim() });
    setIsEditingNote(false);
  };

  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "/placeholder-product.svg";

  return (
    <NodeViewWrapper className="my-6">
      <div
        className={`relative rounded-2xl border transition-all duration-200 select-none ${
          selected
            ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
            : "border-[var(--color-editor-border)] hover:border-emerald-500/40"
        } bg-[var(--color-editor-surface)] overflow-hidden`}
      >
        {/* Top Header Bar inside NodeView */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/50 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShoppingBag size={14} />
            <span>Shop Product Embed</span>
            {product?.sku && (
              <span className="text-[10px] text-[var(--color-editor-muted)] px-1.5 py-0.5 rounded bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)]">
                SKU: {product.sku}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Layout Toggle */}
            <select
              value={layout}
              onChange={(e) => updateAttributes({ layout: e.target.value })}
              className="bg-[var(--color-editor-surface)] text-[var(--color-editor-secondary)] text-[11px] border border-[var(--color-editor-border)] rounded px-1.5 py-0.5 cursor-pointer outline-none"
              title="Card Layout"
            >
              <option value="card">Card Layout</option>
              <option value="compact">Compact Layout</option>
            </select>

            {/* Remove Block Button */}
            <button
              type="button"
              onClick={deleteNode}
              className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors cursor-pointer"
              title="Remove product embed"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-6 flex items-center justify-center gap-3 text-[var(--color-editor-muted)] text-xs">
            <Loader2 size={16} className="animate-spin text-emerald-500" />
            <span>Resolving live Shop catalog data...</span>
          </div>
        ) : error || !product ? (
          /* Graceful Fallback for unpublished, missing, or discontinued product */
          <div className="p-5 flex items-start justify-between gap-4 bg-amber-500/5 text-amber-600 dark:text-amber-400">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">
                  Product Unavailable or Draft
                </p>
                <p className="text-[11px] text-[var(--color-editor-muted)] mt-0.5">
                  Reference ID: <code className="font-mono">{productId}</code> is
                  not currently available in the public catalog. Readers will see
                  a neutral fallback or this block will be hidden.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={deleteNode}
              className="text-xs text-red-500 hover:underline shrink-0 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          /* Active Product Card Preview */
          <div className="p-4">
            <div
              className={`flex ${
                layout === "compact"
                  ? "flex-row items-center gap-4"
                  : "flex-col sm:flex-row items-start sm:items-center gap-4"
              }`}
            >
              {/* Product Thumbnail */}
              <div
                className={`relative shrink-0 rounded-xl overflow-hidden border border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)] ${
                  layout === "compact" ? "w-16 h-16" : "w-24 h-24 sm:w-28 sm:h-28"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {/* Category */}
                  {typeof product.category === "object" && product.category?.name && (
                    <span className="text-[10px] font-medium text-[var(--color-editor-muted)] bg-[var(--color-editor-elevated)] px-2 py-0.5 rounded-full">
                      {product.category.name}
                    </span>
                  )}

                  {/* Availability Badge */}
                  {product.availabilityStatus === "in_stock" ? (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <PackageCheck size={10} />
                      In Stock
                    </span>
                  ) : product.availabilityStatus === "available_on_order" ? (
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} />
                      Supplier Order
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <PackageX size={10} />
                      Out of Stock
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[var(--color-editor-text)] truncate">
                  {product.name}
                </h4>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatVND(product.sellingPrice)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.sellingPrice && (
                      <span className="text-xs text-[var(--color-editor-muted)] line-through">
                        {formatVND(product.originalPrice)}
                      </span>
                    )}
                </div>
              </div>

              {/* View Catalog Link Button */}
              <a
                href={`/shop/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
              >
                <span>View catalog</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Contextual Editor Recommendation Note */}
            <div className="mt-3 pt-3 border-t border-[var(--color-editor-border)]/60">
              {isEditingNote ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="e.g. Recommended CPU pairing for this build..."
                    className="flex-1 bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--color-editor-text)] outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveNote();
                      if (e.key === "Escape") setIsEditingNote(false);
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                    title="Save note"
                  >
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setNoteDraft(contextualLabel);
                    setIsEditingNote(true);
                  }}
                  className="flex items-center justify-between text-xs cursor-pointer group hover:bg-[var(--color-editor-elevated)]/40 p-1.5 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[var(--color-editor-secondary)]">
                    <Tag size={12} className="text-emerald-500" />
                    {contextualLabel ? (
                      <span className="italic font-medium text-[var(--color-editor-text)]">
                        &quot;{contextualLabel}&quot;
                      </span>
                    ) : (
                      <span className="text-[var(--color-editor-muted)] italic">
                        Add an editor recommendation note (optional)...
                      </span>
                    )}
                  </div>
                  <Edit3
                    size={12}
                    className="text-[var(--color-editor-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
