'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import loadingStore from "@/store/LoadingStore";
import {
    Search,
    Filter,
    PlayCircle,
    Star,
    ArrowRight,
    ChevronDown,
    Grid,
    List,
    X,
    Code,
    Brain,
    Database,
    Lock,
    Cloud,
    Terminal,
    Smartphone,
    Layout
} from 'lucide-react';

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
    category?: string;
};

const CATEGORIES = [
    { id: 'web', label: 'Lập trình Web', icon: Code },
    { id: 'ai', label: 'Trí tuệ nhân tạo', icon: Brain },
    { id: 'data', label: 'Khoa học dữ liệu', icon: Database },
    { id: 'security', label: 'An ninh mạng', icon: Lock },
    { id: 'cloud', label: 'Điện toán đám mây', icon: Cloud },
    { id: 'devops', label: 'DevOps', icon: Terminal },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
    { id: 'uiux', label: 'UI/UX Design', icon: Layout },
];

const PRICE_RANGES = [
    { id: 'free', label: 'Miễn phí' },
    { id: 'under500', label: 'Dưới 500.000đ' },
    { id: 'above500', label: 'Trên 500.000đ' },
];

const SearchResultsContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState(query);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const changeLoad = loadingStore(state => state.changeLoad);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                changeLoad();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/course`);
                setCourses(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                changeLoad();
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        let results = courses?.filter(course =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description?.toLowerCase().includes(query.toLowerCase())
        );

        if (selectedCategories.length > 0) {
            // Mapping categories to labels for filtering since current data might not have category IDs
            results = results.filter(course =>
                selectedCategories.some(catId => {
                    const cat = CATEGORIES.find(c => c.id === catId);
                    return course.category === cat?.label;
                })
            );
        }

        if (selectedPrices.length > 0) {
            results = results.filter(course => {
                if (selectedPrices.includes('free') && course.price === 0) return true;
                if (selectedPrices.includes('under500') && course.price > 0 && course.price < 500000) return true;
                if (selectedPrices.includes('above500') && course.price >= 500000) return true;
                return false;
            });
        }

        setFilteredCourses(results);
    }, [query, courses, selectedCategories, selectedPrices]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/courses/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const togglePrice = (id: string) => {
        setSelectedPrices(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedPrices([]);
    };

    return (
        <div className="bg-white min-h-screen pt-20">
            {/* Search Header */}
            <div className="bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 max-w-2xl relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm khóa học..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-medium whitespace-nowrap">
                                <span className="text-gray-900 font-bold">{filteredCourses?.length}</span> kết quả cho "{query}"
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-700 shadow-sm"
                    >
                        <Filter size={18} /> Lọc kết quả
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`fixed inset-0 z-50 lg:relative lg:z-0 lg:block w-72 h-full bg-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <div className="lg:sticky lg:top-24 h-full overflow-y-auto lg:overflow-visible">
                            <div className="flex items-center justify-between p-6 lg:p-0 mb-8 border-b lg:border-0">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Filter size={20} className="text-blue-600" /> Bộ lọc
                                </h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Categories Filter */}
                            <div className="px-6 lg:px-0 mb-10">
                                <h4 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                                    Lĩnh vực
                                    {selectedCategories.length > 0 && (
                                        <button onClick={() => setSelectedCategories([])} className="text-xs text-blue-600 hover:underline">Xóa</button>
                                    )}
                                </h4>
                                <div className="space-y-3">
                                    {CATEGORIES.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer hidden"
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onChange={() => toggleCategory(cat.id)}
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-500 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                </div>
                                            </div>
                                            <cat.icon size={18} className="text-gray-400" />
                                            <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">{cat.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="px-6 lg:px-0 mb-10">
                                <h4 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                                    Mức giá
                                    {selectedPrices.length > 0 && (
                                        <button onClick={() => setSelectedPrices([])} className="text-xs text-blue-600 hover:underline">Xóa</button>
                                    )}
                                </h4>
                                <div className="space-y-3">
                                    {PRICE_RANGES.map(price => (
                                        <label key={price.id} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer hidden"
                                                    checked={selectedPrices.includes(price.id)}
                                                    onChange={() => togglePrice(price.id)}
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-500 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">{price.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-2xl hover:border-red-500 hover:text-red-500 text-xs transition-all text-sm mb-12"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                {query ? `Kết quả tìm kiếm cho "${query}"` : 'Tất cả khóa học'}
                            </h2>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>

                        {filteredCourses?.length > 0 ? (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
                                {filteredCourses.map((course) => (
                                    <Link
                                        key={course._id}
                                        href={`/courses/${course.slug}`}
                                        className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col h-full'}`}
                                    >
                                        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3' : 'aspect-video'}`}>
                                            <img
                                                src={course.thumbnail?.url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-bold bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">
                                                    {course.price === 0 ? 'Phổ biến' : 'Bán chạy'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-6 flex flex-col flex-1`}>
                                            <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${viewMode === 'list' ? 'text-lg' : 'text-xl'}`}>
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-200">
                                                    <img src={course.instructor?.avatar} className="w-full h-full rounded-full object-cover" />
                                                </div>
                                                <div className="text-sm text-gray-600 font-medium">{course.instructor?.name}</div>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 mb-4">
                                                <Star size={14} fill="currentColor" />
                                                <Star size={14} fill="currentColor" />
                                                <Star size={14} fill="currentColor" />
                                                <Star size={14} fill="currentColor" />
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-xs text-gray-400 font-bold ml-1">(4.9)</span>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div>
                                                    {course.price === 0 ? (
                                                        <div className="text-xl font-black text-gray-900">MIỄN PHÍ</div>
                                                    ) : course.discountPrice && course.discountPrice > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xl font-black text-gray-900">
                                                                {course.discountPrice.toLocaleString()} VNĐ
                                                            </span>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                {course.price.toLocaleString()} VNĐ
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xl font-black text-gray-900">
                                                            {course.price.toLocaleString()} VNĐ
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Search className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                    Thử thay đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để tìm thấy nội dung phù hợp.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    Khám phá tất cả khóa học
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const SearchResultsPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen pt-40 text-center font-bold text-gray-500">Đang tải...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
};

export default SearchResultsPage;
