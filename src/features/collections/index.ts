// =============================================================================
//  KNOWLEDGE COLLECTIONS — PUBLIC API
//  src/features/collections/index.ts
// =============================================================================

export { collectionApi } from "./api/collection.api";
export { default as SaveToCollectionModal } from "./components/SaveToCollectionModal";
export { default as CollectionCard } from "./components/CollectionCard";
export { default as CreateCollectionModal } from "./components/CreateCollectionModal";

export type {
  CollectionData,
  CollectionItemData,
  CollectionArticle,
  CollectionAuthor,
  CollectionVisibility,
  CollectionDetailResponse,
  CheckCollectionItem,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "./types/collection.types";
