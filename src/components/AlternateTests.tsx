import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard, 
  MousePointer, 
  RefreshCw, 
  AlertCircle, 
  Terminal, 
  Play, 
  Sparkles,
  RefreshCw as ResetIcon
} from 'lucide-react';
import { Ripple, ViewType } from '../types';

// Custom hook to disable page scrolling and zooming on touch devices when a test is active
export function useDisableScrollZoomOnTouch(isRunning: boolean, isTouchDevice: boolean) {
  useEffect(() => {
    if (!isTouchDevice || !isRunning) return;

    // Save previous styles
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    // Prevent scrolling and double-tap zoom/pinch-to-zoom
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    // Extra touch listener to prevent default zoom/pinch behaviors on iOS and some Android devices
    const preventZoomAndScroll = (e: TouchEvent) => {
      // If multi-touch (pinch) or trying to zoom, prevent default
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent gestures like pinch-to-zoom on iOS
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("touchstart", preventZoomAndScroll, { passive: false });
    document.addEventListener("touchmove", preventZoomAndScroll, { passive: false });
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
      document.removeEventListener("touchstart", preventZoomAndScroll);
      document.removeEventListener("touchmove", preventZoomAndScroll);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
    };
  }, [isRunning, isTouchDevice]);
}

// Standard 10 Humorous responses
function getAltHumorousLine(score: number, isTouchDevice: boolean = false): string {
  const choices = isTouchDevice
    ? [
        "Your speed is steady, like a leaky faucet. We need a torrential downpour of taps!",
        "Are you tapping once every leap year? Speed it up!",
        "The crowd is... mildly interested but mostly checking their own screens.",
        "Decent speed! Your finger is officially warmed up. Now try using your whole hand.",
        "Your screen is begging for its union representative. Phenomenal speed!",
        "Are you tapping with an industrial massage gun? That speed is borderline illegal!",
        "Honestly, my grandma taps faster while sleeping. Did you use your nose?",
        "If doing absolutely nothing was an Olympic sport, you'd be a gold medalist.",
        "Are you secretly vibrating your finger at a molecular level? Absolute God Tier!",
        "Are you trying to test the glass structural integrity by NOT touching it?"
      ]
    : [
        "Your speed is steady, like a leaky faucet. We need a torrential downpour!",
        "Are you clicking once every leap year? Speed it up!",
        "The crowd is... mildly interested but mostly checking their phones.",
        "Decent speed! Your finger is officially warmed up. Now try using a hand.",
        "Your tapping switch is begging for its union representative. Phenomenal!",
        "Are you clicking with an industrial massage gun? That speed is borderline illegal!",
        "Honestly, my grandma taps faster while sleeping. Did you use your elbow?",
        "If doing absolutely nothing was an Olympic sport, you'd be a gold medalist.",
        "Are you secretly vibrating at a molecular level? Absolute God Tier!",
        "Are you trying to test the hardware structural integrity by NOT touching it?"
      ];
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

function getRightClickRatingLabel(cps: number): string {
  if (cps >= 12) return "Legendary";
  if (cps >= 9) return "Pro";
  if (cps >= 7) return "Great";
  if (cps >= 5) return "Good";
  if (cps >= 3) return "Average";
  return "Beginner";
}

function getRightClickHumorousLine(cps: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "0 HPS? Did you forget how to right-click on this screen, or are you tapping in a parallel universe?",
        "0 HPS! Perfect speed for doing absolutely nothing.",
        "Your right click gesture is so non-existent, the touch screen is checking its own hardware."
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. At this rate, your finger is moving like it's stuck in a vat of cold peanut butter.",
        "Are you tapping with your nose? Speed it up!",
        "Very slow right tapping. The local snail just zoomed past your touch cursor."
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        "3 HPS. Decent if you are opening a menu, but absolute doom in any speed challenge.",
        "You tap like you're politely knocking on a window. Tap that screen like it owes you lunch money!",
        "Continental drift is currently keeping up with your tap speed. Accelerate!"
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        "5 HPS. Average speed. Not terrible, but you're definitely not breaking any records.",
        "The screen is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of rapid taps!"
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        "7 HPS! Respectable! Your fingers have definitely spent time on intense games.",
        "Your right clicks are getting fast. Is your tapping hand secretly working out behind your back?",
        "Good speed! You can actually hold your ground with this touch rate."
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        "10 HPS! Phenomenal! Your hand is moving so fast it's generating its own weather system.",
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right tapping. The glass is crying tears of friction."
      );
    } else if (cps >= 11 && cps < 15) {
      choices.push(
        "13 HPS! Incredible! You are basically the John Wick of touch tapping.",
        "Your screen is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!"
      );
    } else {
      choices.push(
        "15+ HPS! You aren't tapping, you are literally speaking binary code directly to the screen's controller!",
        "The laws of physics have left the room. You're tapping fast enough to reverse time!",
        "Your other fingers are extremely jealous. Your tapping finger is now a registered lethal weapon!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "0 HPS? Did you forget your middle finger exists, or are you right-clicking in a parallel universe?",
        "0 HPS! Perfect speed for not playing Minecraft Bedwars.",
        "Your right click is so non-existent, the mouse sensor is checking its own pulse."
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. If you tried to right-click block-clutch in Minecraft, you'd fall into the void before the block even realized you clicked.",
        "Are you clicking with your toe? Your middle finger is moving like it's stuck in a vat of cold peanut butter.",
        "Very slow right clicking. The local snail just zoomed past your cursor."
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        "3 HPS. Decent if you are opening a folder, but absolute doom in a PVP bridge fight.",
        "You click like you're politely knocking on a door. Tap that button like it owes you lunch money!",
        "Continental drift is currently keeping up with your click speed. Accelerate!"
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        "5 HPS. Average middle finger. Not terrible, but you're definitely not winning any PVP matches.",
        "The mouse switch is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of right-clicking!"
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        "7 HPS! Respectable! Your middle finger has definitely spent time on a gaming mouse.",
        "Your right clicks are getting fast. Is your middle finger secretly working out behind your back?",
        "Good speed! You can actually set up some decent defense with this rate."
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        "10 HPS! Phenomenal! Your middle finger is moving so fast it's generating its own weather system.",
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right clicking. The mouse switch is crying tears of friction."
      );
    } else if (cps >= 11 && cps < 15) {
      choices.push(
        "13 HPS! Incredible! You are basically the John Wick of right clicking.",
        "Your mouse button is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!"
      );
    } else {
      choices.push(
        "15+ HPS! You aren't right-clicking, you are literally speaking binary code directly to the mouse sensor!",
        "The laws of physics have left the room. You're clicking fast enough to reverse time!",
        "Your index finger is extremely jealous. Your middle finger is now a registered lethal weapon!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

/* ==========================================================================
   REUSABLE DURATION SELECTOR
   ========================================================================== */
function AltDurationSelector({
  selected,
  disabled,
  onSelect,
  isDarkMode
}: {
  selected: number;
  disabled: boolean;
  onSelect: (duration: number) => void;
  isDarkMode: boolean;
}) {
  const durations = [1, 2, 3, 5, 10, 15, 30, 60, -1];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4">
      {durations.map(d => {
        const isSelected = d === selected;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(d)}
            className={`relative rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? "scale-105 bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-md shadow-indigo-500/15"
                : isDarkMode
                  ? "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200/60"
            } ${disabled && !isSelected ? "cursor-not-allowed opacity-40" : ""} ${
              disabled && isSelected ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {d === -1 ? "Manual" : d === 60 ? "1 Min" : `${d}s`}
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   DASHBOARD / MENU SELECTOR
   ========================================================================== */
interface MoreTestsMenuProps {
  onSelect: (view: ViewType) => void;
  isDarkMode: boolean;
}

export function MoreTestsMenu({ onSelect, isDarkMode }: MoreTestsMenuProps) {
  const cards = [
    {
      id: "spacebar" as ViewType,
      title: "Spacebar Counter",
      desc: "Tap the spacebar as fast as possible. Perfect for measuring thumb/index HPS and spacebar rebound rate.",
      icon: <Keyboard className="h-6 w-6 text-fuchsia-400" />,
      color: "hover:border-fuchsia-500/50"
    },
    {
      id: "rightclick" as ViewType,
      title: "Right Click Test",
      desc: "Tests your middle-finger click velocity. Disables standard browser contextual menus for raw counting.",
      icon: <MousePointer className="h-6 w-6 text-indigo-400" />,
      color: "hover:border-indigo-500/50"
    },
    {
      id: "polling" as ViewType,
      title: "Mouse Polling Rate",
      desc: "Measure your mouse sensor's reporting frequency (Hz) by moving your cursor continuously in the zone.",
      icon: <RefreshCw className="h-6 w-6 text-emerald-400" />,
      color: "hover:border-emerald-500/50"
    },
    {
      id: "ghosting" as ViewType,
      title: "Key Ghosting Test",
      desc: "Discover your keyboard's rollover limit. Hold down multiple keys simultaneously to see what gets blocked.",
      icon: <Keyboard className="h-6 w-6 text-amber-400" />,
      color: "hover:border-amber-500/50"
    },
    {
      id: "jitter" as ViewType,
      title: "Jitter Click Coach",
      desc: "Refine high-frequency wrist/arm vibration. Analyze stability, clicking rate, and target accuracy.",
      icon: <AlertCircle className="h-6 w-6 text-pink-400" />,
      color: "hover:border-pink-500/50"
    },
    {
      id: "butterfly" as ViewType,
      title: "Butterfly Click Coach",
      desc: "Practice rhythmic dual-finger clicking. Optimize bounce-back timing, consistency, and alternate stroke rate.",
      icon: <Sparkles className="h-6 w-6 text-violet-400" />,
      color: "hover:border-violet-500/50"
    },
    {
      id: "reaction" as ViewType,
      title: "Reaction Time Test",
      desc: "The classic traffic light reaction challenge. Wait for green, tap instantly, and benchmark your neural latency.",
      icon: <Play className="h-6 w-6 text-red-400" />,
      color: "hover:border-red-500/50"
    },
    {
      id: "kohi" as ViewType,
      title: "Kohi Click Test",
      desc: "Minecraft classic vintage server click simulator with retro, glowing-green terminal pixel styling.",
      icon: <Terminal className="h-6 w-6 text-emerald-500" />,
      color: "hover:border-emerald-500"
    }
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in max-w-2xl">
      {cards.map(card => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white hover:bg-white/[0.08]"
              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:shadow-md"
          } ${card.color}`}
        >
          <div className="mb-3 rounded-xl bg-slate-500/10 p-2.5">
            {card.icon}
          </div>
          <h4 className="text-base font-bold mb-1 tracking-tight">{card.title}</h4>
          <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {card.desc}
          </p>
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   SPACEBAR COUNTER
   ========================================================================== */
interface AltTestProps {
  addHistory: (testType: string, duration: number, score: number, rating: string) => void;
  isDarkMode: boolean;
  isTouchDevice?: boolean;
}

export function SpacebarTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [finalHps, setFinalHps] = useState(0);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  // Clear timer only on actual component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const hps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalHps(hps);
    setHumorousMessage(getAltHumorousLine(hps, isTouchDevice));
    addHistory("Spacebar Counter", totalSeconds, hps, hps >= 12 ? "Legendary" : hps >= 9 ? "Pro" : hps >= 7 ? "Great" : hps >= 5 ? "Good" : hps >= 3 ? "Average" : "Beginner");
  }, [addHistory, isTouchDevice]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setCount(0);
    setFinalHps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
  }, [duration]);

  const triggerTap = useCallback(() => {
    if (status === "finished") return;

    if (status === "idle") {
      clicksRef.current = 1;
      setCount(1);
      startTimeRef.current = Date.now();
      setStatus("running");
      setTimeLeft(duration === -1 ? 0 : duration);

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current ?? 0)) / 1000;
        if (duration === -1) {
          setTimeLeft(elapsed);
        } else {
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleFinished(duration);
          }
        }
      }, 50) as unknown as number;
    } else {
      clicksRef.current += 1;
      setCount(clicksRef.current);
    }
  }, [status, duration, handleFinished]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "finished") {
          if (!isSpacePressed) {
            setIsSpacePressed(true);
          }
          return;
        }

        if (!isSpacePressed) {
          setIsSpacePressed(true);
          triggerTap();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerTap, isSpacePressed, status, handleReset]);

  const handleStopManual = () => {
    if (status !== "running" || startTimeRef.current === null) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    handleFinished(elapsed);
  };

  const calculatedHps = status === "finished" 
    ? finalHps 
    : status === "running"
      ? (duration === -1 
          ? (timeLeft > 0 ? count / timeLeft : 0) 
          : (count / (duration - timeLeft || 1)))
      : 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      {isTouchDevice && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ Bro thinks he has a spacebar, who's gonna tell him?</span>
        </div>
      )}
      <AltDurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={(d) => {
          setDuration(d);
          setTimeLeft(d === -1 ? 0 : d);
          setStatus("idle");
          setCount(0);
          setFinalHps(0);
          clicksRef.current = 0;
        }}
        isDarkMode={isDarkMode}
      />

      <div className="grid w-full grid-cols-3 gap-3">
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{timeLeft.toFixed(1)}s</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {duration === -1 ? "Elapsed" : "Time"}
          </span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{count}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Taps</span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{calculatedHps.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">HPS</span>
        </div>
      </div>

      <div
        onMouseDown={(e) => {
          if (status === "finished" && e.button === 0 && !isTouchDevice) {
            handleReset();
          }
        }}
        className={`relative flex min-h-64 h-auto w-full flex-col items-center justify-center rounded-3xl border-2 p-6 text-center select-none transition-all ${
          status === "finished" && !isTouchDevice ? "cursor-pointer hover:border-fuchsia-500/40" : ""
        } ${
          isSpacePressed ? "scale-98 border-fuchsia-500" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0b1a]" : "bg-white shadow-sm text-slate-800"}`}
      >
        {isTouchDevice && status === "finished" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleReset();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <ResetIcon className="h-3.5 w-3.5" /> Reset
          </div>
        )}
        {status === "idle" && (
          <div className="space-y-2">
            <p className="text-2xl font-bold">Press SPACEBAR to Start</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Timer triggers on first spacebar stroke</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-4">
            <p className="text-6xl font-black">{count}</p>
            {/* Visual Spacebar Key */}
            <div className={`mx-auto h-8 w-48 rounded-md border-b-4 transition-all ${
              isSpacePressed ? "bg-fuchsia-600 border-fuchsia-800 translate-y-0.5 border-b" : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20"
            }`} />
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-3">
            <p className="text-xs text-fuchsia-500 dark:text-fuchsia-400 uppercase font-bold tracking-widest">Completed!</p>
            <p className="text-5xl font-black">{calculatedHps.toFixed(2)} HPS</p>
            <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed">"{humorousMessage}"</p>
            <div className="pt-2">
              <span className="text-xs font-bold text-fuchsia-500 dark:text-fuchsia-400 border border-fuchsia-500/20 bg-fuchsia-500/5 px-3 py-1.5 rounded-full inline-block animate-pulse">
                {isTouchDevice ? "Tap the Reset button to try again!" : "Click anywhere here to reset"}
              </span>
            </div>
          </div>
        )}
      </div>

      {duration === -1 && (
        <div className="w-full">
          <button
            type="button"
            disabled={status !== "running"}
            onClick={handleStopManual}
            className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              status === "running"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white cursor-pointer active:scale-[0.99] hover:shadow-red-500/20"
                : isDarkMode
                  ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            🛑 Stop Test
          </button>
        </div>
      )}

      <div className="flex w-full justify-end">
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            isDarkMode 
              ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200" 
              : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ResetIcon className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   RIGHT CLICK TEST
   ========================================================================== */
