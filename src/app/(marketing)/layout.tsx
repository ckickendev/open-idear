import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Marketing layout — wraps all public-facing pages with Header + Footer.
 * This is a Server Component by default.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex h-16 items-center justify-center border-b border-border bg-background">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <Header />
      </Suspense>
      <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
