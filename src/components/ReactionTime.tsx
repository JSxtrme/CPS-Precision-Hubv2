import React, { useState, useEffect, useRef } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { handleGlowMove } from './glow';

interface ReactionTimeProps {
  addHistory: (testType: string, duration: number, score: number, rating: string) => void;
  isDarkMode: boolean;
}

export interface ReactionTier {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  quotes: string[];
}

export const REACTION_TIERS: ReactionTier[] = [
  {
    label: "Godlike",
    min: 0,
    max: 149,
    color: "text-amber-500 dark:text-amber-400 font-extrabold animate-pulse godlike-glow",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    quotes: [
      "Are you an AI? That reaction rate is absolutely legendary!",
      "Calm down, Flash. Even the electricity in your mouse wires is struggling to keep up with you!",
      "You tapped before the electrons even decided to move. Are you reading my mind or what?!",
      "Did you just hack the spacetime continuum? Someone check this person's DNA for computer parts!",
      "Either you are a cybernetic organism sent from the future, or you just drank 12 cans of energy drinks.",
      "That is faster than a photon on a treadmill. Absolutely unreal!",
      "Matrix-level dodging. You could literally dodge a blue screen of death.",
      "You clicked so fast, your mouse had to double-check if it actually happened."
    ]
  },
  {
    label: "Superhuman",
    min: 150,
    max: 199,
    color: "text-fuchsia-500 dark:text-fuchsia-400 font-bold",
    bgColor: "bg-fuchsia-500/10 border-fuchsia-500/20",
    quotes: [
      "Woah! You've got the reflexes of an esports pro who eats keycaps for breakfast.",
      "Excellent! Your brain's refresh rate must be running at 360Hz.",
      "Spiderman? Is that you? Your spider-sense is tingling at maximum frequency!",
      "Your synaptic pathways are basically fiber-optic cables. Truly impressive!",
      "You could dodge a bullet in slow motion. Matrix style!",
      "Are you on 0 ping mentally? Your brain's packet loss is literally 0%.",
      "A true competitive gamer. Shroud would be proud of this reaction."
    ]
  },
  {
    label: "Fast",
    min: 200,
    max: 249,
    color: "text-rose-500 dark:text-rose-400 font-bold",
    bgColor: "bg-rose-500/10 border-rose-500/20",
    quotes: [
      "Fast! You definitely have low input lag in your nervous system.",
      "Solid performance! You'd survive at least 5 minutes in a hardcore PvP lobby.",
      "You react faster than a cat hearing a can opener. Meow-ve on up to Superhuman!",
      "Great speed! Your mouse switches are weeping with joy.",
      "Pretty swift! You're faster than 75% of the population.",
      "You click faster than a teenager replying to a 'we need to talk' text.",
      "The force is strong with this one. You've definitely done this before."
    ]
  },
  {
    label: "Good",
    min: 250,
    max: 299,
    color: "text-orange-500 dark:text-orange-400 font-semibold",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    quotes: [
      "Pretty good! The average human is sweating trying to keep up with you.",
      "Not bad at all. With a bit of gaming sleeve grease, you'll be hitting sub-200 in no time.",
      "A healthy, athletic reflex speed! Your morning coffee is definitely working.",
      "Nice and steady. You can definitely dodge a red shell in Mario Kart.",
      "Decent reflexes. You won't get caught off-guard by a banana peel.",
      "You clicked faster than a coupon-clipping granny at a Sunday clearance sale!",
      "Good reflexes. Your response time is faster than the ice cream machine breaking down at McDonald's."
    ]
  },
  {
    label: "Decent",
    min: 300,
    max: 399,
    color: "text-emerald-500 dark:text-emerald-400 font-medium",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    quotes: [
      "Decent reflexes! You're standing right at the sweet spot of human performance.",
      "Comfortably decent. You're fast enough to grab the last slice of pizza from your friends.",
      "Not bad. You can successfully catch a falling pen before it hits the floor.",
      "Quite acceptable! Your neural pathways are awake, alert, and mostly sober.",
      "A solid effort. You won't lag in casual gameplay, but maybe hold off on the pro circuits.",
      "You have the speed of someone who actually reads the Terms and Conditions... Wait, nobody does that."
    ]
  },
  {
    label: "Average",
    min: 400,
    max: 499,
    color: "text-amber-500 dark:text-amber-400 font-medium",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    quotes: [
      "Average. Not a potato, but maybe a slightly warm sweet potato.",
      "Perfect for playing casual turn-based strategy games, but maybe avoid competitive FPS for today.",
      "Your reaction speed is like a 60Hz monitor with vertical sync enabled. Comfortable but safe.",
      "You react just fast enough to close a pop-up ad before it plays audio. Respectable!",
      "About as average as plain white bread. Let's butter up those fingers and try again.",
      "You've achieved total mediocrity. A true beige-painted champion of the middle class.",
      "Perfectly average. Like the middle sibling, unnoticed but functional."
    ]
  },
  {
    label: "Below Average",
    min: 500,
    max: 599,
    color: "text-teal-500 dark:text-teal-400 font-medium",
    bgColor: "bg-teal-500/10 border-teal-500/20",
    quotes: [
      "Oof, below average. Did you blink or did the Earth's gravity double for a second?",
      "A bit sluggish. It's like your brain is downloading the green light via dial-up internet.",
      "Your synapses are taking a scenic route today. Are they stopping for a coffee break?",
      "Your nervous system is buffering. Please wait, or check your mental Wi-Fi signal.",
      "Maybe your monitor has a 50ms display lag? Yes, let's blame the hardware!",
      "Your reaction speed is slower than an iOS update on an iPhone 6.",
      "Did you get distracted by a shiny object? Focus, soldier!"
    ]
  },
  {
    label: "Slow",
    min: 600,
    max: 699,
    color: "text-sky-500 dark:text-sky-400 font-medium",
    bgColor: "bg-sky-500/10 border-sky-500/20",
    quotes: [
      "Ouch. A snail just passed you on the inside lane and honked.",
      "Are you playing this from Mars? Because that latency is practically interplanetary!",
      "Your finger is moving in slow-motion replay. Is this a movie cinematic?",
      "It's okay, some people are built for speed, others are built for... long contemplation.",
      "Your reflexes are like a slow cooker. Good for stews, bad for reaction tests.",
      "Your reaction was slower than a Sunday afternoon line at the DMV.",
      "Even Internet Explorer in its prime could load a webpage faster than that click!"
    ]
  },
  {
    label: "Turtle",
    min: 700,
    max: Infinity,
    color: "text-slate-500 dark:text-slate-400 font-medium",
    bgColor: "bg-slate-500/10 border-slate-500/20",
    quotes: [
      "Wait, did you fall asleep mid-click? Hello? Anyone home?",
      "Is your mouse cursor stuck in molasses? Or are you testing this on a refrigerator screen?",
      "Your brain cells are currently discussing whether they should click or write a poem first.",
      "We had time to cook a three-course meal while waiting for that tap. Delicious, but slow!",
      "You have the legendary reflexes of a sleepy fossilized sloth. Wear it with pride!",
      "The continental drift is officially faster than your index finger. Keep dreaming big!",
      "Are you playing via carrier pigeon? The packet took 3 business days to arrive!",
      "Your response time is measured in geologic eras. Paleolithic speed!"
    ]
  }
];

