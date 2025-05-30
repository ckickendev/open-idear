'use client';
import { useTranslation } from "@/app/hook/useTranslation";
import Logo from "./common/Logo";

export default function Footer() {
    const { t } = useTranslation();
    return (<footer className="px-3 mx-auto pt-4 lg:px-9 border-t-2 bg-gray-50 flex justify-center items-center flex-col">
        <div className="container px-4 grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">

            <div className="sm:col-span-2">
                <a href="#" className="inline-flex items-center">
                    <Logo className="w-30 mr-2" />
                    <span className="text-xl font-bold tracking-wide text-gray-800 uppercase">
                        OpenIdear
                    </span>
                </a>
                <div className="mt-6 lg:max-w-xl">
                    <p className="text-sm text-gray-800">
                        {t('component.footer.description')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 text-sm">
                <p className="text-base font-bold tracking-wide text-gray-900">{t('component.footer.hotcourse')}</p>
                <a href="#">UPSC - Union Public Service Commission</a>
                <a href="#">General Knowledge</a>
                <a href="#">MBA</a>
                <p className="text-base font-bold tracking-wide text-gray-900">{t('component.footer.hottoppic')}</p>
                <a href="#">Human Resource Management</a>
                <a href="#">Operations Management</a>
                <a href="#">Marketing Management</a>
            </div>

            <div>
                <p className="text-base font-bold tracking-wide text-gray-900">{t('component.footer.ava')}</p>
                <div className="flex items-center gap-1 px-2">
                    <a href="#" className="w-full">
                        <img src="https://mcqmate.com/public/images/icons/playstore.svg" alt="Playstore Button"
                            className="h-10" />
                    </a>
                    <a className="w-full" href="https://www.youtube.com/channel/UCo8tEi6SrGFP8XG9O0ljFgA">
                        <img src="https://mcqmate.com/public/images/icons/youtube.svg" alt="Youtube Button"
                            className="h-28" />
                    </a>
                </div>
                <p className="text-base font-bold tracking-wide text-gray-900">{t('component.footer.contact')}</p>
                <div className="flex">
                    <p className="mr-1 text-gray-800">Email:</p>
                    <a href="#" title="send email">opentrashtech@gmail.com</a>
                </div>
            </div>

        </div>

        <div className="w-full flex flex-col-reverse justify-center items-center pt-5 pb-10 border-t lg:flex-row">
            <p className="text-sm text-gray-600">© Copyright 2023 Company. All rights reserved.</p>
        </div>

    </footer>)
}