export function RightClickTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [finalCps, setFinalCps] = useState(0);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const rippleIdCounter = useRef(0);
  const lastFinishedClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const cps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalCps(cps);
    setHumorousMessage(getRightClickHumorousLine(cps, isTouchDevice));
    addHistory("Right Click Test", totalSeconds, cps, getRightClickRatingLabel(cps));
  }, [addHistory, isTouchDevice]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status === "finished") {
      if (e.button === 0 && !isTouchDevice) { // Left click to reset
        const now = Date.now();
        if (now - lastFinishedClickRef.current < 500) {
          handleReset();
        } else {
          lastFinishedClickRef.current = now;
        }
      }
      return;
    }

    if (e.button !== 2) return; // Right click only for actual test
    e.preventDefault();

    // Create ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rid = rippleIdCounter.current++;
    setRipples(prev => [...prev, { id: rid, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rid));
    }, 600);

    if (status === "idle") {
      clicksRef.current = 1;
      setCount(1);
      startTimeRef.current = Date.now();
      setStatus("running");
      setTimeLeft(duration === -1 ? 0 : duration);

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current ?? 0)) / 1000;
        if (duration === -1) {
          setTimeLeft(elapsed);
        } else {
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleFinished(duration);
          }
        }
      }, 50) as unknown as number;
    } else {
      clicksRef.current += 1;
      setCount(clicksRef.current);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setCount(0);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    setRipples([]);
    lastFinishedClickRef.current = 0;
  };

  const handleStopManual = () => {
    if (status !== "running" || startTimeRef.current === null) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    handleFinished(elapsed);
  };

  const calculatedCps = status === "finished" 
    ? finalCps 
    : status === "running"
      ? (duration === -1 
          ? (timeLeft > 0 ? count / timeLeft : 0) 
          : (count / (duration - timeLeft || 1)))
      : 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      {isTouchDevice && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ You ain't got no Right-Click dude, Buy a mouse first</span>
        </div>
      )}
      <AltDurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={(d) => {
          setDuration(d);
          setTimeLeft(d === -1 ? 0 : d);
          setStatus("idle");
          setCount(0);
          clicksRef.current = 0;
          setFinalCps(0);
        }}
        isDarkMode={isDarkMode}
      />

      <div className="grid w-full grid-cols-3 gap-3">
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{timeLeft.toFixed(1)}s</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {duration === -1 ? "Elapsed" : "Time Left"}
          </span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{count}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Right Clicks</span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{calculatedCps.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">CPS</span>
        </div>
      </div>

      <div
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        className={`relative flex min-h-64 h-auto py-6 px-6 w-full overflow-hidden select-none flex-col items-center justify-center rounded-3xl border-2 text-center cursor-pointer transition-all ${
          status === "running" ? "border-indigo-500 shadow-md" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0b1a]" : "bg-white shadow-sm text-slate-800"}`}
      >
        {ripples.map(r => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full bg-indigo-500/35"
            style={{ left: r.x, top: r.y }}
          />
        ))}

        {isTouchDevice && status === "finished" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleReset();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <ResetIcon className="h-3.5 w-3.5" /> Reset
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-1">
            <p className="text-2xl font-bold text-fuchsia-500 dark:text-fuchsia-400">👉 RIGHT CLICK HERE 👈</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Regular click won't work! Disable context menu active.</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-1">
            <p className="text-6xl font-black">{count}</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-bold">Right Clicks Registered</p>
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-3">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Finished!</p>
            <p className="text-5xl font-black">{calculatedCps.toFixed(2)} Right-Click CPS</p>
            <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed">"{humorousMessage}"</p>
            <div className="pt-2">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full inline-block animate-pulse">
                {isTouchDevice ? "Tap the Reset button to try again!" : "Double tap Left-Click to reset"}
              </span>
            </div>
          </div>
        )}
      </div>

      {duration === -1 && (
        <div className="w-full">
          <button
            type="button"
            disabled={status !== "running"}
            onClick={handleStopManual}
            className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              status === "running"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white cursor-pointer active:scale-[0.99] hover:shadow-red-500/20"
                : isDarkMode
                  ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            🛑 Stop Test
          </button>
        </div>
      )}

      <div className="flex w-full justify-end">
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            isDarkMode 
              ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200" 
              : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ResetIcon className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   MOUSE POLLING RATE TEST
   ========================================================================== */
