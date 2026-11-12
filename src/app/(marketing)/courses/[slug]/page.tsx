import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { serverFetch } from "@/lib/api/serverFetch";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseSidebarAction } from "./CourseSidebarAction";
import { Course } from "./types";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

// ─── Route Segment Config ───────────────────────────────────────────────────
// Fallback to on-demand generation for newly published courses
export const dynamicParams = true;

// ─── Pre-render Active Courses at Build Time ─────────────────────────────────

export async function generateStaticParams() {
  try {
    const { data } = await serverFetch<any>("/course?limit=50&sort=-createdAt", {
      tags: ["courses"],
      revalidate: 86400,
      timeoutMs: 5000, // 5s build-time timeout
    });

    const coursesList = data?.data || data?.courses || [];
    if (!Array.isArray(coursesList)) return [];

    return coursesList
      .filter((c: any) => Boolean(c.slug))
      .map((c: any) => ({ slug: c.slug }));
  } catch (err) {
    console.warn("[generateStaticParams:course] Fallback to on-demand generation:", err);
    return [];
  }
}

// ─── Fetch Course with Next.js 15 Data Cache ─────────────────────────────────

async function getCourse(slug: string): Promise<Course | null> {
  const { data } = await serverFetch<any>(`/course/getBySlug?slug=${slug}`, {
    tags: ["courses", `course-${slug}`],
    revalidate: 3600,
    timeoutMs: 8000,
  });

  if (!data) return null;
  return data.data || data.course || null;
}

// ─── Dynamic Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: "Course Not Found | OpenIdear",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${course.title} | OpenIdear Courses`,
    description:
      course.description?.slice(0, 160) ||
      "Master engineering concepts with practical, industry-standard courses on OpenIdear.",
    openGraph: {
      title: `${course.title} | OpenIdear Courses`,
      description: course.description,
      images: course.thumbnail?.url ? [course.thumbnail.url] : ["/banner/course-default.webp"],
    },
  };
}

// ─── Course Detail Page (Server Component) ───────────────────────────────────

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const whatYouWillLearn =
    course.whatYouWillLearn && course.whatYouWillLearn.length > 0
      ? course.whatYouWillLearn
      : [
          "Xây dựng tư duy tài chính cá nhân đúng đắn và kế hoạch hưu trí độc lập",
          "Hiểu rõ cơ chế hoạt động của thị trường chứng khoán, cổ phiếu và trái phiếu",
          "Làm chủ chiến lược đầu tư thụ động (Passive Investing) an toàn và hiệu quả",
          "Tận dụng tối đa sức mạnh của lãi suất kép (Compound Effect) cho danh mục dài hạn",
          "Phân biệt chi tiết giữa Quỹ tương hỗ (Mutual Funds), Quỹ chỉ số (Index Funds) và ETFs",
          "Thực hành phân bổ danh mục đầu tư và lựa chọn quỹ uy tín tại thị trường Việt Nam",
        ];

  const requirements =
    course.requirements && course.requirements.length > 0
      ? course.requirements
      : [
          "Không yêu cầu kiến thức kỹ thuật chuyên sâu trước đó",
          "Tư duy cởi mở và mong muốn xây dựng lộ trình thực chiến bền vững",
          "Thiết bị có kết nối Internet để theo dõi các bài học video",
        ];

  return (
    <div className="bg-background min-h-screen relative pb-20">
      {/* ── Header / Overview Banner (Static Shell) ── */}
      <div className="bg-background border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:w-2/3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Link
                href="/courses"
                className="text-primary font-bold hover:underline"
              >
                {course.category?.name || "Courses"}
              </Link>
              <span className="text-muted-foreground">{">"}</span>
              <span className="text-muted-foreground/70 truncate">
                {course.title}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-500">
                <span className="font-bold underline">
                  {course.averageRating?.toFixed(1) || "4.9"}
                </span>
                <span className="tracking-widest">★★★★★</span>
                <span className="text-primary ml-1">
                  ({course.ratingCount || 128} ratings)
                </span>
              </div>
              <div className="text-muted-foreground">
                {(course.studentsCount || 1520).toLocaleString()} students
              </div>
              {course.instructor?.name && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Instructor:</span>
                  <span className="text-primary font-medium">
                    {course.instructor.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Content + Sticky Sidebar Island ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="border border-border p-6 rounded-xl bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <Check
                    size={18}
                    className="mt-1 flex-shrink-0 text-emerald-500"
                  />
                  <span className="text-foreground/85 text-sm leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion (Client Island) */}
          <CourseCurriculum
            chapters={course.chapters || []}
            courseSlug={slug}
            courseTitle={course.title}
            courseThumbnailUrl={course.thumbnail?.url}
          />

          {/* Requirements */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80 text-sm">
              {requirements.map((req, idx) => (
                <li key={idx} className="leading-relaxed">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor Bio */}
          {course.instructor && (
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold mb-4">Instructor</h2>
              <div className="flex gap-4 items-center mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex-shrink-0 overflow-hidden relative">
                  <img
                    src={course.instructor.avatar || "/default-avatar.png"}
                    alt={course.instructor.name || "Instructor"}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {course.instructor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor.headline || "Technical Lead & Senior Course Author"}
                  </p>
                </div>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                {course.instructor.bio ||
                  "Senior software engineer, architect, and educator with extensive industry experience building scalable production platforms."}
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky Sidebar Purchase / Cart / Preview Action (Client Island) ── */}
        <div className="lg:relative">
          <CourseSidebarAction course={course} />
        </div>
      </div>
    </div>
  );
}
