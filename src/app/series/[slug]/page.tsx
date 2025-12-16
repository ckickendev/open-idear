import HotSeries from '@/component/hot_series/HotSeries';
import PostDisplayPageElement from '@/component/PostDisplayPageElement';
import axios from 'axios';
import AnotherSeries from './AnotherSeries';

export default async function MainPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const getSeriesData = async () => {
        try {
            // Using native fetch with Next.js optimizations
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getSeriesBySlug?slug=${slug}`,
            );


            console.log(res.data.data);
            
            //console.log("data.post: ", data.post);

            return res.data.data;
        } catch (error) {
            console.error("Error fetching post:", error);
            throw new Error(`Failed to fetch post with slug: ${slug}`);
        }
    };

    const seriesData = await getSeriesData();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-100 bg-cover bg-center" style={{ backgroundImage: `url()` }}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{seriesData.title}</h1>
                    <p className="text-white text-lg max-w-2xl">
                        {seriesData.description || "No description available"}
                    </p>
                </div>
            </div>
            <div className="bg-gray-50 py-12">
                <p className='text-center text-gray-700 text-4xl mb-4'>Series included {seriesData?.posts?.length ?? 0} posts</p>
                <PostDisplayPageElement data={seriesData?.posts} totalPage={seriesData?.posts?.length ?? 0} />
            </div>
            <AnotherSeries slug={slug} />
        </div>
    );
}