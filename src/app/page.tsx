import Banner from "@/components/Banner";
import HotSeries from "@/components/hot_series/HotSeries";
import HotPost from "@/components/hot_post/HotPost";
import LastestFeature from "@/components/recently_post/LastestFeature";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenIdeaR",
  description: "openidear - a platform to share and explore ideas",
};

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <>
      <Banner />
      <div className="flex items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col flex-nowrap items-center gap-4 max-w-screen-xl mx-auto w-full row-start-2 items-center sm:items-start">
          <LastestFeature />
          <HotPost />
          <HotSeries />
        </main>
      </div>
    </>

  );
}
