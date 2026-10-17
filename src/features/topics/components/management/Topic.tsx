"use client";
import convertDate from "@/common/datetime";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";
import { topicApi } from "@/features/topics/api/topic.api";
import { Edit, Plus, Trash2, X, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/hook/useTranslation";
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminPagination from "@/components/admin/AdminPagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import TableSkeleton from "@/components/admin/TableSkeleton";

type TopicType = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
};

const Topic = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<TopicType | null>(null);
  const [topics, setTopics] = useState<TopicType[]>([]);
  const [page, setPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const itemsPerPage = 15;
  const changeLoad = loadingStore((state) => state.changeLoad);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        changeLoad();
        setIsDataLoading(true);
        const response = await topicApi.getTopics();
        if (response.success) {
          const topicsList = Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];
          setTopics(topicsList);
        } else throw new Error(response.message);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message);
      } finally {
        changeLoad();
        setIsDataLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
  });
  const filteredTopics = (Array.isArray(topics) ? topics : []).filter((topic) =>
    (topic?.name || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase()),
  );
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentTopics = filteredTopics.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const openModal = (type: string, item: TopicType | null = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(
      item
        ? {
            _id: item._id,
            name: item.name || "",
            description: item.description || "",
          }
        : { _id: "", name: "", description: "" },
    );
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({ _id: "", name: "", description: "" });
  };

  const handleAddTopic = async () => {
    if (!formData.name.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }
    changeLoad();
    try {
      const newTopic = await topicApi.createTopic({
        name: formData.name,
        description: formData.description,
      });
      if (newTopic.success) {
        setTopics([...topics, newTopic.data?.data || newTopic.data]);
        toast.success("Topic added successfully");
      } else throw new Error(newTopic.message);
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    } finally {
      setShowModal(false);
      changeLoad();
    }
  };

  const handleEditTopic = () => {
    if (!formData.name.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }
    changeLoad();
    topicApi
      .updateTopic(selectedItem?._id as string, {
        name: formData.name,
        description: formData.description,
      })
      .then((response) => {
        if (response.success) {
          setTopics(
            topics.map((t) =>
              t._id === selectedItem?._id
                ? {
                    ...t,
                    name: formData.name,
                    description: formData.description,
                  }
                : t,
            ),
          );
          toast.success("Topic updated successfully");
        } else throw new Error(response.message);
      })
      .catch((error) => {
        toast.error(error?.message || "An error occurred");
      })
      .finally(() => {
        setShowModal(false);
        changeLoad();
      });
  };

  const handleDeleteTopic = (id: string) => {
    changeLoad();
    topicApi
      .deleteTopic(id)
      .then((response) => {
        if (response.success) {
          toast.success("Topic deleted successfully");
        } else throw new Error(response.message);
      })
      .catch((error) => {
        toast.error(error?.message || "An error occurred");
      })
      .finally(() => changeLoad());
    setTopics(topics.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Topic Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage content classification topics
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary-ring"
        >
          <Plus size={16} /> Add Topic
        </button>
      </div>

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search topics..."
      />
      <p className="text-sm text-muted-foreground">
        {filteredTopics.length} topics{" "}
        {searchTerm && (
          <span className="text-muted-foreground">
            (filtered from {topics.length} total)
          </span>
        )}
      </p>

      <div className="bg-background rounded-xl border border-border shadow-admin-sm overflow-hidden">
        {isDataLoading ? (
          <TableSkeleton columns={4} rows={6} />
        ) : currentTopics.length === 0 ? (
          <EmptyState
            icon={Hash}
            title={searchTerm ? "No topics found" : "No topics yet"}
            description={
              searchTerm
                ? "Try changing your search terms"
                : "Start by adding the first topic"
            }
            actionLabel={!searchTerm ? "Add Topic" : undefined}
            onAction={!searchTerm ? () => openModal("add") : undefined}
          />
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30/80 border-b border-border">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Topic Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Created Date
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentTopics.map((topic, index) => (
                    <tr
                      key={topic._id}
                      className="hover:bg-muted/30/50 transition-colors duration-100"
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">
                          {topic.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 lg:hidden truncate max-w-xs">
                          {topic.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {topic.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {convertDate(topic.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal("edit", topic)}
                            className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(topic._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border">
              {currentTopics.map((topic, index) => (
                <div
                  key={topic._id}
                  className="p-4 hover:bg-muted/30/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {topic.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {topic.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {convertDate(topic.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openModal("edit", topic)}
                        className="p-2 rounded-lg text-admin-primary hover:bg-admin-primary-light"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(topic._id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
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
        onConfirm={() => confirmDelete && handleDeleteTopic(confirmDelete)}
        title="Delete topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {modalType === "add" ? "Add new topic" : "Edit topic"}
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
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring transition-all"
                  placeholder="Enter topic name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  Description
                </label>
                <TextAreaCustom
                  id="description"
                  value={formData.description}
                  onChange={(e: any) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  placeholder="Enter topic description"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 rounded-b-xl border-t border-border">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-foreground/80 bg-background border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalType === "add" ? handleAddTopic : handleEditTopic}
                className="px-4 py-2 text-sm font-medium text-white bg-admin-primary rounded-lg hover:bg-admin-primary-hover transition-colors"
              >
                {modalType === "add" ? "Add new" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topic;
