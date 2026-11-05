export type SearchItemType = "all" | "courses" | "posts";

export type SearchSort =
  | "relevance"
  | "newest"
  | "popular"
  | "price_asc"
  | "price_desc";

export interface SearchCourseItem {
  id: string;
  type: "course";
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  level: string;
  studentsCount: number;
  rating: number;
  ratingCount?: number;
  totalDuration?: number;
  createdAt: string;
}

export interface SearchPostItem {
  id: string;
  type: "post";
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
  readtime: number;
  locale: string;
  views: number;
  likes?: number;
  createdAt: string;
}

export type SearchUnifiedItem = SearchCourseItem | SearchPostItem;

export interface SearchCategoryFacet {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface SearchPagination {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GlobalSearchResult {
  query: string;
  type: SearchItemType;
  locale: string;
  sort: SearchSort;
  counts: {
    all: number;
    courses: number;
    posts: number;
  };
  courses: SearchCourseItem[];
  posts: SearchPostItem[];
  items: SearchUnifiedItem[];
  availableCategories: SearchCategoryFacet[];
  pagination: SearchPagination;
}

export interface GlobalSearchParams {
  q?: string;
  type?: SearchItemType;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  isFree?: boolean | string;
  locale?: string;
  sort?: SearchSort;
  page?: number | string;
  limit?: number | string;
}
