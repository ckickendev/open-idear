---
name: frontend-verification
description: Standard quality assurance and verification procedure for frontend modifications in OpenIdear.
---

# Frontend Verification & QA Runbook

This skill defines the mandatory verification and sanity checks required before marking any frontend task as complete in `open-trash-tech`.

---

## 1. Mandatory TypeScript Check

Run the TypeScript compiler in non-emitting mode:
```bash
npx tsc --noEmit --skipLibCheck
```

### Common TypeScript Gotchas in this Codebase:
1. **`null` vs `undefined` in Optional Fields**:
   Many API and analytics interfaces define optional properties as `field?: string`. If a variable can be `null`, normalize it:
   ```ts
   // INCORRECT:
   postId: postId // error if postId is string | null

   // CORRECT:
   postId: postId || undefined
   ```
2. **React 19 Props Compatibility**:
   Ensure custom component props align with React 19 typing (e.g., `React.ComponentType<{ className?: string }>` for Lucide icons).
3. **TipTap Props & Extension Types**:
   Ensure `NodeViewProps` imports come from `@tiptap/react` and that attribute definitions strictly type their defaults.

---

## 2. Dev Server & Runtime Health

Verify that the local development server compiles without runtime bundling errors:
```bash
npm run dev
```
Check for:
- No hydration warnings in browser console.
- No unhandled Promise rejections from API client calls.
- TipTap editor initializes and persists content changes smoothly.

---

## 3. Pre-Completion Checklist

Before finishing any task:
- [ ] TypeScript passes with **0 errors** (`npx tsc --noEmit --skipLibCheck`).
- [ ] All new user-facing components support both **Light** and **Dark** modes.
- [ ] Any modified TipTap NodeView preserves ProseMirror undo/redo history.
- [ ] Telemetry events are preserved with canonical lifecycle action strings.
- [ ] No temporary `console.log` or debug code left behind.
