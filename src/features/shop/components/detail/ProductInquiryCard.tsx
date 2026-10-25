"use client";

// =============================================================================
//  OPENIDEAR SHOP — PRODUCT INQUIRY & ORDER WORKFLOW (SPRINT S3)
//  src/features/shop/components/detail/ProductInquiryCard.tsx
// =============================================================================

import { useState, useEffect } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Package,
  Box,
  AlertTriangle,
  Mail,
  Send,
  CheckCircle2,
  PhoneCall,
  Plus,
  Minus,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  PublicShopProduct,
  InquiryConfirmationResponse,
} from "../../types/shop.types";
import { formatVND, getAvailabilityInfo } from "../../utils/formatters";
import { shopPublicApi } from "../../api/shopPublic.api";

interface ProductInquiryCardProps {
  product: PublicShopProduct;
}

export function ProductInquiryCard({ product }: ProductInquiryCardProps) {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryContact, setInquiryContact] = useState("");
  const [inquiryArea, setInquiryArea] = useState("");
  const [inquiryNote, setInquiryNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<InquiryConfirmationResponse | null>(null);
  const [hasCopiedRef, setHasCopiedRef] = useState(false);
  const [attribution, setAttribution] = useState<{
    articleSlug?: string;
    embedId?: string;
    source?: string;
  } | null>(null);

  // Preserve article attribution if user arrived via educational product embed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromArticle = params.get("from_article");
      const embedId = params.get("embed_id");
      if (fromArticle) {
        setAttribution({
          articleSlug: fromArticle,
          embedId: embedId || undefined,
          source: "article_embed",
        });
      }
    }
  }, []);

  const availability = getAvailabilityInfo(
    product.availabilityStatus,
    product.fulfillmentMode,
    product.stockQuantity
  );

  const isPurchasable =
    (product.fulfillmentMode === "stock" &&
      product.availabilityStatus === "in_stock" &&
      product.stockQuantity > 0) ||
    product.fulfillmentMode === "supplier_order";

  const subtotal = product.sellingPrice * quantity;

  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.min(50, Math.max(1, newQty));
    setQuantity(clamped);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryContact.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // Generate unique idempotency key for this submission attempt
    const idempotencyKey =
      typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await shopPublicApi.submitInquiry({
        productId: product._id,
        quantity,
        customer: {
          name: inquiryName.trim(),
          contactMethod: inquiryContact.trim(),
          deliveryArea: inquiryArea.trim() || undefined,
        },
        customerNote: inquiryNote.trim() || undefined,
        idempotencyKey,
        attribution: attribution || undefined,
      });

      setConfirmation(res);
    } catch (err: unknown) {
      console.error("Inquiry submission failed:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setHasCopiedRef(true);
      setTimeout(() => setHasCopiedRef(false), 2500);
    }
  };

  const handleCloseModal = () => {
    setShowInquiryModal(false);
    // Reset state after modal closes if confirmed
    if (confirmation) {
      setConfirmation(null);
      setInquiryNote("");
      setQuantity(1);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
      {/* ─── Price Display ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Unit Price (VND)
        </span>
        <div className="text-3xl font-extrabold text-foreground tracking-tight">
          {formatVND(product.sellingPrice)}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Listed price includes standard VAT. Final invoice confirmed upon manual consultation.
        </p>
      </div>

      {/* ─── Availability & Fulfillment Status Banner ───────────────────── */}
      <div
        className={`p-4 rounded-xl border ${
          availability.isSupplierOrder
            ? "bg-sky-500/10 border-sky-500/20 text-sky-950 dark:text-sky-200"
            : availability.isAvailable
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
            : "bg-muted/50 border-border text-muted-foreground"
        } space-y-2`}
      >
        <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
          {availability.isSupplierOrder ? (
            <Package className="h-4 w-4 text-sky-500 shrink-0" />
          ) : availability.isAvailable ? (
            <Box className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span>{availability.label}</span>
        </div>

        <p className="text-xs leading-relaxed opacity-90">
          {product.fulfillmentMode === "supplier_order" ? (
            <>
              This product is fulfilled directly through our authorized supplier network. Orders are reserved and scheduled upon consultation.
            </>
          ) : product.availabilityStatus === "in_stock" && product.stockQuantity > 0 ? (
            <>
              Physical inventory is available in our verified hub ({product.stockQuantity} units available). Ready for inspection or dispatch.
            </>
          ) : (
            <>
              This product is currently out of physical stock. Inquiries remain open for restocking dates and verified technical alternatives.
            </>
          )}
        </p>
      </div>

      {/* ─── Quantity Selector (when in stock or available on order) ─────── */}
      {isPurchasable && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/60">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground">
              Quantity
            </span>
            <p className="text-[11px] text-muted-foreground">
              Max 50 units per inquiry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="w-10 text-center font-bold text-sm text-foreground">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 50}
              className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Estimated Subtotal ─────────────────────────────────────────── */}
      {isPurchasable && (
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-muted-foreground font-medium">
            Estimated Subtotal:
          </span>
          <span className="font-bold text-sm text-foreground">
            {formatVND(subtotal)}
          </span>
        </div>
      )}

      {/* ─── Primary Consultation / Purchase CTA ───────────────────────── */}
      <div className="space-y-3">
        {isPurchasable ? (
          <Button
            size="lg"
            onClick={() => setShowInquiryModal(true)}
            className="w-full gap-2 text-sm font-semibold h-12 shadow-md cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            {product.fulfillmentMode === "supplier_order"
              ? "Inquire to Order Hardware"
              : "Submit Purchase Inquiry"}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowInquiryModal(true)}
            className="w-full gap-2 text-sm font-semibold h-12 cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            Inquire for Restock or Alternatives
          </Button>
        )}

        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed space-y-1">
          <p className="font-semibold text-foreground">
            Notice on Manual Order Confirmation:
          </p>
          <p>
            Submitting a purchase inquiry does not reserve inventory or constitute an immediate credit charge. OpenIdear hardware engineers confirm component compatibility and final delivery terms directly with you before finalizing orders.
          </p>
        </div>
      </div>

      {/* ─── Trust Factors ─────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-border/60 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>100% genuine hardware from verified distributor channels</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PhoneCall className="h-4 w-4 text-primary shrink-0" />
          <span>Direct engineering assistance for PC build compatibility</span>
        </div>
      </div>

      {/* ─── Inquiry Modal ─────────────────────────────────────────────── */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* ── Confirmation View ── */}
            {confirmation ? (
              <div className="py-4 space-y-5">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">
                    Purchase Inquiry Received!
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-foreground">{confirmation.customer.name}</strong>. Your hardware inquiry has been registered in our system.
                  </p>
                </div>

                {/* Order Reference Box */}
                <div className="p-4 rounded-xl bg-accent/50 border border-border space-y-2 text-center">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Order Reference
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-foreground tracking-wide">
                      {confirmation.orderReference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyReference(confirmation.orderReference)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-card cursor-pointer transition-colors"
                      title="Copy Reference"
                    >
                      {hasCopiedRef ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Item Summary */}
                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3">
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {confirmation.items[0]?.name}
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        SKU: {confirmation.items[0]?.sku}
                      </p>
                      <p className="text-muted-foreground">
                        Quantity: <strong>{confirmation.items[0]?.quantity}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">
                        {formatVND(confirmation.subtotal)}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                        {confirmation.items[0]?.fulfillmentMode === "supplier_order"
                          ? "Supplier Order"
                          : "Stock Item"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground space-y-0.5">
                    <p>
                      Contact registered: <strong className="text-foreground">{confirmation.customer.contactMethod}</strong>
                    </p>
                    {confirmation.customer.deliveryArea && (
                      <p>
                        Delivery area: <strong className="text-foreground">{confirmation.customer.deliveryArea}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Steps Notice */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>What happens next?</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Our team reviews current inventory and component compatibility.</li>
                    <li>We contact you directly via <strong>{confirmation.customer.contactMethod}</strong> to confirm pricing, shipping options, and timing.</li>
                    <li>No payment has been processed and inventory is not formally reserved until confirmed.</li>
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleCloseModal}
                    className="w-full cursor-pointer font-semibold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Inquiry Form ── */
              <>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground">
                    Purchase Inquiry: {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Submit your request for manual review. Our engineering staff will inspect stock, verify compatibility, and reach out to you.
                  </p>
                </div>

                {attribution?.articleSlug && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                    <Sparkles size={12} />
                    <span>
                      Inquiring via article recommendation:{" "}
                      <strong className="font-mono text-[11px]">{attribution.articleSlug}</strong>
                    </span>
                  </div>
                )}

                {/* Selected Item & Subtotal Card */}
                <div className="p-3 rounded-xl bg-accent/40 border border-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">
                      {product.name}
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      {quantity} unit(s) × {formatVND(product.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Subtotal
                    </span>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatVND(subtotal)}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nguyen Van A"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Contact Method (Email or Phone Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0901234567 or user@example.com"
                      value={inquiryContact}
                      onChange={(e) => setInquiryContact(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      We will contact you via this channel to confirm availability and logistics.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Delivery Area / City (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Quan 1, TP. Ho Chi Minh or Cau Giay, Ha Noi"
                      value={inquiryArea}
                      onChange={(e) => setInquiryArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Technical Questions or Build Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Verifying compatibility with Lian Li O11 Dynamic EVO case..."
                      value={inquiryNote}
                      onChange={(e) => setInquiryNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting}
                      className="gap-1.5 cursor-pointer font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
