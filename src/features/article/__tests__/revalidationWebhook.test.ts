import assert from "node:assert/strict";
import crypto from "crypto";

console.log("==================================================================");
console.log("  OPENIDEAR — PHASE 3: REVALIDATION WEBHOOK SECURITY TESTS        ");
console.log("==================================================================");

const SECRET = "prod_webhook_secret_open_idear_998877";

// Mock payload
const payload = {
  tag: "post-building-distributed-systems",
  tags: ["posts", "feed-home"],
  path: "/post/building-distributed-systems",
  model: "post" as const,
  slug: "building-distributed-systems",
};

const rawBody = JSON.stringify(payload);

// 1. Test HMAC-SHA256 Signature Generation & Verification (Timing-safe)
const rawDigest = crypto
  .createHmac("sha256", SECRET)
  .update(rawBody)
  .digest("hex");

const standardGithubSignature = `sha256=${rawDigest}`;

const verifySignature = (header: string, body: string, secret: string): boolean => {
  const cleanSig = header.startsWith("sha256=") ? header.slice(7) : header;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(cleanSig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

assert.equal(
  verifySignature(rawDigest, rawBody, SECRET),
  true,
  "Raw hex HMAC-SHA256 signature must be verified"
);
console.log("  ✓ Raw hex HMAC-SHA256 signature verification passes");

assert.equal(
  verifySignature(standardGithubSignature, rawBody, SECRET),
  true,
  "GitHub/Stripe-style 'sha256=' prefixed signature must be verified"
);
console.log("  ✓ 'sha256=<hex>' standard signature verification passes");

assert.equal(
  verifySignature(standardGithubSignature, rawBody + "tampered", SECRET),
  false,
  "Tampered payload must be rejected"
);
console.log("  ✓ Tampered payload is rejected immediately");

assert.equal(
  verifySignature(standardGithubSignature, rawBody, "wrong_secret"),
  false,
  "Mismatched secret must be rejected"
);
console.log("  ✓ Incorrect secret is rejected");

// 2. Test Tag Aggregation
const extractTags = (body: typeof payload) => {
  const tags: string[] = [];
  if (body.tag) tags.push(body.tag);
  if (body.tags) tags.push(...body.tags);
  if (body.model === "post" && body.slug) {
    tags.push(`post-${body.slug}`, "posts", "feed-home");
  }
  return Array.from(new Set(tags));
};

const aggregatedTags = extractTags(payload);
assert.deepEqual(
  aggregatedTags,
  ["post-building-distributed-systems", "posts", "feed-home"],
  "Tags must be deduplicated and properly extracted"
);
console.log("  ✓ Singular 'tag' and plural 'tags' are correctly parsed and deduplicated");

console.log("\n==================================================================");
console.log("  PHASE 3 SECURITY TESTS: ALL 5 PASSED");
console.log("==================================================================\n");
