import React, { useState } from 'react';

// Exactly 10 FAQs (see PR body): the preview HTML's 3 first, answers verbatim
// from CPS_Precision_Hub_Makeover_Preview.html, then 7 non-duplicate answers
// copied verbatim from the old site's original 10. The 9 PR #1 questions are
// deliberately NOT included, and the old duplicates are NOT used.
export const FAQ_LIST = [
  {
    q: 'What is a good CPS score?',
    a: 'Most players land between 5 and 7 CPS with normal clicking. Butterfly clicking pushes 10–14, and drag clicking can spike past 16. Check the rank ladder — 9+ CPS puts you in Pro territory.',
  },
  {
    q: 'Does my mouse actually matter?',
    a: 'Yes. Switch debounce time decides how many of your clicks even register — it\'s why drag-clicking mice are famous in PvP. Run the Polling Rate and Double Click modules to see what your hardware is really doing.',
  },
  {
    q: 'Is butterfly clicking allowed in Minecraft PvP?',
    a: 'Depends on the server. Many allow it, some cap CPS or flag drag clicking. Knowing your real numbers first is the whole point of this rig — test here, then check your server\'s rules.',
  },
  {
    q: 'What is a CPS test?',
    a: 'A CPS test measures how many times you can click your mouse in a set period of time (usually 1, 5, 10, or 60 seconds). It\'s commonly used to test clicking speed for gaming, especially competitive Minecraft PvP.',
  },
  {
    q: 'What is jitter clicking?',
    a: 'A technique where you tense your arm and let it vibrate rapidly against the mouse button, generating clicks faster than normal muscle movement allows.',
  },
  {
    q: 'What is butterfly clicking?',
    a: 'A technique using two fingers to alternate clicks on the same mouse button, allowing higher CPS than single-finger clicking. It\'s controversial in some games due to being seen as exploiting hardware/mouse debounce behavior.',
  },
  {
    q: 'What is drag clicking?',
    a: 'Dragging a finger across the mouse button surface to exploit the mechanical properties of certain mouse switches, producing very high CPS (sometimes 20+). Works best with specific mice (e.g., certain Razer or Logitech models with responsive switches).',
  },
  {
    q: 'Does CPS matter for gaming?',
    a: 'Yes, particularly in Minecraft PvP where click speed affects hit frequency. It matters less in most other games, where aim, reaction time, and strategy dominate.',
  },
  {
    q: 'Can I improve my CPS?',
    a: 'Yes — through practice, proper mouse grip, using a lighter/more responsive mouse, and practicing techniques like jitter or butterfly clicking. Results vary by individual.',
  },
  {
    q: 'Why does my score differ between attempts?',
    a: 'Fatigue, mouse hardware differences, click technique, and even browser performance can cause variation. Testing in short bursts (like 5 seconds) is often more reliable than sustained clicking.',
  },
];

export default function FAQs() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="panel faq reveal">
      {FAQ_LIST.map((item, i) => (
        <div className={`faq-item${open === i ? ' open' : ''}`} key={item.q}>
          <button type="button" className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <div className="faq-a"><p>{item.a}</p></div>
        </div>
      ))}
    </div>
  );
}
