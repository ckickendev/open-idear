/**
 * Shared API response types.
 * Used across all feature API calls and the centralized API client.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  status: number;
  message: string;
  data: null;
}
