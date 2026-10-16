import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { fontSans, fontMono } from "@/lib/fonts";
import { Providers } from "@/providers/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OpenIdear",
    template: "%s | OpenIdear",
  },
  description:
    "OpenIdear — a platform to share and explore ideas, courses, and knowledge.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