export function PollingRateTest({ addHistory, isDarkMode }: { addHistory: (testType: string, duration: number, score: number, rating: string) => void; isDarkMode: boolean }) {
  const [active, setActive] = useState(false);
  const [liveHz, setLiveHz] = useState(0);
  const [peakHz, setPeakHz] = useState(0);
  const [showTouchWarning, setShowTouchWarning] = useState(false);
  const eventTimestamps = useRef<number[]>([]);
  const lastUpdate = useRef<number>(0);
  const frameRef = useRef<number | null>(null);

  const isTouchDevice = () => {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  };

  const handleStart = () => {
    if (isTouchDevice()) {
      setShowTouchWarning(true);
      return;
    }
    setActive(true);
    eventTimestamps.current = [];
    setLiveHz(0);
    setPeakHz(0);
    lastUpdate.current = performance.now();
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!active) return;
    const fallbackNow = performance.now();

    if (e.nativeEvent && typeof e.nativeEvent.getCoalescedEvents === "function") {
      const coalesced = e.nativeEvent.getCoalescedEvents();
      if (coalesced && coalesced.length > 0) {
        coalesced.forEach(evt => {
          let ts = evt.timeStamp;
          // Failsafe: if timeStamp is missing or in a different epoch, fallback to performance.now()
          if (!ts || Math.abs(ts - fallbackNow) > 100000) {
            ts = fallbackNow;
          }
          eventTimestamps.current.push(ts);
        });
        return;
      }
    }

    eventTimestamps.current.push(fallbackNow);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const now = performance.now();
      // Keep only stamps in past 1000ms
      eventTimestamps.current = eventTimestamps.current.filter(t => now - t < 1000);
      const count = eventTimestamps.current.length;
      
      setLiveHz(count);
      setPeakHz(prev => Math.max(prev, count));

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  const handleStop = () => {
    setActive(false);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (peakHz > 0) {
      addHistory("Mouse Polling Rate", 0, peakHz, peakHz >= 500 ? "1000Hz Grade" : peakHz >= 250 ? "Gaming Grade" : "Standard");
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      {showTouchWarning && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ You need a mouse buddy</span>
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-4">
        <div className={`flex flex-col items-center p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-3xl font-bold">{liveHz} Hz</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Live Rate</span>
        </div>
        <div className={`flex flex-col items-center p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{peakHz} Hz</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Peak Rate</span>
        </div>
      </div>

      <div
        onPointerMove={handlePointerMove}
        className={`relative flex h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
          active ? "border-emerald-500 bg-emerald-500/5 cursor-crosshair" : isDarkMode ? "border-white/15" : "border-slate-300"
        } ${isDarkMode ? "bg-[#0b0b1a]" : "bg-white shadow-sm text-slate-800"}`}
      >
        {active ? (
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">MOVE CURSOR CONTINUOUSLY</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep moving mouse cursor inside this box to gather samples...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base font-medium">Ready to test your hardware polling rate?</p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-md cursor-pointer"
            >
              <Play className="h-4 w-4" /> Start Rate Test
            </button>
          </div>
        )}
      </div>

      {active && (
        <button
          onClick={handleStop}
          className="rounded-lg bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-semibold text-white cursor-pointer"
        >
          Stop & Lock Result
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   JITTER CLICK COACH
   ========================================================================== */
export function JitterTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [clicks, setClicks] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [finalCps, setFinalCps] = useState(0);
  
  const clickTimestamps = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);
  const rippleIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const total = clickTimestamps.current.length;
    const cps = totalSeconds > 0 ? total / totalSeconds : 0;
    setFinalCps(cps);
    const rank = cps >= 12 ? "Legendary" : cps >= 9 ? "Pro" : cps >= 7 ? "Great" : cps >= 5 ? "Good" : cps >= 3 ? "Average" : "Beginner";
    addHistory("Jitter Click Coach", totalSeconds, cps, rank);
  }, [addHistory]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleReset();
        } else {
          lastRightClickRef.current = now;
        }
      }
      return;
    }

    if (e.button !== 0) return; // Left click only for test clicking
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdCounter.current++;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    const now = Date.now();
    clickTimestamps.current.push(now);
    setClicks([...clickTimestamps.current]);

    if (status === "idle") {
      setStatus("running");
      setTimeLeft(duration === -1 ? 0 : duration);
      lastClickTime.current = now;

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - clickTimestamps.current[0]) / 1000;
        if (duration === -1) {
          setTimeLeft(elapsed);
        } else {
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleFinished(duration);
          }
        }
      }, 50) as unknown as number;
    }
  };

  const getStability = () => {
    if (clicks.length < 3) return 0;
    const intervals: number[] = [];
    for (let i = 1; i < clicks.length; i++) {
      intervals.push(clicks[i] - clicks[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 100)));
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clickTimestamps.current = [];
    setClicks([]);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setRipples([]);
    lastRightClickRef.current = 0;
  };

  const handleStopManual = () => {
    if (status !== "running" || clickTimestamps.current.length === 0) return;
    const elapsed = (Date.now() - clickTimestamps.current[0]) / 1000;
    handleFinished(elapsed);
  };

  const stability = getStability();
  const calculatedCps = status === "finished" 
    ? finalCps 
    : status === "running"
      ? (duration === -1 
          ? (timeLeft > 0 ? clicks.length / timeLeft : 0) 
          : (clicks.length / (duration - timeLeft || 1)))
      : 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      <AltDurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={(d) => {
          setDuration(d);
          setTimeLeft(d === -1 ? 0 : d);
          setStatus("idle");
          setClicks([]);
          setFinalCps(0);
          clickTimestamps.current = [];
        }}
        isDarkMode={isDarkMode}
      />

      <div className="grid w-full grid-cols-3 gap-3">
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{timeLeft.toFixed(1)}s</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {duration === -1 ? "Elapsed" : "Time"}
          </span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{clicks.length}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Clicks</span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className={`text-xl font-bold ${stability > 80 ? "text-emerald-600 dark:text-emerald-400" : stability > 50 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>{stability}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Stability</span>
        </div>
      </div>

      <button
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        className={`relative flex min-h-64 h-auto w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-6 text-center cursor-pointer ${
          status === "running" ? "border-pink-500" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0c0c1c]" : "bg-white shadow-sm text-slate-800"}`}
      >
        {ripples.map(r => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full bg-pink-500/40"
            style={{ left: r.x, top: r.y }}
          />
        ))}

        {isTouchDevice && status === "finished" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleReset();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <ResetIcon className="h-3.5 w-3.5" /> Reset
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-1">
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">PRACTICE JITTER CLICKING</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flesh out a rapid hand/wrist tremor to reach high-frequency clicks</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-2">
            <p className="text-5xl font-black">{clicks.length}</p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: Math.min(12, clicks.length) }).map((_, i) => (
                <div key={i} className="h-4 w-1.5 bg-pink-500 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-2">
            <p className="text-xs text-pink-600 dark:text-pink-400 font-bold uppercase">Jitter Results</p>
            <p className="text-4xl font-black">{calculatedCps.toFixed(2)} CPS</p>
            <p className="text-sm font-semibold">
              Stability Score: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stability}%</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm font-medium">
              {stability > 80 
                ? "Excellent vibration control! Your muscle tremors are remarkably regular." 
                : stability > 50 
                  ? (isTouchDevice 
                      ? "Decent forearm control. Work on stabilizing your tapping hand over the screen." 
                      : "Decent forearm control. Work on stabilizing your grip on the mouse sides.")
                  : "Vibration is unstable. Relax your fingers and tense only your lower forearm."}
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full inline-block animate-pulse">
                {isTouchDevice ? "Tap the Reset button to try again!" : "Double tap Right-Click to reset"}
              </span>
            </div>
          </div>
        )}
      </button>

      {duration === -1 && (
        <div className="w-full">
          <button
            type="button"
            disabled={status !== "running"}
            onClick={handleStopManual}
            className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              status === "running"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white cursor-pointer active:scale-[0.99] hover:shadow-red-500/20"
                : isDarkMode
                  ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            🛑 Stop Test
          </button>
        </div>
      )}

      <div className="flex w-full justify-end">
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            isDarkMode 
              ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200" 
              : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ResetIcon className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   BUTTERFLY CLICK COACH
   ========================================================================== */
