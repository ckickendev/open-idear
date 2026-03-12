import React, { useEffect, useState } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { getHeadersToken } from '@/lib/api/axios';

interface MediaBrowserProps {
    onSelect: (media: any) => void;
    onClose: () => void;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({ onSelect, onClose }) => {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/media/user`, {
                headers: getHeadersToken(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch media');
            }

            const data = await response.json();
            if (data.status === 'success') {
                setMediaList(data.data);
            } else {
                throw new Error(data.error || 'Failed to fetch media');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black-700 bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-5xl p-6 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Media Library</h2>
                        <p className="text-sm text-gray-500 mt-1">Select an existing image from your uploads</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 size={40} className="animate-spin text-blue-500" />
                            <p className="text-gray-500 font-medium">Loading your media...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <p className="font-medium bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                            <button
                                onClick={fetchMedia}
                                className="mt-4 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                Retry
                            </button>
                        </div>
                    ) : mediaList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <ImageIcon size={48} className="text-gray-400" />
                            </div>
                            <p className="font-medium text-lg text-gray-600">No media found</p>
                            <p className="text-sm">Upload some images first to see them here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 px-1">
                            {mediaList.map((media) => (
                                <div
                                    key={media._id}
                                    onClick={() => onSelect(media)}
                                    className="group relative cursor-pointer border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 aspect-square bg-gray-50"
                                >
                                    <img
                                        src={media.url}
                                        alt={media.description || 'Media item'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <button className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg shadow-sm">
                                                Select Image
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaBrowser;
