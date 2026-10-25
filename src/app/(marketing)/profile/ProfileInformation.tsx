"use client";

import { ENV } from "@/api/const";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import convertDate from "@/common/datetime";
import authenticationStore from "@/store/AuthenticationStore";
import loadingStore from "@/store/LoadingStore";
import axios from "axios";
import { toast } from "sonner";
import { UserRoundPen } from "lucide-react";

// Zod schema for validation
const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changeLoad = loadingStore((state) => state.changeLoad);
  const currentUser = authenticationStore((state) => state.currentUser);
  const updateCurrentUser = authenticationStore(
    (state) => state.updateCurrentUser,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      bio: currentUser?.bio || "",
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    // Reset form with current user data
    reset({
      name: currentUser?.name || "",
      bio: currentUser?.bio || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(); // Reset to original values
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      changeLoad();
      const token = localStorage.getItem("access_token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await axios.patch(
          `${ENV.ROOT_API}/user/updateProfile`,
          {
            data,
          },
        );
        console.log("ressss");

        if (res.status == 200) {
          toast.success("Update successfully");
          updateCurrentUser({ bio: data.bio, name: data.name });
        }
      } else {
        toast.error("Error !");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
      changeLoad();
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 m-l-4 p-6 bg-background rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="w-full mx-auto bg-background">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <UserRoundPen className="text-blue-600" size={32} />
              Your information
            </h1>
            <p className="text-muted-foreground">
              Overview about your information
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Profile Information */}
            <div className="space-y-6">
              {/* Registration Date - Read only */}
              <div className="flex items-center py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4">
                  Joined Date
                </span>
                <span className="text-foreground">
                  {convertDate(currentUser.createdAt.toString())}
                </span>
              </div>

              {/* Name */}
              <div className="flex items-center py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4">
                  Full Name
                </span>
                {isEditing ? (
                  <div className="flex-1">
                    <input
                      {...register("name")}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-foreground">{currentUser.name}</span>
                )}
              </div>

              {/* Username */}
              <div className="flex items-center py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4">
                  Username
                </span>
                {isEditing ? (
                  <div className="flex-1">
                    <input
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted"
                      type="text"
                      value={currentUser.username?.toString()}
                    />
                  </div>
                ) : (
                  <span className="text-foreground">
                    {currentUser.username}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4">
                  Email
                </span>
                {isEditing ? (
                  <div className="flex-1">
                    <input
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted"
                      type="email"
                      value={currentUser.email?.toString()}
                    />
                  </div>
                ) : (
                  <span className="text-blue-600">{currentUser.email}</span>
                )}
              </div>

              {/* Biography */}
              <div className="flex items-start py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4 pt-2">
                  Bio
                </span>
                {isEditing ? (
                  <div className="flex-1">
                    <textarea
                      {...register("bio")}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-xs text-sm mt-1">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {currentUser.bio || "---"}
                  </span>
                )}
              </div>

              {/* Account Status - Read only */}
              <div className="flex items-center py-3 border-b border-border">
                <span className="text-muted-foreground font-medium w-1/4">
                  Account Status
                </span>
                <span className="text-muted-foreground">
                  {currentUser.activate ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Action Buttons for Edit Mode */}
            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent disabled:bg-muted text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Membership Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Membership Plan
            </h2>

            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <p className="text-muted-foreground mb-4">
                You have not subscribed to any membership plan yet.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Subscribe to Plan
                </button>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={isEditing}
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isEditing ? "Editing..." : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
