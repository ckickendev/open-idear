"use client";

// =============================================================================
//  OPENIDEAR SHOP — ADMIN ORDER & INQUIRY MANAGEMENT (SPRINT S3)
//  src/features/shop/components/admin/OrderManagement.tsx
// =============================================================================

import React, { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  Eye,
  Clock,
  PhoneCall,
  MapPin,
  FileText,
  Save,
  ArrowRight,
  Package,
  Box,
  RotateCcw,
  AlertCircle,
  Check,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { shopAdminApi } from "../../api/shopAdmin.api";
import type {
  ShopOrder,
  ShopOrderStatus,
} from "../../types/shop.types";
import { formatVND } from "../../utils/formatters";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminPagination from "@/components/admin/AdminPagination";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { Button } from "@/components/ui/button";

const ALLOWED_NEXT_STATUSES: Record<ShopOrderStatus, ShopOrderStatus[]> = {
  inquiry_received: ["contacted", "cancelled"],
  contacted: ["awaiting_customer_confirmation", "cancelled"],
  awaiting_customer_confirmation: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
};

const STATUS_CONFIG: Record<
  ShopOrderStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  inquiry_received: {
    label: "Inquiry Received",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    dotClass: "bg-sky-500",
  },
  contacted: {
    label: "Customer Contacted",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  awaiting_customer_confirmation: {
    label: "Awaiting Confirmation",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  confirmed: {
    label: "Order Confirmed",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    dotClass: "bg-teal-500",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Inspection Drawer
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [statusTransitionNote, setStatusTransitionNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await shopAdminApi.getOrders({
        page,
        limit: 15,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });

      if (res.data) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch shop orders:", err);
      toast.error("Failed to load customer inquiries");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = (order: ShopOrder) => {
    setSelectedOrder(order);
    setAdminNoteInput(order.adminNote || "");
    setStatusTransitionNote("");
  };

  const handleSaveAdminNote = async () => {
    if (!selectedOrder) return;
    setIsSavingNote(true);
    try {
      const res = await shopAdminApi.updateOrderAdminNote(
        selectedOrder._id,
        adminNoteInput
      );
      if (res.data) {
        setSelectedOrder(res.data);
        setOrders((prev) =>
          prev.map((o) => (o._id === res.data._id ? res.data : o))
        );
        toast.success("Admin note updated successfully");
      }
    } catch (err: unknown) {
      console.error("Failed to update admin note:", err);
      toast.error("Failed to save admin note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ShopOrderStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await shopAdminApi.updateOrderStatus(
        selectedOrder._id,
        newStatus,
        statusTransitionNote.trim() || undefined
      );
      if (res.data) {
        setSelectedOrder(res.data);
        setOrders((prev) =>
          prev.map((o) => (o._id === res.data._id ? res.data : o))
        );
        setStatusTransitionNote("");
        toast.success(`Order status updated to '${STATUS_CONFIG[newStatus].label}'`);
      }
    } catch (err: unknown) {
      console.error("Failed to update order status:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update order status";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ─── Sprint S4: Operational Expiration Scanner ─────────────────────────────
  const [isReleasingExpired, setIsReleasingExpired] = useState(false);
  const handleReleaseExpired = async () => {
    setIsReleasingExpired(true);
    try {
      const res = await shopAdminApi.releaseExpiredReservations();
      if (res.data) {
        toast.success(`Processed reservations: released ${res.data.count} expired orders`);
        fetchOrders();
      }
    } catch (err: unknown) {
      console.error("Failed to release expired reservations:", err);
      toast.error("Failed to process expired reservations");
    } finally {
      setIsReleasingExpired(false);
    }
  };

  // ─── Sprint S4: Supplier Item Verification Modal State ─────────────────────
  const [verifyingItemIdx, setVerifyingItemIdx] = useState<number | null>(null);
  const [supplierLeadTime, setSupplierLeadTime] = useState<number>(3);
  const [supplierCost, setSupplierCost] = useState<string>("");
  const [supplierNotes, setSupplierNotes] = useState<string>("");
  const [isSubmittingSupplierVerify, setIsSubmittingSupplierVerify] = useState(false);

  const handleOpenSupplierVerification = (idx: number) => {
    if (!selectedOrder) return;
    const item = selectedOrder.items[idx];
    setVerifyingItemIdx(idx);
    setSupplierLeadTime(item?.supplierVerification?.confirmedLeadTimeDays || 3);
    setSupplierCost(
      item?.supplierVerification?.supplierCostPrice !== undefined &&
        item?.supplierVerification?.supplierCostPrice !== null
        ? String(item.supplierVerification.supplierCostPrice)
        : ""
    );
    setSupplierNotes(item?.supplierVerification?.notes || "");
  };

  const handleVerifySupplierSubmit = async () => {
    if (!selectedOrder || verifyingItemIdx === null) return;
    setIsSubmittingSupplierVerify(true);
    try {
      const res = await shopAdminApi.verifySupplierItem(
        selectedOrder._id,
        verifyingItemIdx,
        {
          verified: true,
          confirmedLeadTimeDays: Number(supplierLeadTime) || 3,
          supplierCostPrice: supplierCost ? Number(supplierCost) : null,
          notes: supplierNotes.trim(),
        }
      );
      if (res.data) {
        setSelectedOrder(res.data);
        setOrders((prev) =>
          prev.map((o) => (o._id === res.data._id ? res.data : o))
        );
        setVerifyingItemIdx(null);
        toast.success("Supplier verification recorded successfully");
      }
    } catch (err: unknown) {
      console.error("Failed to record supplier verification:", err);
      toast.error("Failed to record supplier verification");
    } finally {
      setIsSubmittingSupplierVerify(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Controls ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span>Customer Inquiries & Manual Orders</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect purchase requests, verify stock and distributor lead-time, and manage customer communications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isReleasingExpired}
            onClick={handleReleaseExpired}
            className="gap-1.5 h-9 text-xs cursor-pointer text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            title="Scan and release 72h expired inventory reservations"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Release Expired Reservations</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="gap-1.5 h-9 text-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ─── Search & Status Filters ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="w-full sm:w-80">
          <AdminSearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            placeholder="Search by reference, customer name, contact..."
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses ({totalItems})</option>
            <option value="inquiry_received">Inquiry Received</option>
            <option value="contacted">Customer Contacted</option>
            <option value="awaiting_customer_confirmation">Awaiting Confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ─── Orders Table ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No inquiries found"
            description={
              searchTerm || selectedStatus !== "all"
                ? "No purchase requests match your search or filter parameters."
                : "No customer inquiries have been submitted through the public storefront yet."
            }
            icon={ShoppingBag}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/40 border-b border-border font-semibold text-foreground">
                <tr>
                  <th className="py-3 px-4">Order Ref / Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Requested Item(s)</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Estimated Subtotal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.inquiry_received;
                  const firstItem = order.items[0];

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-foreground block text-xs">
                          {order.orderReference}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground block">
                          {order.customer.name}
                        </span>
                        <span className="text-[11px] block">
                          {order.customer.contactMethod}
                        </span>
                        {order.customer.deliveryArea && (
                          <span className="text-[10px] text-muted-foreground/80 truncate block max-w-[150px]">
                            {order.customer.deliveryArea}
                          </span>
                        )}
                      </td>

                      {/* Item Preview */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-foreground block truncate max-w-[200px]">
                          {firstItem?.name}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          SKU: {firstItem?.sku} × {firstItem?.quantity}
                        </span>
                      </td>

                      {/* Fulfillment */}
                      <td className="py-3.5 px-4">
                        {firstItem?.fulfillmentMode === "supplier_order" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                            <Package className="h-3 w-3" />
                            Supplier Order
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <Box className="h-3 w-3" />
                            Stock Item
                          </span>
                        )}
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatVND(order.subtotal)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(order)}
                          className="gap-1 text-xs h-8 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination ──────────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-border">
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ─── Order Detail Inspection Modal ──────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-extrabold text-foreground">
                    {selectedOrder.orderReference}
                  </span>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedOrder.status];
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted on {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ─── Inventory Reservation Status Alert ───────────────────── */}
            {selectedOrder.inventoryReserved && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">Inventory Reserved: Stock safely locked for this order</span>
                </div>
                {selectedOrder.reservationExpiresAt && (
                  <span className="text-[11px] opacity-80">
                    Expires: {new Date(selectedOrder.reservationExpiresAt).toLocaleString("vi-VN")}
                  </span>
                )}
              </div>
            )}
            {selectedOrder.inventoryFulfilled && (
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0" />
                <span className="font-semibold">Inventory Fulfilled: Physical stock permanently decremented from inventory</span>
              </div>
            )}
            {selectedOrder.status === "cancelled" && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Order Cancelled: Any reserved stock has been released back to available inventory.</span>
              </div>
            )}

            {/* Customer Contact Box */}
            <div className="p-4 rounded-xl bg-accent/40 border border-border/80 space-y-2 text-xs">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-primary" />
                Customer Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <strong className="text-foreground">{selectedOrder.customer.name}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact: </span>
                  <strong className="text-foreground">{selectedOrder.customer.contactMethod}</strong>
                </div>
                {selectedOrder.customer.deliveryArea && (
                  <div className="sm:col-span-2 flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>Delivery area: <strong className="text-foreground">{selectedOrder.customer.deliveryArea}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Item Snapshot */}
            <div className="space-y-3">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                Snapshot of Requested Hardware
              </span>
              <div className="rounded-xl border border-border divide-y divide-border/60 bg-card overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <div className="relative h-12 w-12 rounded-lg border border-border bg-muted/40 overflow-hidden shrink-0">
                            <Image
                              src={item.thumbnail}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg border border-border bg-muted/40 flex items-center justify-center shrink-0 text-muted-foreground">
                            <Box className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-snug">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground font-mono text-[11px]">
                            SKU: {item.sku}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] font-medium text-muted-foreground">
                            {item.fulfillmentMode === "supplier_order"
                              ? "Supplier Order"
                              : "Physical Stock"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-mono text-muted-foreground">
                          {item.quantity} × {formatVND(item.unitPrice)}
                        </p>
                        <p className="font-bold text-foreground text-sm">
                          {formatVND(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Supplier Order Verification Section */}
                    {item.fulfillmentMode === "supplier_order" && (
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                        {item.supplierVerification?.verified ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <Check className="h-3.5 w-3.5" />
                            <span>
                              Supplier Verified (Lead time: {item.supplierVerification.confirmedLeadTimeDays || 3} days)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Supplier Verification Required
                            </span>
                            {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleOpenSupplierVerification(idx)}
                                className="h-6 px-2 text-[11px] cursor-pointer"
                              >
                                Verify with Supplier
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-3 bg-muted/30 flex justify-between items-center text-xs px-4">
                  <span className="font-semibold text-muted-foreground">Total Calculated Subtotal</span>
                  <span className="font-extrabold text-foreground text-base">
                    {formatVND(selectedOrder.subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Note (if present) */}
            {selectedOrder.customerNote && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Customer Inquiry Note:
                </span>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line pl-5">
                  {selectedOrder.customerNote}
                </p>
              </div>
            )}

            {/* Status Transition Control */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider block">
                Update Order Lifecycle Status
              </span>

              {ALLOWED_NEXT_STATUSES[selectedOrder.status]?.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-2">
                    {ALLOWED_NEXT_STATUSES[selectedOrder.status].map((nextSt) => (
                      <Button
                        key={nextSt}
                        size="sm"
                        variant={nextSt === "cancelled" ? "destructive" : "default"}
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus(nextSt)}
                        className="gap-1.5 text-xs cursor-pointer"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Move to: {STATUS_CONFIG[nextSt].label}</span>
                      </Button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Optional transition note for audit history (e.g. Phone confirmed with customer)..."
                    value={statusTransitionNote}
                    onChange={(e) => setStatusTransitionNote(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  This order is in a terminal state ({STATUS_CONFIG[selectedOrder.status]?.label}). No further status transitions allowed.
                </p>
              )}
            </div>

            {/* Internal Admin Note */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Internal Staff Note (Confidential)
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSavingNote}
                  onClick={handleSaveAdminNote}
                  className="gap-1.5 h-7 text-xs cursor-pointer"
                >
                  <Save className="h-3 w-3" />
                  <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                </Button>
              </div>

              <textarea
                rows={3}
                placeholder="Log internal notes, supplier confirmation dates, or shipping estimates here..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
              />
            </div>

            {/* Status Audit History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider block">
                  Status Change Timeline
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.statusHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 text-[11px]"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">
                          {STATUS_CONFIG[hist.status]?.label || hist.status}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          on {new Date(hist.changedAt).toLocaleString("vi-VN")}
                        </span>
                        {hist.note && (
                          <p className="text-muted-foreground/90 mt-0.5">
                            Note: {hist.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Supplier Verification Dialog ──────────────────────────────── */}
      {verifyingItemIdx !== null && selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setVerifyingItemIdx(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl z-20 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Verify Supplier Availability</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Item: {selectedOrder.items[verifyingItemIdx]?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingItemIdx(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Confirmed Supplier Lead Time (Days) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={supplierLeadTime}
                  onChange={(e) =>
                    setSupplierLeadTime(
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Verified Supplier Cost Price (VND)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 12000000"
                  value={supplierCost}
                  onChange={(e) => setSupplierCost(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Confidential internal cost for profit calculations. Never displayed to customers.
                </span>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Supplier Notes / Confirmation Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Confirmed with Synnex FPT distributor via phone, batch arrives Friday..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVerifyingItemIdx(null)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSubmittingSupplierVerify}
                onClick={handleVerifySupplierSubmit}
                className="text-xs cursor-pointer gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>
                  {isSubmittingSupplierVerify
                    ? "Saving..."
                    : "Record Verification"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
