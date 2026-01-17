'use client';

import { useTranslation } from "@/app/hook/useTranslation";
import Image from "next/image";

export default function Banner() {
    const { t } = useTranslation();
    return (
        <>
            {/* <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
                <div className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
                    <div className="aspect-577/310 w-[36.0625rem] bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30" style={{ clipPath: "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9% " }}></div>
                </div>
                <div className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
                    <div className="aspect-577/310 w-[36.0625rem] bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30" style={{ clipPath: "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%" }}></div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-sm/6 text-gray-900">
                        <strong className="font-semibold">GeneriCon 2023</strong><svg viewBox="0 0 2 2" className="mx-2 inline size-0.5 fill-current" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>Join us in Denver from June 7 – 9 to see what’s coming next.
                    </p>
                    <a href="#" className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">Register now <span aria-hidden="true">&rarr;</span></a>
                </div>
                <div className="flex flex-1 justify-end">
                    <button type="button" className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
                        <span className="sr-only">Dismiss</span>
                        <svg className="size-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                    </button>
                </div>
            </div> */}
            <section className="relative overflow-hidden w-full flex flex-col items-center">
                <div className="w-full relative aspect-[16/5] sm:aspect-[21/9]">
                    <Image
                        src="/banner/banner_standard.png"
                        alt="image banner open idear"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                </div>
                <div className="absolute top-1 flex flex-col flex-nowrap justify-center items-center  gap-4 max-w-screen-xl mx-auto w-full h-full">
                    <h1 className="text-4xl font-semibold text-gray-900 flex items-center justify-center">
                        <span className="text-7xl text-blue-600 font-bold">Open</span>
                        IdeaR
                    </h1>
                    <div className="text-4xl font-semibold text-gray-900 flex items-center justify-center">{t("component.banner.title")}</div>
                    <a href="./create"
                        className="flex items-center gap-2 py-3.5 px-7 rounded-full bg-blue-600 shadow-md text-white font-semibold hover:bg-red-600">{t("component.banner.create")}<svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1.5 6L14.8333 6M10.6667 11L15.0774 6.58926C15.3552 6.31148 15.4941 6.17259 15.4941 6C15.4941 5.82741 15.3552 5.68852 15.0774 5.41074L10.6667 1"
                                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>

            </section>
        </>



    )
}