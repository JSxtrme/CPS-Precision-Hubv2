import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface FAQsProps {
  isDarkMode: boolean;
}

export default function FAQs({ isDarkMode }: FAQsProps) {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleMain = () => {
    const isCollapsing = isMainOpen;
    
    if (isCollapsing) {
      const mainDropdownElement = document.getElementById("faq-main-dropdown");
      if (mainDropdownElement) {
        const height = mainDropdownElement.scrollHeight;
        const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;
        
        if (isAtBottom) {
          // Smoothly scroll up by the height of the collapsing main dropdown to prevent browser scroll clamping jerk
          window.scrollBy({
            top: -height,
            behavior: "smooth"
          });
        }
      }
    }

    setIsMainOpen(!isMainOpen);
    if (isMainOpen) {
      setExpandedIndex(null);
    }
  };

  const toggleQuestion = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isCollapsing = expandedIndex === idx;
    
    if (isCollapsing) {
      const answerElement = document.getElementById(`faq-answer-${idx}`);
      if (answerElement) {
        const height = answerElement.scrollHeight;
        const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;
        
        if (isAtBottom) {
          // Smoothly scroll up by the height of the collapsing answer to prevent browser scroll clamping jerk
          window.scrollBy({
            top: -height,
            behavior: "smooth"
          });
        }
      }
    } else {
      // Smoothly scroll expanded question content into view after a tiny layout timeout
      setTimeout(() => {
        const answerElement = document.getElementById(`faq-answer-${idx}`);
        if (answerElement) {
          answerElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }
      }, 100);
    }

    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="w-full select-text" style={{ overflowAnchor: "none" }}>
      {/* Main Collapsible FAQ Trigger */}
      <button
        onClick={toggleMain}
        className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl cursor-pointer transition-all duration-200 border text-left ${
          isMainOpen
            ? isDarkMode
              ? "bg-white/[0.04] border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.1)]"
              : "bg-fuchsia-50/40 border-fuchsia-200 shadow-xs"
            : isDarkMode
              ? "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
              : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <HelpCircle className={`h-5 w-5 shrink-0 transition-colors ${
            isMainOpen ? "text-fuchsia-500" : "text-slate-400 dark:text-slate-500"
          }`} />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-white">
            Frequently asked questions
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isMainOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-slate-400 dark:text-slate-500"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Main Dropdown List of Questions */}
      <AnimatePresence initial={false}>
        {isMainOpen && (
          <motion.div
            id="faq-main-dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            style={{ overflowAnchor: "none" }}
          >
            <div className="pt-4 pl-1 pr-1 space-y-2.5">
              {FAQ_LIST.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-200 ${
                      isExpanded
                        ? isDarkMode
                          ? "bg-white/[0.03] border-fuchsia-500/20"
                          : "bg-fuchsia-50/20 border-fuchsia-200/60"
                        : isDarkMode
                          ? "bg-white/[0.01] border-white/5 hover:bg-white/[0.02]"
                          : "bg-slate-50/30 border-slate-200/50 hover:bg-slate-100/30"
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={(e) => toggleQuestion(idx, e)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left font-semibold text-xs sm:text-sm cursor-pointer"
                    >
                      <span className={isExpanded ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-slate-700 dark:text-slate-300"}>
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={isExpanded ? "text-fuchsia-500" : "text-slate-400 dark:text-slate-500"}
                      >
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      </motion.div>
                    </button>

                    {/* Answer Collapsible */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={`faq-answer-${idx}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                          style={{ overflowAnchor: "none" }}
                        >
                          <div className="px-4 pb-4 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3 font-normal">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
