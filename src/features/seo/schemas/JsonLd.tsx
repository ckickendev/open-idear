// =============================================================================
//  JSON-LD COMPONENT
//  src/features/seo/schemas/JsonLd.tsx
//
//  React Server Component that renders Schema.org JSON-LD scripts safely.
//  Escapes `<` to `\u003c` to prevent cross-site scripting (XSS) / script injection.
//  No client-side JavaScript, no styling, zero runtime overhead.
// =============================================================================

import React from "react";

export interface JsonLdProps {
  /**
   * Schema.org JSON-LD object, array of objects, or null.
   * Accepts any serializable object structure.
   * If null or undefined, the component renders nothing (null).
   */
  data: object | Array<object> | null | undefined;
}

/**
 * Server component that injects structured data JSON-LD into page HTML.
 */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  // Safely serialize JSON-LD with XSS protection against script tag breakout
  const jsonLdString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdString,
      }}
    />
  );
}
