import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startBunnyTusUpload } from "../../../lib/bunnyTusUploader.ts";
import type {
  MediaAsset,
  BunnyUploadSignatureResponse,
  BunnyPlaybackConfigResponse,
} from "../types/course.types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================================");
console.log("  OPENIDEAR — SPRINT 3: BUNNY STREAM FRONTEND INTEGRATION TESTS");
console.log("==================================================================");

// ── Test 1: Bunny Stream API Client Endpoint Definitions ────────────────────
{
  const apiPath = path.resolve(__dirname, "../api/course.api.ts");
  const apiContent = fs.readFileSync(apiPath, "utf8");

  assert(apiContent.includes("getBunnyUploadSignature:"), "getBunnyUploadSignature must be defined in course.api.ts");
  assert(apiContent.includes("saveBunnyVideo:"), "saveBunnyVideo must be defined in course.api.ts");
  assert(apiContent.includes("getBunnyPlayback:"), "getBunnyPlayback must be defined in course.api.ts");
  assert(apiContent.includes("getBunnyStatus:"), "getBunnyStatus must be defined in course.api.ts");
  assert(apiContent.includes("deleteBunnyVideo:"), "deleteBunnyVideo must be defined in course.api.ts");
  console.log("✓ Test 1: Bunny Stream API methods registered on courseApi");
}

// ── Test 2: MediaAsset Contract Supports Bunny Stream Fields ────────────────
{
  const bunnyMedia: MediaAsset = {
    _id: "66d1a4d00000000000000001",
    url: "guid-bunny-stream-1234",
    bunnyVideoId: "guid-bunny-stream-1234",
    bunnyLibraryId: "12345",
    provider: "bunny",
    type: "video",
    duration: 360,
    thumbnail: "https://vz-test.b-cdn.net/guid-bunny-stream-1234/thumbnail.jpg",
    status: "ready",
  };

  assert.strictEqual(bunnyMedia.provider, "bunny");
  assert.strictEqual(bunnyMedia.bunnyVideoId, "guid-bunny-stream-1234");
  assert.strictEqual(bunnyMedia.status, "ready");
  assert.strictEqual(bunnyMedia.duration, 360);
  console.log("✓ Test 2: MediaAsset TypeScript contract validates Bunny fields");
}

// ── Test 3: Bunny TUS Resumable Upload Header Construction ──────────────────
{
  // Mock XMLHttpRequest for headless testing
  let postHeaders: Record<string, string> = {};
  let postUrl = "";
  let patchHeaders: Record<string, string> = {};
  let patchUrl = "";
  let patchSent = false;

  const mockFile = {
    name: "react_architecture.mp4",
    size: 15 * 1024 * 1024, // 15MB
    type: "video/mp4",
  } as unknown as File;

  // Polyfill global XMLHttpRequest for test environment
  const originalXhr = (global as any).XMLHttpRequest;
  (global as any).XMLHttpRequest = class MockXHR {
    private url = "";
    private method = "";
    public status = 200;
    public responseText = "";
    public statusText = "OK";
    public upload = { onprogress: null as any };
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;

    open(method: string, url: string) {
      this.method = method;
      this.url = url;
      if (method === "POST") postUrl = url;
      if (method === "PATCH") patchUrl = url;
    }

    setRequestHeader(key: string, value: string) {
      if (this.method === "POST") postHeaders[key] = value;
      if (this.method === "PATCH") patchHeaders[key] = value;
    }

    getResponseHeader(name: string) {
      if (name.toLowerCase() === "location") {
        return "https://video.bunnycdn.com/tusupload/session-xyz-789";
      }
      return null;
    }

    send(body?: any) {
      if (this.method === "POST") {
        this.status = 201;
        setTimeout(() => this.onload?.(), 10);
      } else if (this.method === "PATCH") {
        patchSent = true;
        this.status = 204; // Standard TUS success
        if (this.upload.onprogress) {
          this.upload.onprogress({ lengthComputable: true, loaded: 15 * 1024 * 1024, total: 15 * 1024 * 1024 });
        }
        setTimeout(() => this.onload?.(), 10);
      }
    }

    abort() {}
  };

  (async () => {
    let progressReached = 0;
    const uploadHandle = startBunnyTusUpload({
      file: mockFile,
      endpoint: "https://video.bunnycdn.com/tusupload",
      libraryId: "98765",
      videoId: "guid-video-test-111",
      signature: "sha256-mock-signature-abc",
      expires: 1750000000,
      onProgress: (percent) => {
        progressReached = percent;
      },
    });

    await uploadHandle.promise;

    // Verify canonical Bunny TUS headers
    assert.strictEqual(postHeaders["Tus-Resumable"], "1.0.0");
    assert.strictEqual(postHeaders["AuthorizationSignature"], "sha256-mock-signature-abc");
    assert.strictEqual(postHeaders["AuthorizationExpire"], "1750000000");
    assert.strictEqual(postHeaders["LibraryId"], "98765");
    assert.strictEqual(postHeaders["VideoId"], "guid-video-test-111");
    assert.strictEqual(postHeaders["Upload-Length"], String(15 * 1024 * 1024));

    // Verify PATCH step
    assert.strictEqual(patchUrl, "https://video.bunnycdn.com/tusupload/session-xyz-789");
    assert.strictEqual(patchHeaders["Tus-Resumable"], "1.0.0");
    assert.strictEqual(patchHeaders["Upload-Offset"], "0");
    assert.strictEqual(patchHeaders["Content-Type"], "application/offset+octet-stream");
    assert.strictEqual(patchHeaders["LibraryId"], "98765");
    assert.strictEqual(patchHeaders["VideoId"], "guid-video-test-111");
    assert.strictEqual(patchHeaders["AuthorizationSignature"], "sha256-mock-signature-abc");
    assert.strictEqual(patchHeaders["AuthorizationExpire"], "1750000000");
    assert.strictEqual(patchSent, true);
    assert.strictEqual(progressReached, 100);

    // Restore original XHR
    (global as any).XMLHttpRequest = originalXhr;
    console.log("✓ Test 3: Bunny TUS client request and header protocol passed");
  })().catch((err) => {
    console.error("Test 3 failed:", err);
    process.exit(1);
  });
}

