import axios from 'axios';
import RecentlyPost from './RecentlyPost';
import HotSeries from '@/components/hot_series/HotSeries';

export default async function MainPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-100 bg-cover bg-center" style={{ backgroundImage: `url(banner/recently-post-banner.jpg)` }}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Recently Posted</h1>
                    <p className="text-white text-lg max-w-2xl">
                        New ideas shared by our community. Explore the latest innovations and insights.
                    </p>
                </div>
            </div>
            {/* Climate Change Section */}
            <div className="bg-gray-50 py-12">
                <RecentlyPost />
            </div>
            <HotSeries />
        </div>
    );
}