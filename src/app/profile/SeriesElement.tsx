import { useState } from "react";
import { Bookmark, Upload } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import alertStore from "@/store/AlertStore";
import ImageUpload from "../create/ImageUpload";
import { SeriesLinkCustom } from "@/components/common/LinkCustom";
import { TextAreaCustom } from "@/components/common/TextAreaCustom";
import { ButtonCyanToBlue, ButtonGreenToBlue, ButtonPinkToOrange, ButtonPurpleToBlue, ButtonRedToYellow } from "@/components/common/ButtonCustom";

const SeriesElement = ({ series, onDeleteSeriesing, setOnDeleteSeriesing, deleteSeries }: any) => {
    const currentUser = authenticationStore((state) => state.currentUser);
    const [bookmarked, setBookmarked] = useState(series.marked?.includes(currentUser?._id));
    const [isEditing, setIsEditing] = useState(false);
    const [dataSeriesEdit, setDataSeriesEdit] = useState(series);

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    const onMarkedSeries = async () => {
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/markSeries`, {
                seriesId: series._id,
            }, {
                headers: getHeadersToken()
            });

            if (response.status === 200) {
                setType("success");
                setMessage(response.data.isMarked ? "Series marked successfully." : "Series unmarked successfully.");
                setBookmarked(!bookmarked);
            } else {
                setType("error");
                setMessage("Failed to mark the series.");
            }
        } catch (error: any) {
            console.log(error.response.data);
            setType("error");
            setMessage(error.response.data.message || "An error occurred while marking the series.");
        }
    };

    const onCancelEditing = () => {
        setIsEditing(false);
        setDataSeriesEdit(series); // Reset to original series data
    }

    const onConfirmEditing = async () => {
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/edit`, {
                seriesId: series._id,
                title: dataSeriesEdit.title,
                description: dataSeriesEdit.description,
                image: dataSeriesEdit.image,
            }, {
                headers: getHeadersToken()
            });

            if (response.status === 200) {
                setType("success");
                setMessage("Series updated successfully.");
                // Update the local series data with the edited data
                series.title = dataSeriesEdit.title;
                series.description = dataSeriesEdit.description;
                series.image = dataSeriesEdit.image;
            } else {
                setType("error");
                setMessage("Failed to update the series.");
            }
        } catch (error: any) {
            setType("error");
            setMessage(error.response.data.message || "An error occurred while updating the series.");
        }
        setIsEditing(false);
    }

    const handleImageUploadedPublic = (image: any) => {
        setDataSeriesEdit({ ...dataSeriesEdit, image });
    };

    return (
        <div className="flex w-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
            {/* Left side - Image */}
            <div className="w-1/3 h-40">
                <img
                    src={series.image?.url || '/default-series-image.jpg'}
                    alt={series.title}
                    className="object-cover h-full w-full"
                />
            </div>

            {/* Right side - Content */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <SeriesLinkCustom className={'text-lg font-bold text-green-600 leading-tight mb-2'} slug={series.slug} name={series.title} />
                        <button
                            onClick={onMarkedSeries}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{series.description}</p>

                    <p className="text-sm text-gray-600 line-clamp-2"> {series.posts.length > 0 ? "Series includes " + series.posts.length + " posts" : "No posts available"}</p>

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
                            <ButtonGreenToBlue title="Delete Series" classAddition="mr-4 px-4 py-2 rounded-md" onClick={() => setOnDeleteSeriesing(series._id)} />
                            <ButtonPinkToOrange title="Edit Series" classAddition="mr-4 px-4 py-2 rounded-md" onClick={() => setIsEditing(true)} />
                            <ButtonPurpleToBlue title="View Series" classAddition="px-4 py-2 rounded-md" onClick={() => window.location.href = `/series/${series.slug}`} />
                        </div>
                    </div>
                )}
            </div>

            {isEditing && <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 flex justify-center items-center bg-gray-100/70">
                <div className='absolute top-0 p-2 w-full h-full max-w-xl shadow sm:rounded-xl sm:px-10 flex items-center justify-center py-0 sm:px-6 lg:px-8'>
                    <div className="w-full">
                        <div className="p-6 bg-white rounded-md">
                            <h2 className="text-2xl text-center font-bold mb-4">Edit Series</h2>
                            <ImageUpload
                                onImageUploaded={handleImageUploadedPublic}
                                onClose={() => { }}
                                isTitleDisplay={true}
                            />
                            <p className="mt-6 mb-2 text-sm text-gray-700">Title</p>
                            <input
                                type="text"
                                value={dataSeriesEdit.title}
                                onChange={(e) => setDataSeriesEdit({ ...dataSeriesEdit, title: e.target.value })}
                                className="w-full text-lg font-bold leading-tight  mb-6 border border-gray-300 rounded p-1"
                            />
                            <p className="text-sm mb-2 text-gray-700">Description</p>
                            <TextAreaCustom value={dataSeriesEdit.description} onChange={(e: any) => setDataSeriesEdit({ ...dataSeriesEdit, description: e.target.value })}
                                rows={4}
                                className="w-full p-2 mb-6 border border-gray-300 rounded mb-2"
                            />

                            <div className="flex justify-center gap-4">
                                <ButtonCyanToBlue onClick={onConfirmEditing} title="Save Changes" classAddition="px-8 py-2 rounded-md" />
                                <ButtonRedToYellow onClick={onCancelEditing} title="Cancel" classAddition="px-8 py-2 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {onDeleteSeriesing && <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 flex justify-center items-center bg-gray-100/70">
                <div className='absolute top-0 p-2 w-full h-full max-w-xl shadow sm:rounded-xl sm:px-10 flex items-center justify-center py-0 sm:px-6 lg:px-8'>
                    <div className="w-full">
                        <div className="p-6 bg-white rounded-md">
                            <h2 className="text-2xl text-center font-bold mb-4">Delete Series</h2>
                            <p className="text-center mb-6">Are you sure you want to delete this series? This action cannot be undone.</p>

                            <div className="flex justify-center gap-4">
                                <ButtonRedToYellow onClick={() => deleteSeries(onDeleteSeriesing)} title="Confirm Delete" classAddition="px-8 py-2 rounded-md" />
                                <ButtonCyanToBlue onClick={() => setOnDeleteSeriesing('')} title="Cancel" classAddition="px-8 py-2 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div >
    );
}

export default SeriesElement;