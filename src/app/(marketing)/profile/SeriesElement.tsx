import { useState } from "react";
import { Bookmark, Upload } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { getHeadersToken } from "@/lib/api/axios";
import axios from "axios";
import { toast } from "sonner";
import ImageUpload from "@/app/(editor)/create/ImageUpload";
import { SeriesLinkCustom } from "@/components/common/LinkCustom";
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import { Button } from "@/components/ui/button";

const SeriesElement = ({
  series,
  onDeleteSeriesing,
  setOnDeleteSeriesing,
  deleteSeries,
}: any) => {
  const currentUser = authenticationStore((state) => state.currentUser);
  const [bookmarked, setBookmarked] = useState(
    series.marked?.includes(currentUser?._id),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [dataSeriesEdit, setDataSeriesEdit] = useState(series);

  const onMarkedSeries = async () => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/markSeries`,
        {
          seriesId: series._id,
        },
        {
          headers: getHeadersToken(),
        },
      );

      if (response.status === 200) {
        toast.success(
          response.data.isMarked
            ? "Series marked successfully."
            : "Series unmarked successfully.",
        );
        setBookmarked(!bookmarked);
      } else {
        toast.error("Failed to mark the series.");
      }
    } catch (error: any) {
      console.log(error.response.data);
      toast.error(
        error.response.data.message ||
          "An error occurred while marking the series.",
      );
    }
  };

  const onCancelEditing = () => {
    setIsEditing(false);
    setDataSeriesEdit(series); // Reset to original series data
  };

  const onConfirmEditing = async () => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/edit`,
        {
          seriesId: series._id,
          title: dataSeriesEdit.title,
          description: dataSeriesEdit.description,
          image: dataSeriesEdit.image,
        },
        {
          headers: getHeadersToken(),
        },
      );

      if (response.status === 200) {
        toast.success("Series updated successfully.");
        // Update the local series data with the edited data
        series.title = dataSeriesEdit.title;
        series.description = dataSeriesEdit.description;
        series.image = dataSeriesEdit.image;
      } else {
        toast.error("Failed to update the series.");
      }
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
          "An error occurred while updating the series.",
      );
    }
    setIsEditing(false);
  };

  const handleImageUploadedPublic = (image: any) => {
    setDataSeriesEdit({ ...dataSeriesEdit, image });
  };

  return (
    <div className="flex w-full rounded-lg overflow-hidden bg-background shadow-sm border border-border">
      {/* Left side - Image */}
      <div className="w-1/3 h-40">
        <img
          src={series.image?.url || "/default-series-image.jpg"}
          alt={series.title}
          className="object-cover h-full w-full"
        />
      </div>

      {/* Right side - Content */}
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <SeriesLinkCustom
              className={"text-lg font-bold text-green-600 leading-tight mb-2"}
              slug={series.slug}
              name={series.title}
            />
            <button
              onClick={onMarkedSeries}
              className="text-muted-foreground hover:text-muted-foreground cursor-pointer"
            >
              <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {series.description}
          </p>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {" "}
            {series.posts.length > 0
              ? "Series includes" + series.posts.length + "posts"
              : "No posts available"}
          </p>
        </div>

        {/* Author */}
        {series.user?._id && (
          <div className="flex justify-between align-center">
            <a className="flex items-center mt-2" href={`./${series.user._id}`}>
              {series.user.avatar && (
                <img
                  src={series.user.avatar}
                  alt={series.user.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
              )}
              <div className="flex items-center">
                <span className="text-sm font-medium">{series.user.name}</span>
                {series.user.verified && (
                  <span className="ml-1 text-blue-500">
                    <svg
                      className="w-4 h-4 inline-block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                )}
              </div>
            </a>

            <div className="flex items-center">
              <Button
                variant="gradient-success"
                size="sm"
                className="mr-4"
                onClick={() => setOnDeleteSeriesing(series._id)}
              >
                Delete Series
              </Button>
              <Button
                variant="gradient-danger"
                size="sm"
                className="mr-4"
                onClick={() => setIsEditing(true)}
              >
                Edit Series
              </Button>
              <Button
                variant="gradient-primary"
                size="sm"
                onClick={() =>
                  (window.location.href = `/series/${series.slug}`)
                }
              >
                View Series
              </Button>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 flex justify-center items-center bg-muted/70">
          <div className="absolute top-0 p-2 w-full h-full max-w-xl shadow sm:rounded-xl sm:px-10 flex items-center justify-center py-0 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="p-6 bg-background rounded-md">
                <h2 className="text-2xl text-center font-bold mb-4">
                  Edit Series
                </h2>
                <ImageUpload
                  onImageUploaded={handleImageUploadedPublic}
                  onClose={() => {}}
                  isTitleDisplay={true}
                />
                <p className="mt-6 mb-2 text-sm text-foreground/80">Title</p>
                <input
                  type="text"
                  value={dataSeriesEdit.title}
                  onChange={(e) =>
                    setDataSeriesEdit({
                      ...dataSeriesEdit,
                      title: e.target.value,
                    })
                  }
                  className="w-full text-lg font-bold leading-tight mb-6 border border-border rounded p-1"
                />
                <p className="text-sm mb-2 text-foreground/80">Description</p>
                <TextAreaCustom
                  value={dataSeriesEdit.description}
                  onChange={(e: any) =>
                    setDataSeriesEdit({
                      ...dataSeriesEdit,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-2 mb-6 border border-border rounded mb-2"
                />

                <div className="flex justify-center gap-4">
                  <Button variant="gradient-accent" onClick={onConfirmEditing}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={onCancelEditing}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {onDeleteSeriesing && (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 flex justify-center items-center bg-muted/70">
          <div className="absolute top-0 p-2 w-full h-full max-w-xl shadow sm:rounded-xl sm:px-10 flex items-center justify-center py-0 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="p-6 bg-background rounded-md">
                <h2 className="text-2xl text-center font-bold mb-4">
                  Delete Series
                </h2>
                <p className="text-center mb-6">
                  Are you sure you want to delete this series? This action
                  cannot be undone.
                </p>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => deleteSeries(onDeleteSeriesing)}
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOnDeleteSeriesing("")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesElement;
