"use client";

import React, { useEffect, useState } from "react";
import { BookText, BookOpen, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { courseApi } from "@/features/series/api/course.api";
import loadingStore from "@/store/LoadingStore";

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail?: { url: string };
  instructor: { name: string; avatar?: string };
  status: string;
};

const YourCourse = () => {
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const changeLoad = loadingStore((state) => state.changeLoad);

  useEffect(() => {
    const fetchCourses = async () => {
      changeLoad();
      try {
        const [createdRes, enrolledRes] = await Promise.all([
          courseApi.getCoursesByUser(),
          courseApi.getEnrolledCourses(),
        ]);

        if (createdRes.success) {
          setCreatedCourses(createdRes.data.courses || []);
        }
        if (enrolledRes.success) {
          setEnrolledCourses(enrolledRes.data.courses || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        changeLoad();
      }
    };

    fetchCourses();
  }, []);

  const renderCourseCard = (course: Course, isCreated: boolean) => (
    <div
      key={course._id}
      className="border border-border rounded-lg overflow-hidden flex flex-col sm:flex-row mb-4 hover:shadow-md transition-shadow bg-background"
    >
      <div className="w-full sm:w-48 aspect-video bg-muted flex-shrink-0 relative">
        {course.thumbnail?.url ? (
          <img
            src={course.thumbnail.url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <BookOpen size={24} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {course.description || "No description provided"}
        </p>

        {isCreated ? (
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-border">
            <span
              className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${course.status === "published" ? "bg-[#d1d7dc] text-foreground" : "bg-muted border border-border text-foreground"}`}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </span>
            <Link
              href={`/management/course/${course._id}/curriculum`}
              className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              <Settings size={14} /> Manage
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Learning Progress</span>
              <span className="font-bold text-foreground">0%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-3">
              <div
                className="bg-purple-600 h-1.5 rounded-full"
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> Start now
              </span>
              <Link
                href={`/courses/${course._id}`} // Or course.slug if available
                className="text-sm font-bold bg-background text-white px-3 py-1.5 rounded hover:bg-card transition-colors"
              >
                Learn Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 m-l-4 p-6 bg-background rounded-lg shadow-sm">
      <div className="w-full mx-auto bg-background">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookText className="text-blue-600" size={32} />
            Your Courses
          </h1>
          <p className="text-muted-foreground">
            Overview of the courses you teach and enroll in
          </p>
        </div>

        {/* Enrolled Courses Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
            Enrolled Courses
          </h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {enrolledCourses.map((course) => renderCourseCard(course, false))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 border border-border rounded-lg">
              <p className="text-muted-foreground mb-3">
                You have not enrolled in any courses yet.
              </p>
              <Link
                href="/courses"
                className="text-blue-600 font-bold hover:underline"
              >
                Explore courses now
              </Link>
            </div>
          )}
        </div>

        {/* Created Courses Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
            Instructor Courses
          </h2>
          {createdCourses.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {createdCourses.map((course) => renderCourseCard(course, true))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 border border-border rounded-lg">
              <p className="text-muted-foreground mb-3">
                You haven't created any courses yet.
              </p>
              <Link
                href="/management/my-courses"
                className="text-blue-600 font-bold hover:underline"
              >
                Create New Course
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourCourse;
