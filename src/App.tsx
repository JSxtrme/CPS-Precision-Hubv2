import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewType, HistoryItem } from './types';
import './preview.css';
import FAQs from './components/FAQs';
import ModuleExtras from './components/ModuleExtras';
import PreviewCps, { PreviewSettings } from './components/PreviewCps';
import TiltCard from './components/TiltCard';
import KeyGhostingTest from './components/KeyGhosting';
import {
  SpacebarTest, RightClickTest, PollingRateTest, JitterTest, ButterflyTest, KohiTest,
  DragClickTest, DoubleClickTest, AimTrainer, ScrollTest,
} from './components/AlternateTests';
import { ReactionTimeTest } from './components/ReactionTime';
import LegacyApp from './LegacyApp';

type PvView = ViewType | 'settings';
const PATH_TO_VIEW: Record<string, PvView> = {
  '/': 'cps', '/cps': 'cps', '/old': 'cps',
  '/more-tests': 'cps', '/settings': 'settings',
  '/more-tests/drag-test': 'dragclick', '/more-tests/drag-click': 'dragclick',
  '/more-tests/reaction-test': 'reaction', '/more-tests/spacebar-test': 'spacebar',
  '/more-tests/rightclick-test': 'rightclick', '/more-tests/polling-rate-test': 'polling',
  '/more-tests/key-ghosting-test': 'ghosting', '/more-tests/jitter-test': 'jitter',
  '/more-tests/butterfly-test': 'butterfly', '/more-tests/kohi-test': 'kohi',
  '/more-tests/doubleclick-test': 'doubleclick', '/more-tests/aim-test': 'aim',
  '/more-tests/scroll-test': 'scroll',
};
const VIEW_TO_PATH: Record<string, string> = {
  cps: '/', settings: '/settings', dragclick: '/more-tests/drag-test',
  reaction: '/more-tests/reaction-test', spacebar: '/more-tests/spacebar-test',
  rightclick: '/more-tests/rightclick-test', polling: '/more-tests/polling-rate-test',
  ghosting: '/more-tests/key-ghosting-test', jitter: '/more-tests/jitter-test',
  butterfly: '/more-tests/butterfly-test', kohi: '/more-tests/kohi-test',
  doubleclick: '/more-tests/doubleclick-test', aim: '/more-tests/aim-test',
  scroll: '/more-tests/scroll-test',
};
function initialView(): PvView {
  try {
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    return PATH_TO_VIEW[p] || 'cps';
  } catch { return 'cps'; }
}

const SCRUB_TEXT = 'Most click counters give you a single number and nothing more. This measures the full picture — timing, technique and hardware — precise to the sub-millisecond, and presents it simply, so you always know exactly where you stand.';
const SCRUB_HL = new Set(['picture', 'precise', 'simply,']);

// Preview toolkit, verbatim from the HTML (TOOLS array): 12 modules, MODULE 01/12 style.
const TOOLS: { id: PvView; name: string; desc: string; tag: string; icon: React.ReactNode }[] = [
  { id: 'cps', name: 'CPS Test', desc: 'The main event. Raw clicks per second across nine durations, timed to the sub-millisecond.', tag: 'MODULE 01', icon: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" /> },
  { id: 'reaction', name: 'Reaction Time', desc: 'See green, strike fast. Five rounds expose your true average reflex latency.', tag: 'MODULE 02', icon: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></> },
  { id: 'spacebar', name: 'Spacebar Counter', desc: 'The biggest key on the board gets the CPS treatment. Thock sold separately.', tag: 'MODULE 03', icon: <path d="M4 15h16M4 15v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M9 15v1.5h6V15" /> },
  { id: 'polling', name: 'Polling Rate', desc: 'How often your mouse actually reports in. Sweep the pad and read the Hz.', tag: 'MODULE 04', icon: <path d="M3 12h4l2.5-6 4 12L16 12h5" /> },
  { id: 'doubleclick', name: 'Double Click', desc: 'Catches switch chatter — when one honest press registers twice.', tag: 'MODULE 05', icon: <><circle cx="9" cy="12" r="5.5" /><path d="M13.5 7.2a5.5 5.5 0 1 1-4.7 8.3" /></> },
  { id: 'ghosting', name: 'Key Ghosting', desc: "Hold a chord and see which keys your keyboard's matrix quietly drops.", tag: 'MODULE 06', icon: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" /></> },
  { id: 'scroll', name: 'Scroll Speed', desc: 'Five seconds of pure wheel velocity, measured in raw pixels of travel.', tag: 'MODULE 07', icon: <><rect x="8" y="2.5" width="8" height="19" rx="4" /><path d="M12 6.5v3" /></> },
  { id: 'dragclick', name: 'Drag Click', desc: 'Friction is a feature. Drag across the button and let the switch bounce.', tag: 'MODULE 08', icon: <path d="M4 18c5-1 12-6 14-12M14 4h5v5M4 12v6h6" /> },
  { id: 'rightclick', name: 'Right Click', desc: 'The bridging button gets its own CPS test. Off-hand speed counts too.', tag: 'MODULE 09', icon: <><circle cx="9" cy="12" r="5.5" /><path d="M13.5 7.2a5.5 5.5 0 1 1-4.7 8.3" /></> },
  { id: 'jitter', name: 'Jitter Click', desc: 'Vibrate your whole arm, not just the finger. A PvP classic, timed properly.', tag: 'MODULE 10', icon: <path d="M3 12h4l2.5-6 4 12L16 12h5" /> },
  { id: 'butterfly', name: 'Butterfly Click', desc: 'Two fingers alternating on one button. Double the fingers, double the rate.', tag: 'MODULE 11', icon: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" /> },
  { id: 'kohi', name: 'Kohi Click', desc: 'The classic 10-second measure from the old Kohi days. Pure, nostalgic CPS.', tag: 'MODULE 12', icon: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></> },
];

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = String(target); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return; io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * e));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{target}</span>;
}

