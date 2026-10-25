/**
 * Standalone, zero-dependency browser TUS 1.0.0 client for Bunny Stream.
 * Directly communicates with Bunny Stream's TUS upload protocol without backend proxying.
 */

export interface BunnyTusUploadOptions {
  file: File;
  endpoint: string; // e.g., "https://video.bunnycdn.com/tusupload"
  libraryId: string;
  videoId: string;
  signature: string;
  expires: number;
  metadata?: Record<string, string>;
  chunkSize?: number; // Optional chunk size in bytes (defaults to full stream / 10MB)
  onProgress?: (percent: number, bytesUploaded: number, totalBytes: number) => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export interface BunnyTusUploadHandle {
  abort: () => void;
  promise: Promise<void>;
}

export function startBunnyTusUpload(options: BunnyTusUploadOptions): BunnyTusUploadHandle {
  const {
    file,
    endpoint,
    libraryId,
    videoId,
    signature,
    expires,
    chunkSize,
    onProgress,
    onSuccess,
    onError,
  } = options;

  let isAborted = false;
  let currentXhr: XMLHttpRequest | null = null;

  const abort = () => {
    isAborted = true;
    if (currentXhr) {
      currentXhr.abort();
    }
  };

  const promise = (async () => {
    try {
      // Step 1: Initialize TUS container upload session via POST
      const uploadUrl = await initTusSession({
        endpoint,
        file,
        libraryId,
        videoId,
        signature,
        expires,
        isAborted: () => isAborted,
      });

      if (isAborted) throw new Error("Upload cancelled by user.");

      // Step 2: Upload binary data using TUS PATCH
      await uploadTusData({
        uploadUrl,
        file,
        libraryId,
        videoId,
        signature,
        expires,
        chunkSize,
        onProgress,
        isAborted: () => isAborted,
        setXhr: (xhr) => {
          currentXhr = xhr;
        },
      });

      if (isAborted) throw new Error("Upload cancelled by user.");

      onSuccess?.();
    } catch (err: unknown) {
      const uploadError = err instanceof Error ? err : new Error(String(err));
      onError?.(uploadError);
      throw uploadError;
    }
  })();

  return { abort, promise };
}

/**
 * Initiates TUS upload on Bunny Stream endpoint.
 * Returns the Location URL for uploading chunks.
 */
function initTusSession(args: {
  endpoint: string;
  file: File;
  libraryId: string;
  videoId: string;
  signature: string;
  expires: number;
  isAborted: () => boolean;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (args.isAborted()) return reject(new Error("Upload cancelled."));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", args.endpoint, true);

    // Encode metadata safely
    const titleBase64 = btoa(unescape(encodeURIComponent(args.file.name || "video.mp4")));
    const fileTypeBase64 = btoa(args.file.type || "video/mp4");

    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("Upload-Length", String(args.file.size));
    xhr.setRequestHeader("Upload-Metadata", `filetype ${fileTypeBase64},title ${titleBase64}`);
    xhr.setRequestHeader("AuthorizationSignature", args.signature);
    xhr.setRequestHeader("AuthorizationExpire", String(args.expires));
    xhr.setRequestHeader("LibraryId", String(args.libraryId));
    xhr.setRequestHeader("VideoId", args.videoId);

    xhr.onload = () => {
      if (args.isAborted()) return reject(new Error("Upload cancelled."));

      if (xhr.status === 201 || xhr.status === 200) {
        let location = xhr.getResponseHeader("Location");
        if (!location) {
          // If CORS doesn't expose Location, Bunny uses standard video upload URL
          location = `${args.endpoint}/${args.videoId}`;
        }
        // Normalize relative URLs
        try {
          const resolved = new URL(location, args.endpoint).href;
          resolve(resolved);
        } catch {
          resolve(location);
        }
      } else {
        const errorDetail = xhr.responseText || xhr.statusText;
        reject(
          new Error(
            `Failed to initiate Bunny TUS session (HTTP ${xhr.status}): ${errorDetail || "Unauthorized or invalid signature"}`
          )
        );
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error initiating Bunny TUS upload."));
    xhr.send();
  });
}

/**
 * Uploads binary data via TUS PATCH.
 * Handles both single-shot and chunked uploads (5MB chunks by default).
 * Bunny Stream requires LibraryId, VideoId, AuthorizationSignature, and AuthorizationExpire
 * on every PATCH request as well as on POST.
 */
async function uploadTusData(args: {
  uploadUrl: string;
  file: File;
  libraryId: string;
  videoId: string;
  signature: string;
  expires: number;
  chunkSize?: number;
  onProgress?: (percent: number, bytesUploaded: number, totalBytes: number) => void;
  isAborted: () => boolean;
  setXhr: (xhr: XMLHttpRequest) => void;
}): Promise<void> {
  const total = args.file.size;
  const canSlice = typeof args.file.slice === "function";
  const chunkSize = args.chunkSize !== undefined ? args.chunkSize : 5 * 1024 * 1024; // 5MB

  if (!canSlice || chunkSize <= 0 || total <= chunkSize) {
    return uploadSingleChunk({
      ...args,
      chunk: args.file,
      offset: 0,
      totalBytes: total,
    });
  }

  let offset = 0;
  while (offset < total) {
    if (args.isAborted()) throw new Error("Upload cancelled by user.");

    const nextOffset = Math.min(offset + chunkSize, total);
    const chunk = args.file.slice(offset, nextOffset);

    await uploadSingleChunk({
      ...args,
      chunk,
      offset,
      totalBytes: total,
    });

    offset = nextOffset;
  }
}

/**
 * Performs a single TUS PATCH request for a chunk or the entire file.
 */
function uploadSingleChunk(args: {
  uploadUrl: string;
  chunk: Blob | File;
  offset: number;
  totalBytes: number;
  libraryId: string;
  videoId: string;
  signature: string;
  expires: number;
  onProgress?: (percent: number, bytesUploaded: number, totalBytes: number) => void;
  isAborted: () => boolean;
  setXhr: (xhr: XMLHttpRequest) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (args.isAborted()) return reject(new Error("Upload cancelled."));

    const xhr = new XMLHttpRequest();
    args.setXhr(xhr);
    xhr.open("PATCH", args.uploadUrl, true);

    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("Upload-Offset", String(args.offset));
    xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");
    xhr.setRequestHeader("LibraryId", String(args.libraryId));
    xhr.setRequestHeader("VideoId", args.videoId);
    xhr.setRequestHeader("AuthorizationSignature", args.signature);
    xhr.setRequestHeader("AuthorizationExpire", String(args.expires));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && args.onProgress) {
        const currentUploaded = args.offset + e.loaded;
        const percent = Math.min(100, Math.round((currentUploaded / args.totalBytes) * 100));
        args.onProgress(percent, currentUploaded, args.totalBytes);
      }
    };

    xhr.onload = () => {
      if (args.isAborted()) return reject(new Error("Upload cancelled."));

      // 204 No Content is standard TUS success, 200 OK also accepted
      if (xhr.status === 204 || xhr.status === 200) {
        const chunkSize = "size" in args.chunk ? args.chunk.size : 0;
        const finishedOffset = args.offset + chunkSize;
        const percent = Math.min(100, Math.round((finishedOffset / args.totalBytes) * 100));
        args.onProgress?.(percent, finishedOffset, args.totalBytes);
        resolve();
      } else {
        const detail = xhr.responseText || xhr.statusText;
        reject(new Error(`TUS upload failed (HTTP ${xhr.status}): ${detail}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network connection lost during video upload."));
    xhr.ontimeout = () => reject(new Error("Video upload timed out."));
    xhr.send(args.chunk);
  });
}
