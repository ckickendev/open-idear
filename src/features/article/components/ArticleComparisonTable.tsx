"use client";

// =============================================================================
//  ARTICLE COMPARISON TABLE BLOCK COMPONENT
//  src/features/article/components/ArticleComparisonTable.tsx
//
//  Sprint 3.1 — migrated to editorial.css .ed-comparison classes.
//  Mobile: horizontal scroll with visible scroll affordance.
//  Accessibility: proper <th scope> attributes for both axes.
// =============================================================================

import React from "react";
import type { ComparisonBlock } from "../types/article.types";

interface ArticleComparisonTableProps {
  block: ComparisonBlock;
}

export default function ArticleComparisonTable({
  block,
}: ArticleComparisonTableProps) {
  return (
    <div id={`block-${block.id}`} className="ed-comparison">
      {block.title && (
        <h3 className="ed-comparison__title">{block.title}</h3>
      )}

      {/* Horizontal scroll wrapper */}
      <div
        className="ed-comparison__scroll"
        role="region"
        aria-label={block.title ?? "Comparison table"}
        tabIndex={0}
      >
        <table
          className="ed-comparison__table"
          aria-label={block.title ?? "Comparison table"}
        >
          <thead className="ed-comparison__thead">
            <tr>
              {block.columns.map((col, i) => (
                <th
                  key={i}
                  scope={i === 0 ? "col" : "col"}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="ed-comparison__tbody">
            {block.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.cells.map((cell, cellIdx) =>
                  cellIdx === 0 ? (
                    // First column is a row header
                    <th key={cellIdx} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIdx}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
