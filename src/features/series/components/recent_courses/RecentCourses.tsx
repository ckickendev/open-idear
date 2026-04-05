'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Star, Clock, BookOpen, ArrowRight } from 'lucide-react';

type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    thumbnail: { url: string };
    instructor: { name: string; avatar: string };
    status: string;
    createdAt?: string;
};

const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return `₫${price.toLocaleString()}`;
};

const RecentCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course`);
                if (res.status === 200 && res.data?.data) {
                    // Take the most recent courses (last added)
                    const allCourses = res.data.data;
                    setCourses(allCourses.slice(0, 10));
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetchCourses();
    }, []);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    if (courses.length === 0) return null;

    return (
        <section className="max-w-full py-10">
            {/* Section Header */}
            <div className="flex items-center justify-center mb-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
                <div className="px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        Recently Added Courses
                    </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
            </div>

            {/* Subtitle */}
            <div className="flex justify-center mb-8">
                <Link
                    href="/courses"
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                >
                    Explore the newest courses from our community. See all
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* Course Carousel */}
            <div className="relative group/courses">
                {/* Left scroll button */}
                <button
                    onClick={scrollLeft}
                    className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-200 text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover/courses:opacity-100 transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-lg"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Scrollable container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-5 px-8 pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {courses.map((course) => {
                        const rating = (4 + Math.random() * 0.9);
                        const students = Math.floor(100 + Math.random() * 5000);
                        const totalHours = Math.floor(5 + Math.random() * 30);

                        return (
                            <div key={course._id} className="flex-shrink-0 w-[280px]">
                                <Link href={`/courses/${course.slug}`} className="group block">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden rounded-xl mb-3 bg-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
                                        {course.thumbnail?.url ? (
                                            <Image
                                                src={course.thumbnail.url}
                                                alt={course.title}
                                                fill
                                                sizes="280px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                <BookOpen size={32} className="text-indigo-300" />
                                            </div>
                                        )}
                                        {/* Price badge */}
                                        <div className="absolute top-2 right-2">
                                            {course.discountPrice && course.discountPrice > 0 ? (
                                                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                                    -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                                                </span>
                                            ) : course.price === 0 ? (
                                                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                                    FREE
                                                </span>
                                            ) : null}
                                        </div>
                                        {/* New badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                                New
                                            </span>
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <h3 className="font-bold text-[15px] leading-snug text-gray-800 mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                                        {course.title}
                                    </h3>

                                    <p className="text-xs text-gray-500 mb-1.5 truncate">
                                        {course.instructor?.name || 'Instructor'}
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

                                    {/* Duration */}
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
                                        <Clock size={11} />
                                        <span>{totalHours} hours</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-2">
                                        {course.discountPrice && course.discountPrice > 0 ? (
                                            <>
                                                <span className="font-extrabold text-gray-900">{formatPrice(course.discountPrice)}</span>
                                                <span className="text-xs text-gray-400 line-through">{formatPrice(course.price)}</span>
                                            </>
                                        ) : (
                                            <span className="font-extrabold text-gray-900">{formatPrice(course.price)}</span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Right scroll button */}
                <button
                    onClick={scrollRight}
                    className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-200 text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover/courses:opacity-100 transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-lg"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Bottom border */}
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </section>
    );
};

export default RecentCourses;
