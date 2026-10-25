"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Folder, Layers, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { shopAdminApi } from "../../api/shopAdmin.api";
import type { ShopCategory } from "../../types/shop.types";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { MediaLibraryModal } from "@/features/media-library";
import type { MediaAsset } from "@/features/media-library";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentCategory: "",
    displayOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await shopAdminApi.getCategories();
      if (res.success) {
        setCategories(res.data);
      } else {
        toast.error(res.message || "Failed to load categories");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load categories";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentCategory: "",
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: ShopCategory) => {
    setModalMode("edit");
    setSelectedCategory(cat);
    const parentId =
      typeof cat.parentCategory === "object" && cat.parentCategory !== null
        ? cat.parentCategory._id
        : (cat.parentCategory as string) || "";

    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      parentCategory: parentId,
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<ShopCategory> = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        image: formData.image || null,
        parentCategory: formData.parentCategory || null,
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
      };

      if (modalMode === "create") {
        const res = await shopAdminApi.createCategory(payload);
        if (res.success) {
          toast.success("Category created successfully");
          setShowModal(false);
          fetchCategories();
        } else {
          toast.error(res.message || "Failed to create category");
        }
      } else if (selectedCategory) {
        const res = await shopAdminApi.updateCategory(selectedCategory._id, payload);
        if (res.success) {
          toast.success("Category updated successfully");
          setShowModal(false);
          fetchCategories();
        } else {
          toast.error(res.message || "Failed to update category");
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
      const res = await shopAdminApi.deleteCategory(deleteConfirmId);
      if (res.success) {
        toast.success(res.data?.message || "Category deleted successfully");
        setDeleteConfirmId(null);
        fetchCategories();
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error(msg);
    }
  };

  const handleMediaSelect = (asset: MediaAsset) => {
    const imageUrl = asset.urls?.webp || asset.urls?.original || "";
    setFormData((prev) => ({ ...prev, image: imageUrl }));
    setIsMediaPickerOpen(false);
    toast.success("Image selected from Media Library");
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="text-[var(--color-admin-primary)]" size={24} />
            Hardware Categories
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage PC component and peripheral classifications.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-admin-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-admin-primary-hover)] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search categories by name or slug..."
        />
      </div>

      {/* Category Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No hardware categories found"
            description="Create categories like GPUs, Processors, Keyboards, or Memory to organize your shop."
            icon={Folder}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Parent</th>
                  <th className="px-5 py-3.5 text-center">Products</th>
                  <th className="px-5 py-3.5 text-center">Order</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((cat) => {
                  const parentName =
                    typeof cat.parentCategory === "object" && cat.parentCategory !== null
                      ? cat.parentCategory.name
                      : "—";

                  return (
                    <tr
                      key={cat._id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border flex-shrink-0">
                              <Folder size={18} />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-foreground group-hover:text-[var(--color-admin-primary)] transition-colors">
                              {cat.name}
                            </span>
                            {cat.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                        {cat.slug}
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {parentName}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {cat.productCount || 0}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center text-muted-foreground text-xs">
                        {cat.displayOrder}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cat._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
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
      </div>

      {/* Create / Edit Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
              <h3 className="font-semibold text-foreground text-base">
                {modalMode === "create" ? "Add Hardware Category" : "Edit Hardware Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Graphics Cards"
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  URL Slug (Optional, auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. graphics-cards"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Parent Category
                </label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => selectedCategory === null || c._id !== selectedCategory._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of hardware in this category..."
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                />
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Category Icon / Thumbnail
                </label>
                <div className="flex items-center gap-3">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    Select from Media Library
                  </button>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="text-xs text-destructive hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[var(--color-admin-primary)] rounded-sm border-border focus:ring-[var(--color-admin-primary)]"
                    />
                    <span className="text-sm font-medium text-foreground">Active in Shop</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
                  className="px-5 py-2 text-sm font-medium bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)] rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Hardware Category"
        message="Are you sure you want to delete this category? Categories with active products or sub-categories cannot be deleted."
        confirmText="Delete Category"
        variant="danger"
      />

      {/* Media Library Picker Modal */}
      <MediaLibraryModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
