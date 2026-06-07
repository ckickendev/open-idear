"use client";

import { useRouter } from "next/navigation";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFoundPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[180px] pointer-events-none" />

      {/* Main Content Container - Glassmorphism */}
      <div className="relative z-10 w-full max-w-xl p-10 md:p-14 bg-background/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl text-center flex flex-col items-center">
        {/* Icon Container with Pulse + Spin effect */}
        <div className="relative flex items-center justify-center mb-8">
          <div
            className="absolute w-32 h-32 bg-indigo-500/20 rounded-full animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute w-40 h-40 bg-violet-500/10 rounded-full animate-pulse" />
          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Compass
              className="w-12 h-12 text-white animate-spin"
              strokeWidth={1.5}
              style={{ animationDuration: "8s" }}
            />
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground/50 mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
          Looks like you've drifted into uncharted territory. The page you're
          looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => router.back()}
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-background/10 hover:bg-background/20 text-white font-medium rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Return Home</span>
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 text-muted-foreground text-sm font-medium tracking-wide">
        OPEN IDEAR • PAGE NOT FOUND
      </div>
    </div>
  );
}
