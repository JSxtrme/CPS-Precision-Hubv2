import React, { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  isDarkMode: boolean;
  activeView?: string;
}

const FAQ_LIST = [
  {
    q: "What is a CPS test?",
    a: "A CPS test measures how many times you can click your mouse in a set period of time (usually 1, 5, 10, or 60 seconds). It's commonly used to test clicking speed for gaming, especially competitive Minecraft PvP."
  },
  {
    q: "What is a good CPS score?",
    a: "Average users click 4–6 CPS. 6–8 CPS is considered good, and anything above 10 CPS is exceptional. Pro Minecraft PvP players often hit 10–14+ CPS using techniques like jitter clicking or butterfly clicking."
  },
  {
    q: "What is jitter clicking?",
    a: "A technique where you tense your arm and let it vibrate rapidly against the mouse button, generating clicks faster than normal muscle movement allows."
  },
  {
    q: "What is butterfly clicking?",
    a: "A technique using two fingers to alternate clicks on the same mouse button, allowing higher CPS than single-finger clicking. It's controversial in some games due to being seen as exploiting hardware/mouse debounce behavior."
  },
  {
    q: "What is drag clicking?",
    a: "Dragging a finger across the mouse button surface to exploit the mechanical properties of certain mouse switches, producing very high CPS (sometimes 20+). Works best with specific mice (e.g., certain Razer or Logitech models with responsive switches)."
  },
  {
    q: "Does CPS matter for gaming?",
    a: "Yes, particularly in Minecraft PvP where click speed affects hit frequency. It matters less in most other games, where aim, reaction time, and strategy dominate."
  },
  {
    q: "Can I improve my CPS?",
    a: "Yes — through practice, proper mouse grip, using a lighter/more responsive mouse, and practicing techniques like jitter or butterfly clicking. Results vary by individual."
  },
  {
    q: "Why does my score differ between attempts?",
    a: "Fatigue, mouse hardware differences, click technique, and even browser performance can cause variation. Testing in short bursts (like 5 seconds) is often more reliable than sustained clicking."
  },
  {
    q: "Is drag clicking allowed in official tournaments?",
    a: "Depends on the game/tournament. Many competitive Minecraft leagues have banned or restricted drag clicking because it relies on hardware exploitation rather than skill."
  },
  {
    q: "Does my mouse affect my CPS score?",
    a: "Yes significantly. Mouse switch type (mechanical vs optical), debounce time, and button responsiveness all affect max achievable CPS, especially for jitter/drag clicking."
  }
];

export default function FAQs({ isOpen, onClose, onOpen, isDarkMode, activeView }: FAQsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Synchronize browser history back gesture
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isOpen && (!e.state || !e.state.faqs)) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  const handleOpen = () => {
    onOpen();
    // Push entry to history state so back button closes it
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, faqs: true }, "");
  };

  const handleClose = () => {
    onClose();
    if (window.history.state?.faqs) {
      window.history.back();
    }
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`${activeView !== "cps" ? "hidden sm:flex" : "flex"} items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
          isDarkMode
            ? "bg-white/5 hover:bg-white/10 text-slate-300"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
        }`}
      >
        <HelpCircle className="h-3.5 w-3.5 text-fuchsia-400" /> FAQs
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`relative w-full max-w-2xl rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border transition-all ${
              isDarkMode
                ? "bg-[#0f0f1c] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200/10 dark:border-white/5">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-fuchsia-500" />
                <h3 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Scrollable Accordion Body */}
            <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-2 select-text">
              {FAQ_LIST.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-150 ${
                      isExpanded
                        ? isDarkMode
                          ? "bg-white/[0.03] border-fuchsia-500/40"
                          : "bg-fuchsia-50/50 border-fuchsia-200"
                        : isDarkMode
                          ? "bg-white/[0.01] border-white/5 hover:bg-white/[0.02]"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left font-semibold text-sm cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-fuchsia-500 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-xs sm:text-sm leading-relaxed text-slate-400 dark:text-slate-300 border-t border-slate-200/5 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200/10 dark:border-white/5">
              <button
                onClick={handleClose}
                className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-90 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
