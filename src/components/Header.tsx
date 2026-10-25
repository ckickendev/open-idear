"use client";
import { ENV } from "@/api/const";
import { useEffect, useState } from "react";
import { AuthenPage } from "./authen/AuthenPage";
import Profile from "@/features/users/components/Profile";
import axios from "axios";
import { getHeadersToken, getToken, removeToken } from "@/lib/api/axios";
import authenticationStore from "@/store/AuthenticationStore";
import cartStore from "@/store/CartStore";

import { useTranslation } from "@/app/hook/useTranslation";
import LanguageSelector from "./LanguageSelector";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguage";
import Image from "next/image";
import { ShoppingCart, BookOpen } from "lucide-react";

export default function Header() {
  const { t } = useTranslation();

  const isAuthenFormDisplay = authenticationStore(
    (state) => state.isAuthenFormDisplay,
  );
  const setIsAuthenFromDisplay = authenticationStore(
    (state) => state.setIsAuthenFromDisplay,
  );
  const setStateAuthen = authenticationStore((state) => state.setState);

  const currentUser = authenticationStore((state) => state.currentUser);
  const setCurrentUser = authenticationStore((state) => state.setCurrentUser);

  const { itemCount, fetchCart } = cartStore();

  const initializeLang = useLanguageStore((state) => state.initializeLang);

  useEffect(() => {
    initializeLang(); // initialize from localStorage on mount
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();

      if (token && !currentUser?._id) {
        try {
          const headers = getHeadersToken();

          const res = await axios.get(
            `${ENV.ROOT_API}/auth/getProfile`,
            { headers },
          );
          if (res.status === 200 && res.data?.userInfo) {
            console.log("User info:", res.data.userInfo);
            setCurrentUser(res.data.userInfo);
          }
        } catch (error: any) {
          console.warn("[Header] Failed to fetch profile:", error?.message);
          // If token is invalid or expired (401 or 403), remove it so subsequent calls don't keep failing
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            removeToken();
          }
        }
      }
    };
    fetchUser();
  }, [currentUser._id]);

  // Fetch cart when user is logged in
  useEffect(() => {
    if (currentUser?._id) {
      fetchCart();
    }
  }, [currentUser?._id]);

  return (
    <header className="flex border-b border-border py-2.5 px-4 sm:px-8 bg-background/95 backdrop-blur-md tracking-wide relative z-50">
      <div className="flex flex-row items-center justify-between gap-4 max-w-screen-xl mx-auto w-full">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {process.env.NEXT_PUBLIC_CLOUDINARY_LOGO_URL && (
              <Image
                src={process.env.NEXT_PUBLIC_CLOUDINARY_LOGO_URL}
                alt="OpenIdear logo"
                width={40}
                height={40}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform group-hover:scale-105"
                priority
              />
            )}
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center tracking-tight">
              <span className="text-2xl sm:text-3xl text-blue-600 font-bold">Open</span>
              <span>IdeaR</span>
            </h1>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-accent/60 whitespace-nowrap"
            >
              {t("component.header.course")}
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-accent/60 whitespace-nowrap"
            >
              Shop
            </Link>
          </nav>
        </div>

        {/* Search, User Controls, Language Selector */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 flex-1 min-w-0">
          <form
            action="https://tailwindflex.com/search"
            className="flex flex-row relative w-[160px] sm:w-[220px] md:w-[260px] shrink-1 min-w-[120px]"
          >
            <input
              className="pr-9 input w-full rounded-lg py-1.5 pl-3 border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
              type="search"
              name="q"
              placeholder={t("component.header.search")}
            />

            <button
              type="submit"
              className="absolute top-0 right-0 h-full flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span className="sr-only">{t("component.header.search")}</span>
              <svg
                className="w-3.5 h-3.5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 56.966 56.966"
              >
                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23 s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92 c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17 s-17-7.626-17-17S14.61,6,23.984,6z"></path>
              </svg>
            </button>
          </form>

          {/* My Learning Link (only when logged in) */}
          {currentUser?._id && (
            <Link
              href="/my-learning"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:bg-accent/50 shrink-0"
              title={t("component.header.myLearningTooltip")}
            >
              <BookOpen size={16} />
              <span>{t("component.header.myLearning")}</span>
            </Link>
          )}

          {/* Cart Icon (only when logged in) */}
          {currentUser?._id && (
            <Link
              href="/checkout"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50 shrink-0"
              title={t("component.header.cartTooltip")}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {currentUser?._id ? (
            <div className="shrink-0">
              <Profile />
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="cursor-pointer text-foreground bg-accent hover:bg-accent/80 border border-border font-medium rounded-lg text-xs px-3.5 py-1.5 transition-all whitespace-nowrap"
                onClick={() => {
                  setIsAuthenFromDisplay(true);
                  setStateAuthen(1);
                }}
              >
                {t("component.header.login")}
              </button>
              <button
                type="button"
                className="cursor-pointer text-primary-foreground bg-primary hover:bg-primary/95 font-medium rounded-lg text-xs px-3.5 py-1.5 transition-all whitespace-nowrap"
                onClick={() => {
                  setIsAuthenFromDisplay(true);
                  setStateAuthen(2);
                }}
              >
                {t("component.header.getstarted")}
              </button>
            </div>
          )}

          <div className="shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {isAuthenFormDisplay && <AuthenPage />}
      </div>
    </header>
  );
}
