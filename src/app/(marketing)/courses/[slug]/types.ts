export interface LessonMedia {
  duration?: number;
  url?: string;
  thumbnail?: string;
  bunnyVideoId?: string;
  cloudflareId?: string;
  type?: string;
  status?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  type: string;
  url: string;
  isFreePreview: boolean;
  order: number;
  duration?: number;
  media?: LessonMedia;
}

export interface Chapter {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseInstructor {
  name: string;
  avatar?: string;
  bio?: string;
  headline?: string;
}

export interface CourseCategory {
  name: string;
  slug: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  isFree?: boolean;
  thumbnail?: { url: string };
  category?: CourseCategory;
  topics?: Array<{ name: string; slug: string }>;
  instructor?: CourseInstructor;
  chapters?: Chapter[];
  studentsCount?: number;
  averageRating?: number;
  ratingCount?: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  totalDuration?: number;
  level?: string;
  language?: string;
}

