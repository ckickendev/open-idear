'use client';
import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import axios from "axios";

interface SeriesInteface {
  _id: string;
  description: string;
  image: { url: string; description: string };
  user: { name: string; username: string }
  slug: string;
  title: string;
}

const getSeriesData = async () => {
  // Placeholder for fetching series data
  try {

    const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getHotSeries`);
    if (res.status === 200) {
      console.log('res.data.series: ', res.data.series);
      return res.data.series;

    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

const series = await getSeriesData();

const HotSeries: React.FC = () => {
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
    <section className="max-w-full py-8">
      {/* Header with divider lines */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <h2 className="text-2xl font-bold text-gray-800 px-6 uppercase">
          Hot Series
        </h2>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* See all link */}
      <div className="flex justify-center mb-8">
        <Link
          href="/series"
          className="text-sm text-gray-700 hover:underline"
        >
          Hot series updates every day. See all
        </Link>
      </div>

      {/* Articles container with scroll */}
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
          {series.map((serie: SeriesInteface) => (
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

      {/* Bottom border */}
      <div className="mt-8 h-px bg-gray-300"></div>
    </section>
  );
};

export default HotSeries;
