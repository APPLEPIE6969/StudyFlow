## 2024-05-22 - Theme Switching FOUC
**Learning:** Next.js app router with Tailwind class-based dark mode requires a script in head to prevent FOUC, even if using a ThemeProvider.
**Action:** Always inject a script to set document class before hydration when implementing dark mode.
