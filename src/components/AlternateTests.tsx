import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard, 
  MousePointer, 
  RefreshCw, 
  AlertCircle, 
  Terminal, 
  Play, 
  Sparkles,
  RefreshCw as ResetIcon,
  HelpCircle,
  Target,
  Sliders,
  ArrowUpDown,
  Mouse
} from 'lucide-react';
import { Ripple, ViewType, getRating } from '../types';

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
  const choices: string[] = [];

  if (isTouchDevice) {
    if (score === 0) {
      choices.push(
        "Are you double-tapping, or did your screen just confuse your touch for a heavy sigh?",
        "0 HPS! Perfect speed for doing absolutely nothing on a virtual keyboard.",
        "Your touch-spacebar speed is so non-existent, the virtual spring has dissolved.",
        "Did you forget that the spacebar is on the screen, not in the physical world?",
        "A fossilized dinosaur has more spacebar activation than your finger right now.",
        "Screen spacebar power-saver mode: fully activated."
      );
    } else if (score > 0 && score < 3) {
      choices.push(
        "1-2 HPS. A sleeping sloth is literally typing faster than you right now.",
        "Your finger is moving like it's stuck in thick molasses. Pick up the pace!",
        "Is the digital spacebar key too slippery for your fingers? Press it!",
        "You're tapping with the intensity of a gentle breeze on a windowpane.",
        "Touch spacebar speed matches the speed of a snail climbing an oily glass surface.",
        "Are you afraid of wearing out the virtual spring? Touch is completely free!"
      );
    } else if (score >= 3 && score < 6) {
      choices.push(
        "3-5 HPS. Polite golf clap tempo. The crowd is looking for the exit.",
        "Decent rhythm, but your thumbs are giving 'I need a chamomile tea' vibes.",
        "Not bad for a slow-motion simulation of typing, but we need speed!",
        "You're tapping the screen like you're trying not to wake up a sleeping puppy.",
        "Your spacebar tapping has the consistency of a slow dripping kitchen faucet.",
        "Are you reading the instruction manual between taps? Get moving!"
      );
    } else if (score >= 6 && score < 9) {
      choices.push(
        "6-8 HPS. Respectable speed! Your thumb has officially entered cardio mode.",
        "Solid touch rate. Your screen's capacitive sensor is actually paying attention now.",
        "You tap faster than a teenager texting gossip to their best friend.",
        "Very stable tempo. You're definitely skipping dialogues in mobile RPGs easily.",
        "Good effort! The glass is feeling a tiny bit of friction now."
      );
    } else {
      choices.push(
        "9+ HPS! Absolute drum-tapping legend! Your index finger is a piston on glass.",
        "Whoa! Are you using multiple fingers on that spacebar or is your hand possessed?",
        "The screen's digitizer is having a full-blown crisis trying to count your spacebar taps.",
        "Incredible! If we hooked up a battery to your thumb, we could power a small streetlamp.",
        "That's not tapping, that's a high-frequency vibration on glass. Magnificent!"
      );
    }
  } else {
    if (score === 0) {
      choices.push(
        "Did you press the spacebar with a feather? Speak up, the switch can't hear you!",
        "0 HPS. The spacebar spring is resting in peace. It hasn't felt any pressure in ages.",
        "Did you buy a custom aluminum keyboard just to never touch the largest key on it?",
        "Are you trying to protect your stabilizer wire from rattling by not clicking?",
        "If doing absolutely nothing was an Olympic event, your thumb would win the gold.",
        "Your spacebar is checking its own USB connection. Are you there?"
      );
    } else if (score > 0 && score < 3) {
      choices.push(
        "1-2 HPS. Are your mechanical keyboard stabilizers lubed with honey? It's stuck!",
        "Your thumb is reacting with the velocity of continental plates. Press that key!",
        "Are you playing in slow-mo, or did you buy a linear switch with 10kg actuation force?",
        "You clack like a sleepy typist on a 1920 typewriter. Wake up!",
        "At this speed, you aren't space-bar clicking; you are writing a slow love letter to your keyboard.",
        "Is your keyboard's steel plate too heavy for your thumb? Let's see some power!"
      );
    } else if (score >= 3 && score < 6) {
      choices.push(
        "3-5 HPS. Did you buy Cherry MX Brown switches just to click them once a minute?",
        "You're pressing the spacebar with the gentle grace of a butterfly landing on a flower. Smash it!",
        "We can hear your stabilizers rattling from here, but only because they rattle once a year.",
        "Decent speed for a spreadsheet session, but highly mediocre for gaming.",
        "Your thumb looks like it's dreaming of a mattress. Give it some caffeine!",
        "Spacebar spring is working, but it's not even warm. Pick up the tempo!"
      );
    } else if (score >= 6 && score < 9) {
      choices.push(
        "6-8 HPS! Solid clacking! The spacebar spring is getting a legitimate workout.",
        "Great speed! You've definitely mastered the thumb-roll technique on the bottom row.",
        "Your mechanical switches are sounding like a miniature drum roll. Respectable!",
        "Nice, fast spacebar presses. You can definitely jump-bridge with this speed.",
        "The steel plate of your keyboard is vibrating. Excellent rhythm!"
      );
    } else {
      choices.push(
        "9+ HPS! Absolute clack master! Your thumb is moving faster than a machine gun!",
        "Are you vibrating your entire wrist on that spacebar or are you just a machine?",
        "The stabilizers have entered a state of quantum superposition. Absolutely legendary clacking!",
        "Your mechanical switches are crying tears of solder. Incredible speed!",
        "You've bottomed out that spacebar so many times it's practically part of the desk now."
      );
    }
  }

  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

