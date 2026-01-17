"use client"

import { SeriesInterface } from "@/interfaces/Interface";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AnotherSeries = ({ slug }: { slug: string }) => {
    const [anotherSeriesData, setAnotherSeriesData] = React.useState<SeriesInterface[]>([]);

    React.useEffect(() => {
        const getAnotherSeriesData = async () => {
            try {
                // Fetch another series data based on the slug
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getAnotherSeriesBySlug?slug=${slug}`,
                );

                console.log(res.data.anotherSeries);
                setAnotherSeriesData(res.data.anotherSeries);
            } catch (error) {
                console.error("Error fetching another series:", error);
            }
        };
        getAnotherSeriesData();
    }, [slug]);

    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    return (
        <>
            <div className="flex items-center justify-center mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <h2 className="text-2xl font-bold text-gray-800 px-6 uppercase">
                    Another Series from this author
                </h2>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="relative">
                {/* Left scroll button */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-3 hover:bg-gray-100"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Scrollable container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-5 px-12 pb-4 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {anotherSeriesData?.map((serie: SeriesInterface) => (
                        <div key={serie._id} className="flex-shrink-0 w-64">
                            <Link href={`/series/${serie.slug}`}>
                                <div className="group">
                                    <div className="bg-gray-200 h-40 w-full mb-3 overflow-hidden">
                                        <Image src={serie?.image?.url || '/default-series-image.jpg'} alt={serie.title} width={256} height={160} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        {/* Placeholder for image - in production, use Next.js Image component */}
                                        <div className="h-full w-full bg-gray-300"></div>
                                    </div>
                                    <h3 className="font-bold text-base mb-2 group-hover:text-blue-600">
                                        {serie.title}
                                    </h3>
                                    <p className="text-xs text-gray-600">BY {serie.user.name}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right scroll button */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-3 hover:bg-gray-100"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </>
    );
};

export default AnotherSeries;