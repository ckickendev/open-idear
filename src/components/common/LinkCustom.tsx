"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/useLanguage";

export const CategoryLinkCustom = ({ className, slug, name }: any) => {
  return (
    <Link
      href={`/category/${slug}`}
      className={`${className} cursor-pointer hover:underline`}
    >
      <span>{name}</span>
    </Link>
  );
};

export const SeriesLinkCustom = ({ className, slug, name }: any) => {
  return (
    <Link
      href={`/series/${slug}`}
      className={`${className} block hover:underline`}
    >
      <h2 className="text-lg font-bold leading-tight mb-2">{name}</h2>
    </Link>
  );
};

export const PostLinkCustom = ({ className, slug, name, locale }: any) => {
  const pathname = usePathname();
  const storeLang = useLanguageStore((state) => state.lang);
  const activeLocale = locale || (pathname?.startsWith("/vi") ? "vi" : (storeLang || "en"));
  const href = activeLocale === "vi" ? `/vi/post/${slug}` : `/post/${slug}`;

  return (
    <Link href={href} className={`block hover:underline`}>
      <h4 className={className}>{name}</h4>
    </Link>
  );
};

export const UserLinkCustom = ({ className, username, name }: any) => {
  return (
    <Link
      href={`/profile/${username}`}
      className={`${className} cursor-pointer hover:underline`}
    >
      <span>{name}</span>
    </Link>
  );
};
