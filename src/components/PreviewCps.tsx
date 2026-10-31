import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HistoryItem, Ripple, RATING_TIERS, getRating } from '../types';
import { useDisableScrollZoomOnTouch } from './AlternateTests';
import { getHumorousLine, getHighScore, updateHighScore } from '../LegacyApp';

// Preview rank ladder, copied from CPS_Precision_Hub_Makeover_Preview.html (RANKS).
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
function previewRankFor(cps: number) {
  for (const r of PREVIEW_RANKS) if (cps >= r.min && cps < r.max) return r;
  return PREVIEW_RANKS[PREVIEW_RANKS.length - 1];
}

const DURATIONS = [1, 2, 3, 5, 10, 15, 30, 60, -1];
const durLabel = (d: number) => (d === -1 ? 'Manual' : d === 60 ? '1 Min' : `${d}s`);

export interface PreviewSettings {
  sound: boolean; particles: boolean; shake: boolean; motion: boolean;
}

function MagneticButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  // Port of the preview's magnetic primary buttons (preview ~126032):
  // pointermove translate x * 0.18, y * 0.3, hover-capable only, reduced-motion guard.
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!window.matchMedia('(hover:hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = ref.current; if (!btn) return;
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
  };
  return (
    <button type="button" ref={ref} className={className} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerMove={onMove} onPointerLeave={() => { if (ref.current) ref.current.style.transform = ''; }}>
      {children}
    </button>
  );
}

interface Props {
  onAddHistory: (testType: string, duration: number, score: number, rating: string) => void;
  isTouchDevice: boolean;
  history: HistoryItem[];
  settings: PreviewSettings;
}

