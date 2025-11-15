import Banner from "@/component/Banner";
import Guide from "@/component/Guide/Guide";
import HotPost from "@/component/hot_post/HotPost";
import LastestFeature from "@/component/lastest_feature/LastestFeature";
import Head from "next/head";

export default function Home() {
  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <>
      <Head>
        <title>OpenIdeaR</title>
        <meta name="description" content="openidear - a platform to share and explore ideas" />
        <link rel="icon" href="logo.ico" />
      </Head>
      <Banner />
      <div className="flex items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col flex-nowrap items-center gap-4 max-w-screen-xl mx-auto w-full row-start-2 items-center sm:items-start">
          <LastestFeature />
          <HotPost />
          <Guide />
        </main>
      </div>
    </>

  );
}
