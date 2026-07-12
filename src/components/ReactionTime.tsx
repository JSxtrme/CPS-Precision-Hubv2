import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertTriangle } from 'lucide-react';

interface ReactionTimeProps {
  addHistory: (testType: string, duration: number, score: number, rating: string) => void;
  isDarkMode: boolean;
}

export function ReactionTimeTest({ addHistory, isDarkMode }: ReactionTimeProps) {
  const [status, setStatus] = useState<"idle" | "waiting" | "active" | "result" | "too-early">("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("reaction_best");
    return saved ? parseFloat(saved) : null;
  });

  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startTest = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setStatus("waiting");
    setReactionTime(null);
    startTimeRef.current = null;
  };

  const handleTrigger = (e: React.PointerEvent<HTMLDivElement> | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "waiting") {
      // Too early!
      setStatus("too-early");
    } else if (status === "active") {
      // Success!
      if (startTimeRef.current !== null) {
        const endTime = performance.now();
        const timeDiff = Math.round(endTime - startTimeRef.current);
        setReactionTime(timeDiff);
        setStatus("result");

        // Save best score
        if (bestTime === null || timeDiff < bestTime) {
          setBestTime(timeDiff);
          localStorage.setItem("reaction_best", timeDiff.toString());
        }

        // Add to history
        const rank = timeDiff < 150 ? "Lightning Fast" : timeDiff < 250 ? "Excellent" : timeDiff < 400 ? "Good" : "Luggish";
        addHistory("Reaction Time Test", 0, timeDiff, rank);
      }
    } else if (status === "result" || status === "too-early" || status === "idle") {
      // Reset & go back to waiting
      startTest();
    }
  };

  // Dedicated useEffect to handle the random timer during 'waiting' state
  useEffect(() => {
    if (status !== "waiting") return;

    const randomDelay = Math.random() * 3000 + 1500; // 1.5s to 4.5s
    const timer = window.setTimeout(() => {
      setStatus("active");
      startTimeRef.current = performance.now();
    }, randomDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  // Keyboard Space listener for convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "waiting") {
          setStatus("too-early");
        } else if (status === "active") {
          if (startTimeRef.current !== null) {
            const diff = Math.round(performance.now() - startTimeRef.current);
            setReactionTime(diff);
            setStatus("result");
            if (bestTime === null || diff < bestTime) {
              setBestTime(diff);
              localStorage.setItem("reaction_best", diff.toString());
            }
            addHistory("Reaction Time Test", 0, diff, diff < 200 ? "Superhuman" : "Normal");
          }
        } else {
          startTest();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [status, bestTime, addHistory]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 animate-fade-in select-none">
      <div className="w-full text-center">
        <h3 className="text-xl font-bold tracking-tight">Reaction Time Test</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Wait for the traffic light to turn <span className="font-bold text-emerald-500">GREEN</span>, then click or press SPACEBAR immediately!
        </p>
      </div>

      <div
        onPointerDown={(e) => {
          if (e.button === 0) handleTrigger(e);
        }}
        className={`relative flex h-72 w-full flex-col items-center justify-center rounded-3xl border-2 transition-all duration-150 cursor-pointer text-center p-6 select-none ${
          status === "idle"
            ? isDarkMode
              ? "border-white/10 bg-white/5 text-white hover:border-slate-500/50"
              : "border-slate-200 bg-white text-slate-800 hover:shadow-md"
            : status === "waiting"
              ? "border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_50px_-10px_rgba(239,68,68,0.4)]"
              : status === "active"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)] animate-pulse"
                : status === "too-early"
                  ? "border-amber-500 bg-amber-500/10 text-amber-500"
                  : "border-emerald-500 bg-slate-500/5 text-slate-800 dark:text-white"
        }`}
      >
        {status === "idle" && (
          <div className="space-y-4">
            {/* Visual Traffic Light */}
            <div className="flex justify-center gap-3 bg-slate-800/80 p-3 rounded-2xl w-fit mx-auto border border-white/5">
              <div className="h-6 w-6 rounded-full bg-red-600/30" />
              <div className="h-6 w-6 rounded-full bg-amber-500/30" />
              <div className="h-6 w-6 rounded-full bg-emerald-500/30 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black">Click to Start Test</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Measurement starts after clicking</p>
            </div>
          </div>
        )}

        {status === "waiting" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-3 bg-slate-800/90 p-3 rounded-2xl w-fit mx-auto border border-red-500/30">
              <div className="h-6 w-6 rounded-full bg-red-500 animate-ping shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              <div className="h-6 w-6 rounded-full bg-amber-500/10" />
              <div className="h-6 w-6 rounded-full bg-emerald-500/10" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black uppercase tracking-wider animate-pulse">Wait for green...</p>
              <p className="text-xs opacity-75">Clicking early will fail the round!</p>
            </div>
          </div>
        )}

        {status === "active" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-3 bg-slate-800/90 p-3 rounded-2xl w-fit mx-auto border border-emerald-500/30">
              <div className="h-6 w-6 rounded-full bg-red-500/10" />
              <div className="h-6 w-6 rounded-full bg-amber-500/10" />
              <div className="h-6 w-6 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]" />
            </div>
            <div className="space-y-1 text-emerald-600 dark:text-emerald-400">
              <p className="text-5xl font-black uppercase tracking-widest animate-bounce">TAP NOW!!!</p>
              <p className="text-xs font-bold uppercase tracking-widest">Immediate click required!</p>
            </div>
          </div>
        )}

        {status === "too-early" && (
          <div className="space-y-3">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
            <div className="space-y-1 text-amber-600 dark:text-amber-400">
              <p className="text-2xl font-black uppercase">TOO EARLY!</p>
              <p className="text-xs font-semibold">You clicked before the light turned green.</p>
              <p className="text-[10px] text-slate-500 uppercase mt-4">⚡ Click anywhere or press space to try again ⚡</p>
            </div>
          </div>
        )}

        {status === "result" && reactionTime !== null && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-widest text-emerald-500 font-bold">Your Latency</p>
              <p className="text-6xl font-black tracking-tight text-slate-800 dark:text-white sm:text-7xl">
                {reactionTime} <span className="text-2xl font-medium">ms</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reactionTime < 150 
                  ? "Are you an AI? That reaction rate is absolutely legendary!" 
                  : reactionTime < 250 
                    ? "Fantastic! You are well above the human average of 273ms." 
                    : "Decent. Try sitting a bit closer to your monitor for less optical delay."}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest pt-2 animate-pulse font-semibold">
                ⚡ Click anywhere or press space to retry ⚡
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex justify-between text-sm text-slate-600 dark:text-slate-400 px-2">
        <p>
          Personal Best: <span className="font-bold text-slate-800 dark:text-white">{bestTime ? `${bestTime} ms` : "None yet"}</span>
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setReactionTime(null);
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            isDarkMode 
              ? "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200" 
              : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
