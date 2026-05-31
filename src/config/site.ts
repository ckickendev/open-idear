/**
 * Site-wide configuration.
 * Single source of truth for metadata, navigation, and brand identity.
 */
export const siteConfig = {
  name: "OpenIdear",
  description: "A platform to share and explore ideas, courses, and knowledge.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://openidear.com",
  ogImage: "/og-image.png",
  links: {
    facebook: "https://www.facebook.com/openidear",
    youtube: "https://www.youtube.com/channel/UCo8tEi6SrGFP8XG9O0ljFgA",
    email: "opentrashtech@gmail.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
