"use client";
import convertDate from "@/common/datetime";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";
import { categoryApi } from "@/features/categories/api/category.api";
import { Edit, Plus, Trash2, Eye, X, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/hook/useTranslation";
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminPagination from "@/components/admin/AdminPagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";

type CategoryType = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  background_image: string;
  createdAt: string;
};

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CategoryType | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [page, setPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [listStatus, setListStatus] = useState<"all" | "trash">("all");

  const itemsPerPage = 15;
  const changeLoad = loadingStore((state) => state.changeLoad);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        changeLoad();
        setIsDataLoading(true);
        const response = await categoryApi.getCategories(listStatus);
        if (response.success) {
          setCategories(response.data.categories);
        } else throw new Error(response.message);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message);
      } finally {
        changeLoad();
        setIsDataLoading(false);
      }
    };
    fetchCategories();
  }, [listStatus]);

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    slug: "",
    description: "",
  });

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const openModal = (type: string, item: CategoryType | null = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(
      item
        ? {
            _id: item._id,
            name: item.name || "",
            slug: item.slug,
            description: item.description || "",
          }
        : { _id: "", name: "", slug: "", description: "" },
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({ _id: "", name: "", slug: "", description: "" });
  };

  const handleAddCategory = async () => {
    changeLoad();
    if (formData.name.trim()) {
      try {
        const newCategory = await categoryApi.createCategory({
          name: formData.name,
          slug:
            formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          description: formData.description,
        });
        if (newCategory.success) {
          setCategories([...categories, newCategory.data.category]);

          toast.success(t("management.category.add_success"));
        } else throw new Error(newCategory.message);
      } catch (error: any) {
        toast.error(error?.message);
      } finally {
        setShowModal(false);
        changeLoad();
      }
    }
  };

  const handleEditCategory = () => {
    changeLoad();
    if (!formData.name.trim()) {
      toast.success(t("management.category.no_name_empty"));
      changeLoad();
      return;
    }
    categoryApi
      .updateCategory(selectedItem?._id as string, {
        _id: selectedItem?._id,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
      })
      .then((response) => {
        if (response.success) {
          setCategories(
            categories.map((cat) =>
              cat._id === selectedItem?._id ? response.data.category : cat,
            ),
          );

          toast.success(t("management.category.update_success"));
        } else throw new Error(response.message);
      })
      .catch((error) => {
        toast.error(error?.message);
      })
      .finally(() => {
        setShowModal(false);
        changeLoad();
      });
  };

  const handleDeleteCategory = (id: string) => {
    changeLoad();
    categoryApi
      .deleteCategory(id)
      .then((response) => {
        if (response.success) {
          toast.success("Xóa danh mục thành công");
        } else throw new Error(response.message);
      })
      .catch((error) => {
        toast.error(error?.message);
      })
      .finally(() => changeLoad());
    setCategories(categories.filter((cat) => cat._id !== id));
  };

  const handleRestoreCategory = (id: string) => {
    changeLoad();
    categoryApi
      .restoreCategory(id)
      .then((response) => {
        if (response.success) {
          toast.success("Khôi phục danh mục thành công");
          setCategories(categories.filter((cat) => cat._id !== id));
        } else throw new Error(response.message);
      })
      .catch((error) => {
        toast.error(error?.message);
      })
      .finally(() => changeLoad());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("management.category.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các danh mục của hệ thống
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary-ring"
        >
          <Plus size={16} />
          {t("management.category.add")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setListStatus("all")}
          className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
            listStatus === "all"
              ? "border-admin-primary text-admin-primary"
              : "border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setListStatus("trash")}
          className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
            listStatus === "trash"
              ? "border-admin-primary text-admin-primary"
              : "border-transparent text-muted-foreground hover:text-foreground/80 hover:border-border"
          }`}
        >
          Thùng rác
        </button>
      </div>

      {/* Search */}
      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t("management.category.find")}
      />

      {/* Results */}
      <p className="text-sm text-muted-foreground">
        {filteredCategories.length} {t("management.category.cate")}
        {searchTerm && (
          <span className="text-muted-foreground">
            {" "}
            (lọc từ {categories.length} tổng cộng)
          </span>
        )}
      </p>

      {/* Table */}
      <div className="bg-background rounded-xl border border-border shadow-admin-sm overflow-hidden">
        {isDataLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : currentCategories.length === 0 ? (
          <EmptyState
            icon={Folder}
            title={
              searchTerm ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"
            }
            description={
              searchTerm
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Bắt đầu bằng cách thêm danh mục đầu tiên"
            }
            actionLabel={!searchTerm ? t("management.category.add") : undefined}
            onAction={!searchTerm ? () => openModal("add") : undefined}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30/80 border-b border-border">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("management.category.name")}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t("management.category.description")}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("management.category.background_image")}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      {t("management.category.createDate")}
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("management.category.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentCategories.map((category, index) => (
                    <tr
                      key={category._id}
                      className="hover:bg-muted/30/50 transition-colors duration-100"
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {category.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 lg:hidden truncate max-w-xs">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={
                            category.background_image ||
                            `background/category/${category._id}.png`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-admin-primary hover:underline text-sm"
                        >
                          <Eye size={14} /> Xem
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {convertDate(category.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {listStatus === "trash" ? (
                            <button
                              onClick={() =>
                                handleRestoreCategory(category._id)
                              }
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                              title="Khôi phục"
                            >
                              Khôi phục
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openModal("edit", category)}
                                className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(category._id)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-border">
              {currentCategories.map((category, index) => (
                <div
                  key={category._id}
                  className="p-4 hover:bg-muted/30/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {category.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {convertDate(category.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {listStatus === "trash" ? (
                        <button
                          onClick={() => handleRestoreCategory(category._id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-admin-primary hover:bg-admin-primary hover:text-white transition-colors font-medium text-xs whitespace-nowrap"
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openModal("edit", category)}
                            className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(category._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteCategory(confirmDelete)}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="danger"
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {modalType === "add"
                  ? "Thêm danh mục mới"
                  : "Chỉnh sửa danh mục"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {t("management.category.name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                  placeholder={t("management.category.input_name")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  {t("management.category.description")}
                </label>
                <TextAreaCustom
                  id="description"
                  value={formData.description}
                  onChange={(e: any) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder={t("management.category.input_description")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Slug
                </label>
                <input
                  disabled
                  type="text"
                  value={formData.slug}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-muted/30 text-muted-foreground"
                  placeholder="Slug sẽ được tạo tự động"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 rounded-b-xl border-t border-border">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-foreground/80 bg-background border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {t("management.category.cancel")}
              </button>
              <button
                onClick={
                  modalType === "add" ? handleAddCategory : handleEditCategory
                }
                className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors"
              >
                {modalType === "add" ? "Thêm mới" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
