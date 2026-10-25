"use client";

import { ENV } from "@/api/const";
import { SeriesInterface } from "@/interfaces/Interface";
import { SeriesCardSkeleton } from "@/components/ui/Skeletons";
import axios from "axios";
import { BookOpen, Layers, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

export default function SeriesListPage() {
  const [seriesList, setSeriesList] = useState<SeriesInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchAllSeries = async () => {
      const rootApi = ENV?.ROOT_API;
      if (!rootApi) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Fetch hot series and all series
        const res = await axios.get(`${rootApi}/series/getHotSeries`, {
          timeout: 5000,
        });
        if (!isMounted) return;
        if (res.status === 200 && res.data?.series) {
          setSeriesList(res.data.series);
        } else {
          // Fallback to /series
          const fallbackRes = await axios.get(`${rootApi}/series`, {
            timeout: 5000,
          });
          if (!isMounted) return;
          setSeriesList(fallbackRes.data?.series || []);
        }
      } catch (err) {
        console.warn("Error fetching series list:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllSeries();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.filter((s) => {
      const titleMatch = s.title?.toLowerCase().includes(q);
      const descMatch = s.description?.toLowerCase().includes(q);
      const authorMatch =
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.username?.toLowerCase().includes(q);
      return titleMatch || descMatch || authorMatch;
    });
  }, [seriesList, searchQuery]);

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Sparkles size={14} />
            <span>Curated Learning Paths</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Explore Series
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Structured, multi-part series designed to take you deep into programming,
            system architecture, and modern technology.
          </p>

          {/* Search Bar */}
          <div className="relative mt-6 max-w-md mx-auto">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search series by title or author..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Series Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SeriesCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((item) => (
              <Link
                key={item._id}
                href={`/series/${item.slug}`}
                className="group flex flex-col bg-card border border-border/60 hover:border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Series Banner */}
                <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#161B22] to-[#242B38] flex items-center justify-center">
                      <Layers size={36} className="text-primary/70" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={12} />
                    Series
                  </div>
                </div>

                {/* Series Details */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {item.description || "No description available for this series."}
                  </p>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">
                      by{" "}
                      <span className="font-semibold text-foreground">
                        {item.user?.name || item.user?.username || "OpenIdear Author"}
                      </span>
                    </span>
                    <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform text-xs inline-flex items-center gap-0.5">
                      Explore &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Layers size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              No series found
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery
                ? `No series matching "${searchQuery}". Try different keywords.`
                : "No learning series available yet. Check back soon!"}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear search query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