// Scroll-scrub manifesto, ported from the preview's scrub() (lerped rAF loop,
// words light up as the paragraph scrolls through; reduced-motion shows all).
function ScrubText({ motionOK }: { motionOK: boolean }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = SCRUB_TEXT.split(/\s+/);
  useEffect(() => {
    const p = ref.current; if (!p) return;
    const spans = Array.from(p.querySelectorAll('.w')) as HTMLElement[];
    if (!motionOK) { spans.forEach((s) => s.classList.add('on')); return; }
    let target = 0, cur = -1, rafId = 0;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const measure = () => {
      const r = p.getBoundingClientRect(), vh = window.innerHeight;
      target = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.32), 0, 1);
      if (!rafId && Math.abs(target - cur) > 0.0005) rafId = requestAnimationFrame(step);
    };
    const step = () => {
      rafId = 0;
      cur = cur < 0 ? target : cur + (target - cur) * 0.085;
      if (Math.abs(target - cur) <= 0.0005) cur = target;
      const lit = Math.floor(cur * spans.length + 0.0001);
      spans.forEach((s, i) => s.classList.toggle('on', i < lit));
      if (cur !== target) rafId = requestAnimationFrame(step);
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure(); cur = target;
    spans.forEach((s, i) => s.classList.toggle('on', i < Math.floor(cur * spans.length + 0.0001)));
    return () => { window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); if (rafId) cancelAnimationFrame(rafId); };
  }, [motionOK]);
  return (
    <p className="scrub" id="scrubText" ref={ref} aria-label={SCRUB_TEXT}>
      {words.map((w, i) => (<React.Fragment key={i}><span className={`w${SCRUB_HL.has(w) ? ' hl' : ''}`}>{w}</span>{' '}</React.Fragment>))}
    </p>
  );
}

