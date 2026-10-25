"use client";

// =============================================================================
//  OPENIDEAR SHOP — PC HARDWARE PRODUCT GALLERY
//  src/features/shop/components/detail/ProductGallery.tsx
// =============================================================================

import { useState } from "react";
import Image from "next/image";
import { Cpu, ZoomIn } from "lucide-react";
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
    <div className="flex flex-col gap-3.5">
      {/* ─── Main High-Resolution Image Viewer ──────────────────────────── */}
      <div className="group relative aspect-4/3 sm:aspect-square w-full rounded-2xl border border-border bg-zinc-50/70 dark:bg-zinc-900/40 overflow-hidden flex items-center justify-center p-6 shadow-xs">
        {activeImage ? (
          <>
            <Image
              src={activeImage}
              alt={validImages[selectedIdx]?.alt || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />

            {/* Image counter badge if multiple */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-mono backdrop-blur-xs">
                {selectedIdx + 1} / {validImages.length}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-3 p-6 text-center">
            <Cpu className="h-16 w-16 stroke-[1.2] text-blue-500/40" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                OEM Specification Image
              </p>
              <p className="text-xs text-muted-foreground">
                Verified technical specifications listed below
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Thumbnail Strip (if multiple images) ────────────────────────── */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-18 w-18 shrink-0 rounded-xl border bg-card p-1.5 overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-500/30 shadow-xs"
                    : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${idx + 1} of ${productName}`}
                aria-pressed={isSelected}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="72px"
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