export function ButterflyTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [clicks, setClicks] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [finalCps, setFinalCps] = useState(0);
  
  const clickTimestamps = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);
  const rippleIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const total = clickTimestamps.current.length;
    const cps = totalSeconds > 0 ? total / totalSeconds : 0;
    setFinalCps(cps);
    const rank = cps >= 12 ? "Legendary" : cps >= 9 ? "Pro" : cps >= 7 ? "Great" : cps >= 5 ? "Good" : cps >= 3 ? "Average" : "Beginner";
    addHistory("Butterfly Click Coach", totalSeconds, cps, rank);
  }, [addHistory]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleReset();
        } else {
          lastRightClickRef.current = now;
        }
      }
      return;
    }

    if (e.button !== 0) return; // Left click only for test clicking
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdCounter.current++;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    const now = Date.now();
    clickTimestamps.current.push(now);
    setClicks([...clickTimestamps.current]);

    if (status === "idle") {
      setStatus("running");
      setTimeLeft(duration === -1 ? 0 : duration);
      lastClickTime.current = now;

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - clickTimestamps.current[0]) / 1000;
        if (duration === -1) {
          setTimeLeft(elapsed);
        } else {
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleFinished(duration);
          }
        }
      }, 50) as unknown as number;
    }
  };

  const getStability = () => {
    if (clicks.length < 3) return 0;
    const intervals: number[] = [];
    for (let i = 1; i < clicks.length; i++) {
      intervals.push(clicks[i] - clicks[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 100)));
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clickTimestamps.current = [];
    setClicks([]);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setRipples([]);
    lastRightClickRef.current = 0;
  };

  const handleStopManual = () => {
    if (status !== "running" || clickTimestamps.current.length === 0) return;
    const elapsed = (Date.now() - clickTimestamps.current[0]) / 1000;
    handleFinished(elapsed);
  };

  const stability = getStability();
  const calculatedCps = status === "finished" 
    ? finalCps 
    : status === "running"
      ? (duration === -1 
          ? (timeLeft > 0 ? clicks.length / timeLeft : 0) 
          : (clicks.length / (duration - timeLeft || 1)))
      : 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in">
      <AltDurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={(d) => {
          setDuration(d);
          setTimeLeft(d === -1 ? 0 : d);
          setStatus("idle");
          setClicks([]);
          setFinalCps(0);
          clickTimestamps.current = [];
        }}
        isDarkMode={isDarkMode}
      />

      <div className="grid w-full grid-cols-3 gap-3">
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{timeLeft.toFixed(1)}s</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {duration === -1 ? "Elapsed" : "Time"}
          </span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className="text-xl font-bold">{clicks.length}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Clicks</span>
        </div>
        <div className={`flex flex-col items-center p-3 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
          <span className={`text-xl font-bold ${stability > 80 ? "text-emerald-600 dark:text-emerald-400" : stability > 50 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>{stability}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Stability</span>
        </div>
      </div>

      <button
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        className={`relative flex min-h-64 h-auto w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-6 text-center cursor-pointer ${
          status === "running" ? "border-violet-500" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0c1c]" : "bg-white shadow-sm text-slate-800"}`}
      >
        {ripples.map(r => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full bg-violet-500/40"
            style={{ left: r.x, top: r.y }}
          />
        ))}

        {isTouchDevice && status === "finished" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleReset();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <ResetIcon className="h-3.5 w-3.5" /> Reset
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-1">
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">PRACTICE BUTTERFLY CLICKING</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drum your index and middle fingers alternately on the mouse button</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-2">
            <p className="text-5xl font-black">{clicks.length}</p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: Math.min(12, clicks.length) }).map((_, i) => (
                <div key={i} className="h-4 w-1.5 bg-violet-500 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-2">
            <p className="text-xs text-violet-600 dark:text-violet-400 font-bold uppercase">Butterfly Results</p>
            <p className="text-4xl font-black">{calculatedCps.toFixed(2)} CPS</p>
            <p className="text-sm font-semibold">
              Stability Score: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stability}%</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm font-medium">
              {stability > 80 
                ? (isTouchDevice 
                    ? "Perfect drumming rhythm! Your double-taps are clean and perfectly separated." 
                    : "Perfect drumming rhythm! Your double-clicks are clean and perfectly separated.") 
                : stability > 50 
                  ? "Good alternating rhythm, but avoid slamming fingers too hard. Keep strokes light." 
                  : "Inconsistent timing. Work on developing a steady 'one-two' tap-tap tempo."}
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full inline-block animate-pulse">
                {isTouchDevice ? "Tap the Reset button to try again!" : "Double tap Right-Click to reset"}
              </span>
            </div>
          </div>
        )}
      </button>

      {duration === -1 && (
        <div className="w-full">
          <button
            type="button"
            disabled={status !== "running"}
            onClick={handleStopManual}
            className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              status === "running"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white cursor-pointer active:scale-[0.99] hover:shadow-red-500/20"
                : isDarkMode
                  ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            🛑 Stop Test
          </button>
        </div>
      )}

      <div className="flex w-full justify-end">
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            isDarkMode 
              ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200" 
              : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ResetIcon className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   KOHI CLASSIC RETRO TEST
   ========================================================================== */
