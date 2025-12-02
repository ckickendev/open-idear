import Notification from '@/component/common/Notification';
import { Menu, Search, User } from 'lucide-react';

export default async function CategoryList({
    params,
}: {
    params: Promise<{ slug: string }>;
}
) {
    const { slug } = await params;
    console.log(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getCategoryBySlug/${slug}`);

    const getCategory = async (slug: string) => {
        try {
            // Using native fetch with Next.js optimizations
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getCategoryBySlug/${slug}`,
                {
                    // Next.js 13+ fetch options
                    next: { revalidate: 3600 }, // Cache for 1 hour
                    // or use: cache: 'no-store' for always fresh data
                }
            );

            console.log(`Fetched category data for slug:`, res);


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const bgImg = `${process.env.NEXT_PUBLIC_ROOT_FRONTEND}/background/category/${data.category?._id}.png`;

            console.log('Final bgImg path:', bgImg);
            return { ...data.category, bgImg };
        } catch (error) {
            console.error("Error fetching category:", error);
            throw new Error(`Failed to fetch category with slug: ${slug}`);
        }
    };

    const getPostData = async (slug: string) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getPostsByCategorySlug/${slug}`,
                {
                    next: { revalidate: 3600 },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            return data.posts;
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw new Error(`Failed to fetch posts for category slug: ${slug}`);
        }
    };

    const getAllCategory = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`,
                {
                    next: { revalidate: 3600 },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            return data.categories;
        } catch (error) {
            console.error("Error fetching all categories:", error);
            throw new Error("Failed to fetch all categories");
        }
    }

    const categoryData = await getCategory(slug);
    const postData = await getPostData(slug);
    const allCategory = await getAllCategory();

    const ArticleCard = ({ image, title, size = 'normal', category = 'ANIMALS' }: { image: string; title: string; size?: string; category?: string }) => {
        return (
            <div className={`relative overflow-hidden rounded-lg group cursor-pointer ${size === 'large' ? 'col-span-2 row-span-2' : ''
                }`}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <p className="text-xs font-semibold tracking-widest mb-3">{category}</p>
                        <h2 className={`font-bold leading-tight mb-4 ${size === 'large' ? 'text-4xl' : 'text-2xl'
                            }`}>
                            {title}
                        </h2>
                        <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                            <Menu size={16} />
                            READ
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const articles = [
        {
            category: 'ANIMALS',
            title: 'Sharks are thriving in some marine parks—but not others. Why?',
            image: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=800&h=600&fit=crop',
            link: '#'
        },
        {
            category: 'SCIENCE',
            title: 'Is caffeine a vice or virtue? It depends on the dose',
            image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop',
            link: '#'
        },
        {
            category: 'ENVIRONMENT',
            title: 'Why we must flooding diagnosis',
            image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
            link: '#'
        },
        {
            category: 'ENVIRONMENT',
            title: 'In 500 pieces, six tree species protect Earth',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
            link: '#'
        },
        {
            category: 'ENVIRONMENT',
            title: 'What is lake-effect snow?',
            image: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&h=600&fit=crop',
            link: '#'
        },
        {
            category: 'ENVIRONMENT',
            title: 'What is lake-effect snow?',
            image: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&h=600&fit=crop',
            link: '#'
        }
    ];

    const climateArticles = [
        {
            category: 'ENVIRONMENT',
            title: 'Los Angeles wildfires rage overnight',
            description: 'The Palisades and Eaton fires have burned more than 25,000 acres and forced thousands to evacuate as heavy winds fuel the blazes.',
            image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&h=500&fit=crop',
            size: 'large'
        },
        {
            category: 'ENVIRONMENT',
            title: "The world's plastic pollution crisis, explained",
            description: `Plastic waste is everywhere—from the ocean floor to mountain peaks. Here's how it got there and what we can do about it.`,
            image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&h=500&fit=crop',
            size: 'large'
        },
        {
            category: 'SCIENCE',
            title: 'Why deforestation matters and what we can do to stop it',
            description: `Forests cover about 30 percent of the planet, but deforestation is clearing these essential habitats on a massive scale. Here's what's at stake.`,
            image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=500&fit=crop',
            size: 'medium'
        },
        {
            category: 'SCIENCE',
            title: 'What causes earthquakes?',
            description: 'Earthquakes are caused by shifts in the outer layers of Earth—a region called the lithosphere.',
            image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=500&fit=crop',
            size: 'medium'
        },
        {
            category: 'SCIENCE',
            title: 'What are hurricanes, typhoons, and cyclones?',
            description: `These giant tropical storms produce deadly floods, winds, and storm surges. Here's what you need to know.`,
            image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=500&fit=crop',
            size: 'medium'
        }
    ];

    const moreArticles = [
        {
            category: 'ENVIRONMENT',
            title: 'Farmers in Brazil are restoring biodiversity to grow more resilient crops',
            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: 'The ten states obesities—and how to fight them',
            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: "Why are Alaska's rivers turning bright orange?",
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'
        },
        {
            category: 'ENVIRONMENT',
            title: "Why hurricanes are getting more powerful—even deadly",
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop'
        },
    ];

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Section */}
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${categoryData?.bgImg})` }}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{categoryData?.name}</h1>
                    <p className="text-white text-lg max-w-2xl">
                        {categoryData?.description}
                    </p>
                </div>
            </div>

            {/* Featured Articles Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-10">RECENTLY</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, idx) => (
                        <ArticleCard
                            key={idx}
                            image={article.image}
                            title={article.title}
                            category={article.category}
                        />
                    ))}
                </div>
            </div>

            {/* Climate Change Section */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-10">MORE ON CATEGORY</h2>
                    <div className="space-y-8 flex flex-col justify-between md:flex-row md:space-y-0 md:space-x-8">
                        <div className='w-4/5 space-y-4'>
                            {climateArticles.map((article, idx) => (
                                <div key={idx} className={'grid md:grid-cols-5 gap-y-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow'}>
                                    <div className={'md:col-span-2'}>
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className={`p-6 flex flex-col justify-center md:col-span-3`}>
                                        <span className="text-yellow-600 text-xs font-semibold mb-2">{article.category}</span>
                                        <h3 className="text-2xl font-bold mb-3">{article.title}</h3>
                                        <p className="text-gray-600">{article.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='w-1/5'>
                            <h2 className="text-sm font-bold text-left mb-10">KEYWORDS</h2>
                            {allCategory.map((cat: any, idx: number) => (
                                <div key={idx} className="mb-6">
                                    <a href={`/category/${cat.slug}`} className="text-heading bg-gradient-to-r from-gray-200 to-green-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-base text-sm px-4 py-2.5 leading-5 mb-2 mr-2">
                                        {cat.name}
                                    </a>
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className="text-center mt-10">
                        <button className="border-2 border-black px-8 py-3 rounded font-semibold hover:bg-black hover:text-white transition-colors">
                            LOAD MORE
                        </button>
                    </div>
                </div>
            </div>

            {/* Read More Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8">ANOTHER</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moreArticles.map((article, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-lg mb-3">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <span className="text-yellow-400 text-xs font-semibold">{article.category}</span>
                                    <h3 className="text-white text-xl font-bold mt-2">{article.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>

        </div>
    );
}