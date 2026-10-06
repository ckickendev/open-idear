// =============================================================================
//  KNOWLEDGE COLLECTIONS — TYPE DEFINITIONS
//  src/features/collections/types/collection.types.ts
// =============================================================================

export type CollectionVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export interface CollectionAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface CollectionArticle {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  text?: string;
  content?: string;
  image?: {
    url?: string;
    thumbnail?: string;
    alt?: string;
  } | null;
  author?: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    avatarUrl?: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionItemData {
  id: string;
  order: number;
  note?: string;
  addedAt: string;
  article: CollectionArticle;
}

export interface CollectionData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  visibility: CollectionVisibility;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  articleCount?: number;
  previewImages?: (string | null)[];
  followersCount?: number;
}

export interface CollectionDetailResponse {
  collection: CollectionData;
  owner: CollectionAuthor;
  items: CollectionItemData[];
  isOwner: boolean;
}

export interface CheckCollectionItem {
  _id: string;
  title: string;
  slug: string;
  visibility: CollectionVisibility;
  coverImage?: string | null;
  isSaved: boolean;
}

export interface CreateCollectionPayload {
  title: string;
  description?: string;
  visibility?: CollectionVisibility;
  coverImage?: string | null;
}

export interface UpdateCollectionPayload {
  title?: string;
  description?: string;
  visibility?: CollectionVisibility;
  coverImage?: string | null;
}
