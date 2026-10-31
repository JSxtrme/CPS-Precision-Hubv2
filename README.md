<img width="2340" height="746" alt="Image" src="https://github.com/user-attachments/assets/ac6fac6c-9d2a-4ab2-843e-2238f3268da5" />

# CPS Precision Hub

A click-speed and input-performance testing suite for gamers, Minecraft PvP players, and PC enthusiasts. Measure how fast you can click, how quickly you react, and how your actual hardware responds — all in one place, with no account and nothing sent to a server.

Live site: https://cps-precision-hubv2.vercel.app/

## What it tests

- **CPS Test (home page)** — clicks per second with durations 1s, 2s, 3s, 5s, 10s, 15s, 30s, 1 min, and Manual (stop when you choose). Live CPS, per-duration bests, an 8-tier rank ladder (Beginner → Legendary, plus Godlike at 20+ CPS), recent activity, and a humour line after every result.
- **Toolkit (pill nav → toolkit on the home page, deep links under `/more-tests/…`)** — Spacebar Counter, Right Click Test, Mouse Polling Rate, Key Ghosting, Jitter Click Coach, Butterfly Click Coach, Reaction Time, Kohi Click Test, Drag Click, Double Click, Aim Trainer (extra, beyond the preview's 12), and Scroll Speed. Each module view is the preview shell around the repo's real test engine.
- **Rankings** — CPS tiers and reaction-time tiers are shown on the relevant pages so a score means something in context, not just as a bare number.

## Settings (separate `/settings` view, not a home section)

- **Theme** — Dark / Light, stored as before (`cps-test-theme`). Dark is the default.
- **Accent colour** — Navy (default), Cobalt, Sky, or Slate, as in the preview HTML (`cps-preview-accent`).
- **Custom cursor** — the preview's 5px accent dot + lerped ring, toggleable in Settings, hidden on touch / hover:none and when reduced motion is on.
- **Test feel** — click sounds (WebAudio blip, as in the preview), click particles, pad shake, scroll-lock preference, and reduced motion, stored in `cps-preview-prefs`. Note: the scroll-lock toggle is a preview-faithful local preference only — the preserved mobile behaviour is still `touch-action: pan-y` + ~12px threshold with no body scroll lock during a test (see below).
- **Colour schemes** — the old 15-scheme paintbrush dropdown was removed with the old visual; the preview's 4 accents replace it. A previously saved old scheme key is ignored by the new UI.
- **Device badge** — the header shows PC or Touch based on automatic device detection. The layout and reset controls adapt to that, rather than showing everyone the same layout.
- **Per-test settings** — duration pills on click-style tests, Left/Right drag mode on Drag Click, and a Double Click Delay Threshold slider (default 80ms; standard gaming-mouse delay is 40–80ms) on the Double Click Test.

## The reset shortcut (important)

After a test finishes, reset with the **opposite** button to the one you tested with:

- Left-click test → **double right-click** to reset.
- Right-click test → **double left-click** to reset.
- Drag Click → the opposite button to the drag mode you used.

This is deliberate. When you are clicking very fast, two extra clicks on the test button itself are easy to miss — if those counted as a reset, your result would vanish before you read it. Using the opposite button means a stray extra test click cannot wipe a result. On touch devices, use the on-screen Reset button instead (double-tapping is unreliable on mobile).

## Mobile behaviour: scroll vs tap

On touch devices, a **swipe** on the click area scrolls the page, and only a **genuine tap** counts as a click. The main CPS pad uses `touch-action: pan-y` plus a ~12px movement threshold: if your finger moves more than that, the following click is suppressed, so scrolling can no longer accidentally start a test. Scroll is not locked just because a test is running; only multi-touch pinch-zoom is blocked. Desktop mouse behaviour is unchanged.

## Bests, history and privacy

- Bests are stored per test and per duration, and recent activity (last 50 results) is stored, **only in your browser's local storage**.
- There is no account, no sign-in, and no server-side storage of scores.
- Clearing site data, or switching browsers/devices, resets bests and history.

## Hidden legacy view

The pre-redesign app is kept at a hidden URL with no link to it anywhere in the new frontend:

```
https://cps-precision-hubv2.vercel.app/old
```

Type that URL to see the old site (Cosmic Purple theme, old layout, old 19-question FAQ via `LegacyFAQs`). Type `/` (or use the normal navigation) to return to the current site. The old premium navy overlay and scroll-effects helper are no longer imported by the new `main.tsx`, so `/old` no longer shows the premium reading-progress hairline — its layout, theme and test logic are otherwise unchanged.

## Run it locally

Prerequisites: Node.js.

```bash
npm install
npm run dev
```

## Build and deploy

```bash
npm run build
npm run preview
```

The site is a Vite + React 19 + TypeScript + Tailwind CSS 4 single-page app. `vercel.json` rewrites every path to `index.html`, so deep links such as `/more-tests/reaction-test` and `/old` work on Vercel. No environment variables are required — the app is fully client-side (see `.env.example`).

## Project layout

- `index.html` — title and favicon (`/favicon.svg`, also used as the header logo mark).
- `src/App.tsx` — new preview-exact app: pill nav, hero, rig, scrub Why section, toolkit, Settings view, cursor, progress/reveal.
- `src/components/PreviewCps.tsx` — preview CPS rig (rank ladder, result screen, magnetic buttons, velocity graph) wired to the repo's real CPS timing/bests/humour code, imported from `LegacyApp`.
- `src/LegacyApp.tsx` — the pre-rebuild app, kept verbatim (plus exported timing/humour helpers) so `/old` still renders the old site; it is only rendered on `/old`.
- `src/preview.css` — the preview HTML's `<style>` block, scoped under `.pv-scope` so `/old` is not restyled.
- `src/components/FAQs.tsx` — exactly 10 FAQs: the preview's 3 first, then 7 non-duplicate old-site questions.
- `src/components/AlternateTests.tsx` — Spacebar, Right Click, Polling Rate, Jitter, Butterfly, Kohi, Drag Click, Double Click, Aim and Scroll tests, plus the touch scroll/zoom hook.
- `src/components/ReactionTime.tsx` — Reaction Time test.
- `src/components/KeyGhosting.tsx` — Key Ghosting test.
- `src/components/HistoryList.tsx` — recent activity list.
- `src/index.css` — Tailwind and theme utilities.
- `src/premium.css` / `src/scroll-effects.ts` — no longer imported by the new `main.tsx` (the preview's own progress/reveal in `App.tsx` replaces them); left in the repo, not in the bundle.
