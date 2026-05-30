'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ShoppingCart, Trash2, CreditCard, ArrowLeft, Shield,
    CheckCircle, Loader2, Tag, ChevronRight, Sparkles, Lock
} from 'lucide-react';
import cartStore, { CartItem } from '@/store/CartStore';
import { paymentApi } from '@/features/series/api/payment.api';
import authenticationStore from '@/store/AuthenticationStore';
import { toast } from 'sonner';

type PaymentGateway = 'demo' | 'stripe' | 'vnpay' | 'momo';

const GATEWAYS: { id: PaymentGateway; label: string; desc: string; available: boolean }[] = [
    { id: 'demo', label: 'Demo Payment', desc: 'Thanh toán thử nghiệm (miễn phí)', available: true },
    { id: 'stripe', label: 'Stripe', desc: 'Visa, Mastercard, Apple Pay', available: false },
    { id: 'vnpay', label: 'VNPay', desc: 'Ngân hàng nội địa, QR Code', available: false },
    { id: 'momo', label: 'MoMo', desc: 'Ví điện tử MoMo', available: false },
];

// ─── Cart Item Row ──────────────────────────────────────────────────────────

const CartItemRow = ({ item, onRemove, isRemoving }: {
    item: CartItem;
    onRemove: (id: string) => void;
    isRemoving: boolean;
}) => {
    const effectivePrice = (item.discountPrice && item.discountPrice > 0)
        ? item.discountPrice : item.price;

    return (
        <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0 group">
            {/* Thumbnail */}
            <div className="w-28 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.thumbnail?.url ? (
                    <img src={item.thumbnail.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart size={20} />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/courses/${item.slug}`}
                    className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 hover:text-[var(--color-admin-primary)] transition-colors"
                >
                    {item.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                    {item.instructor?.name || 'Giảng viên'}
                </p>
            </div>

            {/* Price + Remove */}
            <div className="flex flex-col items-end justify-between flex-shrink-0">
                <div className="text-right">
                    <div className="font-bold text-gray-900">
                        {effectivePrice === 0 ? 'Miễn phí' : `₫${effectivePrice.toLocaleString()}`}
                    </div>
                    {item.discountPrice && item.discountPrice > 0 && item.price > item.discountPrice && (
                        <div className="text-xs text-gray-400 line-through">₫{item.price.toLocaleString()}</div>
                    )}
                </div>
                <button
                    onClick={() => onRemove(item._id)}
                    disabled={isRemoving}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Xóa khỏi giỏ hàng"
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
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto relative">
                        <CheckCircle size={48} className="text-emerald-500" />
                        <div className="absolute -top-2 -right-2">
                            <Sparkles size={24} className="text-amber-400 animate-pulse" />
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Thanh toán thành công!</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Các khóa học đã được thêm vào danh sách học tập của bạn. Bắt đầu học ngay!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => router.push('/my-learning')}
                        className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        Đi tới Học tập <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => router.push('/courses')}
                        className="border border-gray-300 text-gray-700 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Tiếp tục khám phá
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Empty Cart ─────────────────────────────────────────────────────────────

const EmptyCart = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart size={36} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
            Hãy khám phá các khóa học và thêm vào giỏ hàng để bắt đầu hành trình học tập.
        </p>
        <Link
            href="/courses"
            className="bg-[var(--color-admin-primary)] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            Khám phá khóa học
        </Link>
    </div>
);

// ─── Skeleton ───────────────────────────────────────────────────────────────

const CartSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 py-5 border-b border-gray-100">
                <div className="w-28 h-16 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
        ))}
    </div>
);

// ─── Main Checkout Page ─────────────────────────────────────────────────────

const CheckoutPage = () => {
    const router = useRouter();
    const { items, isLoading, fetchCart, removeFromCart, clearLocalCart } = cartStore();
    const currentUser = authenticationStore(state => state.currentUser);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('demo');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?._id) {
            return;
        }
        fetchCart();
    }, [currentUser?._id]);

    const handleRemove = async (courseId: string) => {
        setRemovingId(courseId);
        const result = await removeFromCart(courseId);
        if (result.success) {
            toast.info('Đã xóa khỏi giỏ hàng');
        } else {
            toast.error(result.message || 'Không thể xóa');
        }
        setRemovingId(null);
    };

    const handlePayment = async () => {
        if (items.length === 0) return;
        setIsProcessing(true);

        try {
            // Step 1: Create checkout
            const checkoutRes = await paymentApi.createCheckout();
            if (!checkoutRes.success) {
                toast.error(checkoutRes.message || 'Không thể tạo đơn thanh toán');
                setIsProcessing(false);
                return;
            }

            const paymentId = checkoutRes.data?.data?._id;
            if (!paymentId) {
                toast.error('Lỗi hệ thống: không tìm thấy mã thanh toán');
                setIsProcessing(false);
                return;
            }

            // Step 2: Process demo payment
            const payRes = await paymentApi.processDemoPayment(paymentId);
            if (payRes.success) {
                clearLocalCart();
                setPaymentSuccess(true);
            } else {
                toast.error(payRes.message || 'Thanh toán thất bại');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Đã xảy ra lỗi trong quá trình thanh toán');
        } finally {
            setIsProcessing(false);
        }
    };

    // Payment success view
    if (paymentSuccess) {
        return <PaymentSuccess />;
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
                <Lock size={48} className="text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
                <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem giỏ hàng và thanh toán.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Thanh toán</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShoppingCart size={16} />
                        <span>{items.length} khóa học</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2"><CartSkeleton /></div>
                        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="font-bold text-lg text-gray-900 mb-4">
                                    Giỏ hàng ({items.length} khóa học)
                                </h2>
                                {items.map(item => (
                                    <CartItemRow
                                        key={item._id}
                                        item={item}
                                        onRemove={handleRemove}
                                        isRemoving={removingId === item._id}
                                    />
                                ))}
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
                                <h2 className="font-bold text-lg text-gray-900 mb-4">
                                    Phương thức thanh toán
                                </h2>
                                <div className="space-y-3">
                                    {GATEWAYS.map(gw => (
                                        <label
                                            key={gw.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                !gw.available
                                                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    : selectedGateway === gw.id
                                                        ? 'border-[var(--color-admin-primary)] bg-indigo-50/50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gateway"
                                                value={gw.id}
                                                checked={selectedGateway === gw.id}
                                                onChange={() => gw.available && setSelectedGateway(gw.id)}
                                                disabled={!gw.available}
                                                className="w-4 h-4 text-[var(--color-admin-primary)] focus:ring-[var(--color-admin-primary)]"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">{gw.label}</span>
                                                    {!gw.available && (
                                                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                                            Sắp ra mắt
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{gw.desc}</p>
                                            </div>
                                            {gw.id === 'demo' && (
                                                <CreditCard size={20} className="text-[var(--color-admin-primary)]" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
                                <h2 className="font-bold text-lg text-gray-900 mb-5">Tổng quan đơn hàng</h2>

                                <div className="space-y-3 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="text-gray-900">₫{subtotal.toLocaleString()}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-600 flex items-center gap-1">
                                                <Tag size={14} /> Giảm giá:
                                            </span>
                                            <span className="text-emerald-600 font-medium">
                                                -₫{totalDiscount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                                        <span className="font-bold text-gray-900">Tổng cộng:</span>
                                        <span className="font-extrabold text-xl text-gray-900">
                                            {finalTotal === 0 ? 'Miễn phí' : `₫${finalTotal.toLocaleString()}`}
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
                                            <Loader2 size={20} className="animate-spin" /> Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} /> Thanh toán ngay
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                                    <Shield size={14} />
                                    <span>Giao dịch được bảo mật & mã hóa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