export default function App() {
  const isLegacyView = typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/old';
  const [activeView, setActiveView] = useState<PvView>(initialView);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { const s = localStorage.getItem('cps-test-theme'); return s ? s === 'dark' : true; } catch { return true; }
  });
  const [accent, setAccent] = useState(() => {
    try { return localStorage.getItem('cps-preview-accent') || 'navy'; } catch { return 'navy'; }
  });
  const [prefs, setPrefs] = useState(() => {
    const base = { sound: true, particles: true, shake: true, cursor: true, trail: false, grain: true, scrolllock: true, motion: false };
    try { const s = localStorage.getItem('cps-preview-prefs'); return s ? { ...base, ...JSON.parse(s) } : base; } catch { return base; }
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { const s = localStorage.getItem('cps-test-history'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  // Aim leaderboard duration: the selected pill (default 15s, mirrors
  // AimTrainer's own state via handleAimState) — except while a finished
  // test's result screen is up, when the leaderboard pins to that test's
  // duration instead of a pill changed afterwards. Restart/abandon/start
  // clears the pin, so the pill rules again before the next test.
  const [aimDuration, setAimDuration] = useState(15);
  const [aimFinishedDuration, setAimFinishedDuration] = useState<number | null>(null);
  const handleAimState = useCallback((d: number, status: 'idle' | 'running' | 'finished') => {
    setAimDuration(d);
    setAimFinishedDuration(status === 'finished' ? d : null);
  }, []);
  const aimLeaderboardDuration = aimFinishedDuration ?? aimDuration;
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [scrollToToolkit, setScrollToToolkit] = useState(() => { try { return window.location.pathname.replace(/\/$/, '') === '/more-tests'; } catch { return false; } });
  // Toolkit timeline (all widths, see preview.css): one dot per ROW of the
  // 12-module grid, relative to the first row's centre, plus scroll
  // progress (0..1) through the track. Rows are grouped from the live DOM
  // (cards sharing an offsetTop), not assumed from the column count — so
  // this is 12 dots at 1 column, 6 at 2 columns, and 3 at 4 columns
  // (desktop 4x3 grid). Dots sit on each row's centre whatever the card
  // heights are. The "Also in the lab" Aim grid is a separate .toolkit
  // element and is deliberately NOT measured here.
  const [tlOffsets, setTlOffsets] = useState<number[]>([]);
  const tlOffsetsRef = useRef<number[]>([]);
  // Timeline scroll progress is deliberately NOT React state (perf, 2026-11-01):
  // the old code called setTlProgress on every scroll frame, re-rendering the
  // whole App (CPS rig, TiltCards, everything) per frame — that is what made
  // phones lag when the toolkit scrolled into view. The fill and dot classes
  // below are now driven straight through refs, with no re-render at all.
  const tlFillRef = useRef<HTMLDivElement | null>(null);
  const tlDotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlLitRef = useRef<boolean[]>([]);
  const tlGridRef = useRef<HTMLElement | null>(null);
  const tlRafRef = useRef(0);
  const tlUpdateRef = useRef<(() => void) | null>(null);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  const systemReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOK = !prefs.motion && !systemReduced;
  const cursorOn = prefs.cursor && !isTouchDevice && motionOK && typeof window !== 'undefined' && window.matchMedia('(hover:hover)').matches;
  // Cursor trail: independent of the dot+ring cursor — all four combinations
  // (cursor on/off × trail on/off) work. Fine-pointer desktop only, off on
  // touch and under reduced motion, same as the cursor. Stored in the same
  // cps-preview-prefs blob as the other toggles; hidden on mobile in Settings
  // (see .desktop-only-set in preview.css) but its stored value is never deleted.
  const trailOn = prefs.trail && !isTouchDevice && motionOK && typeof window !== 'undefined' && window.matchMedia('(hover:hover)').matches;
  const trailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    setIsTouchDevice(hasTouch);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('cps-test-theme', isDarkMode ? 'dark' : 'light'); } catch {}
    const root = document.documentElement;
    root.dataset.theme = isDarkMode ? 'dark' : 'light';
    root.classList.toggle('dark', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#04070f' : '#f2f4f9';
  }, [isDarkMode]);
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    try { localStorage.setItem('cps-preview-accent', accent); } catch {}
  }, [accent]);
  useEffect(() => {
    try { localStorage.setItem('cps-preview-prefs', JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  // Scroll choreography (preview scrollFX): progress hairline, header settling,
  // gentle parallax on the ambient glow; dialled down on touch/small screens,
  // off entirely when reduced motion is requested.
  useEffect(() => {
    if (isLegacyView) return;
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const factor = (coarse || window.innerWidth < 760) ? 0.05 : 0.16;
    let ticking = false, py = -1;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const max = Math.max(document.documentElement.scrollHeight - vh, 1);
      const prog = Math.max(0, Math.min(1, window.scrollY / max));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${prog.toFixed(4)})`;
      if (headerRef.current) headerRef.current.classList.toggle('scrolled', window.scrollY > 12);
      if (bgRef.current && motionOK) {
        const y = Math.round(window.scrollY * factor);
        if (y !== py) { py = y; bgRef.current.style.setProperty('--py', `${y}px`); }
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update); update();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', update); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK, isLegacyView]);

  // Reveal on scroll (preview revIO + safety-net fallback).
  useEffect(() => {
    if (isLegacyView) return;
    const els = Array.from(document.querySelectorAll('.pv-scope .reveal')) as HTMLElement[];
    if (!motionOK) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    const t = window.setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [activeView, motionOK, isLegacyView]);

  // Cursor trail: a small pool of fading dots that chase the pointer. The
  // dots are created imperatively and moved in one rAF loop (no React state
  // per mousemove, no layout thrash) — each dot lerps toward the previous
  // one, so the trail snakes behind the cursor and shrinks as it fades.
  useEffect(() => {
    if (!trailOn) return;
    const container = trailRef.current; if (!container) return;
    const N = 10;
    const dots: HTMLSpanElement[] = [];
    const pos: { x: number; y: number }[] = [];
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      s.className = 'cursor-trail-dot';
      s.style.width = `${(10 - i * 0.7).toFixed(1)}px`;
      s.style.height = s.style.width;
      s.style.opacity = (0.85 - i * 0.07).toFixed(2);
      container.appendChild(s); dots.push(s); pos.push({ x: mx, y: my });
    }
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    let raf = 0;
    const loop = () => {
      let px = mx, py = my;
      pos.forEach((p, i) => {
        p.x += (px - p.x) * 0.35; p.y += (py - p.y) * 0.35;
        dots[i].style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-50%)`;
        px = p.x; py = p.y;
      });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      container.innerHTML = '';
    };
  }, [trailOn]);

  // Custom cursor (preview cursor()): 5px accent dot follows instantly, ring
  // lerps at 0.16; is-pad on .pad/.stage, is-hover on interactive elements,
  // is-down while pressed. Hidden on touch / hover:none by preview CSS, and
  // not rendered at all when the Settings cursor toggle or reduced motion is off.
  useEffect(() => {
    if (!cursorOn) return;
    const dot = cursorDotRef.current, ring = cursorRingRef.current; if (!dot || !ring) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, raf = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
      const t = e.target as HTMLElement | null;
      ring.classList.toggle('is-pad', !!(t && t.closest && t.closest('.pad, .stage')));
      ring.classList.toggle('is-hover', !!(t && t.closest && t.closest('button, a, .dur, .tool-card, .key')));
    };
    const onDown = () => ring.classList.add('is-down');
    const onUp = () => ring.classList.remove('is-down');
    const loop = () => { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; raf = requestAnimationFrame(loop); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); cancelAnimationFrame(raf); };
  }, [cursorOn]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [activeView]);
  useEffect(() => {
    if (scrollToToolkit) {
      requestAnimationFrame(() => { document.getElementById('toolkitAnchor')?.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' }); });
      setScrollToToolkit(false);
    }
  }, [scrollToToolkit, activeView, motionOK]);

  // Toolkit timeline measurements + scroll progress, all widths. Only the
  // 12-module grid (#toolkitGrid) is measured. Cards are grouped into rows
  // by their live top position (same row = tops within 10px), and each
  // row contributes ONE dot at its centre — so the dot count follows the
  // live column count (12 at 1 column, 6 at 2, 3 at 4 on desktop).
  // Fill point: 70% down the viewport — when that point passes a row's
  // centre, the line has lit up to it and its dot ripples (CSS .lit).
  useEffect(() => {
    if (activeView !== 'cps') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => {
      const grid = tlGridRef.current || document.getElementById('toolkitGrid');
      if (!grid) return;
      tlGridRef.current = grid as HTMLElement;
      const cards = Array.from(grid.querySelectorAll<HTMLElement>('.tool-card'));
      if (cards.length < 2) return;
      const gridTop = grid.getBoundingClientRect().top + window.scrollY;
      // Group cards into rows by live top position, then one centre per
      // row (mean of that row's card centres). Centres are relative to
      // the grid top (= wrapper top: the grid is the wrapper's first
      // child). The track spans first→last row centre.
      const rows: { top: number; centres: number[] }[] = [];
      cards.forEach((c) => {
        const top = c.getBoundingClientRect().top + window.scrollY;
        const centre = top + c.offsetHeight / 2 - gridTop;
        const row = rows.find((r) => Math.abs(r.top - top) <= 10);
        if (row) row.centres.push(centre);
        else rows.push({ top, centres: [centre] });
      });
      const centres = rows.map((r) => r.centres.reduce((a, b) => a + b, 0) / r.centres.length);
      tlOffsetsRef.current = centres;
      setTlOffsets(centres);
      update();
    };
    // Hot path: one getBoundingClientRect per rAF frame (the grid's top is
    // the only per-frame measurement — row centres stay cached from
    // measure()), fill via transform (compositor-only, no layout), and dot
    // classes toggled only when a dot's lit state actually changes, so the
    // ripple re-triggers exactly as before without a re-render.
    const update = () => {
      tlRafRef.current = 0;
      const grid = tlGridRef.current;
      if (!grid || tlOffsetsRef.current.length < 2) return;
      const offs = tlOffsetsRef.current;
      const trackH = offs[offs.length - 1] - offs[0];
      if (reduced) {
        if (tlFillRef.current) tlFillRef.current.style.transform = 'scaleY(1)';
        offs.forEach((_, i) => { if (!tlLitRef.current[i]) { tlLitRef.current[i] = true; tlDotRefs.current[i]?.classList.add('lit'); } });
        return;
      }
      const rect = grid.getBoundingClientRect();
      const trackTop = rect.top + offs[0];
      // (trackTop/trackH are viewport-relative; fill progress is the
      // fraction of the track the 70%-viewport point has passed.)
      const point = window.innerHeight * 0.7;
      const progress = Math.min(1, Math.max(0, (point - trackTop) / Math.max(1, trackH)));
      if (tlFillRef.current) tlFillRef.current.style.transform = `scaleY(${progress})`;
      const filled = progress * trackH;
      offs.forEach((c, i) => {
        const lit = filled >= c - offs[0];
        if (lit !== tlLitRef.current[i]) { tlLitRef.current[i] = lit; tlDotRefs.current[i]?.classList.toggle('lit', lit); }
      });
    };
    tlUpdateRef.current = update;
    // rAF-throttled like the main scroll choreography: at most one update
    // per frame, no matter how many scroll events fire.
    const onScroll = () => { if (!reduced && !tlRafRef.current) tlRafRef.current = requestAnimationFrame(update); };
    measure();
    const t = window.setTimeout(measure, 600); // re-measure after reveal animations settle
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => { window.clearTimeout(t); if (tlRafRef.current) cancelAnimationFrame(tlRafRef.current); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', measure); };
  }, [activeView]);

  // Once the measured dots mount (tlOffsets set by measure above), paint
  // the initial fill/lit state without waiting for the next scroll event.
  useEffect(() => {
    if (tlOffsets.length > 1 && tlUpdateRef.current) {
      const id = requestAnimationFrame(() => tlUpdateRef.current?.());
      return () => cancelAnimationFrame(id);
    }
  }, [tlOffsets]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state && e.state.view) setActiveView(e.state.view as PvView);
      else { const p = window.location.pathname.replace(/\/$/, '') || '/'; setActiveView(PATH_TO_VIEW[p] || 'cps'); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (view: PvView) => {
    if (view === activeView) return;
    const path = VIEW_TO_PATH[view] || '/';
    window.history.pushState({ view }, '', path);
    setActiveView(view);
  };
  const gotoToolkit = () => {
    if (activeView !== 'cps') { window.history.pushState({ view: 'cps' }, '', '/'); setActiveView('cps'); }
    setScrollToToolkit(true);
  };
  const handleAddHistory = useCallback((testType: string, duration: number, score: number, rating: string) => {
    const item: HistoryItem = { id: Math.random().toString(36).substring(2, 9), timestamp: Date.now(), testType, duration: parseFloat(duration.toFixed(2)), score, rating };
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try { localStorage.setItem('cps-test-history', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);
  // Old site's per-page Clear: clears the history array only, bests stay.
  // (Settings' Wipe data is separate — it clears bests too.)
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('cps-test-history'); } catch {}
  }, []);
  const wipeData = () => {
    setHistory([]);
    try {
      localStorage.removeItem('cps-test-history');
      Object.keys(localStorage).filter((k) => k.startsWith('cps-test-best-')).forEach((k) => localStorage.removeItem(k));
    } catch {}
  };
  const togglePref = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const pvSettings: PreviewSettings = { sound: prefs.sound, particles: prefs.particles, shake: prefs.shake, motion: prefs.motion, scrolllock: prefs.scrolllock };

  if (isLegacyView) return <LegacyApp />;

  const moduleHead = (serial: string, title: React.ReactNode, desc: string) => (
    <div className="view-head">
      <button type="button" className="back-link" onClick={gotoToolkit}>← All modules</button>
      <div className="serial" style={{ marginTop: 14 }}>{serial}</div>
      <h2>{title}</h2><p>{desc}</p>
    </div>
  );
  const engineWrap = (child: React.ReactNode) => <div className="pv-engine">{child}</div>;

  return (
    <div className={`pv-scope${prefs.cursor ? '' : ' no-cursor'}`} ref={scopeRef}>
      <div className="bg-fx" ref={bgRef} aria-hidden="true" />
      {prefs.grain && <div className="grain" aria-hidden="true" />}
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      {cursorOn && <><div className="cursor-dot" ref={cursorDotRef} aria-hidden="true" /><div className="cursor-ring" ref={cursorRingRef} aria-hidden="true" /></>}
      {trailOn && <div className="cursor-trail" ref={trailRef} aria-hidden="true" />}
      <header ref={headerRef}>
        <div className="header-in">
          <a className="wordmark" href="/" onClick={(e) => { e.preventDefault(); navigate('cps'); }} aria-label="CPS Precision Hub — home">
            <span className="mark" aria-hidden="true"><img src="/favicon.svg" alt="" width="36" height="36" /></span>
            <span><b>CPS Precision Hub</b><small>Precision Input Lab</small></span>
          </a>
          <nav className="mainnav" aria-label="Tests">
            <button type="button" className={activeView === 'cps' ? 'active' : ''} onClick={() => navigate('cps')}>CPS Test</button>
            <button type="button" className={activeView === 'reaction' ? 'active' : ''} onClick={() => navigate('reaction')}>Reaction</button>
            <button type="button" className={activeView === 'spacebar' ? 'active' : ''} onClick={() => navigate('spacebar')}>Spacebar</button>
            <button type="button" className="pv-toolkit-pill" onClick={gotoToolkit}>Toolkit</button>
            <button type="button" className={activeView === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}>Settings</button>
          </nav>
          <div className="head-tools">
            <span className="device-badge"><i /><span>{isTouchDevice ? 'TOUCH · TAP' : 'PC · MOUSE'}</span></span>
            <button type="button" className="icon-btn" aria-pressed={prefs.sound} aria-label="Toggle click sounds" title="Click sounds" onClick={() => togglePref('sound')}>♪</button>
            <button type="button" className="icon-btn" aria-label="Toggle light / dark theme" title="Theme" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '☀' : '☾'}</button>
          </div>
        </div>
      </header>
      <main>
        {activeView === 'cps' && (
          <section className="view" id="view-cps">
            <div className="hero">
              <div className="serial">CPS Test · Module 01</div>
              <h1 className="mega hero-in">How fast can<br />you <span className="acc">click?</span></h1>
              <p className="hero-sub">A precision click-speed test with sub-millisecond timing, live velocity analysis and a clear, honest ranking. <b>The first click starts the clock.</b></p>
              <div className="hero-meta">
                <div className="hm"><b><CountUp target={12} /></b>Test modules</div>
                <div className="hm"><b><CountUp target={8} /></b>Rank tiers</div>
                <div className="hm"><b>0<em>.</em>1<em>ms</em></b>Timer resolution</div>
                <div className="hm"><b><CountUp target={0} /></b>Excuses accepted</div>
              </div>
            </div>
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track">
                <span>Click faster <i>◆</i></span><span>Butterfly <i>◆</i></span><span>Jitter <i>◆</i></span><span>Drag click <i>◆</i></span><span>16+ CPS = Legendary <i>◆</i></span><span>Measured, not guessed <i>◆</i></span>
                <span>Click faster <i>◆</i></span><span>Butterfly <i>◆</i></span><span>Jitter <i>◆</i></span><span>Drag click <i>◆</i></span><span>16+ CPS = Legendary <i>◆</i></span><span>Measured, not guessed <i>◆</i></span>
              </div>
            </div>
            <PreviewCps onAddHistory={handleAddHistory} isTouchDevice={isTouchDevice} history={history} settings={pvSettings} onClear={handleClearHistory} />
            <div className="manifesto">
              <div className="k">Why CPS Precision Hub</div>
              <ScrubText motionOK={motionOK} />
            </div>
            <div className="strip reveal">
              <div className="cell"><div className="n"><CountUp target={12} /><em>+</em></div><div className="t">Input modules</div></div>
              <div className="cell"><div className="n"><CountUp target={120} /><em>Hz</em></div><div className="t">Graph sampling</div></div>
              <div className="cell"><div className="n"><CountUp target={60} /><em>s</em></div><div className="t">Longest test</div></div>
              <div className="cell"><div className="n"><CountUp target={2} /><em>×</em></div><div className="t">Device modes · PC &amp; touch</div></div>
            </div>
            <div className="section-head reveal" id="toolkitAnchor">
              <div><h2>The <span className="acc">toolkit</span></h2><p>Twelve calibrated modules — one for raw speed, the rest for everything your peripherals have been hiding.</p></div>
              <span className="tag mono" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '.2em' }}>12 MODULES · ALL LIVE</span>
            </div>
            <div className="pv-toolkit-wrap">
              <div className="toolkit" id="toolkitGrid">
                {TOOLS.map((t, i) => (
                  <TiltCard key={t.id} className="tool-card reveal" style={{ ['--rd' as string]: `${(i % 4) * 70}ms` }} onClick={() => (t.id === 'cps' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate(t.id))}>
                    <span className="idx">{t.tag} / 12</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
                    <h4>{t.name}</h4><p>{t.desc}</p><span className="go">Open module →</span>
                  </TiltCard>
                ))}
              </div>
              {tlOffsets.length > 1 && (
                <div className="pv-toolkit-timeline" aria-hidden="true">
                  <div className="pv-tl-track" style={{ top: tlOffsets[0], height: tlOffsets[tlOffsets.length - 1] - tlOffsets[0] }}>
                    <div className="pv-tl-fill" ref={tlFillRef} />
                    {tlOffsets.map((c, i) => (
                      <span key={i} ref={(el) => { tlDotRefs.current[i] = el; }} className="pv-tl-dot" style={{ top: c - tlOffsets[0] }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="section-head reveal"><div><h2>Also in the <span className="acc">lab</span></h2><p>One extra repo module beyond the preview's twelve — kept functional, not counted in the twelve.</p></div></div>
            <div className="toolkit">
              <TiltCard className="tool-card reveal" onClick={() => navigate('aim')}>
                <span className="idx">EXTRA / 12</span><h4>Aim Trainer</h4><p>Click randomly-appearing targets as fast and accurately as possible.</p><span className="go">Open module →</span>
              </TiltCard>
            </div>
            <div className="section-head reveal"><div><h2>Built to a <span className="acc">higher standard</span></h2><p>Careful engineering behind a calm surface — timing, feedback and hardware insight, without the clutter.</p></div></div>
            <div className="about">
              <div className="panel reveal">
                <h3>What is CPS Precision Hub?</h3>
                <p>An all-in-one testing suite for gamers, Minecraft PvP players and PC enthusiasts who want to measure — and improve — clicking speed, reaction time and overall input performance.</p>
                <p>Beyond the core CPS test, the toolkit covers <b>Spacebar Counter, Reaction Time, Key Ghosting, Polling Rate, Double Click, Scroll Speed, Drag Click, Right Click, Jitter, Butterfly and Kohi</b>, so you can benchmark everything from raw finger speed to the responsiveness of your actual hardware. In one place.</p>
              </div>
              <div className="panel reveal">
                <h3>Why it's better</h3>
                <ul className="feat-list">
                  <li><span><b>Smart device detection</b> — detects PC vs touch and adapts the whole testing experience instead of showing everyone the same broken layout.</span></li>
                  <li><span><b>A built-in humour engine</b> — sharp, personalised one-liners after every test. Run a PC-only test on your phone and it will call you out.</span></li>
                  <li><span><b>Context-aware roasts</b> — PC users get peripheral jokes; touch users get finger-and-thumb jokes. A phone has no right-click to laugh about.</span></li>
                  <li><span><b>Scroll lock during tests</b> — on touch, the page freezes mid-test so rapid tapping can't scroll your score away.</span></li>
                  <li><span><b>Adaptive reset controls</b> — double-click to reset on PC, a dedicated on-screen reset on touch. One size fits nobody.</span></li>
                </ul>
              </div>
            </div>
            <div className="section-head reveal"><div><h2>Frequently asked <span className="acc">questions</span></h2><p>Everything you need to know before you start clicking.</p></div></div>
            <FAQs />
            <footer><span>CPS Precision Hub — <span className="acc">Input Lab</span></span><span>Designed for precision</span><span>Timed with performance.now()</span></footer>
          </section>
        )}
        {activeView === 'reaction' && (<section className="view">{moduleHead('Module 02 — Reflex Latency', <>Reaction <span className="acc">Time</span></>, 'Wait for the panel to flash, then strike. Five rounds expose your true average reflex latency.')}{engineWrap(<ReactionTimeTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />)}<ModuleExtras view="reaction" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'spacebar' && (<section className="view">{moduleHead('Module 03 — Key Velocity', <>Spacebar <span className="acc">Counter</span></>, 'The biggest key on the board gets the CPS treatment.')}{engineWrap(<SpacebarTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="spacebar" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'polling' && (<section className="view">{moduleHead('Module 04 — Sensor Report Rate', <>Polling <span className="acc">Rate</span></>, 'How often your mouse actually reports in. Sweep the pad and read the Hz.')}{engineWrap(<PollingRateTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />)}<ModuleExtras view="polling" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'doubleclick' && (<section className="view">{moduleHead('Module 05 — Switch Diagnostics', <>Double <span className="acc">Click</span></>, 'Catches switch chatter — when one honest press registers twice.')}{engineWrap(<DoubleClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="doubleclick" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'ghosting' && (<section className="view">{moduleHead('Module 06 — Matrix Rollover', <>Key <span className="acc">Ghosting</span></>, "Hold a chord and see which keys your keyboard's matrix quietly drops.")}{engineWrap(<KeyGhostingTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />)}<ModuleExtras view="ghosting" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'scroll' && (<section className="view">{moduleHead('Module 07 — Wheel Velocity', <>Scroll <span className="acc">Speed</span></>, 'Five seconds of pure wheel velocity, measured in raw pixels of travel.')}{engineWrap(<ScrollTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="scroll" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'dragclick' && (<section className="view">{moduleHead('Module 08 — Friction Technique', <>Drag <span className="acc">Click</span></>, 'Friction is a feature. Drag across the button and let the switch bounce.')}{engineWrap(<DragClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="dragclick" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'rightclick' && (<section className="view">{moduleHead('Module 09 — Right Click', <>Right <span className="acc">Click</span></>, 'The bridging button gets its own CPS test. Off-hand speed counts too.')}{engineWrap(<RightClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="rightclick" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'jitter' && (<section className="view">{moduleHead('Module 10 — Jitter', <>Jitter <span className="acc">Click</span></>, 'Vibrate your whole arm, not just the finger. A PvP classic, timed properly.')}{engineWrap(<JitterTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="jitter" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'butterfly' && (<section className="view">{moduleHead('Module 11 — Butterfly', <>Butterfly <span className="acc">Click</span></>, 'Two fingers alternating on one button. Double the fingers, double the rate.')}{engineWrap(<ButterflyTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="butterfly" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'kohi' && (<section className="view">{moduleHead('Module 12 — Kohi', <>Kohi <span className="acc">Click</span></>, 'The classic 10-second measure from the old Kohi days. Pure, nostalgic CPS.')}{engineWrap(<KohiTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />)}<ModuleExtras view="kohi" history={history} onClear={handleClearHistory} /></section>)}
        {activeView === 'aim' && (<section className="view">{moduleHead('Extra — Aim', <>Aim <span className="acc">Trainer</span></>, 'Click randomly-appearing targets as fast and accurately as possible.')}{engineWrap(<AimTrainer addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} onAimState={handleAimState} />)}<ModuleExtras view="aim" history={history} onClear={handleClearHistory} duration={aimLeaderboardDuration} /></section>)}
        {activeView === 'settings' && (
          <section className="view" id="view-settings">
            <div className="view-head">
              <button type="button" className="back-link" onClick={() => navigate('cps')}>← Back to the rig</button>
              <div className="serial" style={{ marginTop: 14 }}>Preferences</div>
              <h2>Set<span className="acc">tings</span></h2>
              <p>Refine the experience to your hand. Every control applies live — no save button, no menus to dig through mid-test.</p>
            </div>
            <div className="settings-grid">
              <div className="panel">
                <div className="panel-head"><h3>Appearance</h3><span className="tag">LIVE</span></div>
                <div className="set-body">
                  <div className="set-row"><div className="s-txt"><b>Theme</b><span>Deep navy dark, or a clean, bright light finish.</span></div>
                    <div className="seg" role="group" aria-label="Theme"><button type="button" className={isDarkMode ? 'active' : ''} onClick={() => setIsDarkMode(true)}>Dark</button><button type="button" className={!isDarkMode ? 'active' : ''} onClick={() => setIsDarkMode(false)}>Light</button></div></div>
                  <div className="set-row"><div className="s-txt"><b>Accent colour</b><span>A family of considered blues — recolours pads, graphs, ranks and cursor.</span></div>
                    <div className="swatches" role="group" aria-label="Accent colour">
                      {([['navy', '#6ea8ff'], ['cobalt', '#517dff'], ['sky', '#4cc3ff'], ['slate', '#a3bce4']] as const).map(([id, bg]) => (
                        <button key={id} type="button" className={`swatch${accent === id ? ' active' : ''}`} style={{ background: bg }} aria-label={`${id} blue accent`} onClick={() => setAccent(id)} />
                      ))}
                    </div></div>
                  <div className="set-row desktop-only-set"><div className="s-txt"><b>Custom cursor</b><span>A quiet ring that follows your pointer across the page.</span></div>
                    <button type="button" className="switch" data-setting="cursor" aria-pressed={prefs.cursor} aria-label="Toggle custom cursor" onClick={() => togglePref('cursor')} /></div>
                  <div className="set-row desktop-only-set"><div className="s-txt"><b>Cursor trail</b><span>Fading dots that follow your pointer, alongside or instead of the custom cursor.</span></div>
                    <button type="button" className="switch" data-setting="trail" aria-pressed={prefs.trail} aria-label="Toggle cursor trail" onClick={() => togglePref('trail')} /></div>
                  <div className="set-row"><div className="s-txt"><b>Surface texture</b><span>An extremely subtle texture over the page finish.</span></div>
                    <button type="button" className="switch" data-setting="grain" aria-pressed={prefs.grain} aria-label="Toggle film grain" onClick={() => togglePref('grain')} /></div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Test feel</h3><span className="tag">LIVE</span></div>
                <div className="set-body">
                  <div className="set-row"><div className="s-txt"><b>Click sounds</b><span>A short switch “thock” synthesised per click. Your neighbours will hear the real one anyway.</span></div>
                    <button type="button" className="switch" data-setting="sound" aria-pressed={prefs.sound} aria-label="Toggle click sounds" onClick={() => togglePref('sound')} /></div>
                  <div className="set-row"><div className="s-txt"><b>Click particles</b><span>Sparks fly off the pad on every registered click.</span></div>
                    <button type="button" className="switch" data-setting="particles" aria-pressed={prefs.particles} aria-label="Toggle click particles" onClick={() => togglePref('particles')} /></div>
                  <div className="set-row"><div className="s-txt"><b>Pad shake</b><span>A 90-millisecond kick on each click. Tactile, like a heavy switch bottoming out.</span></div>
                    <button type="button" className="switch" data-setting="shake" aria-pressed={prefs.shake} aria-label="Toggle pad shake" onClick={() => togglePref('shake')} /></div>
                  <div className="set-row"><div className="s-txt"><b>Scroll lock while testing</b><span>Freezes page scroll during a run on touch devices, so taps can't drag the page.</span></div>
                    <button type="button" className="switch" data-setting="scrolllock" aria-pressed={prefs.scrolllock} aria-label="Toggle scroll lock during tests" onClick={() => togglePref('scrolllock')} /></div>
                  <div className="set-row"><div className="s-txt"><b>Reduce motion</b><span>Calms the marquee, reveals and cursor theatrics. The rig stays fast; the page stops showing off.</span></div>
                    <button type="button" className="switch" data-setting="motion" aria-pressed={prefs.motion} aria-label="Toggle reduced motion" onClick={() => togglePref('motion')} /></div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Session data</h3><span className="tag">THIS TAB</span></div>
                <div className="set-body"><div className="set-row"><div className="s-txt"><b>Personal bests</b><span>{history.length === 0 ? 'No results recorded yet this session.' : `${history.length} result${history.length === 1 ? '' : 's'} in recent activity, bests stored per duration in this browser.`}</span></div>
                  <button type="button" className="btn danger" onClick={wipeData}>Wipe data</button></div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>About</h3><span className="tag">V2</span></div>
                <div className="set-body">
                  <div className="set-row"><div className="s-txt"><b>Timing engine</b><span>performance.now() timestamps on every input event — no interval drift, no rounded frames.</span></div></div>
                  <div className="set-row"><div className="s-txt"><b>Device mode</b><span>{isTouchDevice ? 'Touch mode — scroll lock and on-screen resets are active, PC-only roasts are swapped for finger jokes.' : 'PC mode — mouse + keyboard detected. Double-click the pad to reset instantly.'}</span></div></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
