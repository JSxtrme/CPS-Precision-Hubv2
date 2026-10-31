import React, { useMemo } from 'react';
import { HistoryItem } from '../types';
import { REACTION_TIERS } from './ReactionTime';

/**
 * ModuleExtras — the sections the old site had below each test
 * (Recent Activity, a leaderboard, an About panel), rebuilt fresh
 * in preview language. This is NOT a copy of the old layout:
 * it reuses the preview's own .panel / .panel-head / .rank-list /
 * .rank-row / .activity-list / .act-item / .about / .feat-list
 * classes, Manrope + Instrument Serif hierarchy, navy dot-grid
 * panels and accent colours.
 *
 * DATA, by contrast, is old-site-compatible on purpose, so existing
 * local-storage bests and history carry over unchanged:
 *  - history comes from the single 'cps-test-history' array (last 50,
 *    HistoryItem { testType, duration, score, rating }) and is filtered
 *    by testType with exactly the mapping the old HistoryList used.
 *  - per-test bests are read from the old keys (cps-test-best-<test>-<duration>,
 *    reaction_best, cps-test-best-scroll-*) — never a new scheme.
 *  - scores are formatted the way the old HistoryList formatted them
 *    (Hz / Keys / ms / Hits / Steps, otherwise 2 decimals).
 * If a test has no old best key, its leaderboard is derived from
 * history entries instead, and the panel says so.
 * Aim exception: Aim's ladder is duration-scaled (see AIM_BASE_BANDS)
 * and its Best is per-duration. The effective duration arrives via the
 * `duration` prop from App: the selected pill before a test, the
 * just-finished test's duration while its result screen is up, and back
 * to the pill once the test is restarted/abandoned or a new one starts.
 */

const PREVIEW_RANKS = [
  { name: 'Beginner', min: 0, max: 3, color: '#8494b0' },
  { name: 'Novice', min: 3, max: 5, color: '#a3bce4' },
  { name: 'Average', min: 5, max: 7, color: '#7db1f5' },
  { name: 'Skilled', min: 7, max: 9, color: '#6ea8ff' },
  { name: 'Pro', min: 9, max: 11, color: '#517dff' },
  { name: 'Elite', min: 11, max: 13, color: '#4cc3ff' },
  { name: 'Master', min: 13, max: 16, color: '#b9cdf5' },
  { name: 'Legendary', min: 16, max: Infinity, color: '#e3c078' },
];

/**
 * Aim baseline bands — the 15s bands the old site used (and the ones
 * this panel showed for every duration before this fix):
 * Beginner 0–3, Average 4–6, Good 7–10, Great 11–14, Pro 15–19,
 * Legendary 20+ hits. Aim is the ONLY count-based module with a timer,
 * so it is the only ladder that scales: a 5s run cannot reasonably be
 * judged against 15s hit counts, and a 60s run should not earn
 * Legendary at just 20 hits.
 *
 * Scaling: scaledMin = ceil(baselineMin × duration / 15), clamped so
 * bands stay strictly increasing (each covers at least one hit count).
 * Ceil (not round) keeps the tier honest by rate: e.g. Average needs
 * 4 hits in 15s, so in 5s it needs ceil(4/3) = 2 hits — 1 hit in 5s is
 * only 3 hits at 15s pace, still Beginner. Resulting bands:
 *   5s:  0–1, 2, 3, 4, 5–6, 7+
 *   10s: 0–2, 3–4, 5–7, 8–9, 10–13, 14+
 *   15s: 0–3, 4–6, 7–10, 11–14, 15–19, 20+ (baseline, unchanged)
 *   30s: 0–7, 8–13, 14–21, 22–29, 30–39, 40+
 *   60s: 0–15, 16–27, 28–43, 44–59, 60–79, 80+
 * The per-run rating stored in history (hits × accuracy) is NOT
 * rescaled here — only this leaderboard is; see the aim note below.
 */
