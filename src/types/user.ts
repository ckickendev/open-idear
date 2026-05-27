/**
 * Shared user types.
 * Extracted from AuthenticationStore to be reusable across features.
 */

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: number;
  activate: boolean;
  createdAt: Date;
  bio: string;
  background: string;
  avatar: string;
}

/** Partial user for list views and references */
export type UserSummary = Pick<User, "_id" | "username" | "name" | "avatar">;
