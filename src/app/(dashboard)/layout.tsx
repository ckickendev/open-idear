"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

/**
 * Dashboard layout — admin panel with sidebar navigation.
 * No public Header/Footer. The sidebar and dashboard header
 * are rendered by the management page itself (preserving existing pattern).
 *
 * Guards the route: only users with role === 1 (admin) may access.
 * - Unauthenticated users → redirect to /
 * - Authenticated non-admins → redirect to /403
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/auth/getProfile`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const user = res.data?.userInfo;
        if (user && Number(user.role) === 1) {
          setAuthorized(true);
        } else {
          router.replace("/403");
        }
      } catch {
        // Token invalid / network error → treat as unauthenticated
        router.replace("/");
      }
    };

    checkAuth();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