const AIM_BASE_BANDS = [
  { name: 'Beginner', min: 0, color: '#8494b0' },
  { name: 'Average', min: 4, color: '#a3bce4' },
  { name: 'Good', min: 7, color: '#7db1f5' },
  { name: 'Great', min: 11, color: '#6ea8ff' },
  { name: 'Pro', min: 15, color: '#517dff' },
  { name: 'Legendary', min: 20, color: '#e3c078' },
];
const AIM_BASELINE_SECONDS = 15;
const AIM_DURATIONS = [5, 10, 15, 30, 60];

function aimBandsFor(duration: number): { rows: LadderRow[]; mins: number[]; duration: number } {
  const eff = AIM_DURATIONS.includes(duration) ? duration : AIM_BASELINE_SECONDS;
  const mins: number[] = [];
  AIM_BASE_BANDS.forEach((b, i) => {
    const raw = Math.ceil((b.min * eff) / AIM_BASELINE_SECONDS);
    mins.push(i === 0 ? 0 : Math.max(raw, mins[i - 1] + 1));
  });
  const rows: LadderRow[] = AIM_BASE_BANDS.map((b, i) => {
    if (i === AIM_BASE_BANDS.length - 1) return { name: b.name, range: `${mins[i]}+ hits`, color: b.color };
    const hi = mins[i + 1] - 1;
    return { name: b.name, range: hi === mins[i] ? `${mins[i]} hits` : `${mins[i]}–${hi} hits`, color: b.color };
  });
  return { rows, mins, duration: eff };
}

type LadderRow = { name: string; range: string; color: string };
type LadderKind = 'cps' | 'reaction' | 'polling' | 'double' | 'ghosting' | 'scroll' | 'aim';

interface ModuleMeta {
  testTypes: string[];
  unit: string;
  ladderKind: LadderKind;
  /** localStorage key prefixes whose values are per-duration bests (max wins). Empty = history-derived. */
  bestPrefixes: string[];
  aboutTitle: string;
  aboutWhat: string;
  aboutBullets: [string, string][];
}

const DURATIONS = [1, 2, 3, 5, 10, 15, 30, 60, -1];

