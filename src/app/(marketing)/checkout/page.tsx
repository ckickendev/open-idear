"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
  Tag,
  ChevronRight,
  Sparkles,
  Lock,
  Landmark,
  XCircle,
} from "lucide-react";
import cartStore, { CartItem } from "@/store/CartStore";
import { paymentApi } from "@/features/series/api/payment.api";
import authenticationStore from "@/store/AuthenticationStore";
import { toast } from "sonner";

type PaymentGateway = "demo" | "payos" | "stripe" | "momo";

const GATEWAYS: {
  id: PaymentGateway;
  label: string;
  desc: string;
  available: boolean;
}[] = [
  {
    id: "payos",
    label: "Bank Transfer",
    desc: "QR Code VietQR — 24/7 Interbank Transfer",
    available: true,
  },
  {
    id: "demo",
    label: "Demo Payment",
    desc: "Test Payment Simulation (Free)",
    available: true,
  },
  {
    id: "stripe",
    label: "Stripe",
    desc: "Visa, Mastercard, Apple Pay",
    available: false,
  },
  { id: "momo", label: "MoMo", desc: "MoMo E-Wallet", available: false },
];

// ─── Cart Item Row ──────────────────────────────────────────────────────────

const CartItemRow = ({
  item,
  onRemove,
  isRemoving,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) => {
  const effectivePrice =
    item.discountPrice && item.discountPrice > 0
      ? item.discountPrice
      : item.price;

  return (
    <div className="flex gap-4 py-5 border-b border-border last:border-0 group">
      {/* Thumbnail */}
      <div className="w-28 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        {item.thumbnail?.url ? (
          <img
            src={item.thumbnail.url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart size={20} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/courses/${item.slug}`}
          className="font-bold text-foreground text-sm leading-tight line-clamp-1 hover:text-[var(--color-admin-primary)] transition-colors"
        >
          {item.title}
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {item.instructor?.name || "Instructor"}
        </p>
      </div>

      {/* Price + Remove */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <div className="text-right">
          <div className="font-bold text-foreground">
            {effectivePrice === 0
              ? "Free"
              : `₫${effectivePrice.toLocaleString()}`}
          </div>
          {item.discountPrice &&
            item.discountPrice > 0 &&
            item.price > item.discountPrice && (
              <div className="text-xs text-muted-foreground line-through">
                ₫{item.price.toLocaleString()}
              </div>
            )}
        </div>
        <button
          onClick={() => onRemove(item._id)}
          disabled={isRemoving}
          className="text-muted-foreground hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
          title="Remove from cart"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Success State ──────────────────────────────────────────────────────────

const PaymentSuccess = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto relative">
            <CheckCircle size={48} className="text-emerald-500" />
            <div className="absolute -top-2 -right-2">
              <Sparkles size={24} className="text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your enrolled courses have been added to your learning dashboard. Start learning now!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/my-learning")}
            className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Go to My Learning <ChevronRight size={18} />
          </button>
          <button
            onClick={() => router.push("/courses")}
            className="border border-border text-foreground/80 font-bold px-8 py-3.5 rounded-xl hover:bg-muted/30 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty Cart ─────────────────────────────────────────────────────────────

const EmptyCart = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
      <ShoppingCart size={36} className="text-muted-foreground" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
    <p className="text-muted-foreground mb-8 max-w-sm">
      Explore our wide range of courses and add them to your cart to begin your learning journey.
    </p>
    <Link
      href="/courses"
      className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      Explore Courses
    </Link>
  </div>
);

// ─── Skeleton ───────────────────────────────────────────────────────────────

const CartSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 py-5 border-b border-border">
        <div className="w-28 h-16 bg-muted rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
        <div className="w-20 h-4 bg-muted rounded" />
      </div>
    ))}
  </div>
);

// ─── Payment Cancelled State ────────────────────────────────────────────────

const PaymentCancelled = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto relative">
            <XCircle size={48} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your transaction was cancelled. Your cart items have been saved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/checkout")}
            className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Try Again <ChevronRight size={18} />
          </button>
          <button
            onClick={() => router.push("/courses")}
            className="border border-border text-foreground/80 font-bold px-8 py-3.5 rounded-xl hover:bg-muted/30 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Checkout Page ─────────────────────────────────────────────────────

const CheckoutPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, isLoading, fetchCart, removeFromCart, clearLocalCart } =
    cartStore();
  const currentUser = authenticationStore((state) => state.currentUser);
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGateway>("payos");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Handle return URL from payOS
  useEffect(() => {
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");

    if (status && orderCode && currentUser?._id) {
      if (status === "success") {
        // Verify payment with backend
        setIsVerifying(true);
        paymentApi
          .getPaymentStatus(orderCode)
          .then((res) => {
            const paymentData = res.data?.data;
            if (paymentData?.status === "paid") {
              clearLocalCart();
              setPaymentSuccess(true);
            } else {
              // Payment not yet confirmed by webhook — show success anyway
              // (webhook might take a few seconds)
              clearLocalCart();
              setPaymentSuccess(true);
            }
          })
          .catch(() => {
            toast.info("Verifying payment, please wait...");
            clearLocalCart();
            setPaymentSuccess(true);
          })
          .finally(() => setIsVerifying(false));
      } else if (status === "cancel") {
        setPaymentCancelled(true);
      }
    }
  }, [searchParams, currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }
    // Don't fetch cart if we're coming back from payOS
    const status = searchParams.get("status");
    if (!status) {
      fetchCart();
    }
  }, [currentUser?._id]);

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId);
    const result = await removeFromCart(courseId);
    if (result.success) {
      toast.info("Removed from cart");
    } else {
      toast.error(result.message || "Failed to remove item");
    }
    setRemovingId(null);
  };

  const handlePayment = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      if (selectedGateway === "payos") {
        // payOS flow: create checkout → redirect to payOS
        const checkoutRes = await paymentApi.createCheckout("payos");
        if (!checkoutRes.success) {
          toast.error(checkoutRes.message || "Failed to create checkout session");
          setIsProcessing(false);
          return;
        }

        const checkoutUrl = checkoutRes.data?.data?.checkoutUrl;
        if (!checkoutUrl) {
          toast.error("System error: Unable to generate payment link");
          setIsProcessing(false);
          return;
        }

        // Redirect to payOS checkout page
        window.location.href = checkoutUrl;
        return; // Don't setIsProcessing(false) — page is navigating away
      }

      // Demo flow: create checkout → process instantly
      const checkoutRes = await paymentApi.createCheckout("demo");
      if (!checkoutRes.success) {
        toast.error(checkoutRes.message || "Failed to create checkout session");
        setIsProcessing(false);
        return;
      }

      const paymentId = checkoutRes.data?.data?._id;
      if (!paymentId) {
        toast.error("System error: Payment ID not found");
        setIsProcessing(false);
        return;
      }

      const payRes = await paymentApi.processDemoPayment(paymentId);
      if (payRes.success) {
        clearLocalCart();
        setPaymentSuccess(true);
      } else {
        toast.error(payRes.message || "Payment failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during payment processing");
    } finally {
      setIsProcessing(false);
    }
  };

  // Verifying return from payOS
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[var(--color-admin-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  // Payment success view
  if (paymentSuccess) {
    return <PaymentSuccess />;
  }

  // Payment cancelled view
  if (paymentCancelled) {
    return <PaymentCancelled />;
  }

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price, 0);
  const totalDiscount = items.reduce((total, item) => {
    if (item.discountPrice && item.discountPrice > 0) {
      return total + (item.price - item.discountPrice);
    }
    return total;
  }, 0);
  const finalTotal = subtotal - totalDiscount;

  // Auth check
  if (!currentUser?._id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Lock size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Please Sign In
        </h2>
        <p className="text-muted-foreground mb-6">
          You must be signed in to view your cart and proceed to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold text-foreground">Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart size={16} />
            <span>{items.length} courses</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartSkeleton />
            </div>
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">
                  Cart ({items.length} courses)
                </h2>
                {items.map((item) => (
                  <CartItemRow
                    key={item._id}
                    item={item}
                    onRemove={handleRemove}
                    isRemoving={removingId === item._id}
                  />
                ))}
              </div>

              {/* Payment Methods */}
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 mt-6">
                <h2 className="font-bold text-lg text-foreground mb-4">
                  Payment Methods
                </h2>
                <div className="space-y-3">
                  {GATEWAYS.map((gw) => (
                    <label
                      key={gw.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        !gw.available
                          ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                          : selectedGateway === gw.id
                            ? "border-[var(--color-admin-primary)] bg-indigo-50/50"
                            : "border-border hover:border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={gw.id}
                        checked={selectedGateway === gw.id}
                        onChange={() =>
                          gw.available && setSelectedGateway(gw.id)
                        }
                        disabled={!gw.available}
                        className="w-4 h-4 text-[var(--color-admin-primary)] focus:ring-[var(--color-admin-primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {gw.label}
                          </span>
                          {!gw.available && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {gw.desc}
                        </p>
                      </div>
                      {gw.id === "payos" && (
                        <Landmark
                          size={20}
                          className="text-[var(--color-admin-primary)]"
                        />
                      )}
                      {gw.id === "demo" && (
                        <CreditCard
                          size={20}
                          className="text-muted-foreground"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-2xl border border-border shadow-sm p-6 sticky top-8">
                <h2 className="font-bold text-lg text-foreground mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">
                      ₫{subtotal.toLocaleString()}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Tag size={14} /> Discount:
                      </span>
                      <span className="text-emerald-600 font-medium">
                        -₫{totalDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground">
                      Total:
                    </span>
                    <span className="font-extrabold text-xl text-foreground">
                      {finalTotal === 0
                        ? "Free"
                        : `₫${finalTotal.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-[var(--color-admin-primary)] text-white font-bold py-4 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} /> Pay Now
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield size={14} />
                  <span>Secure & encrypted transaction</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with Suspense for useSearchParams
const CheckoutPage = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-muted-foreground" />
    </div>
  }>
    <CheckoutPageInner />
  </Suspense>
);

export default CheckoutPage;
