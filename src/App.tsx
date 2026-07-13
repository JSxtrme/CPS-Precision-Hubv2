import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sun, 
  Moon, 
  ArrowLeft, 
  Grid,
  Trophy,
  Smartphone,
  Laptop,
  RotateCcw,
  HelpCircle,
  Paintbrush
} from 'lucide-react';
import { ViewType, HistoryItem, RatingTier, Ripple, RATING_TIERS, getRating } from './types';
import FAQs from './components/FAQs';
import HistoryList from './components/HistoryList';
import KeyGhostingTest from './components/KeyGhosting';
import { 
  MoreTestsMenu, 
  SpacebarTest, 
  RightClickTest, 
  PollingRateTest, 
  JitterTest,
  ButterflyTest, 
  KohiTest,
  useDisableScrollZoomOnTouch,
  DragClickTest,
  DoubleClickTest,
  AimTrainer,
  ScrollTest
} from './components/AlternateTests';
import { ReactionTimeTest, REACTION_TIERS as REACTION_TIERS_DATA } from './components/ReactionTime';

// Time durations in seconds
const DURATIONS = [1, 2, 3, 5, 10, 15, 30, 60, -1];

interface ThemeColorSet {
  from: string;
  to: string;
  from300: string;
  to400: string;
  from500: string;
  to500: string;
  to600: string;
  from600: string;
  from500_60: string;
  from600_20: string;
  to600_20: string;
  center_10: string;
  shadow_pad: string;
  shadow_btn: string;
  from400_50: string;
  to500_20: string;
  to500_5: string;
  to500_35: string;
}

interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColorSet;
  previewBg: string;
}