const META: Record<string, ModuleMeta> = {
  spacebar: {
    testTypes: ['Spacebar Counter'],
    unit: 'HPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-spacebar-'],
    aboutTitle: 'What is a Spacebar Counter?',
    aboutWhat:
      'The biggest key on the board, measured like a CPS test. Press space as fast as you can for the chosen duration. It is popular with Minecraft players for bunny-hop timing, and it doubles as a clean stamina check for your pressing hand.',
    aboutBullets: [
      ['It measures', 'hits per second (HPS) over the chosen duration — 1s to 1 Min, or Manual.'],
      ['Bests are stored per duration', 'under the old keys cps-test-best-spacebar-<duration>, so a 1s best never overwrites a 10s best.'],
      ['Spacebar’s own scale', 'Good 5+, Great 7+, Pro 9+, Legendary 12+ HPS — the ladder below uses the preview CPS tiers for comparison.'],
    ],
  },
  reaction: {
    testTypes: ['Reaction Time Test'],
    unit: 'ms',
    ladderKind: 'reaction',
    bestPrefixes: [],
    aboutTitle: 'What is a Reaction Time Test?',
    aboutWhat:
      'A reaction time test measures how quickly you respond to a visual cue — usually a screen changing colour — and click or press a key. The average human reaction time is around 200–250ms. Gamers, especially in FPS and competitive titles, use it to gauge and train their reflexes.',
    aboutBullets: [
      ['It measures', 'five rounds, averaged into a result — but your personal best is your fastest single round.'],
      ['Best is stored as', 'reaction_best in local storage (lower is better), exactly as the old site stored it.'],
      ['Control, not duration', 'this module is rounds-based, so there is no duration selector — rounds are its timer.'],
    ],
  },
  polling: {
    testTypes: ['Mouse Polling Rate'],
    unit: 'Hz',
    ladderKind: 'polling',
    bestPrefixes: [],
    aboutTitle: 'What is a Polling Rate Test?',
    aboutWhat:
      'A polling rate test measures how often your mouse reports its position to your computer, in Hz (times per second). A higher polling rate — 1000Hz versus 125Hz — means more frequent updates and lower input lag, which can matter for competitive gaming. This test verifies your mouse is running at its advertised rate.',
    aboutBullets: [
      ['It measures', 'live Hz: mouse reports counted over the last 1000ms while you sweep the pad, plus a peak Hz for the session.'],
      ['Grades, from the old site', 'Standard below 250Hz, Gaming Grade 250–499Hz, 1000Hz Grade at 500Hz and up.'],
      ['Control, not duration', 'this module is live and continuous — Start / Stop is its control, so no duration selector is faked onto it.'],
    ],
  },
  doubleclick: {
    testTypes: ['Double Click Test'],
    unit: 'ms',
    ladderKind: 'double',
    bestPrefixes: [],
    aboutTitle: 'What is a Double Click Test?',
    aboutWhat:
      'Checks for unwanted double-click registration — a common mechanical switch failure as mice age. Some mice with sensitive micro-switches register one physical press as two rapid clicks, and skilled clickers have learned to use that intentionally to push CPS higher than normal single-clicking allows.',
    aboutBullets: [
      ['It measures', 'the exact millisecond interval between consecutive click signals.'],
      ['Threshold is the control', 'a slider from 10–200ms (default 80ms): any interval under it is flagged as a double click.'],
      ['History records', 'each detected double as one entry, with its interval in ms — the ladder below uses your fastest recorded interval.'],
    ],
  },
  ghosting: {
    testTypes: ['Key Rollover', 'Key Ghosting'],
    unit: 'Keys',
    ladderKind: 'ghosting',
    bestPrefixes: [],
    aboutTitle: 'What is a Key Ghosting Test?',
    aboutWhat:
      'Checks how many keys your keyboard can register accurately when pressed simultaneously. “Ghosting” happens when a keyboard fails to detect certain key combinations due to hardware limitations — a problem in fast-paced games needing multiple simultaneous inputs, like WASD + Shift + Space. This test shows whether your keyboard has full N-key rollover (NKRO) or is limited by ghosting.',
    aboutBullets: [
      ['It measures', 'simultaneous keys held at once. Release the chord and that count lands in Recent Activity.'],
      ['Grades, from the old site', 'Office Grade below 6 keys, 6-KRO at 6–9 keys, NKRO at 10 keys and up.'],
      ['Control, not duration', 'this module is count-based — there is no timer to select.'],
    ],
  },
  scroll: {
    testTypes: ['Scroll Speed Test'],
    unit: 'steps/s',
    ladderKind: 'scroll',
    bestPrefixes: ['cps-test-best-scroll-'],
    aboutTitle: 'What is a Scroll Speed Test?',
    aboutWhat:
      'Measures the speed and mechanical consistency of your mouse scroll wheel, in total scroll steps per second. Useful for speed-scrolling setups, web page layout testing, and gamers optimising scroll-wheel binds — like Minecraft hotbar scrolling or jump binds.',
    aboutBullets: [
      ['It measures', 'steps per second: total wheel steps divided by the chosen duration.'],
      ['Duration is now selectable', '3s, 5s, 10s, 15s or 30s (was fixed at 5s). Bests use the old key pattern cps-test-best-scroll-<duration>, so your 5s best carries over unchanged.'],
      ['Peak velocity', 'is tracked live during the run, alongside up/down step counts.'],
    ],
  },
  dragclick: {
    testTypes: ['Drag Left Click', 'Drag Right Click', 'Drag Click Test'],
    unit: 'CPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-drag-left-', 'cps-test-best-drag-right-'],
    aboutTitle: 'What is a Drag Click Test?',
    aboutWhat:
      'Tests your mouse’s drag-click potential — how many clicks your specific mouse switch can generate via the drag technique. Results depend heavily on mouse hardware (switch type matters a lot here), so this doubles as a mouse-compatibility checker: does my mouse support drag clicking?',
    aboutBullets: [
      ['It measures', 'CPS generated by dragging across the button, in left-click or right-click mode.'],
      ['Bests are stored per mode and duration', 'under cps-test-best-drag-left-<duration> and cps-test-best-drag-right-<duration>.'],
      ['Reset follows the opposite rule', 'left-drag resets on double right-click, right-drag on double left-click, within 500ms.'],
    ],
  },
  rightclick: {
    testTypes: ['Right Click Test', 'Right Click CPS'],
    unit: 'CPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-right-'],
    aboutTitle: 'What is a Right Click Test?',
    aboutWhat:
      'The bridging button gets its own CPS test. Off-hand speed counts too — most players have never measured their right hand on its own, and it is usually slower than the left. Same timing, same ladder, different finger.',
    aboutBullets: [
      ['It measures', 'right-button clicks per second over the chosen duration — 1s to 1 Min, or Manual.'],
      ['Bests are stored per duration', 'under cps-test-best-right-<duration>.'],
      ['Reset follows the opposite rule', 'a finished right-click test resets on double left-click, within 500ms, so fast extra clicks cannot wipe a result.'],
    ],
  },
  jitter: {
    testTypes: ['Jitter Click Coach', 'Technique Trainer'],
    unit: 'CPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-jitter-'],
    aboutTitle: 'What is a Jitter Click Test?',
    aboutWhat:
      'Vibrate your whole arm, not just the finger. A PvP classic, timed properly: jitter clicking trades control for raw speed, and this coach measures the CPS you actually sustain — plus how stable your intervals are — instead of just counting clicks.',
    aboutBullets: [
      ['It measures', 'CPS over the chosen duration, with interval stability tracked alongside the count.'],
      ['Bests are stored per duration', 'under cps-test-best-jitter-<duration>.'],
      ['Technique note', 'short bursts with a relaxed grip beat long tense runs — the old coach’s humour lines say the same thing after every result.'],
    ],
  },
  butterfly: {
    testTypes: ['Butterfly Click Coach'],
    unit: 'CPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-butterfly-'],
    aboutTitle: 'What is a Butterfly Click Test?',
    aboutWhat:
      'Two fingers alternating on one button. Double the fingers, double the rate — if your alternation is clean. Butterfly clicking pushes past what a single finger can sustain, which is why it sits high on the CPS ladder, but only when both fingers land evenly.',
    aboutBullets: [
      ['It measures', 'CPS over the chosen duration, from alternating index and middle finger clicks.'],
      ['Bests are stored per duration', 'under cps-test-best-butterfly-<duration>.'],
      ['Watch the alternation', 'uneven fingers show up as unstable intervals long before the CPS number drops.'],
    ],
  },
  kohi: {
    testTypes: ['Kohi Retro Test'],
    unit: 'CPS',
    ladderKind: 'cps',
    bestPrefixes: ['cps-test-best-kohi-'],
    aboutTitle: 'What is a Kohi Click Test?',
    aboutWhat:
      'The classic measure from the old Kohi days, in a retro terminal skin. Pure, nostalgic CPS — no technique tricks, just how fast you can click the pad for the chosen duration. The green-on-black stage is deliberate: it is the one module that keeps its own look.',
    aboutBullets: [
      ['It measures', 'CPS over the chosen duration (default 5s, up to 1 Min or Manual).'],
      ['Bests are stored per duration', 'under cps-test-best-kohi-<duration>.'],
      ['Terminal styling is kept', 'the Kohi stage keeps its retro look inside the preview shell — that is the module’s identity, not a leftover.'],
    ],
  },
  aim: {
    testTypes: ['Aim Trainer'],
    unit: 'Hits',
    ladderKind: 'aim',
    bestPrefixes: [],
    aboutTitle: 'What is an Aim Trainer?',
    aboutWhat:
      'Click randomly-appearing targets to test raw mechanical hand-eye reflex time and precision tracking, simulating competitive FPS target-switching routines. It tracks accuracy %, average time-to-hit, and misses — not just how many targets you hit.',
    aboutBullets: [
      ['It measures', 'hits in the chosen window, plus accuracy and average reaction per target.'],
      ['Duration is now selectable', '5s, 10s, 15s, 30s or 60s (was fixed at 15s). Each run lands in history with its duration. The leaderboard scales its bands with the selected (or just-finished) duration, and Best is the best run at that same duration — so a 5s run is never judged against 15s hit counts.'],
      ['Rating in history', 'combines hits and accuracy (for example “Pro (92% Acc)”) — the ladder below ranks by hits alone, and says so.'],
    ],
  },
};