export default function PreviewCps({ onAddHistory, isTouchDevice, history, settings }: Props) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [liveCps, setLiveCps] = useState(0);
  const [peak, setPeak] = useState(0);
  const [finalCps, setFinalCps] = useState(0);
  const [highScore, setHighScore] = useState(() => getHighScore(duration));
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [humorousMessage, setHumorousMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const clicksRef = useRef(0);
  const clickTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rippleIdCounter = useRef(0);
  const lastRightClickRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const padRef = useRef<HTMLDivElement | null>(null);
  const countedViaPointerAtRef = useRef(0);
  const graphRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const motionOK = () => !settings.motion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useDisableScrollZoomOnTouch(status === 'running', isTouchDevice);

  const cancelTimer = useCallback(() => {
    if (animFrameIdRef.current !== null) { cancelAnimationFrame(animFrameIdRef.current); animFrameIdRef.current = null; }
  }, []);

  const drawGraph = useCallback(() => {
    const cv = graphRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const start = startTimeRef.current; if (!start) return;
    const span = duration === -1 ? Math.max(1, (performance.now() - start) / 1000) : duration;
    const buckets = new Array(60).fill(0);
    for (const t of clickTimesRef.current) {
      const idx = Math.min(59, Math.floor((t / span) * 60));
      if (idx >= 0) buckets[idx] += 1;
    }
    const max = Math.max(1, ...buckets);
    ctx.beginPath();
    buckets.forEach((v, i) => {
      const x = (i / 59) * W, y = H - 8 - (v / max) * (H - 24);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#6ea8ff'; ctx.lineWidth = 2; ctx.stroke();
  }, [duration]);

  const handleFinished = useCallback((totalSeconds: number) => {
    cancelTimer();
    const clicks = clicksRef.current;
    const cps = totalSeconds > 0 ? clicks / totalSeconds : 0;
    setFinalCps(cps); setClickCount(clicks); setTimeLeft(totalSeconds); setStatus('finished');
    setHumorousMessage((prev) => getHumorousLine(cps, prev, isTouchDevice));
    const prevHighScore = getHighScore(duration);
    const updatedBest = updateHighScore(duration, cps);
    const rank = getRating(cps).label;
    onAddHistory('Standard Left Click', totalSeconds, cps, rank);
    setIsNewHighScore(cps > 0 && cps > prevHighScore);
    setHighScore(updatedBest);
    setTimeout(drawGraph, 0);
  }, [cancelTimer, duration, onAddHistory, isTouchDevice, drawGraph]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);
  useEffect(() => {
    if (status === 'idle') { setHighScore(getHighScore(duration)); setTimeLeft(duration === -1 ? 0 : duration); }
  }, [duration, status]);
  useEffect(() => { drawGraph(); }, [clickCount, drawGraph]);

  const runTimerTick = useCallback((totalSeconds: number) => {
    if (startTimeRef.current === null) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    if (totalSeconds === -1) {
      setTimeLeft(elapsed);
      const live = elapsed > 0 ? clicksRef.current / elapsed : 0;
      setLiveCps(live); setPeak((p) => Math.max(p, live));
      animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(totalSeconds));
      return;
    }
    const remaining = totalSeconds - elapsed;
    if (remaining <= 0) { handleFinished(totalSeconds); return; }
    setTimeLeft(remaining);
    const live = elapsed > 0 ? clicksRef.current / elapsed : 0;
    setLiveCps(live); setPeak((p) => Math.max(p, live));
    animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(totalSeconds));
  }, [handleFinished]);

  const clickSound = () => {
    if (!settings.sound) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const a = audioRef.current; if (a.state === 'suspended') void a.resume();
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'square'; o.frequency.value = 1400 + Math.random() * 500;
      g.gain.setValueAtTime(0.035, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.028);
      o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.028);
    } catch { /* audio unavailable: test continues silently */ }
  };

  const padFX = (clientX: number, clientY: number) => {
    const pad = padRef.current; if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    if (settings.particles && motionOK()) {
      for (let i = 0; i < 4; i++) {
        const p = document.createElement('span'); p.className = 'particle';
        p.style.left = `${x}px`; p.style.top = `${y}px`; pad.appendChild(p);
        const ang = Math.random() * Math.PI * 2, dist = 34 + Math.random() * 60;
        const anim = p.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist - 14}px) rotate(${Math.random() * 260 - 130}deg)`, opacity: 0 },
        ], { duration: 420 + Math.random() * 200, easing: 'cubic-bezier(.2,.8,.3,1)' });
        anim.onfinish = () => p.remove();
      }
    }
    if (settings.shake && motionOK()) { pad.classList.remove('shake'); void pad.offsetWidth; pad.classList.add('shake'); }
    pad.classList.add('flash'); window.setTimeout(() => pad.classList.remove('flash'), 90);
  };

  // Single counting path, shared by pointerdown (mouse/pen), click (touch /
  // keyboard fallback) and keydown. A tap is counted exactly once.
  const doPadTap = (clientX: number, clientY: number) => {
    const pad = padRef.current; if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const id = rippleIdCounter.current++;
    setRipples((prev) => [...prev, { id, x: clientX - rect.left, y: clientY - rect.top }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    padFX(clientX, clientY); clickSound();
    if (status === 'idle') {
      clicksRef.current = 1; clickTimesRef.current = [0]; setClickCount(1); setLiveCps(0); setPeak(0);
      startTimeRef.current = performance.now(); setStatus('running');
      animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(duration));
    } else if (status === 'running') {
      clicksRef.current += 1; setClickCount(clicksRef.current);
      if (startTimeRef.current !== null) clickTimesRef.current.push((performance.now() - startTimeRef.current) / 1000);
    }
    // status === 'finished': deliberately no count / restart here — the
    // finished result is reset only via Run it back, Reset, or the
    // opposite-button double-click, so fast extra clicks cannot wipe it.
  };

  // Cursor-reactive pad glow, ported from the preview's spotlightMove():
  // --px/--py drive the pad's radial-gradient background in preview.css.
  const handlePadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const pad = padRef.current; if (!pad) return;
    const rect = pad.getBoundingClientRect();
    pad.style.setProperty('--px', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    pad.style.setProperty('--py', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handlePadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Touch is handled by the click path below, after the swipe check in
    // onTouchEnd — counting here would count a swipe before its movement
    // is known. Mouse/pen count on pointerdown, like the preview.
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (status === 'finished' && target && target.closest && target.closest('.result')) return; // result buttons handle their own clicks
    if (status === 'finished') return;
    countedViaPointerAtRef.current = Date.now();
    doPadTap(e.clientX, e.clientY);
  };

  const handlePadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    if (e.button !== 0) return;
    // A mouse/pen tap already counted in pointerdown; its click must not
    // count twice. The timestamp guard means a stale flag (dragged off
    // the pad, so no click followed) cannot swallow a later real tap.
    if (Date.now() - countedViaPointerAtRef.current < 1000) { countedViaPointerAtRef.current = 0; return; }
    doPadTap(e.clientX, e.clientY);
  };

  const handlePadKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code !== 'Space' && e.code !== 'Enter') return;
    e.preventDefault();
    if (e.repeat || status === 'finished') return;
    const rect = padRef.current?.getBoundingClientRect();
    doPadTap(rect ? rect.left + rect.width / 2 : 0, rect ? rect.top + rect.height / 2 : 0);
  };

  const handleReset = () => {
    cancelTimer(); startTimeRef.current = null; clicksRef.current = 0; clickTimesRef.current = [];
    setClickCount(0); setLiveCps(0); setPeak(0); setFinalCps(0); setIsNewHighScore(false);
    setTimeLeft(duration === -1 ? 0 : duration); setStatus('idle'); setHumorousMessage(''); lastRightClickRef.current = 0;
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status === 'finished' && e.button === 2) {
      e.preventDefault();
      const now = Date.now();
      if (now - lastRightClickRef.current < 500) handleReset(); else lastRightClickRef.current = now;
    }
  };
  const handleSelectDuration = (d: number) => {
    if (status === 'running') return;
    setDuration(d); cancelTimer(); startTimeRef.current = null; clicksRef.current = 0; clickTimesRef.current = [];
    setClickCount(0); setLiveCps(0); setPeak(0); setFinalCps(0); setIsNewHighScore(false);
    setTimeLeft(d === -1 ? 0 : d); setStatus('idle'); setHumorousMessage('');
  };
  const handleStopManual = () => {
    if (status !== 'running' || startTimeRef.current === null) return;
    handleFinished((performance.now() - startTimeRef.current) / 1000);
  };
  const copyScore = async () => {
    try { await navigator.clipboard.writeText(`${finalCps.toFixed(2)} CPS — ${getRating(finalCps).label} · CPS Precision Hub`); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };

  const currentCps = status === 'finished' ? finalCps : liveCps;
  const currentRating = getRating(currentCps);
  const progressRatio = duration === -1 ? (status === 'running' ? (timeLeft % 2) / 2 : 0) : (status === 'idle' ? 0 : Math.min(1, 1 - timeLeft / duration));
  const timeDisplay = status === 'idle' ? (duration === -1 ? 0 : duration) : timeLeft;
  const curRank = previewRankFor(currentCps);
  const nextRank = PREVIEW_RANKS[PREVIEW_RANKS.indexOf(curRank) + 1];
  const rpPct = nextRank ? Math.max(0, Math.min(100, ((currentCps - curRank.min) / (nextRank.min - curRank.min)) * 100)) : 100;

  return (
    <div className="rig">
      <div className="rig-main">
        <div className="dur-row" role="group" aria-label="Test duration">
          {DURATIONS.map((d) => (
            <button key={d} type="button" className={`dur${duration === d ? ' active' : ''}`} disabled={status === 'running'} onClick={() => handleSelectDuration(d)}>
              {durLabel(d)}
            </button>
          ))}
        </div>
        <div className="readouts">
          <div className="readout"><div className="num">{timeDisplay.toFixed(1)}<small>s</small></div><div className="lbl">{duration === -1 ? 'Elapsed' : 'Time Left'}</div></div>
          <div className="readout"><div className="num">{clickCount}</div><div className="lbl">Clicks</div><div className="sub">peak {peak.toFixed(2)} cps</div></div>
          <div className="readout"><div className="num">{currentCps.toFixed(2)}</div><div className="lbl">Live CPS</div><div className="sub">rank: {currentCps > 0 ? currentRating.label : '—'}</div></div>
        </div>
        <div className="hairline"><i style={{ width: `${progressRatio * 100}%` }} /></div>
        <div className="pad-wrap">
          {/* NOTE: this was a <button> in PR #3. Its children are all
              absolutely positioned, so as a button it collapsed to ~0 width
              and taps landed outside it (selecting the "Best for" text
              below). As a block <div> — exactly like the preview's
              <div class="pad"> — it fills the rig and is the click target.
              Nested result buttons are also only valid inside a div. */}
          <div ref={padRef} className={`pad${status === 'running' ? ' running' : ''}`} role="button" tabIndex={0}
            onContextMenu={(e) => e.preventDefault()} onClick={handlePadClick} onMouseDown={handleMouseDown}
            onPointerDown={handlePadPointerDown} onPointerMove={handlePadPointerMove} onKeyDown={handlePadKeyDown}
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(e) => { const t = e.touches[0]; touchStartRef.current = { x: t.clientX, y: t.clientY }; touchMovedRef.current = false; }}
            onTouchMove={(e) => { const s = touchStartRef.current; if (!s) return; const t = e.touches[0]; if (Math.abs(t.clientX - s.x) > 12 || Math.abs(t.clientY - s.y) > 12) touchMovedRef.current = true; }}
            onTouchEnd={() => { if (touchMovedRef.current) suppressClickRef.current = true; touchStartRef.current = null; touchMovedRef.current = false; }}
            aria-label="Click target. Press or click to start the CPS test.">
            <div className="pad-grid" aria-hidden="true" />
            {ripples.map((r) => (<span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />))}
            <div className="pad-center">
              <div className="big">Click to <span className="acc">start</span></div>
              <div className="small">{duration === -1 ? 'Manual timer mode' : `${durLabel(duration)} challenge`} · timer starts on first click</div>
              <div className="mono-hint">Left click only · Space / Enter works too</div>
            </div>
            <div className="live-cps" aria-hidden="true"><div><div className="v">{liveCps.toFixed(2)}</div><div className="u">CLICKS / SEC</div></div></div>
            <div className={`result${status === 'finished' ? ' show' : ''}`}>
              <div className="r-lbl">Final score</div>
              <div className="r-num">{finalCps.toFixed(2)}</div>
              <div className="r-unit">CLICKS PER SECOND</div>
              <div className="r-rank">{getRating(finalCps).label}</div>
              <p className="r-roast">{humorousMessage ? `“${humorousMessage}”` : ''}</p>
              {isNewHighScore && <div className="r-roast">▲ NEW BEST</div>}
              <div className="btn-row">
                <MagneticButton className="btn primary" onClick={handleReset}>Run it back</MagneticButton>
                <button type="button" className="btn" onClick={(e) => { e.stopPropagation(); void copyScore(); }}>{copied ? 'Copied!' : 'Copy score'}</button>
              </div>
              <p className="r-roast">{isTouchDevice ? 'Tap Reset below to try again!' : 'Double right-click the pad to reset'}</p>
            </div>
          </div>
        </div>
        <canvas className="graph" ref={graphRef} width={900} height={128} aria-label="Live click velocity graph" />
        <div className="pad-foot">
          <div className="best-line">Best for <span>{durLabel(duration)}</span>: <b>{highScore.toFixed(2)} CPS</b>{isNewHighScore && <span className="newbest">▲ NEW BEST</span>}</div>
          <div className="btn-row">
            {duration === -1 && status === 'running' && <button type="button" className="btn danger" onClick={handleStopManual}>Stop test</button>}
            <button type="button" className="btn" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>
      <aside className="side">
        <div className="panel">
          <div className="panel-head"><h3>Recent activity</h3><span className="tag">THIS SESSION</span></div>
          <div className="activity-list">
            {history.length === 0 ? (
              <div className="act-empty">“Crickets chirping… your clicks are so silent we can hear dust landing. Give it a tap.”</div>
            ) : history.slice(0, 20).map((h) => (
              <div className="act-item" key={h.id}>
                <div className="a-top"><span className="a-name">{h.testType}</span><span className="a-score">{h.score.toFixed(2)} · {h.rating}</span></div>
                <div className="a-time">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {h.duration}s</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Rank ladder</h3><span className="tag">8 TIERS</span></div>
          <div className="rank-list">
            {PREVIEW_RANKS.map((r) => (
              <div key={r.name} className={`rank-row${r === curRank && currentCps > 0 ? ' current' : ''}${currentCps > 0 && r.max <= currentCps ? ' done' : ''}`} style={{ ['--rc' as string]: r.color }}>
                <span className="dot" /><span className="rn">{r.name}</span><span className="rr">{r.max === Infinity ? `${r.min}+ CPS` : `${r.min}–${r.max} CPS`}</span>
              </div>
            ))}
          </div>
          <div className="rank-progress">
            <div className="rp-lbl"><span>Current: {currentCps > 0 ? curRank.name : '—'}</span><span>{nextRank ? `Next: ${nextRank.name} @ ${nextRank.min} CPS` : 'Max tier reached'}</span></div>
            <div className="rp-track"><i style={{ width: `${currentCps > 0 ? rpPct : 0}%` }} /></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
export { RATING_TIERS };
