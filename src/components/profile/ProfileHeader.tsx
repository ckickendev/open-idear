"use client";
import { ENV } from "@/api/const";
import React, { useState } from "react";
import {
  Edit,
  Camera,
  Shield,
  GraduationCap,
  User,
  X,
  Upload,
} from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { useParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";
import { getHeadersToken } from "@/lib/api/axios";
import { toast } from "sonner";
import loadingStore from "@/store/LoadingStore";

const roleConfig: Record<
  number,
  { label: string; color: string; icon: React.ReactNode }
> = {
  0: {
    label: "Member",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: <User size={12} />,
  },
  1: {
    label: "Instructor",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: <GraduationCap size={12} />,
  },
  2: {
    label: "Admin",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    icon: <Shield size={12} />,
  },
};

const ProfileHeader: React.FC = () => {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showBgUpload, setShowBgUpload] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);
  const updateCurrentUser = authenticationStore(
    (state) => state.updateCurrentUser,
  );
  const setIsLoading = loadingStore((state) => state.setIsLoading);

  const params = useParams();
  const usernameParam = params?.username as string | undefined;
  const [publicUser, setPublicUser] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);

  React.useEffect(() => {
    if (
      usernameParam &&
      usernameParam.toLowerCase() !==
      String(currentUser?.username).toLowerCase()
    ) {
      axios
        .get(
          `${ENV.ROOT_API}/auth/getProfileByUsername?username=${usernameParam}`,
          { headers: getHeadersToken() },
        )
        .then((res) => {
          setPublicUser(res.data.userInfo);
          setIsFollowed(res.data.userInfo?.isFollowed || false);
        })
        .catch((err) => console.error("Failed to load user profile", err));
    } else {
      setPublicUser(null);
    }
  }, [usernameParam, currentUser?.username]);

  const displayUser = publicUser || currentUser;
  const isOwner =
    !usernameParam ||
    usernameParam.toLowerCase() === String(currentUser?.username).toLowerCase();

  const role = roleConfig[Number(displayUser.role)] || roleConfig[0];

  const handleFollowUser = async () => {
    if (!displayUser?._id) return;
    try {
      const res = await axios.patch(
        `${ENV.ROOT_API}/post/followUser?userId=${displayUser._id}`,
        {},
        { headers: getHeadersToken() },
      );
      if (res.status === 200) {
        const followed = res.data.isFollowed;

        toast.success(
          followed
            ? "User followed successfully"
            : "User unfollowed successfully",
        );
        setIsFollowed(followed);
      }
    } catch (error) {
      toast.error("Error when following user");
    }
  };

  const handleImageUpload = async (
    type: "avatar" | "background",
    url: string,
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await axios.patch(
        `${ENV.ROOT_API}/user/updateImage`,
        {
          [type]: url,
        },
      );
      if (res.status === 200) {
        toast.success("Updated successfully!");
        updateCurrentUser({ [type]: url });
        setShowAvatarUpload(false);
        setShowBgUpload(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        {displayUser?.background ? (
          <img
            src={displayUser.background}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-admin-primary)] via-indigo-500 to-blue-900 opacity-90">
            {/* Dynamic glass overlay */}
            <div className="absolute inset-0 bg-background/5 backdrop-blur-3xl" />
          </div>
        )}

        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Change cover button */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            {showBgUpload ? (
              <div className="flex items-center gap-2 bg-background/95 dark:bg-card/95 backdrop-blur-sm rounded-xl p-2 shadow-lg">
                <CldUploadWidget
                  signatureEndpoint="/api/image_upload"
                  onQueuesStart={() => setIsLoading(true)}
                  onAbort={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                  onClose={() => setIsLoading(false)}
                  onSuccess={(result, { widget }) => {
                    if (typeof result?.info !== "string" && result?.info?.url) {
                      handleImageUpload("background", result.info.url);
                    }
                    widget.close();
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Upload size={14} /> Upload
                    </button>
                  )}
                </CldUploadWidget>
                <button
                  onClick={() => setShowBgUpload(false)}
                  className="p-1 hover:bg-muted dark:hover:bg-accent rounded-lg transition-colors cursor-pointer"
                >
                  <X
                    size={14}
                    className="text-muted-foreground dark:text-muted-foreground/70"
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBgUpload(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-background/90 dark:bg-card/90 backdrop-blur-sm text-foreground/80 dark:text-muted-foreground/50 text-xs font-medium rounded-xl hover:bg-background dark:hover:bg-card transition-all shadow-sm cursor-pointer"
              >
                <Camera size={14} /> Edit Cover
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Info Bar */}
      <div className="relative -mt-16 mx-4 sm:mx-6">
        <div className="bg-background dark:bg-card rounded-2xl border border-border dark:border-border shadow-lg shadow-border/50 dark:shadow-border/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-20 flex-shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-border shadow-2xl shadow-[var(--color-admin-primary-ring)] overflow-hidden bg-muted dark:bg-accent transition-transform duration-300 group-hover:scale-105">
                <img
                  src={displayUser?.avatar || "/icon/profile/hippo.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Avatar edit button */}
              {isOwner && (
                <div className="absolute -bottom-1 -right-1">
                  {showAvatarUpload ? (
                    <div className="absolute bottom-full right-0 mb-2 flex items-center gap-2 bg-background dark:bg-card rounded-xl p-2 shadow-lg border border-border dark:border-border min-w-max">
                      <CldUploadWidget
                        signatureEndpoint="/api/image_upload"
                        onQueuesStart={() => setIsLoading(true)}
                        onAbort={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                        onClose={() => setIsLoading(false)}
                        onSuccess={(result, { widget }) => {
                          if (
                            typeof result?.info !== "string" &&
                            result?.info?.url
                          ) {
                            handleImageUpload("avatar", result.info.url);
                          }
                          widget.close();
                        }}
                      >
                        {({ open }) => (
                          <button
                            onClick={() => open()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            <Upload size={14} /> Upload
                          </button>
                        )}
                      </CldUploadWidget>
                      <button
                        onClick={() => setShowAvatarUpload(false)}
                        className="p-1 hover:bg-muted dark:hover:bg-accent rounded-lg transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null}
                  <button
                    onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white truncate">
                  {displayUser?.name || displayUser?.username || "User"}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${role.color}`}
                >
                  {role.icon} {role.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 truncate">
                {String(displayUser?.email || "")}
              </p>
              {displayUser?.bio && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/70 mt-1 line-clamp-1">
                  {displayUser?.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOwner ? (
                <a
                  href="/profile/settings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-admin-primary)] hover:bg-[var(--color-admin-primary-hover)] text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-0.5"
                >
                  <Edit size={14} /> Edit Profile
                </a>
              ) : (
                <button
                  onClick={handleFollowUser}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${isFollowed ? "bg-muted text-foreground dark:bg-accent dark:text-muted-foreground/50 hover:bg-muted dark:hover:bg-accent" : "bg-[var(--color-admin-primary)] text-white hover:bg-[var(--color-admin-primary-hover)] shadow-[inset_0px_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"}`}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
