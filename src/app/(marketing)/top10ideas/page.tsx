import { Suspense } from "react";
import Top10IdeasClient from "./Top10IdeasClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 10 Ideas of the Month — OpenIdear",
  description:
    "Discover the most impactful ideas shared by our community this month, ranked by engagement, views, and community interaction.",
};

export default function Top10IdeasPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-800" />

        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Monthly Ranking
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
            Top{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              10
            </span>{" "}
            Ideas
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
            The most impactful ideas from our community — ranked by likes,
            comments, and views.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm animate-pulse">
                Calculating top ideas…
              </p>
            </div>
          }
        >
          <Top10IdeasClient />
        </Suspense>
      </div>
    </main>
  );
}
