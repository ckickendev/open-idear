"use client";

// =============================================================================
//  OPENIDEAR SHOP — PRODUCT GALLERY (SPRINT S2)
//  src/features/shop/components/detail/ProductGallery.tsx
// =============================================================================

import { useState } from "react";
import Image from "next/image";
import { Cpu } from "lucide-react";
import type { ShopProductImage } from "../../types/shop.types";

interface ProductGalleryProps {
  images: ShopProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const validImages = images && images.length > 0 ? images : [];
  const primaryIdx = validImages.findIndex((img) => img.isPrimary);
  const [selectedIdx, setSelectedIdx] = useState(
    primaryIdx >= 0 ? primaryIdx : 0
  );

  const activeImage = validImages[selectedIdx]?.url;

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Main Image Viewer ─────────────────────────────────────────── */}
      <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center p-6 shadow-xs">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={validImages[selectedIdx]?.alt || productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4 transition-all duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-3">
            <Cpu className="h-16 w-16 stroke-[1.2]" />
            <p className="text-sm font-medium">No product image available</p>
          </div>
        )}
      </div>

      {/* ─── Thumbnail Strip (if multiple images) ────────────────────────── */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-20 w-20 shrink-0 rounded-xl border bg-card p-1.5 overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 shadow-xs"
                    : "border-border hover:border-muted-foreground/40 opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${idx + 1} of ${productName}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
