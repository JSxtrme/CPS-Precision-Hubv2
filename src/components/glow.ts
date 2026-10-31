import React from 'react';

/**
 * Cursor-reactive glow, ported from the preview HTML's spotlightMove():
 * the CPS pad (and now every test stage) carries a radial-gradient
 * background at --px/--py. This handler updates those vars on the
 * element itself, on mouse pointers only. It never stops propagation
 * and never touches click counting, so it cannot eat clicks the way
 * an overlay could. Touch pointermoves are ignored (no glow on phones),
 * and reduced-motion users get no glow either.
 */
export function handleGlowMove(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  el.style.setProperty('--px', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  el.style.setProperty('--py', `${((e.clientY - rect.top) / rect.height) * 100}%`);
}