function getRightClickHumorousLine(cps: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "0 HPS? Did you forget how to right-tap on this screen, or are you tapping in a parallel universe?",
        "0 HPS! Perfect speed for doing absolutely nothing.",
        "Your right click gesture is so non-existent, the touch screen is checking its own hardware.",
        "Did you forget where the touch trigger was or is your screen covered in grease?",
        "Perfect 0. The digitizer is literally taking a nap right now."
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. At this rate, your finger is moving like it's stuck in a vat of cold peanut butter.",
        "Are you tapping with your nose? Speed it up!",
        "Very slow right tapping. The local snail just zoomed past your touch cursor.",
        "You tap like you're carefully placing a fragile glass sticker. Give it some energy!"
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        `${Math.round(cps)} HPS. Decent if you are opening a menu, but absolute doom in any speed challenge.`,
        "You tap like you're politely knocking on a window. Tap that screen like it owes you lunch money!",
        "Continental drift is currently keeping up with your tap speed. Accelerate!",
        "Your middle finger feels like it needs a major software update. Wake up!"
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        `${Math.round(cps)} HPS. Average speed. Not terrible, but you're definitely not breaking any records.`,
        "The screen is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of rapid taps!",
        "Are you tapping with your knuckles? Lift those fingers and use your tip!"
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        `${Math.round(cps)} HPS! Respectable! Your fingers have definitely spent time on intense games.`,
        "Your right clicks are getting fast. Is your tapping hand secretly working out behind your back?",
        "Good speed! You can actually hold your ground with this touch rate.",
        "The glass is warming up! The capacitive field is feeling your authority."
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        `${Math.round(cps)} HPS! Phenomenal! Your hand is moving so fast it's generating its own weather system.`,
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right tapping. The glass is crying tears of friction.",
        "Your double-tap right clicks are incredibly crisp. Highly optimized touch finger!"
      );
    } else if (cps >= 11 && cps < 15) {
      choices.push(
        `${Math.round(cps)} HPS! Incredible! You are basically the John Wick of touch tapping.`,
        "Your screen is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!",
        "Is your screen about to shatter or are your fingers just vibrating at high frequencies?"
      );
    } else {
      choices.push(
        "15+ HPS! You aren't tapping, you are speaking binary directly to the screen controller!",
        "The laws of physics have left the room. You're tapping fast enough to reverse time!",
        "Your other fingers are extremely jealous. Your tapping finger is now a registered lethal weapon!",
        "Capacitive sensors are completely overloaded. You are tapping in a separate dimension."
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "0 HPS? Did you forget your middle finger exists, or are you right-clicking in a parallel universe?",
        "0 HPS! Perfect speed for not playing Minecraft Bedwars.",
        "Your right click is so non-existent, the mouse sensor is checking its own pulse.",
        "Did you unplug your secondary mouse switch or did you forget you have a middle finger?",
        "Perfect 0. The mechanical switch inside is currently celebrating its longevity."
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. If you tried to right-click block-clutch in Minecraft, you'd fall into the void before the block even realized you clicked.",
        "Are you clicking with your toe? Your middle finger is moving like it's stuck in a vat of cold peanut butter.",
        "Very slow right clicking. The local snail just zoomed past your cursor.",
        "Did you buy a gaming mouse with Kailh switches just to look at them? Click it!"
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        `${Math.round(cps)} HPS. Decent if you are opening a folder, but absolute doom in a PVP bridge fight.`,
        "You click like you're politely knocking on a door. Tap that button like it owes you lunch money!",
        "Continental drift is currently keeping up with your click speed. Accelerate!",
        "Your right-click button is yawning. It has never experienced such a lazy pace."
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        `${Math.round(cps)} HPS. Average middle finger. Not terrible, but you're definitely not winning any PVP matches.`,
        "The mouse switch is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of right-clicking!",
        `Is your wrist braced? It should be, because ${Math.round(cps)} HPS is barely a warm-up!`
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        `${Math.round(cps)} HPS! Respectable! Your middle finger has definitely spent time on a gaming mouse.`,
        "Your right clicks are getting fast. Is your middle finger secretly working out behind your back?",
        "Good speed! You can actually set up some decent defense with this rate.",
        "Your mouse switches are clacking happily now. Very solid speed!"
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        `${Math.round(cps)} HPS! Phenomenal! Your middle finger is moving so fast it's generating its own weather system.`,
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right clicking. The mouse switch is crying tears of friction.",
        "Your block-clutches must look majestic. Exceptional finger control!"
      );
    } else if (cps >= 11 && cps < 15) {
      choices.push(
        `${Math.round(cps)} HPS! Incredible! You are basically the John Wick of right clicking.`,
        "Your mouse button is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!",
        "The middle microswitch is tensing up. Let the absolute click density take over!"
      );
    } else {
      choices.push(
        "15+ HPS! You aren't right-clicking, you are literally speaking binary code directly to the mouse sensor!",
        "The laws of physics have left the room. You're clicking fast enough to reverse time!",
        "Your index finger is extremely jealous. Your middle finger is now a registered lethal weapon!",
        "We had to upgrade our server database just to store the sheer number of right-clicks you made."
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Jitter click humorous lines
function getJitterHumorousLine(cps: number, stability: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "Is your hand completely paralyzed, or is your screen's digitizer on vacation?",
        "0 CPS. Did you forget to vibrate your hand, or is your finger too scared of the glass?",
        "Perfect 0. The capacitive screen is wondering if you still exist."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Jitter clicking is about tensing your arm, not gently patting the glass. Wake those muscles up!",
        "Your fingers look like they are taking a leisurely stroll on the screen. Start shaking!",
        "Are you checking the temperature of the mobile device with your finger? Vibration required!"
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Not a bad tremor, but your stability is all over the place. Tighten your forearm grip!",
        "Your hand is shaking, but it looks like you are holding a cup of hot tea. Tense that wrist!",
        "You have a tiny bit of vibration, but it's more like a polite wiggle. We need a jackhammer!"
      );
    } else if (cps >= 8 && cps < 12) {
      choices.push(
        "Incredible wrist vibration! You're making the phone glass rattle at high frequencies.",
        "Excellent jitter-tap form! Your screen's glass is getting quite warm from the pure friction.",
        "Your forearm is a blur of high-fidelity spasms. Exceptional mobile jitter speed!"
      );
    } else {
      choices.push(
        "Absolute cybernetic vibration! Your fingers are vibrating at 60Hz. Corning Gorilla Glass is sweating!",
        "Are you holding an electric sander in your hand? Your jitter rate is absolutely terrifying!",
        "The laws of gravity do not apply to your hand. You are tensing at a molecular level!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Did you even tense your forearm? Your mouse is sitting completely still, looking bored.",
        "0 CPS. Mechanical switches are fully asleep. Try shaking that hand!",
        "Your mouse is checking its USB connection because your finger didn't move a millimeter."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Jittering requires localized muscle spasms. You click like you're browsing a cooking blog. Let's go!",
        "Are you clicking with your pinky? Forearm tension is nonexistent!",
        "This is a speed test, not a museum tour of mouse switch durability. Vibrate that arm!"
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Good hand tremor! The mouse sensor is tracking your shakes nicely. Lock that wrist for more stability!",
        "Your hand is shaking, but your mouse button is only half-convinced. Tense up your wrist!",
        "Decent shaking. The click frequency is climbing, but the microswitch wants more heat!"
      );
    } else if (cps >= 8 && cps < 12) {
      choices.push(
        "Whoa! Your mouse switch is vibrating like a pneumatic drill. Excellent jitter-click form!",
        "The Omron switches are screaming under your forearm spasms. Highly optimized vibration!",
        "Your wrist is fully locked and your elbow is generating pure velocity. Fantastic jittering!"
      );
    } else {
      choices.push(
        "Insane forearm tremors! Your mouse is vibrating so hard it's slowly walking across your desk. Absolute beast!",
        "Are you a human woodpecker? Your mouse switch has entered a separate dimension of mechanical strain!",
        "This click rate should be illegal in competitive play. Your wrist is tensing at 1000Hz!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Butterfly click humorous lines
function getButterflyHumorousLine(cps: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "No fingers on the glass. Are the butterflies extinct?",
        "0 CPS. Did your index and middle fingers get locked in a digital safe?",
        "Zero taps. The screen is staring back at you in absolute silence."
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Butterfly tapping requires alternating fingers. You look like you're tapping with a single tired thumb.",
        "Are you tapping with a single digit? The point of a butterfly is having TWO wings!",
        "Your alternate fingers are moving in slow motion. Synchronization error!"
      );
    } else if (cps >= 5 && cps < 10) {
      choices.push(
        "Decent alternating speed. Your fingers are starting to do gymnastics on the glass surface.",
        "Good rhythm! One-two, one-two. Keep the drumming tempo steady!",
        "The touchscreen is feeling the alternate drumming now. Pick up the pace for pro status."
      );
    } else if (cps >= 10 && cps < 15) {
      choices.push(
        "Superb drumming! Your two fingers are hitting the screen like a rapid bongo drum solo.",
        "Excellent alternate lift technique! The glass is getting a serious beatdown.",
        "Your alternate finger lifts are highly synchronized. Great touch butterfly speed!"
      );
    } else {
      choices.push(
        "What on earth! You are drum-tapping with 4 fingers like a classical pianist playing Flight of the Bumblebee!",
        "Your fingers are vibrating fast enough to split atoms on the touchscreen surface!",
        "Capacitive sensors are completely flooded with alternate touch coordinates. Epic speed!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Zero clicks! Did both your index and middle fingers go on strike at the same time?",
        "0 CPS. The mechanical mouse buttons are completely safe from your butterfly wings.",
        "Did you forget how to lift your fingers? Both switches are completely silent."
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Butterfly clicking requires drumming your index and middle fingers alternately on the left click. You click like a sleeping turtle.",
        "Are you clicking with only one finger? Give the middle finger some clicking duties!",
        "That alternating clack is so slow, it sounds like an old grandfather clock. Speed up!"
      );
    } else if (cps >= 5 && cps < 10) {
      choices.push(
        "Good double-finger drumming! The switches are clacking in tandem. Now synchronize your lifts!",
        "Solid alternating tempo. Your mouse switches are humming a nice, fast tune.",
        "Nice rhythm, but we need to see some real mechanical stress. Drum those switches faster!"
      );
    } else if (cps >= 10 && cps < 15) {
      choices.push(
        "Incredible butterfly speed! Your mechanical mouse switches are sounding like automatic gunfire. PVP gods are smiling.",
        "The alternate lifting of your index and middle fingers is extremely crisp. Double-clicks galore!",
        "Excellent bounce-clicking! You are definitely ready to dominate any block-clutch duel."
      );
    } else {
      choices.push(
        "Insane double-clicking! Your fingers are a blur of alternate lifts. Razer/Logitech switches are praying for safety!",
        "You are registering double-clicks at a rate that defies modern physics. Absolute butterfly master!",
        "Your mouse is practically tensing up on its own. Beautiful alternate-drumming velocity!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Kohi Retro humorous lines
function getKohiHumorousLine(cps: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "No clicks. Even in the retro age of 2012 Minecraft, this would get you banned for inactivity.",
        "0 CPS. Your touch retro sequence has completely expired.",
        "Perfect 0. The Kohi server kicked you for being a stationary statue."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Very retro, indeed! Your tap speed is so slow it reminds us of 9600-baud dial-up internet.",
        "You tap like you're browsing a medieval library. Lift those digits!",
        "Your mobile retro sequence is moving like an old slow-loading VHS tape."
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Good old-school pacing. Respectable speed for classic touch gaming.",
        "Solid retro tap tempo. Your glass screen is feeling some classical pressure.",
        "A respectable classic touch rate. Perfect for some casual vintage pocket-edition combos."
      );
    } else if (cps >= 8 && cps < 12) {
      choices.push(
        "You are tapping like an absolute legend from the legacy mobile server days. Incredible speed!",
        "Excellent classic velocity! You are skip-dialogue comboing like a professional retro speedrunner.",
        "Your finger is moving fast enough to trigger nostalgia sensors in our server database!"
      );
    } else {
      choices.push(
        "Retro god tier! Capacitive sensors are breaking under the weight of your classic retro tap gymnastics!",
        "Your finger has reached 1999 arcade-cabinet speeds! Absolute legend of the retro tap scene!",
        "You've unlocked the secret classic combos! All retro touch-screens bow to your speed."
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "0 CPS. You would get instant-killed on Kohi in 0.2 seconds. Plug in the mouse!",
        "Did you get comboed into next week before clicking once? Wake up, PvP soldier!",
        "0 CPS. Your legacy mouse has been disconnected from the server for pure sleepiness."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Is your mouse a serial-port ball mouse from 1995? Click those retro switches faster!",
        "Your PvP speed is so slow, you're practically block-clutching in reverse.",
        "At this speed, you'd get comboed into orbit on any Kohi lobby. Shake that wrist!"
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Decent nostalgic pace. Good enough to fight some legacy mobs, but too slow for hardcore factions.",
        "Classic Minecraft PvP sweat speed is within reach. Now start vibrating your middle finger!",
        "Decent old-school clicking. Your mouse switches are recalling memories of 2013 Minecraft servers."
      );
    } else if (cps >= 8 && cps < 12) {
      choices.push(
        "Outstanding! You have that classic 2013 Minecraft PvP sweat speed. Your mechanical switches are screaming!",
        "Excellent Kohi clacking! You are definitely triggering those legacy double-click combos.",
        "Your click rate is high enough to make any legacy factions leader proud. Solid battle speed!"
      );
    } else {
      choices.push(
        "Absolute Kohi Legend! You are click-clutching, drag-clicking, and comboing like a caffeinated teenager from 2014!",
        "Omron switch contacts are practically welded together from your retro velocity. Phenomenal!",
        "Are you wearing a headset and yelling about combos? Because your click rate is pure competitive sweat!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

export function getRandomSpacebarWarning(): string {
  const list = [
    "Bro thinks he has a spacebar, who's gonna tell him?",
    "Your thumb ain't a spacebar, bro",
    "Tapping glass isn't the same as slamming a spacebar",
    "Bro pulled up without a keyboard",
    "No spacebar detected, only vibes",
    "Bunny-hopping on a touchscreen? Bold move",
    "Bro's finger is not a mechanical switch",
    "This ain't Fruit Ninja, get a keyboard",
    "Spacebar not found. Neither is your setup",
    "Bro really tried to jump without a keyboard",
    "Screen tapping speedrun, huh?",
    "Your phone screen isn't rated for this",
    "Where's the clack clack? Get a keyboard",
    "Bro thinks his thumb has N-key rollover",
    "Spacebar.exe not found on this device",
    "Tap harder, it still won't count",
    "Real spacebars only, no glass allowed",
    "Bro's cooking with zero keyboards",
    "This is a keyboard test, not a touchscreen test",
    "Bro brought a phone to a keyboard fight"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomRightClickWarning(): string {
  const list = [
    "You ain't got no Right-Click dude, Buy a mouse first",
    "Long-pressing ain't right-clicking, bro",
    "No right-click, no rights",
    "Bro's out here tapping like it's a touchscreen game",
    "Right click not found, skill issue",
    "Touchscreens don't have a middle finger, apparently",
    "Bro forgot his mouse at home",
    "This context menu needs an actual mouse",
    "Tap-and-hold isn't a right click, chief",
    "No mouse, no right-click, no clout",
    "Bro thinks his screen has buttons",
    "Right-click.exe has left the chat",
    "Your thumb can't do what a mouse can",
    "404: Right click not found",
    "Get a mouse before you get more embarrassed",
    "Bro's clicking air right now",
    "This ain't a smartphone menu, bro",
    "Mouse required. Vibes are not a substitute",
    "Bro pulled up mouseless, couldn't be me",
    "Right click detected: 0. Confidence detected: 100"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomPollingWarning(): string {
  const list = [
    "You need a mouse buddy",
    "0 Hz because 0 mouse",
    "Bro's polling rate is powered by hope",
    "No mouse, no Hz, no chance",
    "Your finger doesn't poll at 1000Hz, sorry",
    "This sensor needs an actual sensor",
    "Bro's mouse is in another dimension",
    "Polling rate: nonexistent, just like your mouse",
    "Get a mouse before you get a number",
    "0 Hz gang rise up",
    "Bro forgot the entire mouse",
    "This isn't a touchscreen flex, bro",
    "Your screen isn't a sensor pad",
    "No cursor, no polling, no point",
    "Bro's out here polling with vibes",
    "Mouse not detected. Confidence still detected",
    "Real mice only, no glass taps",
    "0Hz because bro brought 0 mouse",
    "This test smells a touchscreen from a mile away",
    "Bro's peak rate is his phone battery"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomDoubleClickWarning(): string {
  const list = [
    "Bro thinks his finger is a mouse button",
    "Tapping glass ain't double clicking, chief",
    "No mouse, no double click, no dice",
    "Your thumb doesn't have a switch inside it",
    "Bro brought zero mice to a mouse test",
    "Double click not found. Neither was your mouse",
    "This ain't a touchscreen tapping contest",
    "Bro's finger isn't Omron certified",
    "Get a mouse before you get more clicks",
    "0 clicks because 0 mouse, simple math",
    "Bro's double-clicking with vibes only",
    "Real mouse buttons only, no glass taps",
    "Your screen isn't a switch, bro",
    "Double click detected: none. Excuses detected: many",
    "Bro pulled up mouseless again, couldn't be me",
    "This test needs clicks, not taps",
    "Bro thinks tapping twice fast counts",
    "No mouse in sight, only cope",
    "Get a mouse, then get a score",
    "Bro's mouse is still in the shopping cart"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomScrollWarning(): string {
  const list = [
    "Bro's out here scrolling with vibes, no wheel detected",
    "Where's the wheel, bro? Buy a mouse first",
    "Bro thinks swiping counts as scrolling",
    "Swiping ain't scrolling, chief",
    "No wheel, no scroll, no chance",
    "Your thumb isn't a scroll wheel, bro",
    "Bro forgot the entire mouse again",
    "This test needs a real wheel, not glass",
    "Scroll detected: 0. Excuses detected: plenty",
    "Bro's out here swiping like it's Tinder",
    "Get a mouse before you get a score",
    "Real scroll wheels only, no touchscreens allowed",
    "Bro's scroll wheel is his phone screen apparently",
    "No mouse, no wheel, no scrolling, no problem for us",
    "This ain't Instagram, stop swiping",
    "Bro pulled up wheelless again",
    "Scroll speed: nonexistent, just like your mouse",
    "Your finger doesn't spin like a wheel, bro",
    "Get a mouse before you get more roasted",
    "Bro thinks swiping up counts as scrolling fast"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

// Drag click humorous lines
function getDragClickHumorousLine(cps: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (cps === 0) {
      choices.push(
        "No drag touches. Are you waiting for a magic sliding carpet?",
        "0 CPS. Did your finger completely forget how to slide on the glass screen?",
        "Zero drag-clicking registered. Give that glass surface a gentle drag!"
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Dragging on glass? Your finger is just squeaking like a wet window wiper. Try some dry sliding or tape!",
        "Very low friction detected. It feels like you are petting a sleeping cat on the screen.",
        "Your drag speed is so gentle, it wouldn't even activate a touch zoom!"
      );
    } else if (cps >= 5 && cps < 12) {
      choices.push(
        "Decent friction slide! The glass is warming up, but that screen digitizer isn't breaking a sweat yet.",
        "Good effort sliding on the touchscreen. Try adding a little bit of thumb-tip pressure!",
        "Nice, consistent drag-sliding tempo. Let's see some real screen squeaking!"
      );
    } else if (cps >= 12 && cps < 20) {
      choices.push(
        "Wow! Your finger is drumming on that glass like a rapid-fire woodpecker. Incredible touch control!",
        "Are you using grip-tape on your finger? That capacitive sensor is registering some serious friction vibrations!",
        "Superb screen slide frequency! Highly responsive touch coordinate tracking."
      );
    } else {
      choices.push(
        "Unbelievable glass vibration! Are you sure your finger isn't a high-frequency massage gun?",
        "You are registering drag-slides at a rate that defies modern physics on glass. Absolute slide master!",
        "The touchscreen is begging for mercy from your hyper-speed finger dragging gymnastics!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Zero drag clicks. Did your finger slide completely off the mouse?",
        "0 Drag CPS. The switches didn't vibrate at all. Are you holding a block of wood?",
        "Did you forget to drag click or is your mouse switch made of solid steel?"
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Standard Mouse switch: Switch is too stiff or you aren't sliding with enough friction. Or did you forget to apply grip tape?",
        "Your finger is sliding too smoothly. We need switch-vibration, not a relaxing massage!",
        "At this rate, you aren't drag-clicking; you're just polishing your left mouse button."
      );
    } else if (cps >= 5 && cps < 12) {
      choices.push(
        "Decent drag-clicking potential. Try applying some electrical or grip tape for extra finger traction!",
        "Good vibration chatter! The switches are starting to hum nicely.",
        "Nice, consistent drag sliding. You are beginning to master the switch-bounce technique!"
      );
    } else if (cps >= 12 && cps < 20) {
      choices.push(
        "Excellent switch vibration! Your hardware has a highly optimized debounce threshold for insane drag chatter.",
        "Outstanding! You can hear those Omron switches screaming in rapid succession.",
        "Beautiful drag friction! Your Minecraft bridging is going to look incredibly smooth."
      );
    } else {
      choices.push(
        "God-Tier Drag Clicker! Unrivaled switch chatter abuse detected. Your Minecraft PVP opponents stand absolutely no chance!",
        "Your mouse switches have officially entered a state of quantum vibration. Superb drag clacking!",
        "Are you sure your mouse hasn't melted from all that friction? That's an legendary speed!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Double click humorous lines
function getDoubleClickHumorousLine(ratio: number, isTouchDevice: boolean = false, doubleClicksCount: number = 0): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (doubleClicksCount === 0) {
      choices.push(
        "Solid Tap Timing: Perfectly clean individual taps. No capacitive lag or static-electric ghosting detected.",
        "100% precision taps. Your touchscreen is perfectly calibrated to your fingers.",
        "Consistent single touches. Excellent for accurate navigation on mobile screens."
      );
    } else if (ratio < 0.15) {
      choices.push(
        "Quick Tap-Double: Registering some rapid consecutive touches. Handy for double-tap zoom features!",
        "Sensitive touch sensing! A few swift multi-touches detected. Perfect for action games.",
        "Nice double-tapping rhythm. Great for skipping forward in mobile media players."
      );
    } else {
      choices.push(
        "Ultra-Sonic Flutter: Your finger is fluttering on the screen like a rapid butterfly wings. Pure raw speed!",
        "Insane screen-drumming sensitivity! The capacitive grid can barely keep up with your double taps.",
        "Absolute flutter master! Your fingers are vibrating across the glass like static electricity."
      );
    }
  } else {
    if (doubleClicksCount === 0) {
      choices.push(
        "Standard Clicks Only: Safe and steady. Consistently registering single clicks. Perfect for general accuracy and desktop navigation.",
        "No unintended double clicks detected. Great for precision work, but maybe too slow for block-clutch duels.",
        "Perfect debounce filter. Your mouse is acting like a perfectly disciplined hardware citizen."
      );
    } else if (ratio < 0.15) {
      choices.push(
        "Moderate CPS Boost: Sensitive switches with moderate double-clicks detected. Great for gaining a quick mechanical speed advantage without sacrificing normal control.",
        "A hint of switch chatter detected! Just enough to help you squeeze out an extra CPS or two.",
        "Nice responsive switches. They are perfectly primed for rapid-fire trigger clicks."
      );
    } else {
      choices.push(
        "High CPS Potential / Active Chatter: Highly responsive double-clicking active! Outstanding potential for pushing ultra-high CPS limits in competitive clicking or games like Minecraft.",
        "Your mouse switch is practically double-clicking on its own. That's a built-in mechanical cheat code!",
        "Incredible bounce chatter! If you play PvP, you are absolutely blessed with this mechanical sensitivity."
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Aim Trainer humorous lines
function getAimHumorousLine(hits: number, accuracy: number, avgReaction: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  const finalScore = hits * (accuracy / 100);

  if (isTouchDevice) {
    if (hits === 0) {
      choices.push(
        "0 hits! Did you target the screen, or were you aiming at the reflection of your own confused face?",
        "No targets popped. Did your finger forget how to tap or are you playing with your eyes closed?",
        "The targets came and went, completely untouched. Like ships passing in the night."
      );
    } else if (finalScore < 6) {
      choices.push(
        "Slow response on touch! Did you tap a target or just pet the screen? Keep your hand moving!",
        "Your finger is wandering around the screen like a lost tourist in a big city.",
        "Tapping too slow! Those micro-targets are laughing at your touch reflexes."
      );
    } else if (finalScore >= 6 && finalScore < 14) {
      choices.push(
        "Decent hand-eye coordination. Tapping glass with good rhythm. Practice more to lock your muscle memory.",
        "Nice, steady tapping. You're catching a solid amount of targets, but we need more speed!",
        "Solid touch accuracy. Now try to flick your finger to the next target instantly!"
      );
    } else if (finalScore >= 14 && finalScore < 22) {
      choices.push(
        "Excellent mobile aim! Highly competitive speed, popping targets like bubble wrap!",
        "Your touch reflexes are extremely sharp! Popping targets left and right with superb accuracy.",
        "Great hand-to-screen synchronization. You are definitely ready for mobile competitive action!"
      );
    } else {
      choices.push(
        "Superhuman finger speed! Your reflexes are sharper than a cat chasing a laser pointer!",
        "Absolute touch screen dominance! Are you tapping with multiple fingers or are you just a touch god?",
        "Phenomenal coordination! The targets are popping so fast the screen looks like a sparkling starry night."
      );
    }
  } else {
    if (hits === 0) {
      choices.push(
        "0 hits. Your crosshair is so far off, it has registered its own ZIP code.",
        "Did you click the arena or your desk? Not a single target was harmed in this test.",
        "Are you using a trackball or just aiming with your elbow? Complete silence on the targets."
      );
    } else if (finalScore < 6) {
      choices.push(
        "Slow response times. Keep your wrist loose, check your mouse DPI/sensitivity, and try again.",
        "You're tracking those targets with the velocity of a heavy freight train. Flick that mouse!",
        "Did your mouse cord get stuck? That reaction time has some serious network lag vibes."
      );
    } else if (finalScore >= 6 && finalScore < 14) {
      choices.push(
        "Decent precision tracking. Your muscle memory is developing. Keep practicing to flick faster!",
        "Nice consistent target pops. Good accuracy, now let's crank up the speed dial!",
        "Not bad! A highly solid baseline accuracy. Work on your click-to-movement timing."
      );
    } else if (finalScore >= 14 && finalScore < 22) {
      choices.push(
        "Excellent aim and trigger control. Highly competitive speed. Shroud would be proud!",
        "Flick city! Your crosshair is landing perfectly on target centers with minimal overshoot.",
        "Outstanding wrist precision! You are definitely ready for some high-tier ranked lobby climbing."
      );
    } else {
      choices.push(
        "Absolute aim bot! Are you sure you aren't running an aim script? Legendary mouse precision!",
        "Your hand-eye coordination is practically digital. Superb crosshair snaps and perfect trigger pull!",
        "You've popped so many targets, our server registers you as a serious hardware hazard. Phenomenal!"
      );
    }
  }
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// Scroll Speed Test humorous lines
function getScrollHumorousLine(stepsSec: number, isTouchDevice: boolean = false): string {
  const choices: string[] = [];
  if (isTouchDevice) {
    if (stepsSec === 0) {
      choices.push(
        "No swiping registered. Are you waiting for the page to scroll itself?",
        "0 scrolling. Your thumb is stationary on the screen. Give it a good swipe!",
        "Zero steps. Swipe up or down vigorously to start the scroll engine!"
      );
    } else if (stepsSec < 15) {
      choices.push(
        "Lazy swipe! Are you trying to scroll past an ad, or did your thumb fall asleep?",
        "Very leisurely swiping. You look like you're reading a boring terms and conditions page.",
        "Slow, steady swiping. Good for reading recipes, bad for high-speed scrolling!"
      );
    } else if (stepsSec >= 15 && stepsSec < 40) {
      choices.push(
        "Good casual scrolling speed. Perfect for scrolling through endless social media feeds.",
        "Nice, comfortable scroll swipes. Your thumb has a great, consistent travel distance.",
        "Solid scroll feedback! You are navigating through pages with excellent tactile rhythm."
      );
    } else if (stepsSec >= 40 && stepsSec < 80) {
      choices.push(
        "Vigorous swiping! You're sliding down pages faster than a speedreader on caffeine.",
        "Amazing touchscreen swiping! Your thumb is practically sliding off the bezel.",
        "Super fast scrolling speed! You are looking for that specific meme with extreme velocity!"
      );
    } else {
      choices.push(
        "Absolute thumb fire! You're scrolling so fast you might warp into the next article!",
        "Whoa! Are you using multiple hands or did you lubricate your screen with Teflon? Legend!",
        "The mobile browser is completely overwhelmed by your hyper-speed swipe rate. Phenomenal!"
      );
    }
  } else {
    if (stepsSec === 0) {
      choices.push(
        "0 scroll steps. Did your mouse wheel get stuck with pocket lint?",
        "Zero scrolling detected. Did you buy a mouse without a scroll wheel, or are you just staring at it?",
        "The wheel hasn't turned a single notch. Give it a spin!"
      );
    } else if (stepsSec < 15) {
      choices.push(
        "Slow scrolling. Perfect for browsing light articles, but too slow for Minecraft hotbar toggling.",
        "Are you scrolling with a heavy stone wheel? Spin it with some passion!",
        "Slow, cautious index finger. Are you afraid of scrolling past something important?"
      );
    } else if (stepsSec >= 15 && stepsSec < 40) {
      choices.push(
        "Good, consistent scroll control. Solid scroll feedback rate.",
        "Nice steady wheel scrolling. Perfect for casual gaming and quick hotbar weapon swaps.",
        "Your index finger has a nice, healthy tempo. Steady scrolling keeps the scroll wheel happy!"
      );
    } else if (stepsSec >= 40 && stepsSec < 80) {
      choices.push(
        "Fast index finger! Excellent scroll-wheel speed.",
        "Awesome! You are spinning that wheel like a game show host. Great velocity!",
        "Excellent scroll rate! Your finger-flick technique is highly optimized."
      );
    } else {
      choices.push(
        "God-like Scrolling! You must be using an unlocked free-spin mouse scroll wheel or an infinite-scroll mouse.",
        "The scroll wheel has turned into an alternator! You're producing enough energy to power our servers.",
        "Phenomenal! That wheel is spinning fast enough to generate lift and fly off your desk!"
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
    },
    {
      id: "dragclick" as ViewType,
      title: "Drag Click Test",
      desc: "Check your mouse switch's friction and debounce potential to maximize dragging click frequency.",
      icon: <Mouse className="h-6 w-6 text-emerald-400" />,
      color: "hover:border-emerald-500/50"
    },
    {
      id: "doubleclick" as ViewType,
      title: "Double Click Test",
      desc: "Diagnose mechanical switch double-clicking issues and test rapid mechanical feedback limits.",
      icon: <Sliders className="h-6 w-6 text-amber-400" />,
      color: "hover:border-amber-500/50"
    },
    {
      id: "aim" as ViewType,
      title: "Aim Trainer",
      desc: "Click randomly-appearing targets as fast and accurately as possible. Test precision and speed.",
      icon: <Target className="h-6 w-6 text-rose-400" />,
      color: "hover:border-rose-500/50"
    },
    {
      id: "scroll" as ViewType,
      title: "Scroll Speed Test",
      desc: "Measures scroll wheel speed and consistency. Track steps per second and scrolling feedback.",
      icon: <ArrowUpDown className="h-6 w-6 text-sky-400" />,
      color: "hover:border-sky-500/50"
    }
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in max-w-4xl">
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
  const [touchWarning, setTouchWarning] = useState("");
  const [finalHps, setFinalHps] = useState(0);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    if (isTouchDevice) {
      setTouchWarning(getRandomSpacebarWarning());
    }
  }, [isTouchDevice]);

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
    if (isTouchDevice) {
      setTouchWarning(getRandomSpacebarWarning());
    }
  }, [duration, isTouchDevice]);

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
          <span>⚠️ {touchWarning || "Bro thinks he has a spacebar, who's gonna tell him?"}</span>
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
  const [touchWarning, setTouchWarning] = useState("");
  const [finalCps, setFinalCps] = useState(0);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const rippleIdCounter = useRef(0);
  const lastFinishedClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    if (isTouchDevice) {
      setTouchWarning(getRandomRightClickWarning());
    }
  }, [isTouchDevice]);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const cps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalCps(cps);
    setHumorousMessage(getRightClickHumorousLine(cps, isTouchDevice));
    addHistory("Right Click Test", totalSeconds, cps, getRating(cps).label);
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
    if (isTouchDevice) {
      setTouchWarning(getRandomRightClickWarning());
    }
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
          <span>⚠️ {touchWarning || "You ain't got no Right-Click dude, Buy a mouse first"}</span>
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
            <p className="text-2xl font-bold text-[#a684ff]">RIGHT CLICK HERE</p>
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
            <p className={`text-lg font-bold ${getRating(calculatedCps).color}`}>{getRating(calculatedCps).label}</p>
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
  const [touchWarning, setTouchWarning] = useState("");
  const eventTimestamps = useRef<number[]>([]);
  const lastUpdate = useRef<number>(0);
  const frameRef = useRef<number | null>(null);

  const isTouchDevice = () => {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  };

  const handleStart = () => {
    if (isTouchDevice()) {
      setTouchWarning(getRandomPollingWarning());
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
          <span>⚠️ {touchWarning || "You need a mouse buddy"}</span>
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
  const [humorousMessage, setHumorousMessage] = useState("");
  
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
    const rank = getRating(cps).label;
    addHistory("Jitter Click Coach", totalSeconds, cps, rank);

    const intervals: number[] = [];
    const clicksCopy = [...clickTimestamps.current];
    for (let i = 1; i < clicksCopy.length; i++) {
      intervals.push(clicksCopy[i] - clicksCopy[i - 1]);
    }
    const avg = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length > 0 ? intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length : 0;
    const stdDev = Math.sqrt(variance);
    const calculatedStability = intervals.length >= 2 ? Math.max(0, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 100))) : 0;

    setHumorousMessage(getJitterHumorousLine(cps, calculatedStability, isTouchDevice));
  }, [addHistory, isTouchDevice]);

  const handleJitterReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clickTimestamps.current = [];
    setClicks([]);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    setRipples([]);
    lastRightClickRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleJitterReset();
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
          setHumorousMessage("");
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
              handleJitterReset();
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
            <p className={`text-lg font-bold ${getRating(calculatedCps).color}`}>{getRating(calculatedCps).label}</p>
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
            {humorousMessage && (
              <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed my-2">
                "{humorousMessage}"
              </p>
            )}
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
          onClick={handleJitterReset}
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
  const [humorousMessage, setHumorousMessage] = useState("");
  
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
    const rank = getRating(cps).label;
    addHistory("Butterfly Click Coach", totalSeconds, cps, rank);
    setHumorousMessage(getButterflyHumorousLine(cps, isTouchDevice));
  }, [addHistory, isTouchDevice]);

  const handleButterflyReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clickTimestamps.current = [];
    setClicks([]);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    setRipples([]);
    lastRightClickRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleButterflyReset();
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
          setHumorousMessage("");
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
              handleButterflyReset();
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
            <p className={`text-lg font-bold ${getRating(calculatedCps).color}`}>{getRating(calculatedCps).label}</p>
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
            {humorousMessage && (
              <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed my-2">
                "{humorousMessage}"
              </p>
            )}
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
          onClick={handleButterflyReset}
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
  const [humorousMessage, setHumorousMessage] = useState("");
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
    const rank = getRating(cps).label;
    addHistory("Kohi Retro Test", totalSeconds, cps, rank);
    setHumorousMessage(getKohiHumorousLine(cps, isTouchDevice));
  }, [addHistory, isTouchDevice]);

  const handleKohiReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setClicks(0);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    lastRightClickRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === "finished") {
      if (e.button === 2) { // Right click to reset
        e.preventDefault();
        const now = Date.now();
        if (now - lastRightClickRef.current < 500) {
          handleKohiReset();
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
          setHumorousMessage("");
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
              handleKohiReset();
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
            <p className="text-xs font-bold tracking-widest text-emerald-300">[RANK: {getRating(finalCps).label.toUpperCase()}]</p>
            {humorousMessage && (
              <p className="text-[10px] italic py-1.5 px-2 rounded max-w-[280px] mx-auto text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 font-medium leading-relaxed my-1">
                &gt; "{humorousMessage.toUpperCase()}"
              </p>
            )}
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
        onClick={handleKohiReset}
        className="w-full py-2 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors rounded-lg"
      >
        [RESET_TERMINAL]
      </button>
    </div>
  );
}

/* ==========================================================================
   DRAG CLICK TEST
   ========================================================================== */
export function DragClickTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(3);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [finalCps, setFinalCps] = useState(0);
  const [humorousMessage, setHumorousMessage] = useState("");
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const cps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalCps(cps);
    
    setHumorousMessage(getDragClickHumorousLine(cps, isTouchDevice));

    addHistory("Drag Click Test", totalSeconds, cps, getRating(cps).label);
  }, [addHistory, isTouchDevice]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setCount(0);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
  }, [duration]);

  const triggerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
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
      }, 50);
    } else if (status === "running") {
      clicksRef.current += 1;
      setCount(clicksRef.current);
    }
  }, [status, duration, handleFinished]);

  const handleStopManual = () => {
    if (status !== "running" || duration !== -1) return;
    const elapsed = (Date.now() - (startTimeRef.current ?? Date.now())) / 1000;
    handleFinished(elapsed);
  };

  const elapsedSecs = status === "running" && startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : duration;
  const currentCps = status === "finished" ? finalCps : (status === "running" && elapsedSecs > 0 ? clicksRef.current / elapsedSecs : 0);

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Drag Click Test</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Drag-clicking relies on friction between your skin and the mouse shell to generate super-fast clicks. Perfect for testing switch compatibility and debounce thresholds!
        </p>
      </div>

      {status === "idle" && (
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 5, 10, -1].map(d => (
            <button
              key={d}
              onClick={() => {
                setDuration(d);
                setTimeLeft(d === -1 ? 0 : d);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                duration === d
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {d === -1 ? "Manual" : `${d}s`}
            </button>
          ))}
        </div>
      )}

      <button
        onMouseDown={triggerClick}
        className={`w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 select-none outline-none cursor-pointer ${
          status === "running"
            ? "bg-emerald-500/5 border-emerald-500/50 scale-[0.99] shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            : status === "finished"
            ? "bg-slate-500/5 border-slate-300 dark:border-white/10"
            : "bg-transparent border-slate-200 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.01]"
        }`}
      >
        {status === "idle" && (
          <div className="space-y-1 text-center">
            <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">DRAG CLICK HERE</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Slide your finger with friction to vibrate the mouse switches</p>
          </div>
        )}

        {status === "running" && (
          <div className="text-center space-y-1">
            <p className="text-6xl font-black tabular-nums tracking-tight">{count}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
              {duration === -1 ? `Manual Mode • ${timeLeft.toFixed(1)}s` : `Time Left: ${timeLeft.toFixed(1)}s`}
            </p>
            <p className="text-sm font-bold text-emerald-500">{currentCps.toFixed(1)} Live CPS</p>
          </div>
        )}

        {status === "finished" && (
          <div className="text-center space-y-3 p-4">
            <p className="text-xs text-emerald-500 font-bold uppercase">Test Completed!</p>
            <p className="text-5xl font-black">{finalCps.toFixed(2)} Drag CPS</p>
            <p className={`text-lg font-bold ${getRating(finalCps).color}`}>{getRating(finalCps).label}</p>
            <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-emerald-800 dark:text-emerald-200 bg-emerald-500/5 border border-emerald-500/15 font-medium leading-relaxed">
              "{humorousMessage}"
            </p>
          </div>
        )}
      </button>

      <div className="w-full flex gap-3">
        {duration === -1 && status === "running" && (
          <button
            onClick={handleStopManual}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-lg shadow-red-600/10"
          >
            Stop Test
          </button>
        )}
        {(status === "running" || status === "finished") && (
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   DOUBLE CLICK TEST
   ========================================================================== */
export function DoubleClickTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [clickLogs, setClickLogs] = useState<{ id: number; interval: number; isDouble: boolean }[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [doubleClicksCount, setDoubleClicksCount] = useState(0);
  const [threshold, setThreshold] = useState(80);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [touchWarning, setTouchWarning] = useState("");
  const lastClickTimeRef = useRef<number | null>(null);
  const logIdRef = useRef(0);

  useEffect(() => {
    if (isTouchDevice) {
      setTouchWarning(getRandomDoubleClickWarning());
    }
  }, [isTouchDevice]);

  const handleZoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = performance.now();
    const nextTotal = totalClicks + 1;
    setTotalClicks(nextTotal);

    let nextDoubles = doubleClicksCount;
    if (lastClickTimeRef.current !== null) {
      const interval = now - lastClickTimeRef.current;
      
      if (interval >= 1) {
        const isDouble = interval < threshold;
        if (isDouble) {
          nextDoubles = doubleClicksCount + 1;
          setDoubleClicksCount(nextDoubles);
          addHistory("Double Click Test", 0, interval, "Double Click Detected");
        }

        setClickLogs(prev => [
          { id: logIdRef.current++, interval, isDouble },
          ...prev.slice(0, 19)
        ]);
      }
    }
    lastClickTimeRef.current = now;

    const ratio = nextDoubles / Math.max(1, nextTotal);
    setHumorousMessage(getDoubleClickHumorousLine(ratio, isTouchDevice, nextDoubles));
  };

  const handleReset = () => {
    setClickLogs([]);
    setTotalClicks(0);
    setDoubleClicksCount(0);
    lastClickTimeRef.current = null;
    setHumorousMessage("");
    if (isTouchDevice) {
      setTouchWarning(getRandomDoubleClickWarning());
    }
  };

  let statusColor = "text-emerald-500 dark:text-emerald-400";
  let statusText = "Standard Clicks Only";
  let statusDesc = "Consistently registering single clicks. Perfect for general accuracy, desktop navigation, and precision tasks.";

  if (doubleClicksCount > 0) {
    const ratio = doubleClicksCount / Math.max(1, totalClicks);
    if (ratio > 0.15) {
      statusColor = "text-indigo-500 dark:text-indigo-400";
      statusText = "High CPS Potential / Active Chatter";
      statusDesc = "Highly responsive double-clicking active! Outstanding potential for pushing ultra-high CPS limits in competitive clicking or games like Minecraft.";
    } else {
      statusColor = "text-amber-500 dark:text-amber-400";
      statusText = "Moderate CPS Boost / Sensitive Switches";
      statusDesc = "Sensitive switches with moderate double-clicks detected. Great for gaining a quick mechanical speed advantage without sacrificing normal control.";
    }
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-fade-in">
      {isTouchDevice && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ {touchWarning || "Bro thinks his finger is a mouse button"}</span>
        </div>
      )}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Double Click Test</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Calibrate your double-clicking speed or test mechanical switch sensitivity. Measures the exact millisecond interval between consecutive click signals.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-500/5 p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300">Double Click Delay Threshold:</span>
          <span className="font-mono font-black text-amber-500">{threshold}ms</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
          Any consecutive click registering under this duration is flagged as an intentional or mechanical double click. Standard gaming mouse delay is 40-80ms.
        </p>
      </div>

      <div className="w-full grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Clicks</p>
          <p className="text-2xl font-black">{totalClicks}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Double Clicks</p>
          <p className="text-2xl font-black text-indigo-500">{doubleClicksCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Double-Click Rate</p>
          <p className="text-2xl font-black text-amber-500">
            {totalClicks > 0 ? `${((doubleClicksCount / totalClicks) * 100).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </div>

      <button
        onMouseDown={handleZoneClick}
        className="w-full h-40 rounded-3xl border-2 border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:border-amber-500/40 hover:bg-amber-500/[0.03] active:scale-[0.99] transition-all flex flex-col items-center justify-center relative select-none outline-none cursor-pointer"
      >
        <p className="text-xl font-bold text-amber-500">CLICK TEST AREA</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click here continuously at normal or high speed</p>
      </button>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 flex flex-col justify-center">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">Double-Click Dynamic Status</p>
          <p className={`text-lg font-black ${statusColor}`}>{statusText}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{statusDesc}</p>
          {humorousMessage && (
            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 italic mt-3 border-t border-slate-100 dark:border-white/5 pt-2">
              "{humorousMessage}"
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 h-44 flex flex-col">
          <p className="text-xs uppercase font-bold text-slate-400 mb-2">Live Click Logs (Latest)</p>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-1">
            {clickLogs.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-center py-8">No clicks registered yet...</p>
            ) : (
              clickLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-1">
                  <span className="text-slate-400">Interval:</span>
                  <span className={log.isDouble ? "text-indigo-500 font-bold" : "text-emerald-500 font-medium"}>
                    {log.interval.toFixed(1)} ms {log.isDouble ? "⚡ [DOUBLE]" : "✓"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
      >
        Reset Logs
      </button>
    </div>
  );
}

/* ==========================================================================
   AIM TRAINER
   ========================================================================== */
export function AimTrainer({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [duration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [avgReaction, setAvgReaction] = useState(0);
  const [target, setTarget] = useState<{ x: number; y: number; size: number } | null>(null);
  const [humorousMessage, setHumorousMessage] = useState("");

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const spawnTarget = useCallback(() => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    
    const targetSize = 36;
    const xRange = rect.width - targetSize - 20;
    const yRange = rect.height - targetSize - 20;

    const randomX = Math.random() * xRange + 10;
    const randomY = Math.random() * yRange + 10;

    setTarget({ x: randomX, y: randomY, size: targetSize });
    lastSpawnTimeRef.current = performance.now();
  }, []);

  const handleFinished = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    setTarget(null);

    const totalClicks = hitsRef.current + missesRef.current;
    const accuracy = totalClicks > 0 ? (hitsRef.current / totalClicks) * 100 : 0;
    const avgReact = reactionTimesRef.current.length > 0
      ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
      : 0;
    setAvgReaction(avgReact);

    const finalScore = hitsRef.current * (accuracy / 100);
    const ratingLabel = finalScore >= 20 ? "Legendary" : finalScore >= 15 ? "Pro" : finalScore >= 11 ? "Great" : finalScore >= 7 ? "Good" : finalScore >= 4 ? "Average" : "Beginner";

    setHumorousMessage(getAimHumorousLine(hitsRef.current, accuracy, avgReact, isTouchDevice));
    addHistory("Aim Trainer", duration, hitsRef.current, `${ratingLabel} (${accuracy.toFixed(0)}% Acc)`);
  }, [addHistory, duration, isTouchDevice]);

  const handleStart = () => {
    hitsRef.current = 0;
    missesRef.current = 0;
    reactionTimesRef.current = [];
    setHits(0);
    setMisses(0);
    setAvgReaction(0);
    setTimeLeft(duration);
    setHumorousMessage("");
    setStatus("running");
    startTimeRef.current = performance.now();
    spawnTarget();

    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleFinished();
      }
    }, 100);
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "running") return;

    const clickTime = performance.now();
    const reaction = clickTime - lastSpawnTimeRef.current;
    reactionTimesRef.current.push(reaction);

    hitsRef.current += 1;
    setHits(hitsRef.current);

    const avg = reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length;
    setAvgReaction(avg);

    spawnTarget();
  };

  const handleArenaClick = (e: React.MouseEvent) => {
    if (status !== "running") return;
    missesRef.current += 1;
    setMisses(missesRef.current);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setHits(0);
    setMisses(0);
    setAvgReaction(0);
    setTarget(null);
    setTimeLeft(duration);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalClicks = hits + misses;
  const accuracy = totalClicks > 0 ? (hits / totalClicks) * 100 : 100;

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Aim Trainer</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Test your high-precision mouse tracking and tactical reflexes. Hit randomly spawning micro-targets as quickly and accurately as possible!
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-3 text-center">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Hits</p>
          <p className="text-lg font-black text-emerald-500">{hits}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
          <p className="text-lg font-black text-indigo-500">{accuracy.toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Avg Time</p>
          <p className="text-lg font-black text-amber-500">{avgReaction > 0 ? `${avgReaction.toFixed(0)}ms` : "0ms"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Time Left</p>
          <p className="text-lg font-black text-rose-500">{timeLeft.toFixed(1)}s</p>
        </div>
      </div>

      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className={`w-full h-80 rounded-3xl relative border overflow-hidden transition-all duration-300 ${
          status === "running"
            ? "bg-slate-950 border-rose-500/20 cursor-crosshair"
            : "bg-slate-900/5 border-slate-200 dark:border-white/10"
        }`}
      >
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/20">
              <Target className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Are you ready to test your precision?</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">The 15-second counter begins instantly when you hit START.</p>
            </div>
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-sm tracking-widest uppercase rounded-xl transition-all shadow-md shadow-rose-500/15 cursor-pointer"
            >
              Start Trainer
            </button>
          </div>
        )}

        {status === "running" && target && (
          <button
            onMouseDown={handleTargetClick}
            style={{
              position: 'absolute',
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.size}px`,
              height: `${target.size}px`,
            }}
            className="rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-white/40 group active:scale-90"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </button>
        )}

        {status === "finished" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/95">
            <p className="text-xs text-rose-500 font-bold uppercase tracking-widest">Training Ended</p>
            <p className="text-5xl font-black text-white">{hits} Hits</p>
            <div className="flex gap-4 text-xs font-mono text-slate-400">
              <span>ACCURACY: <b className="text-indigo-400">{accuracy.toFixed(1)}%</b></span>
              <span>•</span>
              <span>REACTION: <b className="text-amber-400">{avgReaction.toFixed(0)}ms</b></span>
              <span>•</span>
              <span>MISSES: <b className="text-rose-400">{misses}</b></span>
            </div>
            <p className="text-[11px] max-w-xs text-slate-300 italic py-1 px-3 border border-white/5 rounded-lg bg-white/5">
              "{humorousMessage}"
            </p>
            <button
              onClick={handleReset}
              className="mt-3 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              Restart
            </button>
          </div>
        )}
      </div>

      {status === "running" && (
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
        >
          Abandon Challenge
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   SCROLL SPEED TEST
   ========================================================================== */
export function ScrollTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [timeLeft, setTimeLeft] = useState(5);
  const [scrollSteps, setScrollSteps] = useState(0);
  const [peakSpeed, setPeakSpeed] = useState(0);
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [touchWarning, setTouchWarning] = useState("");

  const scrollZoneRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const recentStepsRef = useRef<{ time: number }[]>([]);
  const peakSpeedRef = useRef(0);

  const duration = 5;

  useEffect(() => {
    if (isTouchDevice) {
      setTouchWarning(getRandomScrollWarning());
    }
  }, [isTouchDevice]);

  const handleFinished = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");

    const stepsSec = stepsRef.current / duration;
    setHumorousMessage(getScrollHumorousLine(stepsSec, isTouchDevice));
    addHistory("Scroll Speed Test", duration, stepsRef.current, `${stepsSec.toFixed(0)} steps/s`);
  }, [addHistory, isTouchDevice]);

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setScrollSteps(0);
    setPeakSpeed(0);
    setUpCount(0);
    setDownCount(0);
    setTimeLeft(duration);
    stepsRef.current = 0;
    peakSpeedRef.current = 0;
    recentStepsRef.current = [];
    setHumorousMessage("");
    if (isTouchDevice) {
      setTouchWarning(getRandomScrollWarning());
    }
  };

  useEffect(() => {
    const el = scrollZoneRef.current;
    if (!el || status !== "running") return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      stepsRef.current += 1;
      setScrollSteps(stepsRef.current);

      if (e.deltaY < 0) {
        setUpCount(prev => prev + 1);
      } else {
        setDownCount(prev => prev + 1);
      }

      recentStepsRef.current.push({ time: now });
      recentStepsRef.current = recentStepsRef.current.filter(x => now - x.time < 500);
      
      const currentSpeed = recentStepsRef.current.length * 2;
      if (currentSpeed > peakSpeedRef.current) {
        peakSpeedRef.current = currentSpeed;
        setPeakSpeed(currentSpeed);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [status]);

  const handleStart = () => {
    handleReset();
    setStatus("running");
    startTimeRef.current = performance.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleFinished();
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const elapsedSecs = status === "running" ? (performance.now() - startTimeRef.current) / 1000 : duration;
  const stepsSec = status === "finished" ? scrollSteps / duration : (status === "running" && elapsedSecs > 0 ? scrollSteps / elapsedSecs : 0);

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-fade-in">
      {isTouchDevice && (
        <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold justify-center">
          <AlertCircle className="h-5 w-5 animate-bounce shrink-0" />
          <span>⚠️ {touchWarning || "Bro's out here scrolling with vibes, no wheel detected"}</span>
        </div>
      )}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Scroll Speed Test</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Scroll up or down as fast as possible in the designated test box. Measures scroll steps per second and detects double-back wheel skipping.
        </p>
      </div>

      <div className="w-full grid grid-cols-4 gap-3 text-center">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Total Steps</p>
          <p className="text-lg font-black text-sky-500">{scrollSteps}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Steps/Sec</p>
          <p className="text-lg font-black text-indigo-500">{stepsSec.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Peak Velocity</p>
          <p className="text-lg font-black text-amber-500">{peakSpeed} stp/s</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 flex flex-col justify-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Time Left</p>
          <p className="text-lg font-black text-rose-500">{timeLeft.toFixed(1)}s</p>
        </div>
      </div>

      <div
        ref={scrollZoneRef}
        className={`w-full h-56 rounded-3xl relative border flex flex-col items-center justify-center transition-all duration-300 select-none overflow-hidden ${
          status === "running"
            ? "bg-sky-500/[0.02] border-sky-500/50 scale-[0.99] shadow-[0_0_20px_rgba(56,189,248,0.1)] cursor-ns-resize"
            : "bg-transparent border-slate-200 dark:border-white/10 hover:border-sky-500/30 hover:bg-sky-500/[0.01]"
        }`}
      >
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Scroll Zone ready</p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs tracking-widest uppercase rounded-xl transition-all cursor-pointer"
            >
              Start Scrolling
            </button>
          </div>
        )}

        {status === "running" && (
          <div className="text-center space-y-2 animate-pulse">
            <ArrowUpDown className="h-8 w-8 text-sky-500 mx-auto mb-1 animate-bounce" />
            <p className="text-lg font-black text-sky-500">SCROLL VIGOROUSLY HERE</p>
            <p className="text-[10px] text-slate-400">Up: {upCount} steps | Down: {downCount} steps</p>
          </div>
        )}

        {status === "finished" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-white dark:bg-[#09090b] z-10">
            <p className="text-xs text-sky-500 font-bold uppercase tracking-wider">Test Completed</p>
            <p className="text-4xl font-black">{scrollSteps} Total Steps</p>
            <p className="text-sm font-bold text-indigo-500">{(scrollSteps / duration).toFixed(1)} Steps per Second</p>
            <p className="text-[11px] max-w-sm text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-2 rounded-xl">
              "{humorousMessage}"
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Restart
            </button>
          </div>
        )}
      </div>

      {status === "running" && (
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
        >
          Reset Test
        </button>
      )}
    </div>
  );
}
