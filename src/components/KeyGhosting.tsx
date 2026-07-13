import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RefreshCw, AlertCircle } from 'lucide-react';

interface KeyGhostingProps {
  isDarkMode: boolean;
  addHistory: (testType: string, duration: number, score: number, rating: string) => void;
}

const KEY_ROWS = [
  [
    { code: "Escape", label: "Esc", width: "w-10 sm:w-12" },
    { code: "F1", label: "F1", width: "w-8 sm:w-10" },
    { code: "F2", label: "F2", width: "w-8 sm:w-10" },
    { code: "F3", label: "F3", width: "w-8 sm:w-10" },
    { code: "F4", label: "F4", width: "w-8 sm:w-10" },
    { code: "F5", label: "F5", width: "w-8 sm:w-10" },
    { code: "F6", label: "F6", width: "w-8 sm:w-10" },
    { code: "F7", label: "F7", width: "w-8 sm:w-10" },
    { code: "F8", label: "F8", width: "w-8 sm:w-10" },
    { code: "F9", label: "F9", width: "w-8 sm:w-10" },
    { code: "F10", label: "F10", width: "w-8 sm:w-10" },
    { code: "F11", label: "F11", width: "w-8 sm:w-10" },
    { code: "F12", label: "F12", width: "w-8 sm:w-10" },
  ],
  [
    { code: "Backquote", label: "`", width: "w-8 sm:w-10" },
    { code: "Digit1", label: "1", width: "w-8 sm:w-10" },
    { code: "Digit2", label: "2", width: "w-8 sm:w-10" },
    { code: "Digit3", label: "3", width: "w-8 sm:w-10" },
    { code: "Digit4", label: "4", width: "w-8 sm:w-10" },
    { code: "Digit5", label: "5", width: "w-8 sm:w-10" },
    { code: "Digit6", label: "6", width: "w-8 sm:w-10" },
    { code: "Digit7", label: "7", width: "w-8 sm:w-10" },
    { code: "Digit8", label: "8", width: "w-8 sm:w-10" },
    { code: "Digit9", label: "9", width: "w-8 sm:w-10" },
    { code: "Digit0", label: "0", width: "w-8 sm:w-10" },
    { code: "Minus", label: "-", width: "w-8 sm:w-10" },
    { code: "Equal", label: "=", width: "w-8 sm:w-10" },
    { code: "Backspace", label: "Back", width: "w-14 sm:w-16" },
  ],
  [
    { code: "Tab", label: "Tab", width: "w-12 sm:w-14" },
    { code: "KeyQ", label: "Q", width: "w-8 sm:w-10" },
    { code: "KeyW", label: "W", width: "w-8 sm:w-10" },
    { code: "KeyE", label: "E", width: "w-8 sm:w-10" },
    { code: "KeyR", label: "R", width: "w-8 sm:w-10" },
    { code: "KeyT", label: "T", width: "w-8 sm:w-10" },
    { code: "KeyY", label: "Y", width: "w-8 sm:w-10" },
    { code: "KeyU", label: "U", width: "w-8 sm:w-10" },
    { code: "KeyI", label: "I", width: "w-8 sm:w-10" },
    { code: "KeyO", label: "O", width: "w-8 sm:w-10" },
    { code: "KeyP", label: "P", width: "w-8 sm:w-10" },
    { code: "BracketLeft", label: "[", width: "w-8 sm:w-10" },
    { code: "BracketRight", label: "]", width: "w-8 sm:w-10" },
    { code: "Backslash", label: "\\", width: "w-10 sm:w-12" },
  ],
  [
    { code: "CapsLock", label: "Caps", width: "w-14 sm:w-16" },
    { code: "KeyA", label: "A", width: "w-8 sm:w-10" },
    { code: "KeyS", label: "S", width: "w-8 sm:w-10" },
    { code: "KeyD", label: "D", width: "w-8 sm:w-10" },
    { code: "KeyF", label: "F", width: "w-8 sm:w-10" },
    { code: "KeyG", label: "G", width: "w-8 sm:w-10" },
    { code: "KeyH", label: "H", width: "w-8 sm:w-10" },
    { code: "KeyJ", label: "J", width: "w-8 sm:w-10" },
    { code: "KeyK", label: "K", width: "w-8 sm:w-10" },
    { code: "KeyL", label: "L", width: "w-8 sm:w-10" },
    { code: "Semicolon", label: ";", width: "w-8 sm:w-10" },
    { code: "Quote", label: "'", width: "w-8 sm:w-10" },
    { code: "Enter", label: "Enter", width: "w-14 sm:w-18" },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: "w-16 sm:w-20" },
    { code: "KeyZ", label: "Z", width: "w-8 sm:w-10" },
    { code: "KeyX", label: "X", width: "w-8 sm:w-10" },
    { code: "KeyC", label: "C", width: "w-8 sm:w-10" },
    { code: "KeyV", label: "V", width: "w-8 sm:w-10" },
    { code: "KeyB", label: "B", width: "w-8 sm:w-10" },
    { code: "KeyN", label: "N", width: "w-8 sm:w-10" },
    { code: "KeyM", label: "M", width: "w-8 sm:w-10" },
    { code: "Comma", label: ",", width: "w-8 sm:w-10" },
    { code: "Period", label: ".", width: "w-8 sm:w-10" },
    { code: "Slash", label: "/", width: "w-8 sm:w-10" },
    { code: "ShiftRight", label: "Shift", width: "w-16 sm:w-20" },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: "w-10 sm:w-12" },
    { code: "MetaLeft", label: "Win", width: "w-8 sm:w-10" },
    { code: "AltLeft", label: "Alt", width: "w-8 sm:w-10" },
    { code: "Space", label: "Spacebar", width: "flex-1 min-w-[120px]" },
    { code: "AltRight", label: "Alt", width: "w-8 sm:w-10" },
    { code: "ControlRight", label: "Ctrl", width: "w-10 sm:w-12" },
    { code: "ArrowLeft", label: "◀", width: "w-8 sm:w-10" },
    { code: "ArrowUp", label: "▲", width: "w-8 sm:w-10" },
    { code: "ArrowDown", label: "▼", width: "w-8 sm:w-10" },
    { code: "ArrowRight", label: "▶", width: "w-8 sm:w-10" },
  ]
];