function KohiDurationSelector({
  selected,
  disabled,
  onSelect
}: {
  selected: number;
  disabled: boolean;
  onSelect: (duration: number) => void;
}) {
  const durations = [1, 2, 3, 5, 10, 15, 30, 60, -1];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 font-mono text-xs">
      {durations.map(d => {
        const isSelected = d === selected;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(d)}
            className={`px-2 py-1 border transition-colors cursor-pointer ${
              isSelected
                ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-black text-emerald-500 border-emerald-500/30 hover:border-emerald-500"
            } ${disabled && !isSelected ? "opacity-35 cursor-not-allowed" : ""} ${
              disabled && isSelected ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {d === -1 ? "[MANUAL]" : d === 60 ? "[1_MIN]" : `[${d}s]`}
          </button>
        );
      })}
    </div>
  );
}

export function KohiTest({ addHistory, isTouchDevice = false }: { addHistory: (testType: string, duration: number, score: number, rating: string) => void; isTouchDevice?: boolean }) {
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [finalCps, setFinalCps] = useState(0);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const cps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalCps(cps);
    const rank = cps >= 12 ? "Legendary" : cps >= 9 ? "Pro" : cps >= 7 ? "Great" : cps >= 5 ? "Good" : cps >= 3 ? "Average" : "Beginner";
    addHistory("Kohi Retro Test", totalSeconds, cps, rank);
  }, [addHistory]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleReset();
        } else {
          lastRightClickRef.current = now;
        }
      }
      return;
    }

    if (e.button !== 0) return; // Left click only for actual clicking
    e.preventDefault();

    if (status === "idle") {
      clicksRef.current = 1;
      setClicks(1);
      startTimeRef.current = Date.now();
      setStatus("running");
      setTimeLeft(duration === -1 ? 0 : duration);

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current ?? 0)) / 1000;
        if (duration === -1) {
          setTimeLeft(elapsed);
        } else {
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleFinished(duration);
          }
        }
      }, 50) as unknown as number;
    } else {
      clicksRef.current += 1;
      setClicks(clicksRef.current);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setClicks(0);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    lastRightClickRef.current = 0;
  };

  const handleStopManual = () => {
    if (status !== "running" || startTimeRef.current === null) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    handleFinished(elapsed);
  };

  const currentCps = status === "finished"
    ? finalCps
    : status === "running"
      ? (duration === -1 
          ? (timeLeft > 0 ? clicks / timeLeft : 0) 
          : (clicks / (duration - timeLeft || 1)))
      : 0;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 font-mono text-emerald-400 bg-black p-6 rounded-3xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] select-none">
      <div className="w-full border-b border-emerald-500/30 pb-3 text-center">
        <p className="text-sm tracking-widest uppercase font-bold text-emerald-500">[KOHI_SPEED_TRIAL v1.8]</p>
      </div>

      <KohiDurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={(d) => {
          setDuration(d);
          setTimeLeft(d === -1 ? 0 : d);
          setStatus("idle");
          setClicks(0);
          clicksRef.current = 0;
          setFinalCps(0);
        }}
      />

      <div className="w-full space-y-2 text-xs">
        <div className="flex justify-between border-b border-emerald-500/20 py-1">
          <span>{duration === -1 ? "TIME_ELAPSED:" : "TIME_REMAINING:"}</span>
          <span>{timeLeft.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between border-b border-emerald-500/20 py-1">
          <span>TOTAL_CLICKS:</span>
          <span>{clicks}</span>
        </div>
        <div className="flex justify-between border-b border-emerald-500/20 py-1">
          <span>RUNNING_CPS:</span>
          <span>{currentCps.toFixed(2)}</span>
        </div>
      </div>

      <button
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        className={`relative w-full h-44 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
          status === "running"
            ? "bg-emerald-500/10 border-emerald-400 animate-pulse"
            : "bg-[#050505] border-emerald-500/40 hover:border-emerald-400"
        }`}
      >
        {isTouchDevice && status === "finished" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleReset();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 z-30 flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 text-[10px] font-bold text-emerald-400 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <ResetIcon className="h-3 w-3" /> RESET
          </div>
        )}
        {status === "idle" && (
          <div className="space-y-1 text-center">
            <p className="text-base font-bold">&gt;&gt;&gt; TAP_PAD &lt;&lt;&lt;</p>
            <p className="text-[10px] text-emerald-500/60">CLICK TO COMMENCE SEQUENCE</p>
          </div>
        )}
        {status === "running" && (
          <p className="text-4xl font-black tracking-widest">{clicks}</p>
        )}
        {status === "finished" && (
          <div className="text-center space-y-2">
            <p className="text-sm font-bold">[SEQUENCE_TERMINATED]</p>
            <p className="text-3xl font-black">{finalCps.toFixed(2)} CPS</p>
            <div className="pt-1">
              <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded-full inline-block animate-pulse">
                {isTouchDevice ? "TAP_RESET_BUTTON_BELOW" : "DOUBLE_TAP_RIGHT_CLICK_TO_RESET"}
              </span>
            </div>
          </div>
        )}
      </button>

      {duration === -1 && (
        <button
          onClick={handleStopManual}
          disabled={status !== "running"}
          className={`w-full py-3 font-bold text-sm tracking-widest uppercase transition-colors rounded-lg border ${
            status === "running"
              ? "bg-red-950/40 hover:bg-red-900/60 text-red-500 border-red-500/60 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse"
              : "bg-black text-emerald-500/30 border-emerald-500/10 cursor-not-allowed"
          }`}
        >
          [STOP_SEQUENCE]
        </button>
      )}

      <button
        onClick={handleReset}
        className="w-full py-2 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors rounded-lg"
      >
        [RESET_TERMINAL]
      </button>
    </div>
  );
}
