// =============================================================================
//  INSERT PRODUCT MODAL — SPRINT S5 CONTENT COMMERCE
//  src/features/editor/components/InsertProductModal.tsx
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Search,
  X,
  Check,
  Loader2,
  Tag,
  Layout,
} from "lucide-react";
import { shopPublicApi } from "@/features/shop/api/shopPublic.api";
import type { PublicShopProduct } from "@/features/shop/types/shop.types";
import { formatVND } from "@/features/shop/utils/formatters";

interface InsertProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: {
    productId: string;
    contextualLabel?: string;
    layout?: "card" | "compact";
  }) => void;
}

export const InsertProductModal: React.FC<InsertProductModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<PublicShopProduct[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<PublicShopProduct | null>(null);
  const [contextualLabel, setContextualLabel] = useState("");
  const [layout, setLayout] = useState<"card" | "compact">("card");

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch initial catalog or search results
  const fetchProducts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await shopPublicApi.getProducts({
        search: query.trim() || undefined,
        limit: 12,
      });
      setProducts(res.products);
    } catch (err) {
      console.error("Error fetching products for embed modal:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts("");
      setSelectedProduct(null);
      setContextualLabel("");
      setLayout("card");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, fetchProducts]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen, fetchProducts]);

  if (!isOpen) return null;

  const handleConfirmInsert = () => {
    if (!selectedProduct) return;
    onInsert({
      productId: selectedProduct._id,
      contextualLabel: contextualLabel.trim() || undefined,
      layout,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[zoom-in_0.15s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-editor-text)]">
                Insert Shop Product Embed
              </h3>
              <p className="text-xs text-[var(--color-editor-muted)]">
                Connect your article with verified hardware from the OpenIdear Shop catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] p-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-editor-muted)]"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or SKU (e.g. RTX 4070, Core i5, SSD)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--color-editor-elevated)] border border-[var(--color-editor-border)] rounded-xl text-[var(--color-editor-text)] placeholder-[var(--color-editor-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {loading && (
              <Loader2
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-emerald-500"
              />
            )}
          </div>
        </div>

        {/* Content Body: Product Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[220px]">
          {loading && products.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-[var(--color-editor-muted)] text-sm">
              <Loader2 size={24} className="animate-spin text-emerald-500 mb-2" />
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-editor-muted)] text-sm">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
              <p>No products found matching &quot;{search}&quot;</p>
              <p className="text-xs mt-1">Try another keyword or SKU.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => {
                const isSelected = selectedProduct?._id === p._id;
                const primaryImage =
                  p.images?.find((img) => img.isPrimary)?.url ||
                  p.images?.[0]?.url ||
                  "/placeholder-product.svg";

                return (
                  <div
                    key={p._id}
                    onClick={() => setSelectedProduct(p)}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                        : "border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/40 hover:border-emerald-500/50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-[var(--color-editor-muted)] font-mono">
                          {p.sku}
                        </span>
                        {p.availabilityStatus === "in_stock" ? (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium">
                            In Stock
                          </span>
                        ) : p.availabilityStatus === "available_on_order" ? (
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded font-medium">
                            On Order
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--color-editor-text)] truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatVND(p.sellingPrice)}
                      </p>
                    </div>

                    {/* Radio check icon */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[var(--color-editor-border)]"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customization footer when a product is selected */}
        {selectedProduct && (
          <div className="p-4 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-elevated)]/60 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Contextual Recommendation Label Input */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[var(--color-editor-muted)] flex items-center gap-1 mb-1">
                  <Tag size={12} />
                  Contextual Recommendation Note (Optional)
                </label>
                <input
                  type="text"
                  value={contextualLabel}
                  onChange={(e) => setContextualLabel(e.target.value)}
                  placeholder="e.g. Best 1440p value card mentioned in section 2..."
                  className="w-full px-3 py-1.5 text-xs bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-lg text-[var(--color-editor-text)] placeholder-[var(--color-editor-muted)] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Layout option */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--color-editor-muted)] flex items-center gap-1 mb-1">
                  <Layout size={12} />
                  Display Layout
                </label>
                <select
                  value={layout}
                  onChange={(e) =>
                    setLayout(e.target.value as "card" | "compact")
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-lg text-[var(--color-editor-text)] focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="card">Standard Card</option>
                  <option value="compact">Compact Ribbon</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--color-editor-border)] bg-[var(--color-editor-surface)]">
          <div className="text-xs text-[var(--color-editor-muted)]">
            {selectedProduct ? (
              <span>
                Selected: <strong className="text-[var(--color-editor-text)]">{selectedProduct.name}</strong>
              </span>
            ) : (
              <span>Select a product above to embed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedProduct}
              onClick={handleConfirmInsert}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Insert Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
