import React, { useRef } from 'react';

// One card for both toolkit grids (the 12 modules and the Aim extra), so the
// desktop hover tilt and the mobile press effect live in exactly one place.
//
// Desktop (fine pointer only): classic perspective tilt — the card bends away
// from the cursor, so a cursor at the top-right corner tips that corner back
// (rotateX positive tips the top away, rotateY positive tips the right away),
// with the card's existing --mx/--my glow following the cursor too. On
// pointer leave it springs back flat via the card's own transform transition.
//
// Mobile (touch only): hover cannot exist, so a press briefly dips the card
// toward the touch point and scales it to 0.97, then springs back on release.
// It never calls preventDefault and never delays the click, so tapping a card
// still navigates on the first tap — no double-tap, no added latency.
//
// Reduced motion: no tilt and no press effect at all. The inline transform is
// cleared on leave/release, so the card's normal hover lift and reveal
// animation keep working when no tilt is active.
export default function TiltCard({ children, onClick, className = '', style }: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch' || !finePointer() || reducedMotion()) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
    el.style.transition = 'transform .15s ease-out';
    el.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-3px)`;
  };
  const onPointerLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
  };
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'touch' || reducedMotion()) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform .12s ease-out';
    el.style.transform = `perspective(900px) rotateX(${(y * 6).toFixed(2)}deg) rotateY(${(-x * 6).toFixed(2)}deg) scale(.97)`;
  };
  const onPointerUp = () => {
    const el = ref.current; if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
  };

  return (
    <button type="button" ref={ref} className={className} style={style} onClick={onClick}
      onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {children}
    </button>
  );
}
