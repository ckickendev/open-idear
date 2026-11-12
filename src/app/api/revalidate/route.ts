import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";

export interface RevalidationPayload {
  model?: "post" | "course" | "category" | "series" | "home" | "all";
  action?: "create" | "update" | "delete";
  slug?: string;
  tag?: string;
  tags?: string[];
  path?: string;
  paths?: string[];
}

/**
 * On-Demand Cache Revalidation Webhook
 *
 * Secures cache purging using HMAC-SHA256 signature verification or Bearer token.
 * Triggered by the Backend CMS / Admin panel upon content mutation.
 */
export async function POST(req: NextRequest) {
  try {
    const secret =
      process.env.WEBHOOK_SECRET ||
      process.env.REVALIDATION_WEBHOOK_SECRET ||
      process.env.INTERNAL_API_SECRET ||
      "";

    if (!secret) {
      console.error("[Revalidate Webhook] Neither WEBHOOK_SECRET nor REVALIDATION_WEBHOOK_SECRET is configured.");
      return NextResponse.json(
        { error: "Server revalidation secret not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-hub-signature-256") ||
      "";
    const authHeader = req.headers.get("authorization") || "";

    let isAuthorized = false;

    // 1. Verify HMAC-SHA256 signature if provided (timing-safe)
    if (signatureHeader) {
      // Strip 'sha256=' prefix if present
      const cleanSignature = signatureHeader.startsWith("sha256=")
        ? signatureHeader.slice(7)
        : signatureHeader;

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      try {
        const sigBuf = Buffer.from(cleanSignature, "hex");
        const expBuf = Buffer.from(expectedSignature, "hex");

        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          isAuthorized = true;
        }
      } catch {
        isAuthorized = false;
      }
    }

    // 2. Fallback to Bearer token verification (timing-safe)
    if (!isAuthorized && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const tokenBuf = Buffer.from(token);
      const secretBuf = Buffer.from(secret);

      if (tokenBuf.length === secretBuf.length && crypto.timingSafeEqual(tokenBuf, secretBuf)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Unauthorized: Invalid cryptographic signature or token",
          hint: "Provide valid 'x-webhook-signature' HMAC-SHA256 or 'Authorization: Bearer <WEBHOOK_SECRET>'",
        },
        { status: 401 }
      );
    }

    let payload: RevalidationPayload;
    try {
      payload = rawBody ? JSON.parse(rawBody) : { model: "home" };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    // Safe helper to purge Next.js 15 Data Cache tag
    const applyTag = (t: string) => {
      if (!t || typeof t !== "string") return;
      try {
        revalidateTag(t);
        revalidatedTags.push(t);
      } catch (err: any) {
        console.warn(`[Revalidate Webhook] Failed to revalidate tag '${t}':`, err?.message);
      }
    };

    // Safe helper to purge Next.js 15 Full Route Cache path
    const applyPath = (p: string, type?: "page" | "layout") => {
      if (!p || typeof p !== "string") return;
      try {
        if (type) {
          revalidatePath(p, type);
        } else {
          revalidatePath(p);
        }
        revalidatedPaths.push(p);
      } catch (err: any) {
        console.warn(`[Revalidate Webhook] Failed to revalidate path '${p}':`, err?.message);
      }
    };

    // 3. Process direct tags (single and array)
    if (payload.tag) {
      applyTag(payload.tag);
    }
    if (payload.tags && Array.isArray(payload.tags)) {
      payload.tags.forEach(applyTag);
    }

    // 4. Process direct paths (single and array)
    if (payload.path) {
      applyPath(payload.path);
    }
    if (payload.paths && Array.isArray(payload.paths)) {
      payload.paths.forEach((p) => applyPath(p));
    }

    // 5. High-level domain-model mappings
    if (payload.model) {
      switch (payload.model) {
        case "post": {
          if (payload.slug) {
            applyTag(`post-${payload.slug}`);
            applyPath(`/post/${payload.slug}`, "page");
            applyPath(`/vi/post/${payload.slug}`, "page");
          }
          applyTag("posts");
          applyTag("feed-home");
          applyPath("/", "page");
          applyPath("/vi", "page");
          break;
        }

        case "course": {
          if (payload.slug) {
            applyTag(`course-${payload.slug}`);
            applyPath(`/courses/${payload.slug}`, "page");
          }
          applyTag("courses");
          applyTag("feed-home");
          applyPath("/", "page");
          applyPath("/vi", "page");
          applyPath("/courses", "page");
          break;
        }

        case "category": {
          if (payload.slug) {
            applyTag(`category-${payload.slug}`);
            applyPath(`/category/${payload.slug}`, "page");
          }
          applyTag("categories");
          applyTag("feed-home");
          break;
        }

        case "series": {
          if (payload.slug) {
            applyTag(`series-${payload.slug}`);
          }
          applyTag("series");
          applyTag("feed-home");
          break;
        }

        case "home": {
          applyTag("feed-home");
          applyTag("posts");
          applyTag("courses");
          applyTag("series");
          applyPath("/", "page");
          applyPath("/vi", "page");
          break;
        }

        case "all": {
          applyTag("feed-home");
          applyTag("posts");
          applyTag("courses");
          applyTag("series");
          applyTag("categories");
          applyTag("discovery");
          applyPath("/", "layout");
          break;
        }
      }
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      model: payload.model || "custom",
      action: payload.action || "update",
      tags: Array.from(new Set(revalidatedTags)),
      paths: Array.from(new Set(revalidatedPaths)),
    });
  } catch (err: any) {
    console.error("[Revalidate Webhook Exception]:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * Health check & diagnostic endpoint for testing webhooks
 */
export async function GET(req: NextRequest) {
  const secret =
    process.env.WEBHOOK_SECRET ||
    process.env.REVALIDATION_WEBHOOK_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    "";

  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("secret");

  if (!secret || token !== secret) {
    return NextResponse.json(
      {
        status: "online",
        authenticated: false,
        message: "Pass ?secret=<WEBHOOK_SECRET> to verify revalidation permissions",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    status: "online",
    authenticated: true,
    supportedModels: ["post", "course", "category", "series", "home", "all"],
    supportedHeaders: [
      "x-webhook-signature: sha256=<hex>",
      "x-hub-signature-256: sha256=<hex>",
      "Authorization: Bearer <WEBHOOK_SECRET>",
    ],
  });
}
