## 2025-05-24 - Theme Script Injection
**Learning:** Next.js App Router (React 19) requires `suppressHydrationWarning` on `html` when using script injection for theme toggling to avoid hydration mismatches.
**Action:** Always include both the blocking script in `<head>` and the prop on `<html>` for seamless dark mode implementation.
