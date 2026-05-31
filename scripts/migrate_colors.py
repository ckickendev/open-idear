#!/usr/bin/env python3
"""
Comprehensive Tailwind hardcoded gray/white → semantic token migration.
Handles ALL gray shades (50-950), slate, zinc, neutral, stone.
Uses regex word boundaries for precise replacement.
"""
import re
import os
import sys
from pathlib import Path

# ── Token Mapping ──────────────────────────────────────────────────────────────
# Pattern: (regex_pattern, replacement)
# Order matters — more specific first

TEXT_MAP = [
    # Gray shades → foreground hierarchy
    (r'\btext-gray-50\b',    'text-foreground/5'),
    (r'\btext-gray-100\b',   'text-foreground/10'),
    (r'\btext-gray-200\b',   'text-muted-foreground/50'),
    (r'\btext-gray-300\b',   'text-muted-foreground/70'),
    (r'\btext-gray-400\b',   'text-muted-foreground'),
    (r'\btext-gray-500\b',   'text-muted-foreground'),
    (r'\btext-gray-600\b',   'text-muted-foreground'),
    (r'\btext-gray-700\b',   'text-foreground/80'),
    (r'\btext-gray-800\b',   'text-foreground'),
    (r'\btext-gray-900\b',   'text-foreground'),
    (r'\btext-gray-950\b',   'text-foreground'),
    # Slate
    (r'\btext-slate-50\b',   'text-foreground/5'),
    (r'\btext-slate-100\b',  'text-foreground/10'),
    (r'\btext-slate-200\b',  'text-muted-foreground/50'),
    (r'\btext-slate-300\b',  'text-muted-foreground/70'),
    (r'\btext-slate-400\b',  'text-muted-foreground'),
    (r'\btext-slate-500\b',  'text-muted-foreground'),
    (r'\btext-slate-600\b',  'text-muted-foreground'),
    (r'\btext-slate-700\b',  'text-foreground/80'),
    (r'\btext-slate-800\b',  'text-foreground'),
    (r'\btext-slate-900\b',  'text-foreground'),
    (r'\btext-slate-950\b',  'text-foreground'),
    # Zinc / Neutral / Stone
    (r'\btext-zinc-\d+\b',   'text-muted-foreground'),
    (r'\btext-neutral-\d+\b','text-muted-foreground'),
    (r'\btext-stone-\d+\b',  'text-muted-foreground'),
    # Plain black
    (r'\btext-black\b',      'text-foreground'),
]

BG_MAP = [
    (r'\bbg-white\b',        'bg-background'),
    (r'\bbg-gray-50\b',      'bg-muted/30'),
    (r'\bbg-gray-100\b',     'bg-muted'),
    (r'\bbg-gray-200\b',     'bg-muted'),
    (r'\bbg-gray-300\b',     'bg-muted'),
    (r'\bbg-gray-400\b',     'bg-muted'),
    (r'\bbg-gray-500\b',     'bg-muted'),
    (r'\bbg-gray-600\b',     'bg-accent'),
    (r'\bbg-gray-700\b',     'bg-accent'),
    (r'\bbg-gray-800\b',     'bg-card'),
    (r'\bbg-gray-900\b',     'bg-background'),
    (r'\bbg-gray-950\b',     'bg-background'),
    (r'\bbg-slate-50\b',     'bg-muted/30'),
    (r'\bbg-slate-100\b',    'bg-muted'),
    (r'\bbg-slate-200\b',    'bg-muted'),
    (r'\bbg-slate-700\b',    'bg-accent'),
    (r'\bbg-slate-800\b',    'bg-card'),
    (r'\bbg-slate-900\b',    'bg-background'),
    (r'\bbg-zinc-\d+\b',     'bg-muted'),
    (r'\bbg-neutral-\d+\b',  'bg-muted'),
    (r'\bbg-black\b',        'bg-background'),
]

BORDER_MAP = [
    (r'\bborder-gray-\d+\b',   'border-border'),
    (r'\bborder-slate-\d+\b',  'border-border'),
    (r'\bborder-zinc-\d+\b',   'border-border'),
    (r'\bborder-neutral-\d+\b','border-border'),
    (r'\bborder-stone-\d+\b',  'border-border'),
]