function readBest(prefixes: string[]): number | null {
  if (typeof window === 'undefined') return null;
  let best: number | null = null;
  try {
    for (const prefix of prefixes) {
      for (const d of DURATIONS) {
        const v = localStorage.getItem(`${prefix}${d}`);
        if (v !== null) {
          const n = parseFloat(v);
          if (!Number.isNaN(n) && (best === null || n > best)) best = n;
        }
      }
      // Also catch any key starting with the prefix (e.g. scroll keys for new durations).
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix) && !DURATIONS.some((d) => k === `${prefix}${d}`)) {
          const n = parseFloat(localStorage.getItem(k) || '');
          if (!Number.isNaN(n) && (best === null || n > best)) best = n;
        }
      }
    }
  } catch {
    return best;
  }
  return best;
}

function formatScore(view: string, item: HistoryItem): string {
  if (item.testType === 'Mouse Polling Rate') return `${item.score.toFixed(0)} Hz`;
  if (item.testType === 'Key Rollover' || item.testType === 'Key Ghosting') return `${item.score.toFixed(0)} Keys`;
  if (item.testType === 'Reaction Time Test' || item.testType === 'Double Click Test') return `${item.score.toFixed(1)} ms`;
  if (item.testType === 'Aim Trainer') return `${item.score.toFixed(0)} Hits`;
  if (item.testType === 'Scroll Speed Test') return `${item.score.toFixed(0)} Steps`;
  return `${item.score.toFixed(2)}`;
}

