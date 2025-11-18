'use client';
import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Article {
  id: number;
  title: string;
  image: string;
  author: string;
  slug: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Want More Privacy Online? Change These Browser Settings",
    image: "https://images.spiderum.com/sp-thumbnails/f8340000109e11f09ea4735fee28966f.jpg",
    author: "KIM KEY",
    slug: "browser-settings-privacy",
  },
  {
    id: 2,
    title: "The Best Hardware Security Keys We've Tested",
    image: "https://images.spiderum.com/sp-thumbnails/f8340000109e11f09ea4735fee28966f.jpg",
    author: "KIM KEY",
    slug: "best-hardware-security-keys",
  },
  {
    id: 3,
    title: "Proton VPN vs. NordVPN: Which Is Best for Protecting Your Privacy?",
    image: "https://images.spiderum.com/sp-thumbnails/f8340000109e11f09ea4735fee28966f.jpg",
    author: "KIM KEY",
    slug: "proton-vs-nordvpn",
  },
  {
    id: 4,
    title: "How to Use a Random Generator to Create the Best Passwords",
    image: "https://images.spiderum.com/sp-thumbnails/f8340000109e11f09ea4735fee28966f.jpg",
    author: "NEIL J. RUBENKING",
    slug: "random-generator-passwords",
  },
  {
    id: 5,
    title: "Arm Your PC With Antivirus You Can Trust",
    image: "https://images.spiderum.com/sp-thumbnails/f8340000109e11f09ea4735fee28966f.jpg",
    author: "NEIL J. RUBENKING",
    slug: "antivirus-you-can-trust",
  },
];

const Guide: React.FC = () => {
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
          SecurityWatch
        </h2>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* See all link */}
      <div className="flex justify-center mb-8">
        <Link
          href="/security-watch"
          className="text-sm text-gray-700 hover:underline"
        >
          See All SecurityWatch Stories
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
          {articles.map((article) => (
            <div key={article.id} className="flex-shrink-0 w-64">
              <Link href={`/article/${article.slug}`}>
                <div className="group">
                  <div className="bg-gray-200 h-40 w-full mb-3 overflow-hidden">
                    <Image src={article.image} alt={article.title} width={256} height={160} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {/* Placeholder for image - in production, use Next.js Image component */}
                    <div className="h-full w-full bg-gray-300"></div>
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-blue-600">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-600">BY {article.author}</p>
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

export default Guide;