export function getReactionStats(time: number) {
  const tier = REACTION_TIERS.find(t => time >= t.min && time <= t.max) || REACTION_TIERS[REACTION_TIERS.length - 1];
  const quote = tier.quotes[Math.floor(Math.random() * tier.quotes.length)];
  return { tier, quote };
}

export function ReactionTimeTest({ addHistory, isDarkMode }: ReactionTimeProps) {
  const [status, setStatus] = useState<"idle" | "waiting" | "active" | "result" | "too-early">("idle");
  const [waitingPhase, setWaitingPhase] = useState<"red" | "yellow" | null>(null);
  const [liveTime, setLiveTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [resultQuote, setResultQuote] = useState<string>("");
  const [resultTier, setResultTier] = useState<ReactionTier | null>(null);
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
    setWaitingPhase("red");
    setReactionTime(null);
    setResultQuote("");
    setResultTier(null);
    setLiveTime(0);
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
        const stats = getReactionStats(timeDiff);
        setResultQuote(stats.quote);
        setResultTier(stats.tier);
        addHistory("Reaction Time Test", 0, timeDiff, stats.tier.label);
      }
    } else if (status === "result" || status === "too-early" || status === "idle") {
      // Reset & go back to waiting
      startTest();
    }
  };

  // Live elapsed time ticker using requestAnimationFrame when status is "active"
  useEffect(() => {
    if (status !== "active" || !startTimeRef.current) {
      setLiveTime(0);
      return;
    }
    let active = true;
    const update = () => {
      if (!active || !startTimeRef.current) return;
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setLiveTime(elapsed);
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    return () => {
      active = false;
    };
  }, [status]);

  // Dedicated useEffect to handle the sequential random timers during 'waiting' state
  useEffect(() => {
    if (status !== "waiting") {
      setWaitingPhase(null);
      return;
    }

    setWaitingPhase("red");

    const redDuration = Math.random() * 1500 + 1000; // 1.0s to 2.5s
    const yellowDuration = Math.random() * 1200 + 800; // 0.8s to 2.0s

    let yellowTimer: number | null = null;
    let greenTimer: number | null = null;

    yellowTimer = window.setTimeout(() => {
      setWaitingPhase("yellow");

      greenTimer = window.setTimeout(() => {
        setStatus("active");
        startTimeRef.current = performance.now();
      }, yellowDuration);
    }, redDuration);

    return () => {
      if (yellowTimer) window.clearTimeout(yellowTimer);
      if (greenTimer) window.clearTimeout(greenTimer);
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
            const stats = getReactionStats(diff);
            setResultQuote(stats.quote);
            setResultTier(stats.tier);
            addHistory("Reaction Time Test", 0, diff, stats.tier.label);
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
        className={`pv-glow relative flex h-72 w-full flex-col items-center justify-center rounded-3xl border-2 transition-all duration-150 cursor-pointer text-center p-6 select-none ${
          status === "idle"
            ? isDarkMode
              ? "border-white/10 bg-white/5 text-white hover:border-slate-500/50"
              : "border-slate-200 bg-white text-slate-800 hover:shadow-md"
            : status === "waiting"
              ? waitingPhase === "yellow"
                ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_50px_-10px_rgba(245,158,11,0.4)]"
                : "border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_50px_-10px_rgba(239,68,68,0.4)]"
              : status === "active"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)]"
                : status === "too-early"
                  ? "border-amber-500 bg-amber-500/10 text-amber-500"
                  : "border-emerald-500 bg-slate-500/5 text-slate-800 dark:text-white"
        }`}
      onPointerMove={handleGlowMove} >
        {status === "idle" && (
          <div className="space-y-4">
            {/* Visual Traffic Light */}
            <div className="flex justify-center gap-3 bg-slate-800/80 p-3 rounded-2xl w-fit mx-auto border border-white/5">
              <div className="h-6 w-6 rounded-full bg-red-600/30" />
              <div className="h-6 w-6 rounded-full bg-amber-500/30" />
              <div className="h-6 w-6 rounded-full bg-emerald-500/30" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black">Click to Start Test</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Measurement starts after clicking</p>
            </div>
          </div>
        )}

        {status === "waiting" && (
          <div className="space-y-4">
            <div className={`flex justify-center gap-3 bg-slate-800/90 p-3 rounded-2xl w-fit mx-auto border transition-colors duration-150 ${
              waitingPhase === "yellow" ? "border-amber-500/30" : "border-red-500/30"
            }`}>
              <div className={`h-6 w-6 rounded-full transition-all duration-150 ${
                waitingPhase === "red"
                  ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-110"
                  : "bg-red-500/10"
              }`} />
              <div className={`h-6 w-6 rounded-full transition-all duration-150 ${
                waitingPhase === "yellow"
                  ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-110"
                  : "bg-amber-500/10"
              }`} />
              <div className="h-6 w-6 rounded-full bg-emerald-500/10" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black uppercase tracking-wider animate-pulse">
                {waitingPhase === "red" ? "Ready..." : "Set..."}
              </p>
              <p className="text-xs opacity-75">
                {waitingPhase === "red" ? "Wait for the yellow and green lights..." : "Get ready to tap instantly!"}
              </p>
            </div>
          </div>
        )}

        {status === "active" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-3 bg-slate-800/90 p-3 rounded-2xl w-fit mx-auto border border-emerald-500/30">
              <div className="h-6 w-6 rounded-full bg-red-500/10" />
              <div className="h-6 w-6 rounded-full bg-amber-500/10" />
              <div className="h-6 w-6 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] scale-110" />
            </div>
            <div className="space-y-1 text-emerald-600 dark:text-emerald-400">
              <p className="text-6xl font-mono font-black tracking-wider tabular-nums">
                {liveTime}<span className="text-2xl font-normal ml-1">ms</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-widest mt-2">TAP NOW!!!</p>
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

        {status === "result" && reactionTime !== null && resultTier && (
          <div className="space-y-5 animate-scale-in">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Your Latency</p>
              <p className="text-6xl font-black tracking-tight text-slate-800 dark:text-white sm:text-7xl tabular-nums">
                {reactionTime}<span className="text-2xl font-normal ml-1 text-slate-400">ms</span>
              </p>
              
              <div className="flex justify-center py-1">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-xs ${resultTier.color} ${resultTier.bgColor}`}>
                  {resultTier.label}
                </span>
              </div>
              {resultTier.label === 'Godlike' && (
                <p className="text-xs font-semibold tracking-wide text-amber-500 dark:text-amber-400">hidden tier unlocked</p>
              )}
              
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto italic px-4 leading-relaxed mt-2">
                "{resultQuote}"
              </p>
              
              <p className="text-[10px] text-slate-400 uppercase tracking-widest pt-4 animate-pulse font-semibold">
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
