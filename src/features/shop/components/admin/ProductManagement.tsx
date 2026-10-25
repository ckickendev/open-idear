"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  CheckCircle,
  Truck,
  Box,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { shopAdminApi } from "../../api/shopAdmin.api";
import type {
  ShopProduct,
  ShopCategory,
  ShopProductSpecification,
  ShopProductImage,
  FulfillmentMode,
  AvailabilityStatus,
  PublicationStatus,
} from "../../types/shop.types";
import { formatVND } from "../../utils/formatters";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminPagination from "@/components/admin/AdminPagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { MediaLibraryModal } from "@/features/media-library";
import type { MediaAsset } from "@/features/media-library";

export default function ProductManagement() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFulfillment, setSelectedFulfillment] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Actions
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<ShopProduct | null>(null);
  const [newStockQuantity, setNewStockQuantity] = useState(0);

  // Product Form State
  const [formState, setFormState] = useState<{
    name: string;
    slug: string;
    sku: string;
    category: string;
    summary: string;
    description: string;
    sellingPrice: number;
    originalPrice: number | null;
    fulfillmentMode: FulfillmentMode;
    availabilityStatus: AvailabilityStatus;
    stockQuantity: number;
    status: PublicationStatus;
    supplierName: string;
    supplierSku: string;
    supplierCostPrice: number | null;
    supplierLeadTime: number;
    specifications: ShopProductSpecification[];
    images: ShopProductImage[];
  }>({
    name: "",
    slug: "",
    sku: "",
    category: "",
    summary: "",
    description: "",
    sellingPrice: 0,
    originalPrice: null,
    fulfillmentMode: "stock",
    availabilityStatus: "in_stock",
    stockQuantity: 0,
    status: "draft",
    supplierName: "",
    supplierSku: "",
    supplierCostPrice: null,
    supplierLeadTime: 3,
    specifications: [],
    images: [],
  });

  // Fetch Categories for Dropdowns
  const loadCategories = async () => {
    try {
      const res = await shopAdminApi.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Fetch Products
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await shopAdminApi.getProducts({
        page,
        limit: 15,
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        fulfillmentMode: selectedFulfillment !== "all" ? selectedFulfillment : undefined,
      });

      if (res.success && res.data) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      } else {
        toast.error(res.message || "Failed to load products");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedCategory, selectedStatus, selectedFulfillment]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedProduct(null);
    const defaultCat = categories.length > 0 ? categories[0]._id : "";
    setFormState({
      name: "",
      slug: "",
      sku: "",
      category: defaultCat,
      summary: "",
      description: "",
      sellingPrice: 0,
      originalPrice: null,
      fulfillmentMode: "stock",
      availabilityStatus: "in_stock",
      stockQuantity: 1,
      status: "draft",
      supplierName: "",
      supplierSku: "",
      supplierCostPrice: null,
      supplierLeadTime: 3,
      specifications: [
        { group: "General", name: "Brand", value: "" },
        { group: "General", name: "Model", value: "" },
      ],
      images: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod: ShopProduct) => {
    setModalMode("edit");
    setSelectedProduct(prod);
    const catId = typeof prod.category === "object" ? prod.category._id : prod.category;

    setFormState({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      category: catId,
      summary: prod.summary || "",
      description: prod.description || "",
      sellingPrice: prod.sellingPrice,
      originalPrice: prod.originalPrice || null,
      fulfillmentMode: prod.fulfillmentMode,
      availabilityStatus: prod.availabilityStatus,
      stockQuantity: prod.stockQuantity,
      status: prod.status,
      supplierName: prod.supplierInfo?.name || "",
      supplierSku: prod.supplierInfo?.sku || "",
      supplierCostPrice: prod.supplierInfo?.costPrice || null,
      supplierLeadTime: prod.supplierInfo?.leadTimeDays || 3,
      specifications: prod.specifications && prod.specifications.length > 0
        ? [...prod.specifications]
        : [{ group: "General", name: "Brand", value: "" }],
      images: prod.images ? [...prod.images] : [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return toast.error("Product name is required");
    if (!formState.sku.trim()) return toast.error("Product SKU is required");
    if (!formState.category) return toast.error("Category is required");
    if (formState.sellingPrice < 0) return toast.error("Selling price cannot be negative");

    try {
      setIsSubmitting(true);
      const payload: Partial<ShopProduct> = {
        name: formState.name.trim(),
        slug: formState.slug.trim() || undefined,
        sku: formState.sku.trim().toUpperCase(),
        category: formState.category,
        summary: formState.summary.trim(),
        description: formState.description.trim(),
        sellingPrice: Number(formState.sellingPrice),
        originalPrice: formState.originalPrice ? Number(formState.originalPrice) : null,
        fulfillmentMode: formState.fulfillmentMode,
        availabilityStatus: formState.availabilityStatus,
        stockQuantity: Number(formState.stockQuantity),
        status: formState.status,
        supplierInfo: {
          name: formState.supplierName.trim(),
          sku: formState.supplierSku.trim(),
          costPrice: formState.supplierCostPrice ? Number(formState.supplierCostPrice) : null,
          leadTimeDays: Number(formState.supplierLeadTime) || 3,
        },
        specifications: formState.specifications.filter((s) => s.name.trim() && s.value.trim()),
        images: formState.images,
      };

      if (modalMode === "create") {
        const res = await shopAdminApi.createProduct(payload);
        if (res.success) {
          toast.success("Product created successfully");
          setShowModal(false);
          loadProducts();
        } else {
          toast.error(res.message || "Failed to create product");
        }
      } else if (selectedProduct) {
        const res = await shopAdminApi.updateProduct(selectedProduct._id, payload);
        if (res.success) {
          toast.success("Product updated successfully");
          setShowModal(false);
          loadProducts();
        } else {
          toast.error(res.message || "Failed to update product");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await shopAdminApi.deleteProduct(deleteConfirmId);
      if (res.success) {
        toast.success(res.data?.message || "Product archived successfully");
        setDeleteConfirmId(null);
        loadProducts();
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      toast.error(msg);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    try {
      const res = await shopAdminApi.updateStock(stockModalProduct._id, newStockQuantity);
      if (res.success) {
        toast.success("Stock updated successfully");
        setStockModalProduct(null);
        loadProducts();
      } else {
        toast.error(res.message || "Failed to update stock");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Stock adjustment failed";
      toast.error(msg);
    }
  };

  const handleMediaSelect = (asset: MediaAsset) => {
    const imageUrl = asset.urls?.webp || asset.urls?.original || "";
    setFormState((prev) => {
      const isFirst = prev.images.length === 0;
      return {
        ...prev,
        images: [
          ...prev.images,
          {
            url: imageUrl,
            publicId: asset.providerAssetId || null,
            alt: asset.altText || prev.name,
            isPrimary: isFirst,
          },
        ],
      };
    });
    setIsMediaPickerOpen(false);
    toast.success("Product image added from Media Library");
  };

  const addSpecRow = () => {
    setFormState((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { group: "General", name: "", value: "" },
      ],
    }));
  };

  const removeSpecRow = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, idx) => idx !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      })),
    }));
  };

  const removeImage = (index: number) => {
    setFormState((prev) => {
      const nextImages = prev.images.filter((_, idx) => idx !== index);
      if (nextImages.length > 0 && !nextImages.some((img) => img.isPrimary)) {
        nextImages[0].isPrimary = true;
      }
      return { ...prev, images: nextImages };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-[var(--color-admin-primary)]" size={24} />
            Hardware Catalog
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage PC components, pricing, inventory stock, and specifications.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-admin-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-card border border-border p-4 rounded-xl shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Search
          </label>
          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, SKU..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Fulfillment Mode
          </label>
          <select
            value={selectedFulfillment}
            onChange={(e) => {
              setSelectedFulfillment(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
          >
            <option value="all">All Fulfillment</option>
            <option value="stock">In-Stock Only</option>
            <option value="supplier_order">Supplier Order Only</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
            Publication Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No hardware products found"
            description="Add graphics cards, processors, storage, or peripherals to begin selling."
            icon={Package}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Product & SKU</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-center">Fulfillment</th>
                  <th className="px-5 py-3.5 text-center">Stock</th>
                  <th className="px-5 py-3.5 text-center">Availability</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => {
                  const primaryImg =
                    prod.images?.find((img) => img.isPrimary)?.url ||
                    prod.images?.[0]?.url;

                  const categoryName =
                    typeof prod.category === "object" ? prod.category?.name : "—";

                  return (
                    <tr
                      key={prod._id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border flex-shrink-0">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-foreground group-hover:text-[var(--color-admin-primary)] transition-colors line-clamp-1 max-w-sm">
                              {prod.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {prod.sku}
                              </span>
                              {prod.views !== undefined && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                  <Eye size={12} /> {prod.views}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground">
                          {categoryName}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="px-5 py-3.5 text-right font-medium text-foreground">
                        <div>{formatVND(prod.sellingPrice)}</div>
                        {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatVND(prod.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Fulfillment Mode */}
                      <td className="px-5 py-3.5 text-center">
                        {prod.fulfillmentMode === "stock" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Box size={12} /> Stocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Truck size={12} /> Supplier
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity with Quick Click */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => {
                            setStockModalProduct(prod);
                            setNewStockQuantity(prod.stockQuantity);
                          }}
                          className="group/stock inline-flex flex-col items-center px-2 py-1 rounded-md text-xs font-medium hover:bg-accent transition-colors cursor-pointer"
                          title="Click to quickly update on-hand stock"
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={
                                prod.fulfillmentMode === "supplier_order"
                                  ? "text-muted-foreground"
                                  : prod.stockQuantity - (prod.reservedQuantity || 0) > 0
                                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "text-destructive font-bold"
                              }
                            >
                              {prod.fulfillmentMode === "supplier_order"
                                ? "—"
                                : prod.stockQuantity - (prod.reservedQuantity || 0)}
                            </span>
                            <Edit size={11} className="opacity-0 group-hover/stock:opacity-100 text-muted-foreground" />
                          </div>
                          {prod.fulfillmentMode === "stock" && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {prod.reservedQuantity && prod.reservedQuantity > 0
                                ? `(${prod.stockQuantity} on-hand, ${prod.reservedQuantity} rsv)`
                                : `(${prod.stockQuantity} on-hand)`}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Availability Status */}
                      <td className="px-5 py-3.5 text-center">
                        {prod.availabilityStatus === "in_stock" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={12} /> In Stock
                          </span>
                        ) : prod.availabilityStatus === "available_on_order" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            On Order
                          </span>
                        ) : prod.availabilityStatus === "out_of_stock" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
                            Discontinued
                          </span>
                        )}
                      </td>

                      {/* Publication Status */}
                      <td className="px-5 py-3.5 text-center">
                        {prod.status === "published" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Published
                          </span>
                        ) : prod.status === "draft" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(prod._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Archive Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {products.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {products.length} of {totalItems} hardware products
            </span>
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Full Product Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <h3 className="font-semibold text-foreground text-base">
                {modalMode === "create" ? "Add Hardware Product" : "Edit Hardware Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[var(--color-admin-primary)] uppercase tracking-wider">
                  1. Basic Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. GeForce RTX 4070 Super 12GB"
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      SKU (Stock Keeping Unit) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.sku}
                      onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                      placeholder="e.g. GPU-NV-4070S-12G"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)] uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Slug (Optional, auto-generated)
                    </label>
                    <input
                      type="text"
                      value={formState.slug}
                      onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                      placeholder="e.g. rtx-4070-super-12gb"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Summary / Short Pitch
                  </label>
                  <input
                    type="text"
                    value={formState.summary}
                    onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
                    placeholder="Short 1-sentence product summary for card grids"
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Comprehensive hardware overview, warranty details, power requirements..."
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Inventory */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-[var(--color-admin-primary)] uppercase tracking-wider">
                  2. Pricing & Fulfillment Mode
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Selling Price (VND) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={formState.sellingPrice}
                      onChange={(e) => setFormState({ ...formState, sellingPrice: Math.max(0, Number(e.target.value)) })}
                      className="w-full px-3.5 py-2 text-sm font-medium bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Original / Comparison Price (VND)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={formState.originalPrice || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          originalPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Optional crossed-out price"
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Fulfillment Mode *
                    </label>
                    <select
                      value={formState.fulfillmentMode}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          fulfillmentMode: e.target.value as FulfillmentMode,
                        })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    >
                      <option value="stock">In-Stock (In Warehouse)</option>
                      <option value="supplier_order">Supplier Order (On-Demand)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.stockQuantity}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          stockQuantity: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Availability Status *
                    </label>
                    <select
                      value={formState.availabilityStatus}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          availabilityStatus: e.target.value as AvailabilityStatus,
                        })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="available_on_order">Available on Order</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Supplier Metadata */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-[var(--color-admin-primary)] uppercase tracking-wider">
                  3. Supplier Info (Internal Only)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={formState.supplierName}
                      onChange={(e) => setFormState({ ...formState, supplierName: e.target.value })}
                      placeholder="e.g. Synnex FPT / Viettel Distribution"
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Cost Price (VND)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.supplierCostPrice || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          supplierCostPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Internal wholesale cost"
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.supplierLeadTime}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          supplierLeadTime: Math.max(0, parseInt(e.target.value, 10) || 3),
                        })
                      }
                      className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Specifications */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--color-admin-primary)] uppercase tracking-wider">
                    4. Technical Specifications
                  </h4>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Add Spec Row
                  </button>
                </div>

                <div className="space-y-2">
                  {formState.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Group (e.g. Memory)"
                        value={spec.group}
                        onChange={(e) => {
                          const updated = [...formState.specifications];
                          updated[idx].group = e.target.value;
                          setFormState({ ...formState, specifications: updated });
                        }}
                        className="w-1/4 px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
                      />
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. VRAM)"
                        value={spec.name}
                        onChange={(e) => {
                          const updated = [...formState.specifications];
                          updated[idx].name = e.target.value;
                          setFormState({ ...formState, specifications: updated });
                        }}
                        className="w-1/3 px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 12GB GDDR6X)"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...formState.specifications];
                          updated[idx].value = e.target.value;
                          setFormState({ ...formState, specifications: updated });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-admin-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md"
                        title="Remove Spec"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Gallery Images */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--color-admin-primary)] uppercase tracking-wider">
                    5. Product Gallery Images
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)] rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <ImageIcon size={14} /> Add from Media Library
                  </button>
                </div>

                {formState.images.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground text-xs">
                    No images added yet. Click &quot;Add from Media Library&quot; to pick product photos.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formState.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl border overflow-hidden p-1.5 bg-muted/20 ${
                          img.isPrimary
                            ? "border-[var(--color-admin-primary)] ring-2 ring-[var(--color-admin-primary)]/20"
                            : "border-border"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt || "Product photo"}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="flex items-center justify-between mt-2 px-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className={`text-[11px] font-medium cursor-pointer ${
                              img.isPrimary
                                ? "text-[var(--color-admin-primary)] font-bold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {img.isPrimary ? "★ Primary" : "Set Primary"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 6: Publication Status */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as PublicationStatus,
                      })
                    }
                    className="px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                  >
                    <option value="draft">Draft (Hidden from store)</option>
                    <option value="published">Published (Visible in store)</option>
                    <option value="archived">Archived (Discontinued)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)] rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal Dialog */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-foreground text-base mb-1">
              Adjust Stock Quantity
            </h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
              {stockModalProduct.name} ({stockModalProduct.sku})
            </p>

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  In-Stock Units
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3.5 py-2 text-base font-bold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)] text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-[var(--color-admin-primary)] text-white rounded-lg hover:bg-[var(--color-admin-primary-hover)]"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Archive Hardware Product"
        message="Are you sure you want to archive this product? It will be removed from the public shop catalog."
        confirmText="Archive Product"
        variant="danger"
      />

      {/* Shared Media Library Picker Modal */}
      <MediaLibraryModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