function ladderFor(meta: ModuleMeta, items: HistoryItem[], aimDuration?: number): { rows: LadderRow[]; best: number | null; current: string | null; next: string | null; progress: number; note: string; aimDuration: number | null } {
  const lowerBetter = meta.ladderKind === 'reaction' || meta.ladderKind === 'double';
  // Aim only: the duration the ladder applies to. The caller (App) passes
  // the selected pill duration, or the just-finished test's duration while
  // its result screen is up — see App's handleAimState. Anything else
  // falls back to the 15s baseline inside aimBandsFor.
  const aim = meta.ladderKind === 'aim' ? aimBandsFor(aimDuration ?? AIM_BASELINE_SECONDS) : null;
  let best: number | null = null;
  let note = '';
  if (meta.ladderKind === 'reaction') {
    try {
      const v = localStorage.getItem('reaction_best');
      best = v !== null ? parseFloat(v) : null;
    } catch { best = null; }
    note = 'Best = fastest single round (reaction_best).';
  } else if (meta.bestPrefixes.length > 0) {
    best = readBest(meta.bestPrefixes);
    note = 'Best = highest stored best across durations (old keys).';
  } else if (meta.ladderKind === 'polling') {
    best = items.length ? Math.max(...items.map((i) => i.score)) : null;
    note = 'Best = highest peak Hz in history (polling has no stored best key).';
  } else if (meta.ladderKind === 'double') {
    best = items.length ? Math.min(...items.map((i) => i.score)) : null;
    note = 'Fastest = lowest recorded double interval in history.';
  } else if (meta.ladderKind === 'ghosting') {
    best = items.length ? Math.max(...items.map((i) => i.score)) : null;
    note = 'Best = highest value in history (no stored best key for this module).';
  } else if (meta.ladderKind === 'aim' && aim) {
    // Per-duration best only: a 60s best (e.g. 40 hits) must never sit as
    // "Best" under a 5s-scaled ladder. Runs at other durations stay
    // visible in Recent activity, each labelled with its own duration.
    const same = items.filter((i) => i.duration === aim.duration);
    best = same.length ? Math.max(...same.map((i) => i.score)) : null;
    note = `Best = best ${aim.duration}s run in history (no stored best key for this module). Bands scaled from the 15s baseline by ×${aim.duration}/15; the ladder ranks by hits alone, while the rating stored in history still combines hits × accuracy, as before.`;
  }
  if (meta.ladderKind === 'scroll' && best === null) {
    // Fallback: derive steps/s from history (score = total steps, duration in seconds).
    const derived = items.filter((i) => i.duration > 0).map((i) => i.score / i.duration);
    if (derived.length) { best = Math.max(...derived); note = 'Best = highest steps/s derived from history.'; }
  }

  let rows: LadderRow[] = [];
  if (meta.ladderKind === 'cps') {
    rows = PREVIEW_RANKS.map((r) => ({ name: r.name, range: r.max === Infinity ? `${r.min}+` : `${r.min}–${r.max}`, color: r.color }));
  } else if (meta.ladderKind === 'reaction') {
    rows = REACTION_TIERS.map((t) => ({ name: t.label, range: t.max === Infinity ? `${t.min}ms+` : `${t.min}–${t.max}ms`, color: '#6ea8ff' }));
  } else if (meta.ladderKind === 'polling') {
    rows = [
      { name: 'Standard', range: '0–249 Hz', color: '#8494b0' },
      { name: 'Gaming Grade', range: '250–499 Hz', color: '#6ea8ff' },
      { name: '1000Hz Grade', range: '500+ Hz', color: '#e3c078' },
    ];
  } else if (meta.ladderKind === 'double') {
    rows = [
      { name: 'Ultra', range: '<20ms', color: '#e3c078' },
      { name: 'Fast', range: '20–39ms', color: '#6ea8ff' },
      { name: 'Standard', range: '40–79ms', color: '#a3bce4' },
      { name: 'Slow', range: '80ms+', color: '#8494b0' },
    ];
  } else if (meta.ladderKind === 'ghosting') {
    rows = [
      { name: 'Office Grade', range: '0–5 keys', color: '#8494b0' },
      { name: '6-KRO', range: '6–9 keys', color: '#6ea8ff' },
      { name: 'NKRO', range: '10+ keys', color: '#e3c078' },
    ];
  } else if (meta.ladderKind === 'scroll') {
    rows = [
      { name: 'Casual', range: '<20 steps/s', color: '#8494b0' },
      { name: 'Quick', range: '20–49 steps/s', color: '#a3bce4' },
      { name: 'Fast', range: '50–99 steps/s', color: '#6ea8ff' },
      { name: 'Blazing', range: '100+ steps/s', color: '#e3c078' },
    ];
  } else if (aim) {
    rows = aim.rows;
  }

  // Current tier: index into rows, using each kind's ordering.
  let currentIdx = -1;
  if (best !== null) {
    if (meta.ladderKind === 'cps') {
      currentIdx = PREVIEW_RANKS.findIndex((r) => best! >= r.min && best! < r.max);
    } else if (meta.ladderKind === 'reaction') {
      currentIdx = REACTION_TIERS.findIndex((t) => best! >= t.min && best! <= t.max);
    } else if (meta.ladderKind === 'polling') {
      currentIdx = best! >= 500 ? 2 : best! >= 250 ? 1 : 0;
    } else if (meta.ladderKind === 'double') {
      currentIdx = best! < 20 ? 0 : best! < 40 ? 1 : best! < 80 ? 2 : 3;
    } else if (meta.ladderKind === 'ghosting') {
      currentIdx = best! >= 10 ? 2 : best! >= 6 ? 1 : 0;
    } else if (meta.ladderKind === 'scroll') {
      currentIdx = best! >= 100 ? 3 : best! >= 50 ? 2 : best! >= 20 ? 1 : 0;
    } else if (aim) {
      // Scaled bands: tier = highest band whose scaled minimum is met.
      currentIdx = aim.mins.reduce((acc, m, i) => (best! >= m ? i : acc), 0);
    }
  }
  const current = currentIdx >= 0 ? rows[currentIdx].name : null;
  // Next: the tier above current (for lower-better kinds, the tier before it in the list).
  let next: string | null = null;
  let progress = 0;
  if (currentIdx >= 0) {
    if (lowerBetter) {
      next = currentIdx > 0 ? rows[currentIdx - 1].name : null;
      progress = currentIdx === 0 ? 1 : 0.5;
    } else {
      next = currentIdx < rows.length - 1 ? rows[currentIdx + 1].name : null;
      progress = currentIdx === rows.length - 1 ? 1 : 0.5;
    }
  }
  return { rows, best, current, next, progress, note, aimDuration: aim ? aim.duration : null };
}

