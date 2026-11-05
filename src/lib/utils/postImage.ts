// =============================================================================
//  POST IMAGE RESOLVER UTILITY
//  src/lib/utils/postImage.ts
//
//  Design Decisions:
//  - Resiliently extracts the image URL across legacy and structured posts:
//    1. post.image.url (Mongoose populated media object)
//    2. post.image (Direct image URL string)
//    3. post.hero.image.src (Structured Article / AI Content Studio hero cover)
//    4. post.background (Post cover background URL)
//  - Prevents empty black squares in sidebar widgets.
//  - Provides a curated fallback image if no cover is available.
// =============================================================================

export function getPostImageUrl(post: any): string {
  if (!post) return "/banner/banner_standard.png";

  // 1. Populated media object
  if (post.image && typeof post.image === "object" && post.image.url) {
    return post.image.url;
  }

  // 2. Direct string image
  if (typeof post.image === "string" && post.image.trim()) {
    return post.image.trim();
  }

  // 3. Structured hero image from AI Content Studio / Block editor
  if (post.hero?.image?.src && typeof post.hero.image.src === "string") {
    return post.hero.image.src.trim();
  }

  // 4. Background cover field
  if (typeof post.background === "string" && post.background.trim()) {
    return post.background.trim();
  }

  return "/banner/banner_standard.png";
}

export function hasCustomPostImage(post: any): boolean {
  const url = getPostImageUrl(post);
  return Boolean(url && url !== "/banner/banner_standard.png");
}
