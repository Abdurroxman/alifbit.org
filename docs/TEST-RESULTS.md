# Validation record

Date: 2026-11-12, Europe/Istanbul.

- TypeScript production check and Vite build: passed.
- Seven Node security/validation tests: passed.
- Eleven final local Worker/D1/R2 integration checks: passed, including creation/publication of a new dynamic project and category management.
- Fifteen React route renders: passed (one H1, main landmark, skip link, image alt, internal destinations). This is semantic rendering validation, not a browser layout test.
- Hero asset optimized from 1,975,604 bytes PNG to approximately 58 KB WebP.
- Fonts and brand assets self-hosted.
- Cloudflare authentication, actual D1/R2 resources, runtime secrets and remote database migrations: configured.
- Production: https://alifbit.org — 22 live endpoints and production assets passed; six public projects, canonical www redirect, Secure/HttpOnly admin login and server-side logout were verified. No production customer orders were created during verification.
- GitHub: source pushed successfully to `Abdurroxman/alifbit.org`, branch `main`. Cloudflare's existing repository integration was preserved. Direct CI status inspection returned 403 because the login lacks the separate Workers CI permission, so the automatic GitHub build result has not been verified. The live deployment was performed and verified with Wrangler.
- Automated visual browser QA: blocked because Windows Computer Use could not determine the current browser URL with sufficient confidence. No alternate browser-control workaround was used.
- Real iPhone Safari / Android Chrome, Lighthouse, contrast audit and measured Core Web Vitals: not completed. CSS contains responsive breakpoints, visible focus, native dialog/menu behavior, reduced-motion handling and input labels; these are implementation measures, not a certification of device or WCAG conformance.

## 2026-11-14 — redesign

- `npm run build` (tsc + Vite): passed. `npm test`: 7/7 passed.
- `scripts/render-check.mjs`: 15 route renders passed (one H1, main landmark, skip link, image alt, link destinations).
- `scripts/integration-test.mjs` against local Worker/D1/R2: 11/11 passed, including a real order with attachment, admin visibility, CMS-created project page and cleanup of the QA order.
- Headless Microsoft Edge (DevTools protocol) on the production build:
  - 15 routes × 5 widths (320, 390, 768, 1024, 1440): no horizontal scroll, one H1 per page, no element left hidden after scrolling to the end, no console errors (the unknown-route check returns the intended 404).
  - Intro: first visit plays the full assembly and writes the flag; repeat visit plays the short variant; `/?intro=1` replays the full one; a first visit to an inner page plays the short variant without writing the flag.
  - Scroll scene captured at all four stages scrolling down and back up; mobile shows four stand-alone steps.
  - `prefers-reduced-motion: reduce`: no intro overlay, no pinned scene, all content visible.
  - Admin: login, overview, project list, editor with save bar, orders and the mobile drawer.
- Not covered: real iPhone Safari and Android Chrome devices, Lighthouse scores and measured Core Web Vitals.