export default function ModuleExtras({ view, history, onClear, duration }: { view: string; history: HistoryItem[]; onClear?: () => void; /** Aim only: selected pill duration, or the just-finished test's duration (App supplies the effective one). Ignored by every other module. */ duration?: number }) {
  const meta = META[view];
  const items = useMemo(() => {
    if (!meta) return [];
    return history.filter((h) => meta.testTypes.includes(h.testType)).slice(0, 8);
  }, [meta, history]);
  const ladder = useMemo(() => {
    if (!meta) return null;
    const all = history.filter((h) => meta.testTypes.includes(h.testType));
    return ladderFor(meta, all, duration);
  }, [meta, history, duration]);
  if (!meta || !ladder) return null;

  const fmtTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } catch { return ''; }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <div className="section-head reveal in" style={{ marginTop: 0 }}>
        <div>
          <h2>Your <span className="acc">results</span></h2>
          <p>Recent runs, your personal best on the ladder, and what this module actually measures.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 38, textAlign: 'left' }} className="pv-extras-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Recent activity</h3>
            <span className="tag">HISTORY</span>
            {onClear && items.length > 0 && (
              <button type="button" onClick={onClear} title="Clear all recent test scores" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Clear</button>
            )}
          </div>
          <div className="activity-list">
            {items.length === 0 ? (
              <div className="act-empty">No runs yet — take this module for a spin and your results will land here.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="act-item">
                  <div className="a-top">
                    <span className="a-name">{item.testType}</span>
                    <span className="a-score">{formatScore(view, item)}</span>
                  </div>
                  <div className="a-roast">{item.rating}{item.duration > 0 ? ` · ${item.duration}s` : ''}</div>
                  <div className="a-time">{fmtTime(item.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Leaderboard</h3>
            <span className="tag">{meta.ladderKind === 'aim' && ladder.aimDuration !== null ? `${ladder.aimDuration}s test` : 'PERSONAL BEST'}</span>
          </div>
          <div className="rank-list">
            {ladder.rows.map((row) => (
              <div key={row.name} className={`rank-row${ladder.current === row.name ? ' current' : ''}`}>
                <span className="dot" style={{ ['--rc' as string]: row.color }} />
                <span className="rn">{row.name}</span>
                <span className="rr">{row.range}</span>
              </div>
            ))}
          </div>
          <div className="rank-progress">
            <div className="rp-lbl">
              <span>Current: {ladder.current ?? '—'}</span>
              <span>Next: {ladder.next ?? 'Top tier'}</span>
            </div>
            <div className="rp-track"><i style={{ width: `${ladder.progress * 100}%` }} /></div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
              {ladder.best === null
                ? 'No personal best yet.'
                : <>Best: <b style={{ color: 'var(--text)' }}>{meta.ladderKind === 'aim' ? ladder.best.toFixed(0) : meta.ladderKind === 'reaction' || meta.ladderKind === 'double' ? ladder.best.toFixed(1) : ladder.best.toFixed(2)} {meta.unit}</b></>}
              <div style={{ marginTop: 4, fontSize: 11 }}>{ladder.note}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="about">
        <div className="panel">
          <h3>{meta.aboutTitle}</h3>
          <p>{meta.aboutWhat}</p>
        </div>
        <div className="panel">
          <h3>How to read it</h3>
          <ul className="feat-list">
            {meta.aboutBullets.map(([b, rest]) => (
              <li key={b}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span><b>{b}</b> — {rest}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
