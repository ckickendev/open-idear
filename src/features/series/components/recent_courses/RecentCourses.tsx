'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Star, Clock, BookOpen, ArrowRight, Sparkles, Users } from 'lucide-react';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    thumbnail: { url: string };
    instructor: { name: string; username: string; avatar: string };
    status: string;
    createdAt?: string;
    enrolledUsers?: string[];
};

const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return `₫${price.toLocaleString()}`;
};

const RecentCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const CARD_WIDTH = 300;
    const GAP = 20;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course?limit=10&sort=-createdAt`
                );
                if (res.status === 200 && res.data?.data) {
                    setCourses(res.data.data);
                } else if (res.status === 200 && res.data?.courses) {
                    setCourses(res.data.courses);
                }
            } catch (error) {
                console.error('Error fetching recent courses:', error);
            }
        };
        fetchCourses();
    }, []);

    // Auto-scroll carousel
    const scrollToIndex = useCallback((index: number) => {
        if (scrollRef.current) {
            const scrollAmount = index * (CARD_WIDTH + GAP);
            scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
            setActiveIndex(index);
        }
    }, []);

    useEffect(() => {
        if (courses.length === 0 || isHovered) return;

        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => {
                const maxIndex = Math.max(0, courses.length - 3);
                const next = prev >= maxIndex ? 0 : prev + 1;
                scrollToIndex(next);
                return next;
            });
        }, 4000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [courses.length, isHovered, scrollToIndex]);

    const scroll = (dir: 'left' | 'right') => {
        const maxIndex = Math.max(0, courses.length - 3);
        if (dir === 'left') {
            const next = activeIndex <= 0 ? maxIndex : activeIndex - 1;
            scrollToIndex(next);
        } else {
            const next = activeIndex >= maxIndex ? 0 : activeIndex + 1;
            scrollToIndex(next);
        }
    };

    // Track scroll position for dot indicators
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const index = Math.round(scrollLeft / (CARD_WIDTH + GAP));
            setActiveIndex(index);
        }
    };

    if (courses.length === 0) return null;

    const maxDots = Math.max(1, courses.length - 2);

    return (
        <section className="py-14 bg-gradient-to-b from-[#f8f7ff] via-white to-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
                                Mới cập nhật
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1.5">
                            Khóa học mới nhất
                        </h2>
                        <p className="text-gray-500 text-[15px]">
                            Những khóa học vừa được thêm vào — bắt đầu học ngay hôm nay
                        </p>
                    </div>
                    <Link
                        href="/courses/search?q="
                        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors group"
                    >
                        Xem tất cả
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Carousel */}
                <div
                    className="relative group/carousel"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Left arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur border border-gray-200 text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 shadow-xl cursor-pointer"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Cards */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-5 overflow-x-auto pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
                    >
                        {courses.map((course) => {
                            const rating = (4 + Math.random() * 0.9);
                            const students = course.enrolledUsers?.length || Math.floor(50 + Math.random() * 2000);
                            const totalHours = Math.floor(5 + Math.random() * 30);

                            return (
                                <div
                                    key={course._id}
                                    className="flex-shrink-0"
                                    style={{ width: CARD_WIDTH, scrollSnapAlign: 'start' }}
                                >
                                    <Link href={`/courses/${course.slug}`} className="group block">
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video overflow-hidden rounded-2xl mb-3.5 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
                                            {course.thumbnail?.url ? (
                                                <Image
                                                    src={course.thumbnail.url}
                                                    alt={course.title}
                                                    fill
                                                    sizes="300px"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                                    <BookOpen size={32} className="text-violet-300" />
                                                </div>
                                            )}

                                            {/* NEW badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-violet-200/50">
                                                    Mới
                                                </span>
                                            </div>

                                            {/* Price badge */}
                                            <div className="absolute top-3 right-3">
                                                {course.discountPrice && course.discountPrice > 0 ? (
                                                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                                        -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                                                    </span>
                                                ) : course.price === 0 ? (
                                                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                                        FREE
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                                <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                                    Xem khóa học →
                                                </span>
                                            </div>
                                        </div>

                                        {/* Course Info */}
                                        <h3 className="font-bold text-[15px] leading-snug text-gray-900 mb-1.5 line-clamp-2 group-hover:text-violet-700 transition-colors duration-200 min-h-[2.7em]">
                                            {course.title}
                                        </h3>

                                        <p className="text-xs text-gray-500 mb-2 truncate">
                                            {course.instructor?.name || course.instructor?.username || 'Instructor'}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <span className="text-sm font-bold text-amber-600">{rating.toFixed(1)}</span>
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star
                                                        key={i}
                                                        size={11}
                                                        className={i <= Math.floor(rating)
                                                            ? 'text-amber-500 fill-amber-500'
                                                            : 'text-amber-500 fill-amber-500 opacity-25'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-gray-400">({students.toLocaleString()})</span>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2.5">
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {totalHours} giờ
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={11} />
                                                {students} học viên
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-2">
                                            {course.discountPrice && course.discountPrice > 0 ? (
                                                <>
                                                    <span className="font-extrabold text-gray-900 text-lg">{formatPrice(course.discountPrice)}</span>
                                                    <span className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</span>
                                                </>
                                            ) : (
                                                <span className="font-extrabold text-gray-900 text-lg">{formatPrice(course.price)}</span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur border border-gray-200 text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 shadow-xl cursor-pointer"
                        aria-label="Next"
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-6">
                    {Array.from({ length: maxDots }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToIndex(i)}
                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                                i === activeIndex
                                    ? 'w-8 h-2 bg-gradient-to-r from-violet-500 to-indigo-600'
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Mobile "View all" link */}
                <div className="sm:hidden mt-6 text-center">
                    <Link
                        href="/courses/search?q="
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600"
                    >
                        Xem tất cả khóa học <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentCourses;
