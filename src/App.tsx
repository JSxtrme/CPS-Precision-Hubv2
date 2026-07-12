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
  HelpCircle
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
import { ReactionTimeTest } from './components/ReactionTime';

// Time durations in seconds
const DURATIONS = [1, 2, 3, 5, 10, 15, 30, 60, -1];

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
        "The glass is so untouched, it's starting to collect virtual dust."
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
        "Your tap interval is long enough to brew a cup of chamomile tea."
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
        "Are you trying to type in Morse code, or is this your actual maximum effort?"
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
        "Is that a tap, or is your screen just registering your thumb's heavy breathing?"
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
        "Average speed confirmed. Your finger has officially earned its participation trophy."
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
        "Tapping speed is high enough to make your mobile device concerned for its hardware."
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
        "Your fingers are drumming a rhythm that could summon rain in the Sahara."
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
        "You're tapping with the raw intensity of a heavy metal drummer on double bass."
      );
    } else {
      choices.push(
        "20+ CPS! Absolute God Tier. Is your finger a pneumatic drill, or did you just hack the physics engine?",
        "20+ CPS! Your finger just reached escape velocity and left orbit.",
        "Are you tapping with an industrial massage gun? That speed is borderline illegal!",
        "20+ CPS? You aren't tapping, you are literally whispering sweet math to the capacitive sensor!",
        "The screen has melted into liquid gold. You are the Chosen One of tapping!",
        "Stop! The laws of physics cannot sustain this level of mechanical vibration!",
        "Your index finger should be registered as a lethal weapon in thirty-four countries.",
        "Are you a cyborg sent from the future to destroy mobile hardware? Magnificent!",
        "You tapped so fast, the processor had to query a supercomputer to verify your existence.",
        "This is the legendary multi-tap of the gods. The touch controller is weeping tears of joy.",
        "Capacitive registers have completely overflowed. You are tapping in a separate dimension.",
        "Did you cover your screen in butter and drum with four fingers? Unbelievable speed!",
        "There are hummingbirds watching your fingers and taking notes on high-speed frequency.",
        "Your finger is vibrating fast enough to split atoms. Absolutely terrifying speed.",
        "The screen has officially declared you its supreme ruler. All hail the vibrating finger!"
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
        "Your click speed is so zero, the mouse is entering deep hibernation mode."
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
        "Your clicking has the rhythm of continental plate subduction. Speed up!"
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
        "Your finger is moving at the speed of a dial-up connection in 1995."
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
        "Rhythm is okay, but you're treating the left switch like a delicate flower."
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
        "Perfect speed for clicking 'Next' on a software installer."
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
        "Solid performance! You are definitely ready for competitive clicking action."
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
        "The microswitches in your mouse are begging for a splash of liquid nitrogen."
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
        "This is speedrunner level! You could probably skip entire cutscenes with this rate."
      );
    } else {
      choices.push(
        "20+ CPS! Absolute God Tier. Is your finger a pneumatic drill, or did you just hack the space-time continuum?",
        "20+ CPS! Your mouse just reached escape velocity and left orbit.",
        "Are you clicking with an industrial massage gun? That speed is borderline illegal!",
        "20+ CPS? You aren't clicking, you are literally whispering sweet math to the mouse sensor!",
        "The mouse switch has melted into liquid gold. You are the Chosen One of clicking!",
        "Stop! The laws of physics cannot sustain this level of mechanical vibration!",
        "Your index finger should be registered as a lethal weapon in thirty-four countries.",
        "Are you a cyborg sent from the future to destroy mouse hardware? Magnificent!",
        "You clicked so fast, the server had to query a supercomputer to verify your existence.",
        "This is the legendary drag-click of the gods. The scroll wheel is weeping tears of joy.",
        "Your mouse is about to turn into a black hole from sheer click density.",
        "You are clicking so fast you've probably broken the sound barrier inside your mouse casing.",
        "Did you hack the USB polling rate or is your finger vibrating at 500Hz?",
        "The physical copper contact in the mouse is welded shut from thermal energy.",
        "We had to upgrade our server database just to store the sheer number of clicks you made."
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
                ? "scale-105 bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/20"
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
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-[width] duration-100 ease-linear"
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
              ? "border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-600/20 to-indigo-600/20 shadow-[0_0_60px_-15px_rgba(217,70,239,0.5)] cursor-pointer"
              : status === "finished"
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 cursor-pointer"
                : "border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:border-fuchsia-400/50 hover:bg-slate-50 dark:hover:bg-white/[0.07] shadow-sm cursor-pointer"
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
              <p className="text-sm font-medium uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-300">
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
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full inline-block animate-pulse">
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
  const [showFaqs, setShowFaqs] = useState(false);
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
        if (state.faqs !== undefined) setShowFaqs(state.faqs);
        if (state.cameFromMenu !== undefined) setCameFromMenu(state.cameFromMenu);
      } else {
        setActiveView("cps");
        setShowFaqs(false);
        setCameFromMenu(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: "cps", faqs: false, cameFromMenu: false }, "");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToView = (view: ViewType) => {
    let nextCameFromMenu = cameFromMenu;
    if (activeView === "menu" && view !== "cps" && view !== "menu") {
      nextCameFromMenu = true;
    } else if (view === "cps" || view === "menu") {
      nextCameFromMenu = false;
    }
    setCameFromMenu(nextCameFromMenu);
    setActiveView(view);
    const state = window.history.state || {};
    window.history.pushState({ ...state, view, cameFromMenu: nextCameFromMenu }, "");
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
      case "spacebar": return <>Spacebar <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Counter</span></>;
      case "rightclick": return <>Right Click <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "polling": return <>Mouse Polling <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Rate</span></>;
      case "ghosting": return <>Key Ghosting <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "jitter": return <>Jitter Click <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Coach</span></>;
      case "butterfly": return <>Butterfly Click <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Coach</span></>;
      case "reaction": return <>Reaction Time <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "kohi": return <span className="font-mono text-emerald-400">[KOHI RETRO TEST]</span>;
      case "dragclick": return <>Drag Click <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "doubleclick": return <>Double Click <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "aim": return <>Aim <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Trainer</span></>;
      case "scroll": return <>Scroll Speed <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
      case "menu": return <>Speed <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Trials</span></>;
      default: return <>CPS <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Test</span></>;
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

  return (
    <div className={`relative min-h-screen overflow-hidden ${activeView === "kohi" ? "bg-black" : isDarkMode ? "bg-[#0b0b16] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Decorative ambient blurred layout */}
      {activeView !== "kohi" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 sm:py-12">
        
        {/* Top Control Header */}
        <div className="flex w-full max-w-7xl items-center justify-between border-b pb-4 mb-6 border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            {activeView !== "cps" && (
              <button
                onClick={() => {
                  if (cameFromMenu && activeView !== "menu") {
                    navigateToView("menu");
                  } else {
                    navigateToView("cps");
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                  isDarkMode ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5 text-fuchsia-400" /> Back
              </button>
            )}
            <button
              onClick={() => navigateToView(activeView === "menu" ? "cps" : "menu")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                activeView === "menu"
                  ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20"
                  : isDarkMode 
                    ? "bg-white/5 hover:bg-white/10 text-slate-300" 
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              }`}
            >
              <Grid className="h-3.5 w-3.5 text-indigo-400" /> More Tests
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Detection Badge */}
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${
              isDarkMode 
                ? "bg-white/5 border-white/5 text-slate-300" 
                : "bg-white border-slate-200 text-slate-600 shadow-sm"
            }`} title={isTouchDevice ? "Touchscreen input detected" : "Mouse/keyboard input detected"}>
              {isTouchDevice ? (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span>Touch</span>
                </>
              ) : (
                <>
                  <Laptop className="h-3.5 w-3.5 text-indigo-400" />
                  <span>PC</span>
                </>
              )}
            </div>

            <FAQs
              isOpen={showFaqs}
              onOpen={() => setShowFaqs(true)}
              onClose={() => setShowFaqs(false)}
              isDarkMode={isDarkMode}
              activeView={activeView}
            />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer border ${
                isDarkMode 
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/5" 
                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
              }`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Content Header */}
        <header className="mb-8 flex flex-col items-center gap-2.5 text-center sm:mb-10 max-w-2xl">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest ${
            isDarkMode 
              ? "border-white/10 bg-white/5 text-fuchsia-300" 
              : "border-slate-200 bg-slate-100 text-fuchsia-600 shadow-2xs"
          }`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
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
                  {activeView === "kohi" && <KohiTest addHistory={handleAddHistory} isTouchDevice={isTouchDevice} />}
                  {activeView === "dragclick" && <DragClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "doubleclick" && <DoubleClickTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "aim" && <AimTrainer addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                  {activeView === "scroll" && <ScrollTest addHistory={handleAddHistory} isDarkMode={isDarkMode} isTouchDevice={isTouchDevice} />}
                </main>
              </div>

              {/* Right Column (4-col on desktop): History list & Ranking showcase */}
              <div className="lg:col-span-4 w-full space-y-6 lg:sticky lg:top-6">
                {/* History Log Panel */}
                <HistoryList
                  history={history}
                  onClear={handleClearHistory}
                  isDarkMode={isDarkMode}
                  activeView={activeView}
                />

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
                  <section className="w-full font-mono bg-black text-emerald-400 rounded-2xl border-2 border-emerald-500/50 p-5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <div className="flex items-center gap-2 mb-4 border-b border-emerald-500/30 pb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">[RANKING_MATRIX]</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {RATING_TIERS.map(tier => (
                        <div
                          key={tier.label}
                          className="flex flex-col items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-2.5 text-center"
                        >
                          <span className="font-bold text-emerald-300 uppercase">{tier.label}</span>
                          <span className="text-[10px] text-emerald-500/70">
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
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl">
          Built for responsive typing and click speed diagnostics · All high scores and history logs are stored securely on your browser.
        </footer>
      </div>
    </div>
  );
}