const KEY_GHOSTING_TOUCH_WARNINGS = [
  "Bro thinks he has a keyboard",
  "No keys, no ghosting, no problem for you",
  "Your screen ain't got NKRO, bro",
  "Bro pulled up keyboardless again",
  "Ghosting requires keys, not taps",
  "This test needs actual switches, chief",
  "Bro's rollover limit is zero",
  "No keyboard, no rollover, no rizz",
  "Touchscreens don't ghost, they just don't work",
  "Bro forgot the keyboard again, shocking",
  "Key detection: none. Confidence: max",
  "This ain't a virtual keyboard test, bro",
  "Real keys only, no glass allowed",
  "Bro's WASD is just his thumb sliding around",
  "Ghosting.exe not found, keyboard also not found",
  "0 keys pressed, 0 keyboards owned",
  "Get a keyboard before you get roasted more",
  "Bro's rollover is just his phone rolling off the couch",
  "This test needs clacky boys, not touchscreens",
  "Bro thinks tapping counts as key presses"
];

export default function KeyGhostingTest({ isDarkMode, addHistory }: KeyGhostingProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);
  const [showTouchWarning, setShowTouchWarning] = useState(false);
  const [touchWarning, setTouchWarning] = useState("");
  const lastActiveKeysCount = useRef(0);

  useEffect(() => {
    const isTouchDevice = () => {
      return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    };
    if (isTouchDevice()) {
      setShowTouchWarning(true);
      setTouchWarning(KEY_GHOSTING_TOUCH_WARNINGS[Math.floor(Math.random() * KEY_GHOSTING_TOUCH_WARNINGS.length)]);
    }
  }, []);

  useEffect(() => {
    const activeCount = pressedKeys.size;
    if (activeCount > 0) {
      lastActiveKeysCount.current = activeCount;
    } else if (activeCount === 0 && lastActiveKeysCount.current > 0) {
      const score = lastActiveKeysCount.current;
      addHistory("Key Rollover", 0, score, score >= 10 ? "NKRO" : score >= 6 ? "6-KRO" : "Office Grade");
      lastActiveKeysCount.current = 0;
    }
  }, [pressedKeys.size, addHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default actions that disrupt the test
      // e.g., Tab moving focus, Spacebar scrolling, Backspace going back, arrows scrolling
      if (["Tab", "Space", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "F1", "F3", "F5", "F6", "F11"].includes(e.code)) {
        e.preventDefault();
      }

      setPressedKeys(prev => {
        const next = new Set(prev);
        next.add(e.code);
        if (next.size > maxSimultaneous) {
          setMaxSimultaneous(next.size);
        }
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    // Also handle window blur so keys don't get stuck
    const handleBlur = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [maxSimultaneous]);

  const clearMax = () => {
    setMaxSimultaneous(0);
    setPressedKeys(new Set());
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      {showTouchWarning && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ {touchWarning || "Bro thinks he has a keyboard"}</span>
        </div>
      )}

      {/* Visual Counters */}
      <div className="grid w-full grid-cols-2 gap-4">
        <div className={`flex flex-col items-center justify-center rounded-2xl border p-4 ${
          isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <span className="text-4xl font-black theme-text-from">
            {pressedKeys.size}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Keys Held
          </span>
        </div>
        <div className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 ${
          isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <span className="text-4xl font-black theme-text-to">
            {maxSimultaneous}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Max Simultaneous (Rollover)
          </span>
          <button
            onClick={clearMax}
            className="absolute right-3 top-3 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"
            title="Reset Max Record"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Keyboard Canvas Container */}
      <div className={`w-full overflow-x-auto rounded-3xl border p-4 sm:p-6 ${
        isDarkMode ? "border-white/10 bg-[#0d0d1a]" : "border-slate-200 bg-white shadow-sm"
      }`}>
        <div className="min-w-[580px] space-y-1.5 font-sans">
          {KEY_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map(key => {
                const isActive = pressedKeys.has(key.code);
                return (
                  <div
                    key={key.code}
                    className={`h-9 sm:h-11 ${key.width} flex items-center justify-center rounded text-[10px] sm:text-xs font-bold uppercase transition-all duration-75 select-none ${
                      isActive
                        ? "theme-active-key text-white scale-[0.94] border-transparent"
                        : isDarkMode
                          ? "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {key.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 max-w-md">
        Hold down as many keys on your keyboard as possible. A standard keyboard might experience "ghosting" or stop registering after 3 to 6 simultaneous keys, while gamer keyboards have N-Key Rollover (NKRO) allowing infinite key detection!
      </div>
    </div>
  );
}
