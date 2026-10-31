# CPS Precision Hub

A click-speed and input-performance testing suite for gamers, Minecraft PvP players, and PC enthusiasts. Measure how fast you can click, how quickly you react, and how your actual hardware responds — all in one place, with no account and nothing sent to a server.

Live site: https://cps-precision-hubv2.vercel.app/

## What it tests

- **CPS Test (home page)** — clicks per second with durations 1s, 2s, 3s, 5s, 10s, 15s, 30s, 1 min, and Manual (stop when you choose). Live CPS, per-duration bests, an 8-tier rank ladder (Beginner → Legendary, plus Godlike at 20+ CPS), recent activity, and a humour line after every result.
- **Speed Trials (`/more-tests`)** — Spacebar Counter, Right Click Test, Mouse Polling Rate, Key Ghosting, Jitter Click Coach, Butterfly Click Coach, Reaction Time, Kohi Click Test, Drag Click, Double Click, Aim Trainer, and Scroll Speed.
- **Rankings** — CPS tiers and reaction-time tiers are shown on the relevant pages so a score means something in context, not just as a bare number.

## Settings

- **Colour scheme** — the paintbrush button in the header opens a dropdown with 15 schemes. Pick one, then press Save Changes. "Navy Blue" is the default for new visitors; a previously saved scheme is kept.
- **Dark / Light mode** — the sun/moon button in the header. Dark is the default.
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

The pre-redesign style is kept at a hidden URL with no link to it anywhere in the new frontend:

```
https://cps-precision-hubv2.vercel.app/old
```

Type that URL to see the old (Cosmic Purple) theme with the premium navy styling switched off. Type `/` (or use the normal navigation) to return to the current site.

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
- `src/App.tsx` — main app, CPS test, routing, colour schemes, header, about section and FAQ section.
- `src/components/AlternateTests.tsx` — Spacebar, Right Click, Polling Rate, Jitter, Butterfly, Kohi, Drag Click, Double Click, Aim and Scroll tests, plus the touch scroll/zoom hook.
- `src/components/ReactionTime.tsx` — Reaction Time test.
- `src/components/KeyGhosting.tsx` — Key Ghosting test.
- `src/components/FAQs.tsx` — expandable FAQ list.
- `src/components/HistoryList.tsx` — recent activity list.
- `src/index.css` — Tailwind and theme utilities.
- `src/premium.css` — premium navy overlay: dot-grid/grain/vignette background, serif-italic hero accent, scroll reveals and progress hairline. Switched off on `/old`.
- `src/scroll-effects.ts` — reading-progress hairline and section reveals (respects reduced motion).