HOVER_BG_MAP = [
    (r'\bhover:bg-white\b',       'hover:bg-background'),
    (r'\bhover:bg-gray-50\b',     'hover:bg-muted/50'),
    (r'\bhover:bg-gray-100\b',    'hover:bg-muted'),
    (r'\bhover:bg-gray-200\b',    'hover:bg-muted'),
    (r'\bhover:bg-gray-700\b',    'hover:bg-accent'),
    (r'\bhover:bg-gray-800\b',    'hover:bg-card'),
    (r'\bhover:bg-slate-50\b',    'hover:bg-muted/50'),
    (r'\bhover:bg-slate-100\b',   'hover:bg-muted'),
]

HOVER_TEXT_MAP = [
    (r'\bhover:text-gray-900\b',  'hover:text-foreground'),
    (r'\bhover:text-gray-800\b',  'hover:text-foreground'),
    (r'\bhover:text-gray-700\b',  'hover:text-foreground/80'),
    (r'\bhover:text-gray-\d+\b',  'hover:text-muted-foreground'),
    (r'\bhover:text-slate-\d+\b', 'hover:text-muted-foreground'),
]

FOCUS_MAP = [
    (r'\bfocus:bg-white\b',         'focus:bg-background'),
    (r'\bfocus:border-gray-\d+\b',  'focus:border-primary'),
    (r'\bfocus:border-slate-\d+\b', 'focus:border-primary'),
    (r'\bfocus:border-indigo-\d+\b','focus:border-primary'),
    (r'\bfocus:ring-indigo-\d+\b',  'focus:ring-ring'),
    (r'\bfocus:ring-gray-\d+\b',    'focus:ring-ring'),
]

DARK_MAP = [
    # Remove redundant dark: overrides that now conflict with semantic tokens
    (r'\bdark:bg-gray-\d+\b',      ''),
    (r'\bdark:text-gray-\d+\b',    ''),
    (r'\bdark:border-gray-\d+\b',  ''),
    (r'\bdark:bg-white\b',         ''),
]

DIVIDE_MAP = [
    (r'\bdivide-gray-\d+\b',   'divide-border'),
    (r'\bdivide-slate-\d+\b',  'divide-border'),
]

PLACEHOLDER_MAP = [
    (r'\bplaceholder:text-gray-\d+\b',  'placeholder:text-muted-foreground'),
    (r'\bplaceholder:text-slate-\d+\b', 'placeholder:text-muted-foreground'),
]

RING_MAP = [
    (r'\bring-gray-\d+\b',    'ring-ring'),
    (r'\bring-slate-\d+\b',   'ring-ring'),
]

SHADOW_MAP = [
    (r'\bshadow-gray-\d+\b',  'shadow-border'),
]

ALL_MAPS = (
    TEXT_MAP + BG_MAP + BORDER_MAP +
    HOVER_BG_MAP + HOVER_TEXT_MAP +
    FOCUS_MAP + DARK_MAP + DIVIDE_MAP +
    PLACEHOLDER_MAP + RING_MAP + SHADOW_MAP
)

# ── Process Files ──────────────────────────────────────────────────────────────
def migrate_file(path: Path) -> int:
    """Returns count of replacements made."""
    try:
        content = path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"  SKIP {path}: {e}")
        return 0

    original = content
    count = 0

    for pattern, replacement in ALL_MAPS:
        new_content, n = re.subn(pattern, replacement, content)
        if n > 0:
            count += n
            content = new_content

    # Clean up double spaces from empty dark: removals
    content = re.sub(r'  +', ' ', content)
    # Clean up trailing spaces in className strings
    content = re.sub(r' "', '"', content)
    content = re.sub(r'" ', '"', content)

    if content != original:
        path.write_text(content, encoding='utf-8')

    return count

def main():
    root = Path('/Users/mac/Documents/workspace/workspace_coding/open-trash-tech/src')
    extensions = {'.tsx', '.ts'}
    exclude_dirs = {'node_modules', '.next', '__pycache__'}

    total_files = 0
    total_replacements = 0
    changed_files = []

    for path in root.rglob('*'):
        if path.suffix not in extensions:
            continue
        if any(ex in path.parts for ex in exclude_dirs):
            continue

        count = migrate_file(path)
        if count > 0:
            total_replacements += count
            total_files += 1
            changed_files.append((count, str(path.relative_to(root))))
            print(f"  {count:4d} replacements → {path.relative_to(root)}")

    print(f"\n{'='*60}")
    print(f"✅ Done: {total_replacements} replacements across {total_files} files")

if __name__ == '__main__':
    main()