const THEMES: ThemePreset[] = [
  {
    id: "cosmic",
    name: "Cosmic Purple",
    colors: {
      from: "#e879f9",
      to: "#818cf8",
      from300: "#f472b6",
      to400: "#818cf8",
      from500: "#d946ef",
      to500: "#6366f1",
      to600: "#4f46e5",
      from600: "#c026d3",
      from500_60: "rgba(217, 70, 239, 0.6)",
      from600_20: "rgba(192, 38, 211, 0.2)",
      to600_20: "rgba(79, 70, 229, 0.2)",
      center_10: "rgba(147, 51, 234, 0.1)",
      shadow_pad: "rgba(217, 70, 239, 0.5)",
      shadow_btn: "rgba(217, 70, 239, 0.5)",
      from400_50: "rgba(232, 121, 249, 0.5)",
      to500_20: "rgba(99, 102, 241, 0.2)",
      to500_5: "rgba(99, 102, 241, 0.05)",
      to500_35: "rgba(99, 102, 241, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #d946ef 0%, #6366f1 100%)",
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    colors: {
      from: "#f472b6",
      to: "#fb923c",
      from300: "#fbcfe8",
      to400: "#fed7aa",
      from500: "#ec4899",
      to500: "#f97316",
      to600: "#ea580c",
      from600: "#db2777",
      from500_60: "rgba(236, 72, 153, 0.6)",
      from600_20: "rgba(219, 39, 119, 0.2)",
      to600_20: "rgba(234, 88, 12, 0.2)",
      center_10: "rgba(236, 72, 153, 0.1)",
      shadow_pad: "rgba(236, 72, 153, 0.5)",
      shadow_btn: "rgba(236, 72, 153, 0.5)",
      from400_50: "rgba(244, 114, 182, 0.5)",
      to500_20: "rgba(249, 115, 22, 0.2)",
      to500_5: "rgba(249, 115, 22, 0.05)",
      to500_35: "rgba(249, 115, 22, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
  },
  {
    id: "emerald",
    name: "Emerald Mint",
    colors: {
      from: "#34d399",
      to: "#2dd4bf",
      from300: "#6ee7b7",
      to400: "#2dd4bf",
      from500: "#10b981",
      to500: "#14b8a6",
      to600: "#0d9488",
      from600: "#059669",
      from500_60: "rgba(16, 185, 129, 0.6)",
      from600_20: "rgba(5, 150, 105, 0.2)",
      to600_20: "rgba(13, 148, 136, 0.2)",
      center_10: "rgba(16, 185, 129, 0.1)",
      shadow_pad: "rgba(16, 185, 129, 0.5)",
      shadow_btn: "rgba(16, 185, 129, 0.5)",
      from400_50: "rgba(52, 211, 153, 0.5)",
      to500_20: "rgba(20, 184, 166, 0.2)",
      to500_5: "rgba(20, 184, 166, 0.05)",
      to500_35: "rgba(20, 184, 166, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    colors: {
      from: "#22d3ee",
      to: "#60a5fa",
      from300: "#67e8f9",
      to400: "#60a5fa",
      from500: "#06b6d4",
      to500: "#3b82f6",
      to600: "#2563eb",
      from600: "#0891b2",
      from500_60: "rgba(6, 182, 212, 0.6)",
      from600_20: "rgba(8, 145, 178, 0.2)",
      to600_20: "rgba(37, 99, 235, 0.2)",
      center_10: "rgba(59, 130, 246, 0.1)",
      shadow_pad: "rgba(6, 182, 212, 0.5)",
      shadow_btn: "rgba(6, 182, 212, 0.5)",
      from400_50: "rgba(34, 211, 238, 0.5)",
      to500_20: "rgba(59, 130, 246, 0.2)",
      to500_5: "rgba(59, 130, 246, 0.05)",
      to500_35: "rgba(59, 130, 246, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  },
  {
    id: "ash_grey",
    name: "Dark Charcoal",
    colors: {
      from: "#94a3b8",
      to: "#475569",
      from300: "#cbd5e1",
      to400: "#94a3b8",
      from500: "#64748b",
      to500: "#334155",
      to600: "#1e293b",
      from600: "#475569",
      from500_60: "rgba(100, 116, 139, 0.6)",
      from600_20: "rgba(71, 85, 105, 0.2)",
      to600_20: "rgba(30, 41, 59, 0.2)",
      center_10: "rgba(100, 116, 139, 0.1)",
      shadow_pad: "rgba(100, 116, 139, 0.4)",
      shadow_btn: "rgba(100, 116, 139, 0.4)",
      from400_50: "rgba(148, 163, 184, 0.5)",
      to500_20: "rgba(51, 65, 85, 0.2)",
      to500_5: "rgba(51, 65, 85, 0.05)",
      to500_35: "rgba(51, 65, 85, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #64748b 0%, #1e293b 100%)",
  },
  {
    id: "charcoal",
    name: "Ash Gray",
    colors: {
      from: "#e4e4e7",
      to: "#71717a",
      from300: "#d4d4d8",
      to400: "#a1a1aa",
      from500: "#52525b",
      to500: "#27272a",
      to600: "#18181b",
      from600: "#3f3f46",
      from500_60: "rgba(82, 82, 91, 0.6)",
      from600_20: "rgba(63, 63, 70, 0.2)",
      to600_20: "rgba(24, 24, 27, 0.2)",
      center_10: "rgba(161, 161, 170, 0.1)",
      shadow_pad: "rgba(161, 161, 170, 0.4)",
      shadow_btn: "rgba(161, 161, 170, 0.4)",
      from400_50: "rgba(161, 161, 170, 0.5)",
      to500_20: "rgba(39, 39, 42, 0.2)",
      to500_5: "rgba(39, 39, 42, 0.05)",
      to500_35: "rgba(39, 39, 42, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #71717a 0%, #18181b 100%)",
  },
  {
    id: "crimson",
    name: "Crimson Gold",
    colors: {
      from: "#f87171",
      to: "#fbbf24",
      from300: "#fca5a5",
      to400: "#fde047",
      from500: "#dc2626",
      to500: "#d97706",
      to600: "#b91c1c",
      from600: "#991b1b",
      from500_60: "rgba(220, 38, 38, 0.6)",
      from600_20: "rgba(153, 27, 27, 0.2)",
      to600_20: "rgba(185, 28, 28, 0.2)",
      center_10: "rgba(220, 38, 38, 0.1)",
      shadow_pad: "rgba(220, 38, 38, 0.5)",
      shadow_btn: "rgba(220, 38, 38, 0.5)",
      from400_50: "rgba(248, 113, 113, 0.5)",
      to500_20: "rgba(217, 119, 6, 0.2)",
      to500_5: "rgba(217, 119, 6, 0.05)",
      to500_35: "rgba(217, 119, 6, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)",
  },
  {
    id: "amethyst",
    name: "Royal Amethyst",
    colors: {
      from: "#c084fc",
      to: "#818cf8",
      from300: "#d8b4fe",
      to400: "#a5b4fc",
      from500: "#7c3aed",
      to500: "#4f46e5",
      to600: "#3730a3",
      from600: "#6d28d9",
      from500_60: "rgba(124, 58, 237, 0.6)",
      from600_20: "rgba(109, 40, 217, 0.2)",
      to600_20: "rgba(55, 48, 163, 0.2)",
      center_10: "rgba(124, 58, 237, 0.1)",
      shadow_pad: "rgba(124, 58, 237, 0.5)",
      shadow_btn: "rgba(124, 58, 237, 0.5)",
      from400_50: "rgba(192, 132, 252, 0.5)",
      to500_20: "rgba(79, 70, 229, 0.2)",
      to500_5: "rgba(79, 70, 229, 0.05)",
      to500_35: "rgba(79, 70, 229, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  },
  {
    id: "cyberpunk",
    name: "Cyber Punk",
    colors: {
      from: "#ff007f",
      to: "#00ffff",
      from300: "#ff7ebb",
      to400: "#70ffff",
      from500: "#e0006c",
      to500: "#00cbd6",
      to600: "#009099",
      from600: "#a80052",
      from500_60: "rgba(224, 0, 108, 0.6)",
      from600_20: "rgba(168, 0, 82, 0.2)",
      to600_20: "rgba(0, 144, 153, 0.2)",
      center_10: "rgba(224, 0, 108, 0.1)",
      shadow_pad: "rgba(224, 0, 108, 0.5)",
      shadow_btn: "rgba(224, 0, 108, 0.5)",
      from400_50: "rgba(255, 0, 127, 0.5)",
      to500_20: "rgba(0, 203, 214, 0.2)",
      to500_5: "rgba(0, 203, 214, 0.05)",
      to500_35: "rgba(0, 203, 214, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #ff007f 0%, #00cbd6 100%)",
  },
  {
    id: "rose_gold",
    name: "Rose Gold",
    colors: {
      from: "#f43f5e",
      to: "#fda4af",
      from300: "#fecdd3",
      to400: "#ffe4e6",
      from500: "#e11d48",
      to500: "#fb7185",
      to600: "#f43f5e",
      from600: "#be123c",
      from500_60: "rgba(225, 29, 72, 0.6)",
      from600_20: "rgba(190, 18, 60, 0.2)",
      to600_20: "rgba(244, 63, 94, 0.2)",
      center_10: "rgba(225, 29, 72, 0.1)",
      shadow_pad: "rgba(225, 29, 72, 0.4)",
      shadow_btn: "rgba(225, 29, 72, 0.4)",
      from400_50: "rgba(251, 113, 133, 0.5)",
      to500_20: "rgba(251, 113, 133, 0.2)",
      to500_5: "rgba(251, 113, 133, 0.05)",
      to500_35: "rgba(251, 113, 133, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #e11d48 0%, #fb7185 100%)",
  },
  {
    id: "golden_hour",
    name: "Golden Hour",
    colors: {
      from: "#f59e0b",
      to: "#ea580c",
      from300: "#fcd34d",
      to400: "#fdba74",
      from500: "#d97706",
      to500: "#c2410c",
      to600: "#9a3412",
      from600: "#b45309",
      from500_60: "rgba(217, 119, 6, 0.6)",
      from600_20: "rgba(180, 83, 9, 0.2)",
      to600_20: "rgba(154, 52, 18, 0.2)",
      center_10: "rgba(217, 119, 6, 0.1)",
      shadow_pad: "rgba(217, 119, 6, 0.5)",
      shadow_btn: "rgba(217, 119, 6, 0.5)",
      from400_50: "rgba(245, 158, 11, 0.5)",
      to500_20: "rgba(194, 65, 12, 0.2)",
      to500_5: "rgba(194, 65, 12, 0.05)",
      to500_35: "rgba(194, 65, 12, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
  },
  {
    id: "forest",
    name: "Forest Shadow",
    colors: {
      from: "#34d399",
      to: "#059669",
      from300: "#a7f3d0",
      to400: "#34d399",
      from500: "#10b981",
      to500: "#064e3b",
      to600: "#022c22",
      from600: "#047857",
      from500_60: "rgba(16, 185, 129, 0.6)",
      from600_20: "rgba(4, 120, 87, 0.2)",
      to600_20: "rgba(6, 78, 59, 0.2)",
      center_10: "rgba(16, 185, 129, 0.1)",
      shadow_pad: "rgba(16, 185, 129, 0.5)",
      shadow_btn: "rgba(16, 185, 129, 0.5)",
      from400_50: "rgba(52, 211, 153, 0.5)",
      to500_20: "rgba(6, 78, 59, 0.2)",
      to500_5: "rgba(6, 78, 59, 0.05)",
      to500_35: "rgba(6, 78, 59, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
  },
  {
    id: "blush",
    name: "Blush Pink",
    colors: {
      from: "#f472b6",
      to: "#fda4af",
      from300: "#fbcfe8",
      to400: "#fecdd3",
      from500: "#ec4899",
      to500: "#f43f5e",
      to600: "#be123c",
      from600: "#db2777",
      from500_60: "rgba(236, 72, 153, 0.6)",
      from600_20: "rgba(219, 39, 119, 0.2)",
      to600_20: "rgba(190, 18, 60, 0.2)",
      center_10: "rgba(236, 72, 153, 0.1)",
      shadow_pad: "rgba(236, 72, 153, 0.5)",
      shadow_btn: "rgba(236, 72, 153, 0.5)",
      from400_50: "rgba(244, 114, 182, 0.5)",
      to500_20: "rgba(244, 63, 94, 0.2)",
      to500_5: "rgba(244, 63, 94, 0.05)",
      to500_35: "rgba(244, 63, 94, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    id: "aurora",
    name: "Northern Lights",
    colors: {
      from: "#2dd4bf",
      to: "#a855f7",
      from300: "#99f6e4",
      to400: "#c084fc",
      from500: "#0d9488",
      to500: "#8b5cf6",
      to600: "#6d28d9",
      from600: "#0f766e",
      from500_60: "rgba(13, 148, 136, 0.6)",
      from600_20: "rgba(15, 118, 110, 0.2)",
      to600_20: "rgba(109, 40, 217, 0.2)",
      center_10: "rgba(13, 148, 136, 0.1)",
      shadow_pad: "rgba(13, 148, 136, 0.5)",
      shadow_btn: "rgba(13, 148, 136, 0.5)",
      from400_50: "rgba(45, 212, 191, 0.5)",
      to500_20: "rgba(139, 92, 246, 0.2)",
      to500_5: "rgba(139, 92, 246, 0.05)",
      to500_35: "rgba(139, 92, 246, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #2dd4bf 0%, #8b5cf6 100%)",
  },
  {
    id: "midnight_neon",
    name: "Midnight Neon",
    colors: {
      from: "#3b82f6",
      to: "#d946ef",
      from300: "#93c5fd",
      to400: "#f0abfc",
      from500: "#2563eb",
      to500: "#c026d3",
      to600: "#86198f",
      from600: "#1d4ed8",
      from500_60: "rgba(37, 99, 233, 0.6)",
      from600_20: "rgba(29, 78, 216, 0.2)",
      to600_20: "rgba(134, 25, 143, 0.2)",
      center_10: "rgba(37, 99, 233, 0.1)",
      shadow_pad: "rgba(37, 99, 233, 0.5)",
      shadow_btn: "rgba(37, 99, 233, 0.5)",
      from400_50: "rgba(59, 130, 246, 0.5)",
      to500_20: "rgba(192, 38, 211, 0.2)",
      to500_5: "rgba(192, 38, 211, 0.05)",
      to500_35: "rgba(192, 38, 211, 0.35)",
    },
    previewBg: "linear-gradient(135deg, #3b82f6 0%, #c026d3 100%)",
  }
];

function getHumorousLine(cps: number, lastMessage?: string, isTouchDevice: boolean = false): string {
  const choices: string[] = [];

  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "Did you even tap the screen? My pet rock has a higher touch-CPS than that.",
        "Are you tapping in slow motion, or did time freeze entirely?",
        "0 CPS. Touchscreen power-saving mode: Activated.",
        "Are you trying to protect the glass screen by NOT touching it?",
        "A fossilized dinosaur has more movement than your fingers right now.",
        "Did you forget how to tap, or is your hand currently on strike?",
        "Congratulations on preserving the lifespan of your screen. Perfect 0!",
        "Is this a speed test or a staring contest? Because you're winning the staring contest.",
        "Your taps are so non-existent, the screen is checking its own touch sensors.",
        "If doing absolutely nothing was an Olympic sport, you'd be a gold medalist.",
        "Are your fingers social distancing from the capacitive display?",
        "The screen's digitizer is wondering if it's dead or just lonely.",
        "We sent search parties for your index finger, but they came back empty-handed.",
        "Are you attempting a 0-click speedrun? Spoiler: You nailed it.",
        "The glass is so untouched, it's starting to collect virtual dust.",
        "Did you mistake the screen for a picture frame? You have to tap it!",
        "Are your thumbs currently glued together? 0 clicks detected.",
        "That's a perfectly polished, fingerprint-free screen. Truly a zero.",
        "Are you practicing mime performance art? Tap the screen, mime!",
        "My battery is draining from old age waiting for your first touch.",
        "Did you mistake this for a staring contest with glass? Tap it!",
        "Your fingertip must be in a committed long-distance relationship with the screen.",
        "Zero touch events. Somewhere, a capacitive sensor is playing violin for you.",
        "Are you holding a high-stakes meeting with your index finger? Press go!",
        "0 CPS. You are officially as active as a picture of a sleeping potato.",
        "Is your finger waiting for a written invitation or a formal royal decree?",
        "If inaction was worth money, you'd be a billionaire tap-mogul by now.",
        "The touchscreen called. It wants to know if you've broken up with it."
      );
    } else if (cps > 0 && cps < 1.5) {
      choices.push(
        "1 CPS? Honestly, my grandma taps faster while sleeping. Did you use your nose?",
        "1 CPS? Your phone screen is wondering if you fell asleep on it.",
        "Are you tapping once every leap year? Speed it up!",
        "You're tapping with the urgency of a sleeping security guard.",
        "This isn't a museum exhibit. You are allowed to tap more than once!",
        "Is your screen covered in wet cement? Or is your hand stuck in molasses?",
        "You're tapping so slow, the Web server is about to time out out of sheer boredom.",
        `${Math.round(cps)} tap${Math.round(cps) === 1 ? "" : "s"} per second. At this rate, the sun will explode before you finish a level.`,
        "Are you carefully examining the glass texture before every tap?",
        "That was so slow, a desktop shortcut asked if you wanted to delete it out of pity.",
        "Are you using your thumb, your toe, or perhaps a warm piece of potato?",
        "Your hand has the reactivity of a dial-up modem on a rainy Tuesday.",
        "You tap like you're trying to not wake up a sleeping cat on your lap.",
        "This is a speed test, not a tactile inspection of mobile glass durability.",
        "Your tap interval is long enough to brew a cup of chamomile tea.",
        "My battery is draining faster than you're tapping the glass.",
        "Are you clicking in braille? Because that was extremely slow.",
        "That was a single gentle tap. The screen barely felt your existence.",
        "You tap like you're playing chess against a deep-thinking supercomputer.",
        "Are you waiting for the glass to give you consent after each individual tap?",
        "Your velocity is slower than an operating system update on dial-up.",
        "Is your finger moving through highly pressurized marshmallow fluff?",
        "At this rate, you could type a three-letter word by next Tuesday.",
        "You're tapping like you are trying to read the microscopic grain of the glass.",
        "A sleepy caterpillar just crossed my desk faster than your finger lifted.",
        "Are you tapping, or is your screen just catching crumbs falling from your mouth?",
        "Your index finger is taking a 500-millisecond vacation between every single touch.",
        "Did you think this was a turn-based strategy game? Tap continuously!"
      );
    } else if (cps >= 1.5 && cps < 3) {
      choices.push(
        `${Math.round(cps)} CPS? A snail is literally drafting in your slipstream right now. Tap faster!`,
        `${Math.round(cps)} CPS? You tap like you're signing a peace treaty. Be aggressive!`,
        "Your tapping speed matches the speed of continental drift. Fascinating, but too slow!",
        "Did you double-tap once and call it a day? Let's go!",
        "Is your finger suffering from existential dread? Just tap it!",
        `${Math.round(cps)} CPS. It's like you're treating the screen as a fragile 18th-century antique.`,
        "You're tapping at the precise tempo of a grandfather clock in an empty room.",
        "My slow-motion camera couldn't even capture how slow that was. Lift those fingers!",
        "Are you social-distancing from your own touchscreen? Get closer and tap!",
        "You are tapping as if each tap costs you five dollars. They're free, I promise!",
        "Are you double-checking your screen's scratch-resistance with every touch?",
        "You tap like an archaeologist handling a fossilized dragonfly wing.",
        "At this speed, you aren't tapping, you're merely introducing your hand to the screen.",
        "Your pace is perfect for reading a slow-scrolling manual. Speed up!",
        "Are you trying to type in Morse code, or is this your actual maximum effort?",
        "Your finger's reactivity is comparable to frozen maple syrup.",
        "You're tapping the screen like it's a hot stovetop. Just leave the finger close and vibrate!",
        "Is your index finger feeling shy? Give it some encouragement.",
        "You are tapping with the enthusiastic energy of an unpaid intern on Monday morning.",
        "Are you trying to compose a very slow and dramatic distress signal in Morse code?",
        "Your speed is perfect if you are trying to simulate a dripping icicle.",
        "Is that your maximum speed, or are you just doing some light tactile stretching?",
        "You tap with the speed of someone trying to avoid leaving fingerprints at a crime scene.",
        "Your hand is moving with the velocity of an official government inquiry.",
        "A lazy squirrel has better high-frequency finger rhythm than this.",
        "You are treating that screen like a priceless museum exhibit from the Mesozoic Era.",
        "Is there a custom heavy-gravity field centered directly on your index finger?",
        "Not quite zero, but definitely not fast enough to escape a slow-moving roomba."
      );
    } else if (cps >= 3 && cps < 5) {
      choices.push(
        "Not bad, but a caffeine-fueled sloth could still give you a run for your money.",
        "3-4 CPS. The crowd is... mildly interested but mostly checking their phones.",
        "You're tapping at the speed of a polite golf clap.",
        "You're tapping like you're waiting for water to boil. A bit more passion please!",
        "Not quite a speed demon. More like a speed bystander.",
        `At ${Math.round(cps)} CPS, you could probably navigate a spreadsheet, but you aren't winning any click duels.`,
        "You are tapping with the rhythmic tempo of a dripping kitchen faucet.",
        "Are you tapping with your non-dominant toe? Try using your finger!",
        "A bit of speed is there, but you're still tapping like you're reading the terms of service.",
        "This speed is perfect if you are trying to not wake up a baby in the next room.",
        "You're tapping like you're trying to remember if you locked the front door.",
        "Your fingers are doing light cardio when they should be running a marathon!",
        "Not slow enough to be lazy, not fast enough to be impressive. The sweet spot of mediocrity.",
        "Your index finger is giving 'I had a cup of decaf' vibes.",
        "Is that a tap, or is your screen just registering your thumb's heavy breathing?",
        "Decent speed for a typing test, but highly average for a clicking challenge.",
        "Your thumb is moving, but its heart isn't in it. Wake it up!",
        "You have the speed of a tired office clerk checking off items.",
        "Your fingers are doing standard office admin work instead of elite gaming actions.",
        "You tap like a librarian searching for a misfiled book. A bit more chaos please!",
        "The speed is respectable if you are testing the screen's basic functionality, but let's go!",
        "Your hand is giving strong 'I drink herbal decaf tea before bed' vibes.",
        "You have successfully achieved the velocity of a casual shopper browsing fresh produce.",
        "It is a steady rhythm, but we need an absolute storm of rapid fingertip strikes!",
        "Are you reading a recipe card between touches? Accelerate those thumbs!",
        "This is a solid pace for browsing real-estate listings. Not so much for clicking speed.",
        "Your tapping speed is currently keeping pace with a sleepy tortoise on a treadmill.",
        "You're tapping with the intensity of someone gently selecting a ripe avocado."
      );
    } else if (cps >= 5 && cps < 7) {
      choices.push(
        "Decent speed! Your finger is officially warmed up. Now try using a whole hand.",
        "5-6 CPS. Average human speed detected. Are you an NPC?",
        "Your taps are steady, like a leaky faucet. We need a torrential downpour!",
        "You're tapping at the speed of someone trying to skip a 5-second unskippable ad.",
        "Perfect speed for checking emails. Absolutely mediocre for pro gaming!",
        "You've got a rhythm! Too bad it's the rhythm of a slow jazz ballad.",
        "Your finger is moving, but your brain is still in first gear. Step on the gas!",
        "Not slow, not fast. You are the human equivalent of lukewarm tap water.",
        "You tap like a professional accountant typing in spreadsheets. Speed it up!",
        "You're tapping with the speed of an average typist with one hand behind their back.",
        "The screen is feeling a bit of friction now. Time to double down!",
        "Solid performance if you're playing a casual puzzle game. Otherwise, turn it up!",
        "Your wrist is doing some work, but your hand looks like it's daydreaming.",
        "You're tapping with the intensity of someone swiping through a mediocre dating app.",
        "Average speed confirmed. Your finger has officially earned its participation trophy.",
        "Not bad, but your screen is yawn-detecting. Let's see some arm movement!",
        "This is the absolute baseline of competitive tapping. Go faster!",
        "Your finger has standard-grade responsiveness. Time to overclock it.",
        "Solid! You've officially graduated from 'absolute beginner' to 'slightly active human'.",
        "Your finger has achieved the kinetic momentum of a moderately excited house cat.",
        "Very stable pace. Your capacitive screen is mildly entertained by your presence.",
        "You're moving like you've had exactly one sip of energy drink. Chug the rest!",
        "You're tapping with the speed of a teenager looking for their misplaced keys.",
        "Nice rhythm. If you were a drummer, we'd have a decent slow-tempo pop song going.",
        "You've reached the speed of a professional bank teller counting small bills.",
        "Not slow enough to be roast-worthy, but not fast enough to escape our sarcasm.",
        "Your finger is doing some nice warm-up jogs. Time to sprint for the finish line!",
        "Your pace is perfect for skipping standard dialogue. Let's aim for speedrun level!"
      );
    } else if (cps >= 7 && cps < 10) {
      choices.push(
        "Impressive! Are you drinking straight espresso or is your hand possessed?",
        "7-9 CPS. Now we're talking! Your finger is a blur, or at least a smudged line.",
        "You're tapping faster than a teenager texting their crush. Keep it up!",
        "Your finger is starting to look like a high-speed piston. Almost impressive!",
        "That's a solid vibration. Are you jitter-tapping or just in sheer panic?",
        "Your touch screen is starting to warm up. I smell a faint hint of glass friction.",
        "You tap faster than an auctioneer speaks! Very respectable speed.",
        "That's some high-fidelity tapping right there. You've definitely done this before.",
        "Your index finger has its own heartbeat now. You're entering the danger zone!",
        "Excellent rate! You can easily win a standard touch battle with this.",
        "Are you vibrating your hand or are you just terrified of the screen?",
        "That index finger is vibrating like a honeybee on a sugar rush. Magnificent!",
        "The screen's glass is getting quite warm. Watch out for spontaneous friction fire!",
        "Your finger is flying! You're definitely skipping the tutorial in every mobile RPG.",
        "Tapping speed is high enough to make your mobile device concerned for its hardware.",
        "You tap so fast you might accidentally activate voice commands. Stay focused!",
        "Your thumb is generating actual aerodynamic drag. Solid speed!",
        "Now we're cooking. Your finger is a blur to the naked eye!",
        "Your finger is moving like it's trying to send an extremely urgent text about free pizza.",
        "Nice! That's a highly competitive rhythm. The screen's digitizer is wide awake!",
        "You tap like a professional stenographer during a highly controversial trial.",
        "Your hand is starting to twitch like you've unlocked a secret coffee reservoir.",
        "Very snappy taps! If you were playing a tap RPG, the monsters would be sweating.",
        "You're starting to look like high-frequency hummingbird wings on glass.",
        "Excellent! Your hand-eye coordination has definitely bypassed normal human latency.",
        "Your thumbs are dancing a highly synchronized tap routine. Beautiful pacing!",
        "The electrostatic field on your screen is getting a real workout. Solid velocity!",
        "Now you are tapping with some serious intent! Keep that index finger vibrating!"
      );
    } else if (cps >= 10 && cps < 15) {
      choices.push(
        "Whoa! Call the fire department, your screen is starting to smoke from those taps!",
        "10-14 CPS! You're tapping like a caffeinated woodpecker!",
        "Your touchscreen is begging for mercy. Don't stop now!",
        "Are you double-finger drumming, or does your hand naturally tremble like an earthquake?",
        "You're tapping faster than light travels in a dense block of glass. Incredible!",
        "This is some professional-grade hand spasms. Your screen is literally sweating.",
        `${Math.round(cps)} CPS? You've graduated from normal tapping to becoming a biological machine.`,
        "Your finger is tapping so fast, it's starting to sound like a mini machine gun on glass.",
        "Is that a finger on the screen or a highly active massage gun? Spectacular!",
        "You're tapping faster than a social media star typing out a response to drama.",
        "The capacitive sensors are crying tears of electrostatic joy.",
        "Your hand is vibrating like an active jackhammer. Absolutely devastating touch speed.",
        "Are you tapping with multiple thumbs or is your index finger just highly caffeinated?",
        "That's not tapping, that's a localized seismic event on a piece of Corning Gorilla Glass.",
        "Your fingers are drumming a rhythm that could summon rain in the Sahara.",
        "Is there static electricity jumping between your fingers and the OLED panel? Insane!",
        "You're tapping faster than the refresh rate of the actual screen. Incredible!",
        "Are your fingers double-jointed, or did you practice tapping on a hot stove? Epic performance.",
        "Your finger has turned into a high-frequency electrostatic jackhammer! Incredible!",
        "Is your wrist hooked up to a commercial massage gun? The glass is rattling!",
        "You're skipping dialogues faster than the engine can render the next scene!",
        "Absolutely majestic speed! Your finger looks like a physical blur to the human eye.",
        "Are you sure you aren't using a touchscreen stylus attached to a reciprocating saw?",
        "That is some elite-tier tapping speed. You are definitely a threat to any tapping leaderboard.",
        "Your index finger is moving at a frequency that could scramble local Wi-Fi signals.",
        "Outstanding! Your screen is feeling a relentless barrage of capacitive shockwaves.",
        "Your hand is vibrating like a high-frequency tuning fork. Magnificent energy!",
        "The digitizer is working overtime to translate your speed. Truly marvelous!"
      );
    } else if (cps >= 15 && cps < 20) {
      choices.push(
        "Insane speed! Are you secretly vibrating your finger at a molecular level?",
        "15-19 CPS! Are you even human, or is this some kind of cybernetic enhancement?",
        "Your touchscreen is begging for its union representative. Phenomenal speed!",
        "You tap faster than the speed of rumor propagation. Absolutely wild!",
        "Are you multi-finger drumming, or did you attach a mini-jackhammer to your knuckle?",
        "Your screen is about to file a lawsuit for physical harassment. Keep vibrating!",
        "If you tapped any faster, you'd rip a hole in the fabric of the space-time continuum.",
        "You must have a macro built into your actual biological nervous system. Insane!",
        "That is the tapping speed of a star collapsing into a black hole. Supernova!",
        "Your hand is vibrating so fast, you might accidentally clip through solid matter.",
        "Are you a professional bongo player or did you drink twelve energy drinks before this?",
        "Your fingers are moving so fast they are leaving visual afterimages on the display.",
        "The digitizer is having a full-blown existential crisis trying to count your touch points.",
        "If we attached a battery to your finger right now, we could power a small village.",
        "You're tapping with the raw intensity of a heavy metal drummer on double bass.",
        "Your finger is a blur. The capacitive grid is practically screaming 'No more!'",
        "Your touch rate is entering the quantum-tunneling realm. Simply magnificent!",
        "Did you grease your fingers or are you just a touch screen speedrunner? Astonishing.",
        "This level of speed should require a licensed permit for digital demolition!",
        "Are your fingers made of pure lightning? The screen's capacitive grid is literally weeping.",
        "You are tapping so fast you are starting to create localized electrostatic weather patterns.",
        "Your index finger has bypassed biological muscle limits. Are you a synthetic android?",
        "Absolutely legendary speed! The pixels under your fingers are begging for liquid cooling.",
        "You are skipping cuts and unskippable intros in games before they even think about loading.",
        "Your wrist is vibrating with the raw frequency of a supercar's crankshaft at 8000 RPM.",
        "Simply phenomenal! We might need to recalibrate our speed limits just for your hand.",
        "Your finger has achieved full molecular escape velocity. Pure electrostatic friction fire!",
        "That's not tapping, that's a high-frequency drum roll performed by a cyborg hummingbird."
      );
    } else {
      choices.push(
        "⚡ Godlike Touch Tier! Are you butterfly-drumming with four fingers, or did you drop liquid mercury on the screen?",
        "⚡ Godlike Touch Tier! The capacitive sensors just filed a class-action lawsuit for glass abuse. Mental touch rate!",
        "⚡ Godlike Touch Tier! Your screen is so hot from those rapid taps, you could fry an egg on the glass.",
        "⚡ Godlike Touch Tier! You just reached escape velocity. The digitizer is crying tears of electrostatic joy.",
        "⚡ Godlike Touch Tier! Did you lubricate your screen with Teflon or is your finger a mini-jackhammer? Legendary!",
        "⚡ Godlike Touch Tier! You're drumming on that display like a professional bongo player on double espresso. Beautiful!",
        "⚡ Godlike Touch Tier! Your touchscreen's controller is querying a supercomputer to verify if a human can even move this fast.",
        "⚡ Godlike Touch Tier! Unbelievable! You just registered more touch events in 5 seconds than an average user does in a year.",
        "⚡ Godlike Touch Tier! Your screen has officially declared you its supreme ruler. All hail the vibrating finger!",
        "⚡ Godlike Touch Tier! If we attached an alternator to your tapping thumb, we could power the city of Tokyo for an hour.",
        "⚡ Godlike Touch Tier! There are hummingbirds watching your fingers and taking notes on high-frequency oscillations.",
        "⚡ Godlike Touch Tier! Are you secretly a high-frequency massage gun with internet access? That touch rate is illegal!",
        "⚡ Godlike Touch Tier! Your finger is moving so fast it's starting to trigger quantum tunneling on the glass!",
        "⚡ Godlike Touch Tier! Are you secretly using a pneumatic drilling rig on your phone? Simply unbelievable!",
        "⚡ Godlike Touch Tier! The capacitive grid is operating at 99.9% saturation. You are a biological DDoS attack!",
        "⚡ Godlike Touch Tier! You are tapping so fast that your screen is trying to register a fifth dimension.",
        "⚡ Godlike Touch Tier! Your finger's electrostatic signature is so powerful it just rebooted a nearby smart TV.",
        "⚡ Godlike Touch Tier! All hail the absolute emperor of touch-screens! Your thumbs are certified hyper-drives.",
        "⚡ Godlike Touch Tier! There are physics professors studying your hand muscles to rewrite kinetic theory.",
        "⚡ Godlike Touch Tier! That's not a finger, that's a cybernetic piston powered by a micro-nuclear reactor.",
        "⚡ Godlike Touch Tier! The screen digitizer has given up on counting and is now just applauding your speed.",
        "⚡ Godlike Touch Tier! You have officially transcended biological limits. Your hand is a beautiful vibrating masterpiece!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Did you even click? My pet rock has a higher CPS than that.",
        "Are you clicking in slow motion, or did time freeze entirely?",
        "0 CPS. Power-saving mode: Activated.",
        "Are you trying to test the mouse's structural integrity by NOT touching it?",
        "A fossilized dinosaur has more movement than your index finger right now.",
        "Did you forget how to left-click, or is your finger currently on strike?",
        "Congratulations on preserving the lifespan of your mouse switch. Perfect 0!",
        "Is this a speed test or a staring contest? Because you're winning the staring contest.",
        "Your clicks are so non-existent, the mouse sensor is checking its own pulse.",
        "If doing absolutely nothing was an Olympic sport, you'd be a gold medalist.",
        "Is your left mouse button stuck, or did you forget to plug in the USB?",
        "The copper leaf spring inside your mouse switch is resting peacefully.",
        "Perfect score for a ghost. Absolutely inactive on the click front.",
        "Did you fall asleep with your hand on the mousepad?",
        "Your click speed is so zero, the mouse is entering deep hibernation mode.",
        "Did you buy a custom mouse just to use it as a paperweight?",
        "Even a wireless mouse with dead batteries has more action than this.",
        "Did your pointer finger go on permanent holiday? Let's click!",
        "Are you holding a mouse or a block of cheese? Click it!",
        "0 CPS. The mechanical switch is basically rusting away as we speak.",
        "Did you buy a custom aluminum coiled cable just to transmit absolute zero?",
        "Your mouse button has forgotten what tactile feedback feels like.",
        "A sloth on anesthesia has a higher reaction rate than your index finger.",
        "Your USB port is wondering if you've unplugged your hand entirely.",
        "No clicks detected. Somewhere, a microswitch is crying tears of solder.",
        "Did you mistake your mouse for a decorative paperweight?",
        "Zero activity. Your finger's posture is incredibly motionless.",
        "Your left-click is waiting for a formal written invitation to be pressed."
      );
    } else if (cps > 0 && cps < 1.5) {
      choices.push(
        "1 CPS? Honestly, my grandma clicks faster while sleeping. Did you use your elbow?",
        "1 CPS? Your mouse is wondering if you fell asleep on the desk.",
        "Are you clicking once every leap year? Speed it up!",
        "You're clicking with the urgency of a sleeping security guard.",
        "This isn't a museum exhibit. You are allowed to click more than once!",
        "Is your mouse button made of wet cement? Or is your hand stuck in molasses?",
        "You're clicking so slow, the Web server is about to time out out of sheer boredom.",
        `${Math.round(cps)} click${Math.round(cps) === 1 ? "" : "s"} per second. At this rate, the sun will explode before you finish a level.`,
        "Are you carefully examining the texture of your left-click button before every click?",
        "That was so slow, a desktop shortcut asked if you wanted to delete it out of pity.",
        "Are you clicking with your thumb or perhaps a heavy book?",
        "Your mouse switch is yawning. It has never experienced such a gentle pace.",
        "You clicked once and then went to make coffee. Let's get moving!",
        "At this rate, you aren't clicking, you are just occasionally leaning on the mouse.",
        "Your clicking has the rhythm of continental plate subduction. Speed up!",
        "Are you trying to measure the mechanical debounce filter in minutes instead of milliseconds?",
        "This isn't a touch-and-hold interaction. Lift, tap, repeat!",
        "Even dial-up internet sends packets faster than you click.",
        "Are you clicking in Morse code, or is your hand moving in slow motion?",
        "Your index finger is taking a 10-second union break between clicks.",
        "You're clicking like you're trying to carefully avoid waking up a sleeping lion.",
        "Your click interval is long enough to install a major operating system update.",
        "Are you paying for each individual click? They are completely free, I promise!",
        "This speed is perfect if you are trying to read a scroll at a snail's pace.",
        "Your clicking has the latency of a dial-up modem on a rainy Tuesday.",
        "Are you checking the mechanical tension of your mouse button after every press?",
        "This is a speed test, not a gentle massage session for your Omron switches!",
        "At this rate, you aren't clicking, you are just occasionally leaning on the mouse."
      );
    } else if (cps >= 1.5 && cps < 3) {
      choices.push(
        `${Math.round(cps)} CPS? A snail is literally drafting in your slipstream right now. Speed up!`,
        `${Math.round(cps)} CPS? You click like you're signing a peace treaty. Be aggressive!`,
        "Your clicking speed matches the speed of continental drift. Fascinating, but too slow!",
        "Did you double-click once and call it a day? Let's go!",
        "Is your pointer finger suffering from existential dread? Just tap it!",
        `${Math.round(cps)} CPS. It's like you're treating the mouse as a fragile 18th-century antique.`,
        "You're clicking at the precise tempo of a grandfather clock in an empty room.",
        "My slow-motion camera couldn't even capture how slow that was. Lift those fingers!",
        "Are you social-distancing from your own mouse button? Get closer and tap!",
        "You are clicking as if each tap costs you five dollars. They're free, I promise!",
        "Your mouse is wondering if you're trying to perform a very slow double-click.",
        "Are you trying to not click too hard to save the mechanical switches? Mash it!",
        "This isn't a library! You can make some clicking noise, it's allowed!",
        "You're clicking like a turtle trying to navigate a computer terminal.",
        "Your finger is moving at the speed of a dial-up connection in 1995.",
        "Your forearm has entered a state of cryogenic freeze. Let's melt it and speed up!",
        "Are you double-checking each click with a team of lawyers? Just press the button!",
        "The copper contacts are wondering if you've abandoned them. Clack them!",
        "You are clicking with the speed of an ice glacier. Accelerate!",
        "Is your finger suffering from existential dread? Just clack the button!",
        "You click like an archaeologist handling a fragile fossilized wing.",
        "Your mouse is wondering if you are trying to perform a very slow double-click.",
        "This isn't a museum. You are allowed to make some mechanical noise!",
        "Your speed is perfect if you are trying to simulate a leaky pipe dripping.",
        "Are you double-checking your click coordinates with a lawyer before pressing?",
        "Your forearm has entered a state of deep cryogenic hibernation. Shake it up!",
        "Not quite zero, but definitely not fast enough to escape a hungry turtle.",
        "You are treating that mouse like a priceless 18th-century porcelain doll."
      );
    } else if (cps >= 3 && cps < 5) {
      choices.push(
        "Not bad, but a caffeine-fueled sloth could still give you a run for your money.",
        "3-4 CPS. The crowd is... mildly interested but mostly checking their phones.",
        "You're clicking at the speed of a polite golf clap.",
        "You're clicking like you're waiting for water to boil. A bit more passion please!",
        "Not quite a speed demon. More like a speed bystander.",
        `At ${Math.round(cps)} CPS, you could probably navigate a spreadsheet, but you aren't winning any click duels.`,
        "You are clicking with the rhythmic tempo of a dripping kitchen faucet.",
        "Are you clicking with your non-dominant toe? Try using your finger!",
        "A bit of speed is there, but you're still clicking like you're reading the terms of service.",
        "This speed is perfect if you are trying to not wake up a baby in the next room.",
        "Decent speed for navigating a web page, but your gaming career is on hold.",
        "Your mouse button is getting clicked, but it's not even sweating yet.",
        "You click with the speed of an average bureaucrat stamping paperwork.",
        "Are you using your pinky finger to click? Try using your index finger!",
        "Rhythm is okay, but you're treating the left switch like a delicate flower.",
        "This speed is great for reading terms of service, but absolute doom for gaming.",
        "Your mouse switch has a nice resting heartbeat. Let's make it beat a little faster!",
        "A casual office pace. Let's turn it into a competitive sprint.",
        "Your index finger is giving strong 'I drink chamomile tea before PvP' vibes.",
        "You click like a librarian searching for a quiet book. Let's see some aggression!",
        "Your mouse button is getting clicked, but the switch is barely even warm.",
        "Decent speed for a spreadsheet session, but highly mediocre for gaming.",
        "You click with the speed of an average bureaucrat stamping paperwork.",
        "Are you clicking with your pinky? Try using your index finger!",
        "Rhythm is okay, but you're treating the switch like a delicate flower. Mash it!",
        "This speed is great for reading terms of service, but absolute doom for gaming.",
        "A highly polite clicking sound. This is a speed test, not a library!",
        "Your hand is doing light cardio when it should be running a gold-medal sprint."
      );
    } else if (cps >= 5 && cps < 7) {
      choices.push(
        "Decent speed! Your finger is officially warmed up. Now try using a hand.",
        "5-6 CPS. Average human speed detected. Are you an NPC?",
        "Your clicks are steady, like a leaky faucet. We need a torrential downpour!",
        "You're clicking at the speed of someone trying to skip a 5-second unskippable ad.",
        "Perfect speed for checking emails. Absolutely mediocre for gaming!",
        "You've got a rhythm! Too bad it's the rhythm of a slow jazz ballad.",
        "Your finger is moving, but your brain is still in first gear. Step on the gas!",
        "Not slow, not fast. You are the human equivalent of lukewarm tap water.",
        "You click like a professional accountant typing in spreadsheets. Speed it up!",
        "You're clicking with the speed of an average typist with one hand behind their back.",
        "Your click frequency is perfectly average. Not too slow, but your mouse is bored.",
        "You click like you're selecting files in a folder. We need high-speed action!",
        "Decent baseline. Now shake that hand and start vibrating!",
        "Your finger is warm, but we need to see some real mechanical stress on those switches.",
        "Perfect speed for clicking 'Next' on a software installer.",
        "Your left-click is consistent, but so is a grandfather clock. Let's shatter the tempo!",
        "Ordinary human speed. Perfect for an NPC, but you want to be the main character, right?",
        "Your mouse brand is highly disappointed in this standard office pacing. Shake that forearm!",
        "Solid! You have officially achieved the speed of an average office clerk.",
        "Your finger is moving, but you're still in comfortable cruise control.",
        "Nice steady clacking, but we need a rapid-fire mechanical storm!",
        "You click like a casual gamer playing a cozy farming simulator. Speed up!",
        "Your left-click is consistent, but so is a grandfather clock. Let's break the tempo!",
        "Your wrist is doing some work, but your arm looks like it's daydreaming.",
        "Average human speed confirmed. Your mouse has earned its participation award.",
        "Not bad, but your mouse is yawn-detecting. Let's see some forearm vibration!",
        "Your mouse brand is highly disappointed in this standard office pacing. Lock that wrist!",
        "This is the absolute baseline of competitive clicking. Go faster!"
      );
    } else if (cps >= 7 && cps < 10) {
      choices.push(
        "Impressive! Are you drinking straight espresso or is your mouse possessed?",
        "7-9 CPS. Now we're talking! Your finger is a blur, or at least a smudged line.",
        "You're clicking faster than a teenager texting their crush. Keep it up!",
        "Your finger is starting to look like a high-speed piston. Almost impressive!",
        "That's a solid vibration. Are you using jitter-clicking or just sheer panic?",
        "Your mouse switch is starting to warm up. I smell a faint hint of plastic friction.",
        "You click faster than an auctioneer speaks! Very respectable speed.",
        "That's some high-fidelity clicking right there. You've definitely done this before.",
        "Your index finger has its own heartbeat now. You're entering the danger zone!",
        "Excellent rate! You can easily win a standard Minecraft bridge fight with this.",
        "The mouse switch is singing. You're entering the speed zone!",
        "Your forearm is starting to tense. Let the click flow through you!",
        "Great speed! The local mouse community is highly impressed by your finger agility.",
        "You click fast enough to trigger double-clicks on an old office mouse.",
        "Solid performance! You are definitely ready for competitive clicking action.",
        "Your mouse switches are clacking in rapid-fire succession. Very snappy!",
        "Your index finger is moving with real purpose. Excellent speed runner potential!",
        "A highly solid click rate. You're definitely not a casual clicker anymore.",
        "Very snappy clacking! Your switches are sounding like a miniature machine gun.",
        "Nice! That's a highly competitive tempo. Your mouse pad is feeling the friction.",
        "You click like a professional stenographer during a highly controversial trial.",
        "Your hand is starting to twitch like you've unlocked a secret coffee reservoir.",
        "Great speed! You've definitely mastered the basic click-vibration technique.",
        "Your index finger is moving with real purpose. Excellent speed runner potential!",
        "The mouse switch is singing a very snappy tune. Keep the tempo steady!",
        "Solid performance! You are definitely ready for competitive PvP lobbies.",
        "Your mechanical switches are clacking in rapid-fire succession. Very crisp!",
        "Awesome finger agility! Your mouse switch is getting a legitimate workout."
      );
    } else if (cps >= 10 && cps < 15) {
      choices.push(
        "Whoa! Call the fire department, your left-click button is starting to smoke!",
        "10-14 CPS! You're clicking like a caffeinated woodpecker!",
        "Your mouse button is begging for mercy. Don't stop now!",
        "Are you butterfly clicking, or does your hand naturally tremble like an earthquake?",
        "You're clicking faster than light travels in a dense block of glass. Incredible!",
        "This is some professional-grade hand spasms. Your mouse is literally sweating.",
        `${Math.round(cps)} CPS? You've graduated from normal clicking to becoming a biological machine.`,
        "Your finger is tapping so fast, it's starting to sound like a mini machine gun.",
        "Is that a hand on the mouse or a highly active massage gun? Spectacular!",
        "You're clicking faster than a keyboard warrior writing a paragraph-long rage comment.",
        "Those mechanical switches are operating at maximum thermal design power!",
        "Your double-finger drumming technique is highly optimized. Insane rate!",
        "The mouse sensor is starting to lose track of your sheer mechanical speed.",
        "Did you replace your index finger with a high-frequency pneumatic piston?",
        "The microswitches in your mouse are begging for a splash of liquid nitrogen.",
        "Omron and Kailh switches are singing your praises. Brilliant vibration control!",
        "Your hand is moving so fast it looks like a low-framerate video. Exceptional!",
        "This is the sweet spot of competitive Minecraft PvP click speed. Simply outstanding.",
        "Absolutely majestic speed! Your finger looks like a physical blur on the switch.",
        "Are you sure you aren't using a high-frequency reciprocating saw on your mouse?",
        "That is some elite-tier clicking speed. You are definitely a threat to PvP players.",
        "Your index finger is moving at a frequency that could scramble local radio signals.",
        "Outstanding! Your mouse button is feeling a relentless barrage of mechanical strikes.",
        "Your hand is vibrating like a high-frequency tuning fork. Magnificent energy!",
        "The microswitches in your mouse are begging for a splash of liquid nitrogen.",
        "Omron and Kailh switches are singing your praises. Brilliant vibration control!",
        "Did you replace your index finger with a high-frequency pneumatic piston?",
        "Your hand is moving so fast it looks like a low-framerate video. Exceptional!"
      );
    } else if (cps >= 15 && cps < 20) {
      choices.push(
        "Insane speed! Are you secretly vibrating at a molecular level?",
        "15-19 CPS! Are you even human, or is this some kind of cybernetic enhancement?",
        "Your mouse switch is begging for its union representative. Phenomenal speed!",
        "You click faster than the speed of rumor propagation. Absolutely wild!",
        "Are you drag-clicking, or did you attach a mini-jackhammer to your knuckle?",
        "Your mouse is about to file a lawsuit for physical harassment. Keep vibrating!",
        "If you clicked any faster, you'd rip a hole in the fabric of the space-time continuum.",
        "You must have a macro built into your actual biological nervous system. Insane!",
        "That is the clicking speed of a star collapsing into a black hole. Supernova!",
        "Your hand is vibrating so fast, you might accidentally clip through solid matter.",
        "Are you using some forbidden drag-click tape or is your hand just a blur?",
        "Omron/Kailh switches are screaming in absolute terror right now.",
        "Your hand looks like a high-speed vibration plate. Truly magnificent click rate!",
        "Are you a professional rhythm game player or is your hand possessed by a clicking demon?",
        "This is speedrunner level! You could probably skip entire cutscenes with this rate.",
        "Your double-clicking threshold is completely shattered. Pure physical mastery!",
        "If we attached a dynamo to your mouse button, we could charge a Tesla. Outstanding!",
        "Your local computer store is celebrating your finger speed because you'll need a new mouse soon.",
        "This level of clicking should require a licensed permit for mechanical demolition!",
        "Are your fingers made of pure steel? Your mouse's copper spring is literally weeping.",
        "You are clicking so fast you are starting to create localized sonic booms in your room.",
        "Your index finger has bypassed biological muscle limits. Are you a synthetic android?",
        "Absolutely legendary speed! The microswitches are begging for a fire extinguisher.",
        "You are registering clicks faster than the game server's anti-cheat can verify!",
        "Your wrist is vibrating with the raw frequency of a supercar's crankshaft at 8000 RPM.",
        "Simply phenomenal! We might need to recalibrate our speed limits just for your hand.",
        "Your mouse button has achieved full molecular escape velocity. Pure mechanical friction fire!",
        "That's not clicking, that's a high-frequency drum roll performed by a cyborg woodpecker."
      );
    } else {
      choices.push(
        "⚡ Godlike PC Tier! Your left-click has officially entered a state of quantum superposition. Razer's engineering team is crying in the corner.",
        "⚡ Godlike PC Tier! You clicked 20+ times per second. Are you abusing a drag-click tape, or did you plug in an industrial massager?",
        "⚡ Godlike PC Tier! The copper leaf spring in your switch has welded itself shut from pure kinetic friction. Magnificent!",
        "⚡ Godlike PC Tier! You are clicking so fast, the polling rate is struggling to keep up. Turn on your RGB to cooling mode.",
        "⚡ Godlike PC Tier! Is your finger an Omron-certified drill? Your mouse switch is filing for early retirement.",
        "⚡ Godlike PC Tier! Absolute God Tier! You aren't just clicking, you are literally talking in binary to the USB controller.",
        "⚡ Godlike PC Tier! Your hand is vibrating at 500Hz. If we attach an alternator, we can power our entire database cluster.",
        "⚡ Godlike PC Tier! You're clicking faster than a keyboard warrior typing their 10,000-word essay about why they are not bad.",
        "⚡ Godlike PC Tier! You are registering double-clicks at a rate that defies modern physics. Absolute mouse abuse!",
        "⚡ Godlike PC Tier! Your microswitches are tensing up on their own. Beautiful alternate-drumming velocity!",
        "⚡ Godlike PC Tier! Stop! The local gravity field cannot sustain this level of mechanical vibration!",
        "⚡ Godlike PC Tier! Your left mouse button has melted into liquid gold. You are the Chosen One of clicking!",
        "⚡ Godlike PC Tier! Your index finger has achieved the legendary status of a biological Gatling gun!",
        "⚡ Godlike PC Tier! Did you spill Red Bull directly on your forearm, or is your hand a physical jackhammer?",
        "⚡ Godlike PC Tier! The microswitch contacts are operating at a rate that violates several local laws of thermodynamics.",
        "⚡ Godlike PC Tier! Your mechanical click rate is so fast, the USB polling rate has entered a state of panic.",
        "⚡ Godlike PC Tier! Are you double-finger drumming or did you attach a high-frequency massage gun to your hand? Insane!",
        "⚡ Godlike PC Tier! The mouse switches are praying to the mechanical gods for early retirement. Magnificent velocity!",
        "⚡ Godlike PC Tier! You are clicking so fast that your mouse has declared you its supreme master. Absolute legend!",
        "⚡ Godlike PC Tier! There are physics professors studying your hand muscles to rewrite kinetic theory.",
        "⚡ Godlike PC Tier! That's not a finger, that's a cybernetic piston powered by a micro-nuclear reactor.",
        "⚡ Godlike PC Tier! Your left mouse button has melted into liquid gold. You are the Chosen One of clicking!"
      );
    }
  }

  const filtered = choices.filter(choice => choice !== lastMessage);
  const finalChoices = filtered.length > 0 ? filtered : choices;

  const randomIndex = Math.floor(Math.random() * finalChoices.length);
  return finalChoices[randomIndex];
}

const STORAGE_KEY_PREFIX = "cps-test-best-";

function getHighScore(duration: number): number {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${duration}`);
    return saved ? parseFloat(saved) : 0;
  } catch {
    return 0;
  }
}

function updateHighScore(duration: number, score: number): number {
  try {
    const currentBest = getHighScore(duration);
    if (score > currentBest) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${duration}`, score.toString());
      return score;
    }
    return currentBest;
  } catch {
    return score;
  }
}

interface StatsCardProps {
  label: string;
  value: string;
  suffix?: string;
}

function StatsCard({ label, value, suffix = "" }: StatsCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-3 sm:py-4 shadow-sm w-full">
      <span className="text-xl font-bold text-slate-800 dark:text-white sm:text-2xl">
        {value}
        {suffix && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{suffix}</span>}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

interface DurationSelectorProps {
  selected: number;
  disabled: boolean;
  onSelect: (duration: number) => void;
  isDarkMode: boolean;
}

function DurationSelector({ selected, disabled, onSelect, isDarkMode }: DurationSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {DURATIONS.map(duration => {
        const isSelected = duration === selected;
        return (
          <button
            key={duration}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(duration)}
            className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-base ${
              isSelected
                ? "scale-105 theme-active-key text-white shadow-lg"
                : isDarkMode
                  ? "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200/60"
            } ${disabled && !isSelected ? "cursor-not-allowed opacity-40" : ""} ${
              disabled && isSelected ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {duration === -1 ? "Manual" : duration === 60 ? "1 Min" : `${duration}s`}
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   STANDARD LEFT-CLICK CPS TEST COMPONENT
   ========================================================================== */
interface CPSTestProps {
  onAddHistory: (testType: string, duration: number, score: number, rating: string) => void;
  isDarkMode: boolean;
  isTouchDevice: boolean;
}

export function CPSTest({ onAddHistory, isDarkMode, isTouchDevice }: CPSTestProps) {
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [liveCps, setLiveCps] = useState(0);
  const [finalCps, setFinalCps] = useState(0);
  const [highScore, setHighScore] = useState(() => getHighScore(duration));
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [humorousMessage, setHumorousMessage] = useState("");

  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const rippleIdCounter = useRef(0);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  const cancelTimer = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  }, []);

  const handleFinished = useCallback((totalSeconds: number) => {
    cancelTimer();
    const clicks = clicksRef.current;
    const cps = totalSeconds > 0 ? clicks / totalSeconds : 0;
    
    setFinalCps(cps);
    setClickCount(clicks);
    setTimeLeft(totalSeconds);
    setStatus("finished");
    setHumorousMessage(prev => getHumorousLine(cps, prev, isTouchDevice));

    const prevHighScore = getHighScore(duration);
    const updatedBest = updateHighScore(duration, cps);
    
    const rank = getRating(cps).label;
    onAddHistory("Standard Left Click", totalSeconds, cps, rank);

    setIsNewHighScore(cps > 0 && cps > prevHighScore);
    setHighScore(updatedBest);
  }, [cancelTimer, duration, onAddHistory]);

  useEffect(() => {
    return () => cancelTimer();
  }, [cancelTimer]);

  useEffect(() => {
    if (status === "idle") {
      setHighScore(getHighScore(duration));
      setTimeLeft(duration === -1 ? 0 : duration);
    }
  }, [duration, status]);

  const runTimerTick = useCallback((totalSeconds: number) => {
    if (startTimeRef.current === null) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;

    if (totalSeconds === -1) {
      setTimeLeft(elapsed);
      setLiveCps(elapsed > 0 ? clicksRef.current / elapsed : 0);
      animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(totalSeconds));
      return;
    }

    const remaining = totalSeconds - elapsed;

    if (remaining <= 0) {
      handleFinished(totalSeconds);
      return;
    }

    setTimeLeft(remaining);
    setLiveCps(elapsed > 0 ? clicksRef.current / elapsed : 0);
    animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(totalSeconds));
  }, [handleFinished]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdCounter.current++;
    
    setRipples(prev => [...prev, { id, x, y }]);
    
    window.setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  const handlePadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Standard left-click logic
    if (e.button !== 0) return;
    createRipple(e);
    
    if (status === "idle") {
      clicksRef.current = 1;
      setClickCount(1);
      setLiveCps(0);
      startTimeRef.current = performance.now();
      setStatus("running");
      animFrameIdRef.current = requestAnimationFrame(() => runTimerTick(duration));
    } else if (status === "running") {
      clicksRef.current += 1;
      setClickCount(clicksRef.current);
    }
  };

  const handleReset = () => {
    cancelTimer();
    startTimeRef.current = null;
    clicksRef.current = 0;
    setClickCount(0);
    setLiveCps(0);
    setFinalCps(0);
    setIsNewHighScore(false);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    lastRightClickRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleReset();
        } else {
          lastRightClickRef.current = now;
        }
      }
    }
  };

  const handleSelectDuration = (newDuration: number) => {
    if (status !== "running") {
      setDuration(newDuration);
      cancelTimer();
      startTimeRef.current = null;
      clicksRef.current = 0;
      setClickCount(0);
      setLiveCps(0);
      setFinalCps(0);
      setIsNewHighScore(false);
      setTimeLeft(newDuration === -1 ? 0 : newDuration);
      setStatus("idle");
      setHumorousMessage("");
    }
  };

  const handleStopManual = () => {
    if (status !== "running" || startTimeRef.current === null) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    handleFinished(elapsed);
  };

  const currentCps = status === "finished" ? finalCps : liveCps;
  const currentRating = getRating(currentCps);
  const progressRatio = duration === -1
    ? (status === "running" ? (timeLeft % 2) / 2 : 0)
    : (status === "idle" ? 0 : Math.min(1, 1 - timeLeft / duration));

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <DurationSelector
        selected={duration}
        disabled={status === "running"}
        onSelect={handleSelectDuration}
        isDarkMode={isDarkMode}
      />

      <div className="grid w-full grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          label={duration === -1 ? (status === "finished" ? "Total Time" : "Elapsed Time") : "Time Left"}
          value={status === "idle" ? (duration === -1 ? "0.00" : duration.toFixed(0)) : timeLeft.toFixed(2)}
          suffix="s"
        />
        <StatsCard
          label="Clicks"
          value={clickCount.toString()}
        />
        <StatsCard
          label={status === "finished" ? "Final CPS" : "Live CPS"}
          value={currentCps.toFixed(2)}
        />
      </div>

      <div className="relative w-full">
        {/* Progress bar */}
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full theme-bg-gradient transition-[width] duration-100 ease-linear"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>

        {/* Clicking Area button */}
        <button
          type="button"
          onContextMenu={(e) => e.preventDefault()}
          onClick={handlePadClick}
          onMouseDown={handleMouseDown}
          className={`relative flex min-h-[20rem] h-auto py-8 sm:py-10 w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-2 text-center transition-all duration-150 active:scale-[0.98] ${
            status === "running"
              ? "theme-running-pad cursor-pointer"
              : status === "finished"
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 cursor-pointer"
                : "border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 theme-hover-pad hover:bg-slate-50 dark:hover:bg-white/[0.07] shadow-sm cursor-pointer"
          }`}
        >
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full bg-slate-500/20 dark:bg-white/40"
              style={{ left: ripple.x, top: ripple.y }}
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
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </div>
          )}

          {status === "idle" && (
            <div className="space-y-2 px-6">
              <p className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">Click to Start</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {duration === -1 ? "Manual timer mode" : `${duration} second challenge`} · timer starts on first click
              </p>
            </div>
          )}

          {status === "running" && (
            <div className="space-y-1 px-6">
              <p className="text-6xl font-black tracking-tight text-slate-800 dark:text-white sm:text-7xl">
                {clickCount}
              </p>
              <p className="text-sm font-medium uppercase tracking-widest theme-text-from-dynamic">
                clicks
              </p>
            </div>
          )}

          {status === "finished" && (
            <div className="space-y-3 px-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                {duration === -1 ? "Stopped!" : "Time's up!"}
              </p>
              <p className="text-6xl font-black tracking-tight text-slate-800 dark:text-white sm:text-7xl">
                {finalCps.toFixed(2)}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">clicks per second</p>
              <p className={`text-lg font-bold ${currentRating.color}`}>{currentRating.label}</p>
              <p className="mt-2 text-xs italic text-amber-800 dark:text-amber-200 max-w-sm mx-auto bg-amber-500/5 dark:bg-amber-400/10 py-2 px-3 rounded-xl border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed">
                "{humorousMessage}"
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold theme-pulse-badge px-3 py-1.5 rounded-full inline-block animate-pulse">
                  {isTouchDevice ? "Tap the Reset button to try again!" : "Double tap Right-Click to reset"}
                </span>
              </div>
              {isNewHighScore && (
                <p className="animate-pulse text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-300">
                  New Best Score!
                </p>
              )}
            </div>
          )}
        </button>

        {/* Manual Mode Stop Button */}
        {duration === -1 && (
          <div className="mt-4 w-full">
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
      </div>

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} CPS</span>
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN EXPORT APP
   ========================================================================== */
export default function App() {
  const [activeView, setActiveView] = useState<ViewType>("cps");
  const [cameFromMenu, setCameFromMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("cps-test-theme");
      return stored ? stored === "dark" : true;
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("cps-test-history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("cps-test-colorscheme");
      return stored && THEMES.some(t => t.id === stored) ? stored : "cosmic";
    } catch {
      return "cosmic";
    }
  });

  const [selectedThemeId, setSelectedThemeId] = useState(activeTheme);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
        setSelectedThemeId(activeTheme);
      }
    }
    if (isThemeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeDropdownOpen, activeTheme]);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 
        ("ontouchstart" in window) || 
        (navigator.maxTouchPoints > 0) || 
        (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
  }, []);

  // Keep body styling in sync with the theme
  useEffect(() => {
    try {
      localStorage.setItem("cps-test-theme", isDarkMode ? "dark" : "light");
    } catch {}

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      document.body.style.backgroundColor = "#0b0b16";
      document.body.style.color = "#ffffff";
    } else {
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#f8fafc"; // Slate 50
      document.body.style.color = "#0f172a"; // Slate 900
    }
  }, [isDarkMode]);

  // Sync state navigation using browser popstate
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state) {
        if (state.view !== undefined) setActiveView(state.view);
        if (state.cameFromMenu !== undefined) setCameFromMenu(state.cameFromMenu);
      } else {
        setActiveView("cps");
        setCameFromMenu(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: "cps", cameFromMenu: false, historyIndex: 0 }, "");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Always scroll to the top of the page when changing active test/view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeView]);

  const navigateToView = (view: ViewType) => {
    let nextCameFromMenu = cameFromMenu;
    if (activeView === "menu" && view !== "cps" && view !== "menu") {
      nextCameFromMenu = true;
    } else if (view === "cps" || view === "menu") {
      nextCameFromMenu = false;
    }
    setCameFromMenu(nextCameFromMenu);

    const currentState = window.history.state || {};
    const currentIdx = currentState.historyIndex || 0;

    const movingToCps = (view === "cps");
    const movingToMenuFromSubtest = (view === "menu" && activeView !== "cps");

    if ((movingToCps && currentIdx > 0) || (movingToMenuFromSubtest && currentIdx > 1)) {
      setActiveView(view);
      window.history.back();
      return;
    }

    setActiveView(view);
    const nextIdx = view === "cps" ? 0 : currentIdx + 1;

    if (view === "cps") {
      window.history.replaceState({ ...currentState, view, cameFromMenu: nextCameFromMenu, historyIndex: 0 }, "");
    } else {
      window.history.pushState({ ...currentState, view, cameFromMenu: nextCameFromMenu, historyIndex: nextIdx }, "");
    }
  };

  const handleAddHistory = (testType: string, duration: number, score: number, rating: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      testType,
      duration: parseFloat(duration.toFixed(2)),
      score,
      rating
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
      try {
        localStorage.setItem("cps-test-history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("cps-test-history");
    } catch {}
  };

  const getActiveTitle = () => {
    switch (activeView) {
      case "spacebar": return <>Spacebar <span className="theme-text-gradient">Counter</span></>;
      case "rightclick": return <>Right Click <span className="theme-text-gradient">Test</span></>;
      case "polling": return <>Mouse Polling <span className="theme-text-gradient">Rate</span></>;
      case "ghosting": return <>Key Ghosting <span className="theme-text-gradient">Test</span></>;
      case "jitter": return <>Jitter Click <span className="theme-text-gradient">Coach</span></>;
      case "butterfly": return <>Butterfly Click <span className="theme-text-gradient">Coach</span></>;
      case "reaction": return <>Reaction Time <span className="theme-text-gradient">Test</span></>;
      case "kohi": return <span className={`font-mono ${isDarkMode ? "text-emerald-400" : "text-emerald-700 font-bold"}`}>[KOHI RETRO TEST]</span>;
      case "dragclick": return <>Drag Click <span className="theme-text-gradient">Test</span></>;
      case "doubleclick": return <>Double Click <span className="theme-text-gradient">Test</span></>;
      case "aim": return <>Aim <span className="theme-text-gradient">Trainer</span></>;
      case "scroll": return <>Scroll Speed <span className="theme-text-gradient">Test</span></>;
      case "menu": return <>Speed <span className="theme-text-gradient">Trials</span></>;
      default: return <>CPS <span className="theme-text-gradient">Test</span></>;
    }
  };

  const getActiveDesc = () => {
    switch (activeView) {
      case "spacebar": return "Measure spacebar hits and switch rebound latency. Keep mashing the spacebar until the time expires!";
      case "rightclick": return "Disables standard context menu blocks. Perfect for testing right-clicking speed and Minecraft bridge-fight setup.";
      case "polling": return "Measures cursor update reports per second (Hz) in real time. Simply swipe your cursor rapidly inside the trackpad.";
      case "ghosting": return "Check your rollover limits. Hold down as many simultaneous keyboard keys as possible to see if any are locked out.";
      case "jitter": return "Refine wrist tremor and muscle tension intervals to perfect jitter clicking frequency.";
      case "butterfly": return "Analyze timing intervals and consistency between alternate drumming index-and-middle clicks.";
      case "reaction": return "Traffic-light style neural reflex benchmark. Click the target card as soon as the light turns green!";
      case "kohi": return "Authentic pixel-art CRT terminal clickpad reminiscent of nostalgia Minecraft Badlion speed drills.";
      case "dragclick": return "Tests your mouse's drag-click potential — measures how many clicks your specific mouse switch can generate via the drag technique.";
      case "doubleclick": return "Checks for unwanted double-click registration — a common mechanical switch failure as mice age.";
      case "aim": return "Click randomly-appearing targets as fast and accurately as possible. Test precision and speed.";
      case "scroll": return "Measures scroll wheel speed and consistency. Track steps per second and scrolling feedback.";
      case "menu": return "Challenge yourself with unique custom mouse and keyboard tests designed to push mechanical thresholds and hand reflex speeds.";
      default: return "Determine clicks per second using left-click. Click once inside the target area to begin, and go as fast as you can!";
    }
  };

  const currentTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  const themeStyles = {
    '--theme-from': currentTheme.colors.from,
    '--theme-to': currentTheme.colors.to,
    '--theme-from-300': currentTheme.colors.from300,
    '--theme-to-400': currentTheme.colors.to400,
    '--theme-from-500': currentTheme.colors.from500,
    '--theme-to-500': currentTheme.colors.to500,
    '--theme-to-600': currentTheme.colors.to600,
    '--theme-from-600': currentTheme.colors.from600,
    '--theme-from-500-60': currentTheme.colors.from500_60,
    '--theme-from-600-20': currentTheme.colors.from600_20,
    '--theme-to-600-20': currentTheme.colors.to600_20,
    '--theme-center-10': currentTheme.colors.center_10,
    '--theme-shadow-pad': currentTheme.colors.shadow_pad,
    '--theme-shadow-btn': currentTheme.colors.shadow_btn,
    '--theme-from-400-50': currentTheme.colors.from400_50,
    '--theme-to-500-20': currentTheme.colors.to500_20,
    '--theme-to-500-5': currentTheme.colors.to500_5,
    '--theme-to-500-35': currentTheme.colors.to500_35,
  } as React.CSSProperties;

  return (
    <div 
      style={themeStyles}
      className={`relative min-h-screen overflow-hidden ${activeView === "kohi" && isDarkMode ? "bg-black" : isDarkMode ? "bg-[#0b0b16] text-white" : "bg-slate-50 text-slate-900"}`}
    >
      
      {/* Decorative ambient blurred layout */}
      {!(activeView === "kohi" && isDarkMode) && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full theme-ambient-left blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full theme-ambient-right blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full theme-ambient-center blur-3xl" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 sm:py-12">
        
        {/* Top Control Header */}
        <div className="flex w-full max-w-7xl items-center justify-between border-b pb-4 mb-6 border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            {activeView !== "cps" && (
              <button
                onClick={() => {
                  if (activeView !== "cps" && activeView !== "menu") {
                    navigateToView("menu");
                  } else {
                    navigateToView("cps");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors sm:px-4.5 sm:py-2.5 sm:text-sm ${
                  isDarkMode ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5 theme-text-from" /> Back
              </button>
            )}
            <button
              onClick={() => navigateToView(activeView === "menu" ? "cps" : "menu")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors sm:px-4.5 sm:py-2.5 sm:text-sm ${
                activeView === "menu"
                  ? "theme-bg-gradient text-white shadow-md"
                  : isDarkMode 
                    ? "bg-white/5 hover:bg-white/10 text-slate-300" 
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              }`}
            >
              <Grid className="h-3.5 w-3.5 sm:h-5 sm:w-5 theme-text-to" /> More Tests
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Detection Badge */}
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border sm:px-4 sm:py-2.5 sm:text-xs ${
              isDarkMode 
                ? "bg-white/5 border-white/5 text-slate-300" 
                : "bg-white border-slate-200 text-slate-600 shadow-sm"
            }`} title={isTouchDevice ? "Touchscreen input detected" : "Mouse/keyboard input detected"}>
              {isTouchDevice ? (
                <>
                  <Smartphone className="h-3.5 w-3.5 sm:h-5 sm:w-5 theme-text-from" />
                  <span>Touch</span>
                </>
              ) : (
                <>
                  <Laptop className="h-3.5 w-3.5 sm:h-5 sm:w-5 theme-text-to" />
                  <span>PC</span>
                </>
              )}
            </div>

            {/* Theme / Color Scheme Brush Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => {
                  if (isThemeDropdownOpen) {
                    setSelectedThemeId(activeTheme); // revert preview on toggle close
                  }
                  setIsThemeDropdownOpen(!isThemeDropdownOpen);
                }}
                className="rounded-lg p-1.5 sm:p-2.5 transition-all duration-200 cursor-pointer border flex items-center justify-center shadow-sm"
                style={{
                  color: isDarkMode ? 'var(--theme-from-300)' : 'var(--theme-from-500)',
                  borderColor: isDarkMode ? 'var(--theme-from-600-20)' : 'var(--theme-from-500-60)',
                  backgroundColor: isThemeDropdownOpen || selectedThemeId !== activeTheme
                    ? 'var(--theme-center-10)'
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 1)',
                  boxShadow: isThemeDropdownOpen || selectedThemeId !== activeTheme
                    ? '0 0 10px var(--theme-to-500-20)'
                    : undefined
                }}
                title="Change Color Scheme"
              >
                <Paintbrush className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {isThemeDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl border p-3.5 shadow-xl z-50 animate-fade-in ${
                  isDarkMode 
                    ? "bg-slate-900/95 border-white/10 text-white backdrop-blur-md" 
                    : "bg-white border-slate-200 text-slate-800 shadow-slate-200/50"
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                    Color Schemes
                  </h4>
                  {!isDarkMode && (
                    <div className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2.5 leading-tight text-center animate-pulse">
                      - switch to dark mode for best experience
                    </div>
                  )}
                  <div className="theme-list-scroll space-y-1.5 max-h-[148px] overflow-y-auto mb-3 pr-1.5 scroll-smooth">
                    {THEMES.map((theme) => {
                      const isSelected = selectedThemeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedThemeId(theme.id)}
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? isDarkMode
                                ? "bg-white/10 text-white font-bold"
                                : "bg-slate-100 text-slate-950 font-bold"
                              : isDarkMode
                                ? "text-slate-300 hover:bg-white/5"
                                : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {/* Color Preview Circle */}
                            <span 
                              className="h-3 w-3 rounded-full border border-white/10" 
                              style={{ background: theme.previewBg }}
                            />
                            <span>{theme.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] uppercase px-1 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Save Changes Button */}
                  <button
                    onClick={() => {
                      setActiveTheme(selectedThemeId);
                      try {
                        localStorage.setItem("cps-test-colorscheme", selectedThemeId);
                      } catch {}
                      setIsThemeDropdownOpen(false);
                    }}
                    disabled={selectedThemeId === activeTheme}
                    className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      selectedThemeId === activeTheme
                        ? "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent"
                        : "theme-bg-gradient hover:opacity-90 active:scale-[0.98] text-white shadow-md border border-transparent"
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`rounded-lg p-1.5 sm:p-2.5 transition-colors cursor-pointer border ${
                isDarkMode 
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/5" 
                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              }`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5 theme-text-to-dynamic" />}
            </button>
          </div>
        </div>

        {/* Content Header */}
        <header className="mb-8 flex flex-col items-center gap-2.5 text-center sm:mb-10 max-w-2xl">
          <div 
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
              isDarkMode 
                ? "bg-white/5" 
                : "bg-slate-100 shadow-2xs"
            }`}
            style={{
              borderColor: isDarkMode ? 'var(--theme-from-600-20)' : 'var(--theme-from-500-60)',
              color: isDarkMode ? 'var(--theme-from-300)' : 'var(--theme-from-500)',
            }}
          >
            <span 
              className="h-1.5 w-1.5 animate-pulse rounded-full" 
              style={{ backgroundColor: isDarkMode ? 'var(--theme-from)' : 'var(--theme-from-500)' }}
            />
            CPS Precision Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-800 dark:text-white">
            {getActiveTitle()}
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-medium"}`}>
            {getActiveDesc()}
          </p>
        </header>

        {/* Responsive Grid Layout Container */}
        <div className="w-full max-w-7xl">
          {activeView === "menu" ? (
            <div className="mx-auto flex flex-col items-center">
              <main className="flex w-full flex-1 flex-col items-center">
                <MoreTestsMenu onSelect={navigateToView} isDarkMode={isDarkMode} />
              </main>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              {/* Left Column (8-col on desktop): Active Test component */}
              <div className="lg:col-span-8 flex flex-col items-center gap-6 w-full">
                <main className="w-full flex flex-col items-center">
                  {activeView === "cps" && <CPSTest onAddHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "spacebar" && <SpacebarTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "rightclick" && <RightClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "polling" && <PollingRateTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />}
                  {activeView === "ghosting" && <KeyGhostingTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />}
                  {activeView === "jitter" && <JitterTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "butterfly" && <ButterflyTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "reaction" && <ReactionTimeTest addHistory={handleAddHistory} isDarkMode={isDarkMode} />}
                  {activeView === "kohi" && <KohiTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "dragclick" && <DragClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "doubleclick" && <DoubleClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "aim" && <AimTrainer addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "scroll" && <ScrollTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                </main>

                {/* If dragclick or reaction, render HistoryList below the testing box */}
                {(activeView === "dragclick" || activeView === "reaction") && (
                  <div className="w-full mt-2">
                    <HistoryList
                      history={history}
                      onClear={handleClearHistory}
                      isDarkMode={isDarkMode}
                      activeView={activeView}
                      isTouchDevice={isTouchDevice}
                    />
                  </div>
                )}
              </div>

              {/* Right Column (4-col on desktop): History list & Ranking showcase */}
              <div className="lg:col-span-4 w-full space-y-6 lg:sticky lg:top-6">
                {/* History Log Panel */}
                {!(activeView === "dragclick" || activeView === "reaction") && (
                  <HistoryList
                    history={history}
                    onClear={handleClearHistory}
                    isDarkMode={isDarkMode}
                    activeView={activeView}
                    isTouchDevice={isTouchDevice}
                  />
                )}

                {/* Standard Rating Tiers Showcase */}
                {(activeView === "cps" || activeView === "butterfly" || activeView === "jitter" || activeView === "rightclick" || activeView === "dragclick") && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-4">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        CPS Ranking Levels
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {RATING_TIERS.map(tier => (
                        <div
                          key={tier.label}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all ${
                            isDarkMode 
                              ? "border-white/5 bg-white/[0.02]" 
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-xs font-bold ${tier.color}`}>{tier.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {tier.max !== undefined ? `${tier.min}-${tier.max}` : `${tier.min}+`} CPS
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Retro Kohi Rating Tiers Showcase */}
                {activeView === "kohi" && (
                  <section className={`w-full font-mono rounded-2xl border-2 p-5 ${
                    isDarkMode
                      ? "bg-black text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-white text-emerald-900 border-emerald-500/50 shadow-md"
                  }`}>
                    <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${
                      isDarkMode ? "border-emerald-500/30" : "border-emerald-500/20"
                    }`}>
                      <span className={`text-xs font-bold uppercase tracking-widest ${
                        isDarkMode ? "text-emerald-500" : "text-emerald-700"
                      }`}>[RANKING_MATRIX]</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {RATING_TIERS.map(tier => (
                        <div
                          key={tier.label}
                          className={`flex flex-col items-center gap-1 rounded border px-2 py-2.5 text-center ${
                            isDarkMode
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : "border-emerald-500/25 bg-emerald-50/50"
                          }`}
                        >
                          <span className={`font-bold uppercase ${
                            isDarkMode ? "text-emerald-300" : "text-emerald-800"
                          }`}>{tier.label}</span>
                          <span className={`text-[10px] ${
                            isDarkMode ? "text-emerald-500/70" : "text-emerald-700/70"
                          }`}>
                            {tier.max !== undefined ? `${tier.min}-${tier.max}` : `${tier.min}+`} CPS
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Spacebar Counter Info Card */}
                {activeView === "spacebar" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Spacebar Counter Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      A spacebar counter measures how many times you can press the spacebar within a set time period (usually 1, 5, 10, or 60 seconds). It's popular among Minecraft players for practicing bunny-hopping (auto-jumping to gain movement speed) and is also used as a general reflex and stamina test for your pressing speed.
                    </p>
                  </section>
                )}

                {/* Reaction Time Rating Tiers Showcase */}
                {activeView === "reaction" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-1.5 mb-4">
                      <Trophy className="h-4 w-4 text-rose-500" />
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Reaction Ranking Levels
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {REACTION_TIERS_DATA.filter(tier => tier.label.toLowerCase() !== "godlike").reverse().map(tier => (
                        <div
                          key={tier.label}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all ${
                            isDarkMode 
                              ? "border-white/5 bg-white/[0.02]" 
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-xs font-bold ${tier.color}`}>{tier.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            {tier.max === Infinity ? `${tier.min}ms+` : `${tier.min}-${tier.max}ms`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reaction Time Info Card */}
                {activeView === "reaction" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Reaction Time Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      A reaction time test measures how quickly you respond to a visual cue, usually a screen changing color, and click or press a key. Your result is shown in milliseconds (ms) — the average human reaction time is around 200–250ms. Gamers, especially in FPS and competitive titles, use this test to gauge and train their reflexes.
                    </p>
                  </section>
                )}

                {/* Key Ghosting Info Card */}
                {activeView === "ghosting" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Key Ghosting Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      A key ghosting test checks how many keys your keyboard can register accurately when pressed simultaneously. "Ghosting" happens when a keyboard fails to detect certain key combinations due to hardware limitations, which can be a problem in fast-paced games requiring multiple simultaneous inputs (like WASD + Shift + Space). This test helps you find out if your keyboard has full N-key rollover (NKRO) or is limited by ghosting.
                    </p>
                  </section>
                )}

                {/* Polling Rate Info Card */}
                {activeView === "polling" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Polling Rate Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      A polling rate test measures how often your mouse reports its position to your computer, measured in Hz (times per second). A higher polling rate (e.g., 1000Hz vs 125Hz) means more frequent updates and lower input lag, which can matter for competitive gaming. This test helps you verify your mouse is running at its advertised polling rate.
                    </p>
                  </section>
                )}

                {/* Drag Click Info Card */}
                {activeView === "dragclick" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Drag Click Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Tests your mouse's drag-click potential — measures how many clicks your specific mouse switch can generate via the drag technique. Since results depend heavily on mouse hardware (switch type matters a lot here), this doubles as a mouse-compatibility checker, which is a good SEO angle ("does my mouse support drag clicking").
                    </p>
                  </section>
                )}

                {/* Double Click Info Card */}
                {activeView === "doubleclick" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Double Click Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Checks for unwanted double-click registration — a common mechanical switch failure as mice age. Beyond checking for accidental double-click issues, some mice with sensitive micro-switches can register a single physical press as two rapid clicks — and skilled clickers have learned to use this intentionally as a technique to push CPS scores higher than normal single-clicking allows. Useful, practical tool (not just a game stat) that pulls in a different search audience than your click-speed tests.
                    </p>
                  </section>
                )}

                {/* Aim Trainer Info Card */}
                {activeView === "aim" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is an Aim Trainer?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Click randomly-appearing targets to test raw mechanical hand-eye reflex time and precision tracking, simulating competitive FPS target-switching routines. Tracks accuracy %, average time-to-hit, and misses.
                    </p>
                  </section>
                )}

                {/* Scroll Test Info Card */}
                {activeView === "scroll" && (
                  <section className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
                    <div className="flex items-start gap-2.5 mb-2">
                      <HelpCircle className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        What is a Scroll Speed Test?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      Measures the speed and mechanical consistency of your mouse scroll wheel, registering total scroll steps per second. Useful for speed-scrolling setups, web page layout testing, and gamers optimizing scroll-wheel binds (like Minecraft hotbar scrolling or apex legends jump binds).
                    </p>
                  </section>
                )}
              </div>
            </div>
          )}

          {/* Full-width About & Frequently Asked Questions Section below the main layout grid */}
          {activeView === "cps" && (
            <section
              className="w-full mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-xs space-y-6"
              style={{ overflowAnchor: "none" }}
            >
              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  What is CPS Precision Hub?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  CPS Precision Hub is an all-in-one testing suite built for gamers, Minecraft PvP players, and PC enthusiasts who want to measure and improve their clicking speed, reaction time, and overall input performance. Beyond the core CPS test, the site includes a full toolkit of related tests, including Spacebar Counter, Reaction Time, Key Ghosting, Polling Rate, Double Click, Scroll Speed, Drag Click, and more, so you can benchmark everything from your raw clicking speed to the responsiveness of your actual hardware, all in one place.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  Why is it better than other CPS testing websites?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Most CPS test sites are the same recycled click counter with a number and nothing else. CPS Precision Hub is built different, with real engineering behind the experience:
                </p>
                
                <ul className="space-y-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full theme-bg-badge-dot" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">Smart device detection</strong> — the site automatically detects whether you're on PC or a touch device and adapts the entire testing experience accordingly, rather than showing everyone the same broken layout.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full theme-bg-to-dot" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">A built-in humour engine</strong> — after every test, you get sharp, personalized one-liners reacting to your results. Try to run a PC-only test (like Right Click or Polling Rate) on your phone, and the site will call you out for it instead of pretending it works.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full theme-bg-badge-dot" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">Context-aware humour</strong> — jokes aren't generic. PC users get peripheral-based roasts (mouse, keyboard, switches), while touch users get finger and thumb specific jokes, since a phone doesn't have a "right-click" to laugh about the same way a mouse does.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full theme-bg-to-dot" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">Scroll lock during testing</strong> — on touch devices, the page automatically becomes non-scrollable while a test is running, since rapid tapping on a scrollable page causes accidental scrolls and ruins your score. It's a small detail most competitor sites completely ignore.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full theme-bg-badge-dot" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">Adaptive reset controls</strong> — resetting a test isn't one size fits all either. PC users can double click to reset instantly, while touch users get a dedicated on screen reset button, since double clicking or tapping on mobile is unreliable and inconsistent.
                    </span>
                  </li>
                </ul>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal pt-2">
                  The result is a testing suite that actually understands what device you're on and adjusts itself to give you an accurate, frustration free result, instead of just being a click counter slapped onto a webpage.
                </p>

                {/* Frequently asked questions dropdown */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                  <FAQs isDarkMode={isDarkMode} />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl">
          Built for responsive typing and click speed diagnostics · All high scores and history logs are stored securely on your browser.
        </footer>
      </div>
    </div>
  );
}