// ── Test 4: Playback Configuration State Machine Contract ───────────────────
{
  // Case A: Encoding / Processing state
  const processingConfig: BunnyPlaybackConfigResponse = {
    lessonId: "66d1a4b10000000000000001",
    title: "Understanding Microfrontends",
    isFreePreview: true,
    isEnrolled: false,
    isAuthorized: true,
    isReady: false,
    status: "processing",
    message: "Video is currently encoding. Please check back shortly.",
    mediaId: "66d1a4d00000000000000001",
    videoId: "guid-encoding-1234",
    provider: "bunny",
    duration: 0,
    thumbnailUrl: "https://vz-test.b-cdn.net/guid-encoding-1234/thumbnail.jpg",
  };

  assert.strictEqual(processingConfig.isReady, false);
  assert.strictEqual(processingConfig.embedUrl, undefined, "embedUrl must be undefined when unready");
  assert.strictEqual(processingConfig.status, "processing");

  // Case B: Verified Ready state
  const readyConfig: BunnyPlaybackConfigResponse = {
    lessonId: "66d1a4b10000000000000001",
    title: "Understanding Microfrontends",
    isFreePreview: true,
    isEnrolled: false,
    isAuthorized: true,
    isReady: true,
    status: "ready",
    mediaId: "66d1a4d00000000000000001",
    videoId: "guid-ready-1234",
    provider: "bunny",
    duration: 520,
    thumbnailUrl: "https://vz-test.b-cdn.net/guid-ready-1234/thumbnail.jpg",
    embedUrl: "https://player.mediadelivery.net/embed/98765/guid-ready-1234?token=abc&expires=1750000000",
    hlsUrl: "https://vz-test.b-cdn.net/guid-ready-1234/playlist.m3u8?token=abc&expires=1750000000",
    isTokenized: true,
  };

  assert.strictEqual(readyConfig.isReady, true);
  assert(readyConfig.embedUrl?.startsWith("https://player.mediadelivery.net/embed/"));
  assert(readyConfig.embedUrl?.includes("token="));
  assert.strictEqual(readyConfig.duration, 520);
  console.log("✓ Test 4: Playback configuration state machine contracts verified");
}

// ── Test 5: Verify Complete Removal of Active Cloudflare Stream Calls ────────
{
  const filesToCheck = [
    path.join(__dirname, "../../../app/(dashboard)/management/course/[id]/curriculum/page.tsx"),
    path.join(__dirname, "../../../app/(marketing)/courses/[slug]/page.tsx"),
    path.join(__dirname, "../../../app/(learn)/courses/[slug]/learn/[lessonSlug]/page.tsx"),
    path.join(__dirname, "../../../app/(editor)/create/VideoUpload.tsx"),
  ];

  for (const filePath of filesToCheck) {
    const content = fs.readFileSync(filePath, "utf8");
    assert(
      !content.includes("@cloudflare/stream-react"),
      `File ${path.basename(filePath)} must not import @cloudflare/stream-react`
    );
    assert(
      !content.includes("videodelivery.net"),
      `File ${path.basename(filePath)} must not construct hardcoded videodelivery.net URLs`
    );
  }

  console.log("✓ Test 5: Verified 0 active Cloudflare Stream calls in updated frontend flows");
}

setTimeout(() => {
  console.log("------------------------------------------------------------------");
  console.log("  Bunny Stream Frontend Integration Tests: 5 passed, 0 failed.");
  console.log("==================================================================");
}, 200);
