"use client";

// =============================================================================
//  ARTICLE COMPARISON TABLE BLOCK COMPONENT
//  src/features/article/components/ArticleComparisonTable.tsx
// =============================================================================

import React from "react";
import type { ComparisonBlock } from "../types/article.types";

interface ArticleComparisonTableProps {
  block: ComparisonBlock;
}

export default function ArticleComparisonTable({ block }: ArticleComparisonTableProps) {
  return (
    <div id={`block-${block.id}`} className="my-8">
      {block.title && (
        <h3 className="text-base font-semibold mb-3 text-foreground">{block.title}</h3>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {block.columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-border last:border-0 even:bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                {row.cells.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-foreground/80">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
