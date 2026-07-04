"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { assetApi, type Asset, type AssetsPaginationResult } from "../api/asset.api";

// ─── Shared Async Action Machine ────────────────────────────────────────────
//
// Eliminates the repeated isLoading / error / success state trio that was
// duplicated across useUploadAsset and useDeleteAsset.
//
function useAsyncAction<TResult, TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<TResult | null>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await action(...args);
        setSuccess(result !== null);
        return result;
      } catch (err: any) {
        setError(err?.message ?? "An unexpected error occurred.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );

  return { run, isLoading, error, success };
}

// ─── Browse Params type ──────────────────────────────────────────────────────

export interface AssetBrowseParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// ─── useAssets ───────────────────────────────────────────────────────────────
//
// Fix: params are passed as individual primitives so useCallback dependency
// comparisons work correctly, preventing the stale-closure infinite-loop
// that occurred when the caller passed a new object literal each render.
//
export function useAssets({
  q = "",
  page = 1,
  limit = 20,
  sort = "-createdAt",
}: AssetBrowseParams = {}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState<AssetsPaginationResult["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await assetApi.browse({ q, page, limit, sort });
      if (result.success && result.data) {
        setAssets(result.data.items);
        setPagination(result.data.pagination);
      } else {
        setError(result.message ?? "Failed to fetch assets.");
      }
    } catch (err: any) {
      setError(err?.message ?? "An error occurred while fetching assets.");
    } finally {
      setIsLoading(false);
    }
  }, [q, page, limit, sort]); // primitive deps — stable across renders

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, pagination, isLoading, error, refetch: fetchAssets };
}

// ─── useAsset ─────────────────────────────────────────────────────────────────

export function useAsset(id: string) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await assetApi.getById(id);
      if (result.success && result.data) {
        setAsset(result.data);
      } else {
        setError(result.message ?? "Failed to fetch asset details.");
      }
    } catch (err: any) {
      setError(err?.message ?? "An error occurred while loading asset details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return { asset, isLoading, error, refetch: fetchAsset };
}

// ─── useUploadAsset ───────────────────────────────────────────────────────────

export function useUploadAsset() {
  const uploadAction = useCallback(
    async (file: File, metadata: { description?: string; alt?: string; tags?: string } = {}) => {
      const result = await assetApi.upload(file, metadata);
      if (result.success && result.data) return result.data;
      throw new Error(result.message ?? "Failed to upload asset.");
    },
    []
  );

  const { run: uploadFile, isLoading: isUploading, error, success } = useAsyncAction(uploadAction);

  return { uploadFile, isUploading, error, success };
}

// ─── useDeleteAsset ───────────────────────────────────────────────────────────

export function useDeleteAsset() {
  const deleteAction = useCallback(async (id: string) => {
    const result = await assetApi.delete(id);
    if (result.success) return true;
    throw new Error(result.message ?? "Failed to delete asset.");
  }, []);

  const { run, isLoading: isDeleting, error, success } = useAsyncAction(deleteAction);

  // Unwrap: return a boolean instead of boolean | null
  const deleteAsset = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await run(id);
      return result === true;
    },
    [run]
  );

  return { deleteAsset, isDeleting, error, success };
}
