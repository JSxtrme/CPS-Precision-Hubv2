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
import { handleGlowMove } from './glow';

// Custom hook to disable page scrolling and zooming on touch devices when a test is active.
//
// LAYOUT-NEUTRAL scroll lock (2026-11-01, replaces the pin-at-position lock
// from commit 00760381): while a test runs on touch, a non-passive document
// touchmove listener preventDefaults every move (except inside a genuinely
// scrollable inner element, e.g. a log with overflow-y-auto), so the page
// cannot scroll during the run. NOTHING else is touched: body position,
// top, width, overflow and scroll position are never written, so there is
// nothing to jump, repaint or restore — the page cannot jerk to the top and
// no element can vanish and reappear.
//
// Why the pin had to go: on the user's phone the pin (body position:fixed
// with top:-scrollY + html/body overflow:hidden) made every element vanish
// the moment a CPS test started, leaving only the fixed blue background,
// and the result came out at 1 CPS — only the starting tap had counted,
// because the pad was unreachable for the rest of the run. The pin was
// removed entirely rather than tweaked: a layout-neutral lock has no
// layout change that could reproduce that failure mode. (The exact mobile
// repaint mechanism could not be proven in a local desktop build; removing
// the suspect code entirely is the safe fix.)
//
// The ORIGINAL hook (main / /old) never locked body scroll at all: it only
// prevented multi-touch pinch/zoom (touchstart/touchmove with touches>1,
// gesturestart/change) and relied on the pad's touch-action: pan-y + ~12px
// move threshold to tell a swipe from a tap. That pinch/zoom prevention is
// kept verbatim below. When lockEnabled is false (CPS with the Settings
// scroll-lock toggle off) the hook is exactly that original behaviour.
// The CPS rig passes the Settings toggle as lockEnabled; other modules,
// which do not receive prefs, lock by default during a run.
export function useDisableScrollZoomOnTouch(isRunning: boolean, isTouchDevice: boolean, lockEnabled: boolean = true) {
  useEffect(() => {
    if (!isTouchDevice || !isRunning) return;

    const originalTouchAction = document.body.style.touchAction;

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

    // Layout-neutral scroll lock: block page scroll for the whole gesture,
    // not just pinch. Touches inside a scrollable inner element are left
    // alone so logs/lists inside a test can still scroll. This does NOT
    // cancel taps: touchstart/touchend (and the pad's click path) still
    // fire, so every tap on the pad counts normally.
    const lockTouchMove = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest && (t.closest('[data-allow-scroll]') || t.closest('.overflow-y-auto'))) return;
      e.preventDefault();
    };

    if (lockEnabled) {
      document.addEventListener('touchmove', lockTouchMove, { passive: false });
    }

    document.addEventListener("touchstart", preventZoomAndScroll, { passive: false });
    document.addEventListener("touchmove", preventZoomAndScroll, { passive: false });
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });

    return () => {
      if (lockEnabled) {
        document.removeEventListener("touchmove", lockTouchMove);
      }
      document.body.style.touchAction = originalTouchAction;
      document.removeEventListener("touchstart", preventZoomAndScroll);
      document.removeEventListener("touchmove", preventZoomAndScroll);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
    };
  }, [isRunning, isTouchDevice, lockEnabled]);
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
        "Screen spacebar power-saver mode: fully activated.",
        "Are your thumbs currently glued together? Not a single space hit.",
        "Did you think the spacebar was a decorative frame? Tap it!",
        "Zero HPS. Your thumb has entered deep hibernation mode on glass.",
        "The touchscreen's virtual spacebar is wondering if it's dead or just lonely.",
        "Is the spacebar invisible to you on glass, or are you hoping for telepathic touch activations?",
        "Perfect zero. Your thumb is currently resting on the bezel like a sleepy lizard.",
        "Your touch-spacebar is so clean, it still has the original screen-protector aroma.",
        "Are you afraid of leaving a fingerprint? Give that virtual spacebar a heavy thumb slam!",
        "Zero space activations. Did your fingers choose to take an unpaid leave of absence?",
        "The screen is literally glowing, but your thumbs are in complete visual denial.",
        "No inputs. Even the dust settling on your screen is registering more static electricity than you.",
        "Your capacitive sensor is feeling extremely ignored. Show it some love!"
      );
    } else if (score > 0 && score < 3) {
      choices.push(
        "1-2 HPS. A sleeping sloth is literally typing faster than you right now.",
        "Your finger is moving like it's stuck in thick molasses. Pick up the pace!",
        "Is the digital spacebar key too slippery for your fingers? Press it!",
        "You're tapping with the intensity of a gentle breeze on a windowpane.",
        "Touch spacebar speed matches the speed of a snail climbing an oily glass surface.",
        "Are you afraid of wearing out the virtual spring? Touch is completely free!",
        "You tap like you're reading the terms of service letter-by-letter. Accelerate!",
        "Your thumbs have the reaction velocity of cold cheese. Shake them up!",
        "Are you examining the glass molecules before every touch? Speed up!",
        "At this speed, you aren't tapping, you are just occasionally leaning on the display.",
        "Are you typing with a feather? Speak up, the glass can barely feel you!",
        "Your thumbs are reacting with the speed of continental drift. Let's pick it up!",
        "You tap like you're playing a turn-based board game in slow motion. Smash it!",
        "This rate is great if you are trying to write one word per hour. Step on it!",
        "Are your thumbs made of heavy concrete blocks? Vibrate them!",
        "Is your thumb checking its GPS coordinates before every single glass contact?",
        "Your tapping interval is so long, the screen has time to go into power-saving mode.",
        "You're tapping like you are trying to read a menu in a dark restaurant. Speed up!"
      );
    } else if (score >= 3 && score < 6) {
      choices.push(
        "3-5 HPS. Polite golf clap tempo. The crowd is looking for the exit.",
        "Decent rhythm, but your thumbs are giving 'I need a chamomile tea' vibes.",
        "Not bad for a slow-motion simulation of typing, but we need speed!",
        "You're tapping the screen like you're trying not to wake up a sleeping puppy.",
        "Your spacebar tapping has the consistency of a slow dripping kitchen faucet.",
        "Are you reading the instruction manual between taps? Get moving!",
        "Decent typing-test speed, but highly average for a spacebar slam challenge.",
        "Your finger is doing light cardio when it should be running a gold-medal sprint.",
        "A very polite, soft rhythm. Too bad politeness doesn't win speed tests!",
        "Your pace is perfect for reading a slow-scrolling document. Let's see some arm power!",
        "A steady, polite rhythm, like a clock ticking in a quiet library.",
        "Your thumb is doing light stretching. Let's turn that stretch into a dynamic sprint!",
        "Decent, but your grandma's voice-to-text typing is still faster than this.",
        "You are tapping at the speed of a dial-up modem handshake. We need broadband speed!",
        "Your thumbs have a nice leisurely pace. Too bad this is a speed challenge, not a stroll!",
        "This tempo is perfect for scrolling a cooking blog. Let's see some PvP panic!",
        "Rhythm is solid, but you're treating the touchscreen like a fragile priceless painting.",
        "Your thumb is tensing up. Release the tension and vibrate that wrist!"
      );
    } else if (score >= 6 && score < 9) {
      choices.push(
        "6-8 HPS. Respectable speed! Your thumb has officially entered cardio mode.",
        "Solid touch rate. Your screen's capacitive sensor is actually paying attention now.",
        "You tap faster than a teenager texting gossip to their best friend.",
        "Very stable tempo. You're definitely skipping dialogues in mobile RPGs easily.",
        "Good effort! The glass is feeling a tiny bit of friction now.",
        "Are you jitter-tapping your thumb or just in a state of caffeine panic?",
        "That's a solid drumbeat. If you had a miniature drum, we'd have a nice groove.",
        "The virtual spacebar is starting to feel some serious tactile pressure. Keep going!",
        "Your finger agility is very impressive for a touch device. Solid rate!",
        "You are definitely ready to skip every single unskippable cutscene in mobile games.",
        "Solid clacking on glass! Your thumb is officially in the zone.",
        "Nice, fast thumb-drumming! You could easily skip all cutscenes in a mobile RPG.",
        "Your thumb is moving like a happy puppy's wagging tail. Very respectable speed!",
        "Excellent! The capacitive matrix is really feeling your rhythmic taps now.",
        "You are skipping dialogues faster than a speedrunner. Very impressive glass-tapping!",
        "Your thumbs are definitely experienced with virtual controller buttons. Smooth rate!",
        "Now we're talking! The glass is getting quite warm from your rapid thumb maneuvers.",
        "Excellent! A highly consistent tapping sound that commands respect."
      );
    } else if (score >= 9 && score < 12) {
      choices.push(
        "9-11 HPS! Absolute drum-tapping legend! Your index finger is a piston on glass.",
        "Whoa! Are you using multiple fingers on that spacebar or is your hand possessed?",
        "The screen's digitizer is having a full-blown crisis trying to count your spacebar taps.",
        "Incredible! If we hooked up a battery to your thumb, we could power a small streetlamp.",
        "That's not tapping, that's a high-frequency vibration on glass. Magnificent!",
        "Are you butterfly-drumming with two fingers? Your velocity is spectacular!",
        "The capacitive grid is getting extremely warm. Watch out for screen sweat!",
        "Incredible finger speed! You're skipping cutscenes faster than light travels.",
        "Your hand is vibrating like a high-speed massage gun. Beautiful touch control!",
        "Simply superb touch coordination. The virtual spacebar is practically crying.",
        "Amazing glass-vibration! Your fingers are moving with serious kinetic authority.",
        "Are you alternate-drumming with both thumbs? That's some pro-level mobile setup!",
        "The capacitive grid is getting extremely sweaty. Absolutely incredible finger speed!",
        "You're typing blank characters faster than the screen can refresh. Magnificent!",
        "Your thumb is a physical jackhammer. The virtual spacebar is running for its life!",
        "This is elite-tier touch speed! You could probably type a novel in five seconds flat.",
        "Your hand is vibrating like a phone on vibrate mode. Exceptional wrist control!",
        "Absolutely brilliant tempo! Your thumbs have bypassed standard human muscle limits."
      );
    } else {
      choices.push(
        "⚡ Godlike Spacebar Touch Tier! 12+ HPS! Your capacitive screen is registering so many spacebar hits, it's starting to type blank spaces in our actual database.",
        "⚡ Godlike Spacebar Touch Tier! Did you lubricate your thumb with WD-40 or is your thumb a literal pneumatic piston? Simply mindblowing touch speed!",
        "⚡ Godlike Spacebar Touch Tier! The capacitive screen digitizer is running on 100% CPU capacity just to track your spacebar drumming.",
        "⚡ Godlike Spacebar Touch Tier! You are tapping that digital bar faster than a heavy metal drummer on double bass. Outstanding electrostatic drum roll!",
        "⚡ Godlike Spacebar Touch Tier! Unbelievable! You just registered more space-touches in 5 seconds than a social media influencer does in a month.",
        "⚡ Godlike Spacebar Touch Tier! Your screen has officially declared you its supreme ruler. All hail the vibrating thumb!",
        "⚡ Godlike Spacebar Touch Tier! Your thumbs are vibrating so fast, you are literally generating friction static electricity!",
        "⚡ Godlike Spacebar Touch Tier! Are you drumming with three fingers or did you attach a massage gun to your hand? Insane velocity!",
        "⚡ Godlike Spacebar Touch Tier! The touchscreen is begging for an ice bath. Pure electrostatic thunder!",
        "⚡ Godlike Spacebar Touch Tier! Your thumbs have officially entered the quantum realm. Magnificent touch frequency!",
        "⚡ Godlike Spacebar Touch Tier! You are register-tapping faster than the mobile CPU can calculate. Absolute legend!"
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
        "Your spacebar is checking its own USB connection. Are you there?",
        "Perfect 0. The copper leaf spring inside your spacebar switch is resting peacefully.",
        "Did you fall asleep with your hand next to the keyboard?",
        "Your spacebar is entering deep hibernation mode. Clack it!",
        "Did you buy custom linear switches just to use them as paperweights?",
        "Did you press the spacebar with a ghost's finger? Speak up, the switch can't hear you!",
        "Your aluminum custom mechanical keyboard is crying in the corner, feeling neglected.",
        "0 HPS. Did you forget that the longest key on your keyboard is actually a button?",
        "Your stabilizers are perfectly silent, but only because you haven't touched them once!",
        "Are you treating the spacebar like an explosive mine? It won't blow up, press it!",
        "Did your thumb choose to take a vacation today? Not a single mechanical clack!",
        "Zero space activations. Perfect rate for doing absolutely nothing.",
        "Your Gateron switches are completely unbothered. Let's hear some clacking noise!"
      );
    } else if (score > 0 && score < 3) {
      choices.push(
        "1-2 HPS. Are your mechanical keyboard stabilizers lubed with honey? It's stuck!",
        "Your thumb is reacting with the velocity of continental plates. Press that key!",
        "Are you playing in slow-mo, or did you buy a linear switch with 10kg actuation force?",
        "You clack like a sleepy typist on a 1920 typewriter. Wake up!",
        "At this speed, you aren't space-bar clicking; you are writing a slow love letter to your keyboard.",
        "Is your keyboard's steel plate too heavy for your thumb? Let's see some power!",
        "You are treating that massive spacebar like a fragile ancient relic. Slam it!",
        "Your stabilizer bars are yawning. Give them a reason to click!",
        "Your thumb's reactivity is comparable to frozen maple syrup. Overclock your forearm!",
        "Are you carefully inspecting the keycap texture before every single clack?",
        "1-2 HPS. Your thumb has the reaction time of a frozen maple syrup jar.",
        "Is your spacebar switch spring rated for 500 grams? It feels like you're lifting weights!",
        "Are you carefully reading the brand name on the keycap before every single clack?",
        "You clack like a sleepy typist on a heavy vintage typewriter from 1890. Speed up!",
        "Your stabilizer wire is yawning. Give it a real mechanical workout!",
        "At this speed, your character would jump once and get shot three times before landing.",
        "Your hand looks like it's taking a gentle nap on the lower row. Vibrate that thumb!",
        "Is there a sticky spill under your spacebar keycap? Let's get that mechanical clack moving!"
      );
    } else if (score >= 3 && score < 6) {
      choices.push(
        "3-5 HPS. Did you buy Cherry MX Brown switches just to click them once a minute?",
        "You're pressing the spacebar with the gentle grace of a butterfly landing on a flower. Smash it!",
        "We can hear your stabilizers rattling from here, but only because they rattle once a year.",
        "Decent speed for a spreadsheet session, but highly mediocre for gaming.",
        "Your thumb looks like it's dreaming of a mattress. Give it some caffeine!",
        "Spacebar spring is working, but it's not even warm. Pick up the tempo!",
        "You click with the speed of an average bureaucrat stamping paperwork. Accelerate!",
        "Rhythm is okay, but you're treating the space switch like a delicate flower. Mash it!",
        "A highly polite clacking sound. This is a speed test, not a library!",
        "Your stabilizer wire is mildly amused. It expected some real vibration.",
        "3-5 HPS. Polite office typing speed. The PvP lobby is highly unimpressed.",
        "You're clicking the spacebar like you're trying to not wake up a sleeping house. Mash it!",
        "Rhythm is okay, but you're treating the space switch like a delicate flower.",
        "We can hear your stabilizers rattling, but only because they rattle once a year.",
        "A highly polite clacking sound. This is a speed test, not a public library!",
        "Your spacebar is getting clicked, but the switch copper leaf isn't even warm yet.",
        "Decent typing-test speed, but absolute doom for any competitive speedrun jumping.",
        "Your thumb is doing light stretching when it should be performing high-frequency sprints."
      );
    } else if (score >= 6 && score < 9) {
      choices.push(
        "6-8 HPS! Solid clacking! The spacebar spring is getting a legitimate workout.",
        "Great speed! You've definitely mastered the thumb-roll technique on the bottom row.",
        "Your mechanical switches are sounding like a miniature drum roll. Respectable!",
        "Nice, fast spacebar presses. You can definitely jump-bridge with this speed.",
        "The steel plate of your keyboard is vibrating. Excellent rhythm!",
        "Now we're cooking. Your mechanical stabilizers are getting a decent workout.",
        "A very snappy clack! You're definitely skipping dialogue in RPGs like a pro.",
        "Your index or thumb is moving with real purpose. Excellent speed runner potential!",
        "Solid performance! You are definitely ready for competitive typing speedruns.",
        "Your keyboard backplate is starting to sing. Keep the clacking tempo steady!",
        "6-8 HPS! Solid clacking! Your mechanical spacebar is getting a real workout.",
        "Excellent thumb-roll technique! The mechanical spring is singing in solid rhythm.",
        "Your keyboard plate is vibrating. Excellent tempo and beautiful mechanical clack!",
        "Now we're cooking. Your custom lubed stabilizers are finally earning their keep.",
        "Very snappy clack! You are definitely skipping dialogues in RPGs like an elite speedrunner.",
        "Nice, fast spacebar presses. Your hand coordination is looking highly competent.",
        "Your mechanical switch is clacking happily. A beautiful rhythmic drum solo!",
        "Solid performance! You are definitely ready for competitive typing battles."
      );
    } else if (score >= 9 && score < 12) {
      choices.push(
        "9-11 HPS! Absolute clack master! Your thumb is moving faster than a machine gun!",
        "Are you vibrating your entire wrist on that spacebar or are you just a machine?",
        "The stabilizers have entered a state of quantum superposition. Absolutely legendary clacking!",
        "Your mechanical switches are crying tears of solder. Incredible speed!",
        "You've bottomed out that spacebar so many times it's practically part of the desk now.",
        "Are you alternate-fingering the spacebar? That mechanical speed is incredible!",
        "The copper contacts are operating at maximum thermal design limits. Pure fire!",
        "Your mechanical spacebar sounds like an active jackhammer. Spectacular speed!",
        "Logitech and Razer are celebrating your thumb speed because you'll need a new keyboard soon.",
        "Simply epic! The mechanical clacking sounds like a professional drum-roll solo.",
        "9-11 HPS! Absolute clack master! Your thumb is moving faster than an active jackhammer!",
        "Are you alternate-drumming the spacebar with both index fingers? That mechanical speed is unreal!",
        "The stabilizers have entered a state of quantum superposition. Absolutely epic clacking!",
        "Your mechanical switches are crying tears of hot solder. Incredible thumb velocity!",
        "You've bottomed out that keycap so many times it's practically fused with the desk.",
        "Your mechanical spacebar sounds like a high-speed machine gun. Incredible rhythm!",
        "Logitech and Razer are celebrating your speed because you'll need a new spacebar soon.",
        "Simply phenomenal! The mechanical clacking sounds like a professional drum-roll solo."
      );
    } else {
      choices.push(
        "⚡ Godlike Spacebar PC Tier! 12+ HPS! The stabilizer bars on your spacebar are currently glowing orange from pure kinetic heat. Magnificent clacking!",
        "⚡ Godlike Spacebar PC Tier! You're clicking so fast, your spacebar switches are about to trigger a localized seismic warning.",
        "⚡ Godlike Spacebar PC Tier! The copper contacts inside your mechanical spacebar switch have officially welded themselves shut. Absolute legend!",
        "⚡ Godlike Spacebar PC Tier! Your keyboard's backplate is vibrating at 400Hz. If we attach an alternator, we can power a small gaming setup.",
        "⚡ Godlike Spacebar PC Tier! Did you borrow a woodpecker's beak to hit the spacebar or is your thumb just built different? Simply incredible!",
        "⚡ Godlike Spacebar PC Tier! The mechanical microswitches are tensing up on their own. Absolute master of bottoming out!",
        "⚡ Godlike Spacebar PC Tier! The stabilizer wires are currently glowing bright red from pure kinetic friction. Magnificent!",
        "⚡ Godlike Spacebar PC Tier! Are you alternate-finger drumming or did you attach a high-frequency massage gun? Outstanding clacking!",
        "⚡ Godlike Spacebar PC Tier! The copper leaf spring has welded itself shut from sheer velocity. Magnificent performance!",
        "⚡ Godlike Spacebar PC Tier! Your keyboard backplate is vibrating at 400Hz. If we attach an alternator, we can power a small village!",
        "⚡ Godlike Spacebar PC Tier! The switches are praying to the mechanical gods for mercy. Absolute master of bottoming out!"
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
        "Perfect 0. The digitizer is literally taking a nap right now.",
        "Are your thumbs currently glued together? Not a single right touch.",
        "The glass has remained completely untouched on the right side. Perfect zero!",
        "The right-touch quadrant is wondering if you lost your hand in a tragic speed-scrolling accident.",
        "Zero right clicks on glass. Did you think the right side of the screen was haunted?",
        "No inputs. Even the static charges on your screen are laughing at this zero.",
        "Are you clicking in your dreams or is your screen too afraid of your right hand?"
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. At this rate, your finger is moving like it's stuck in a vat of cold peanut butter.",
        "Are you tapping with your nose? Speed it up!",
        "Very slow right tapping. The local snail just zoomed past your touch cursor.",
        "You tap like you're carefully placing a fragile glass sticker. Give it some energy!",
        "Your touch-responsiveness has the latency of a dial-up connection. Wake up!",
        "That was a single gentle tap. The screen barely noticed your middle finger.",
        "You are tapping the glass with the speed of an apple falling from a tree in slow-motion.",
        "Is there a sticky layer of pancake syrup on the right side of your phone? Speed up!",
        "You click like you're trying to carefully count every single RGB subpixel. Faster!",
        "Your right touch-responsiveness is currently modeled after continental plate tectonics."
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        `${Math.round(cps)} HPS. Decent if you are opening a menu, but absolute doom in any speed challenge.`,
        "You tap like you're politely knocking on a window. Tap that screen like it owes you lunch money!",
        "Continental drift is currently keeping up with your tap speed. Accelerate!",
        "Your middle finger feels like it needs a major software update. Wake up!",
        "You tap like you're trying to not wake up a sleeping cat on your lap.",
        "Is your finger feeling shy? Give it some physical encouragement!",
        "A lovely, leisurely rate. Too bad this is a speed test, not a spa massage!",
        "Your middle finger is moving like it's trying to make a very polite, low-stakes request.",
        "Decent, if you're selecting an app icon. Disaster if you are aiming for survival.",
        "You're tapping like you're trying to not wake up a sleeping hamster on your shoulder."
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        `${Math.round(cps)} HPS. Average speed. Not terrible, but you're definitely not breaking any records.`,
        "The screen is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of rapid taps!",
        "Are you tapping with your knuckles? Lift those fingers and use your tip!",
        "Average touch responsiveness. Your finger has officially earned its participation trophy.",
        "Decent baseline. Now start vibrating that arm and double down!",
        "Average right-tapping speed. Perfect for an NPC dialogue skip, but highly mediocre!",
        "The screen's capacitive sensor is nodding politely. It's not impressed, but it's paying attention.",
        "A steady tempo of tapping. Let's see some wrist vibration and turn up the heat!",
        "Your middle finger has earned a standard-grade certificate for moderate screen touching."
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        `${Math.round(cps)} HPS! Respectable! Your fingers have definitely spent time on intense games.`,
        "Your right clicks are getting fast. Is your tapping hand secretly working out behind your back?",
        "Good speed! You can actually hold your ground with this touch rate.",
        "The glass is warming up! The capacitive field is feeling your authority.",
        "That's a solid vibration. Are you alternate-tapping or just in sheer panic?",
        "Your finger is flying! You're definitely skipping dialogue in mobile games easily.",
        "Nice snapping rhythm! Your middle finger is definitely showing some genuine coordination.",
        "Very fast right taps! You are skipping cutscenes with elite-level speed runner energy.",
        "Good velocity! The glass digitizer is feeling some warm, high-frequency energy now.",
        "Solid tempo. Your hand is moving in a beautiful rhythm of competitive focus."
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        `${Math.round(cps)} HPS! Phenomenal! Your hand is moving so fast it's generating its own weather system.`,
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right tapping. The glass is crying tears of friction.",
        "Your double-tap right clicks are incredibly crisp. Highly optimized touch finger!",
        "Excellent high-fidelity tapping. The screen's glass is getting quite warm.",
        "Are you tapping with multiple fingers or is your index finger just highly caffeinated?",
        "Incredible drum roll! Your middle finger is a blur on the right side of the screen!",
        "Are you alternate-tapping with both fingers, or does your wrist have a built-in motor?",
        "Outstanding high-fidelity right clicks on glass. The touchscreen is getting seriously warm!",
        "Your finger is moving so fast it's generating a small, localized static storm on the glass."
      );
    } else if (cps >= 11 && cps < 20) {
      choices.push(
        `${Math.round(cps)} HPS! Incredible! You are basically the John Wick of touch tapping.`,
        "Your screen is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!",
        "Is your screen about to shatter or are your fingers just vibrating at high frequencies?",
        "The capacitive digitizer is crying tears of electrostatic joy.",
        "Your hand looks like a high-speed vibration plate. Truly magnificent click rate!",
        "Pure touch speed wizardry! You're block-clutching like an absolute champion on mobile!",
        "The digitizer has entered panic mode trying to record this many electrostatic coordinate shifts.",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier tapping velocity!",
        "Your hand looks like an industrial massager. Unrivaled touchscreen right clicking!"
      );
    } else {
      choices.push(
        "⚡ Godlike Right Click Touch Tier! 20+ HPS! The screen thinks you have four hands or a high-frequency vibration motor strapped to your finger.",
        "⚡ Godlike Right Click Touch Tier! Did you spill Red Bull on your finger or are you just a biological jackhammer on Gorilla Glass? Spectacular!",
        "⚡ Godlike Right Click Touch Tier! You are tapping that secondary touch coordinate faster than a machine gun firing blank cartridges.",
        "⚡ Godlike Right Click Touch Tier! Capacitive sensors are short-circuiting trying to keep up with your middle finger's rhythm.",
        "⚡ Godlike Right Click Touch Tier! Absolute God Tier! If we attached a dynamo to your finger, we could power our entire cloud cluster.",
        "⚡ Godlike Right Click Touch Tier! Your index and middle fingers are vibrating in complete quantum harmony on glass!",
        "⚡ Godlike Right Click Touch Tier! The capacitive screen has declared a local thermal warning. Pure friction fire!",
        "⚡ Godlike Right Click Touch Tier! You are registering touches faster than the mobile hardware clock can poll!",
        "⚡ Godlike Right Click Touch Tier! Stop! The local gravity fields cannot sustain this level of glass vibration!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "0 HPS? Did you forget your middle finger exists, or are you right-clicking in a parallel universe?",
        "0 HPS! Perfect speed for not playing Minecraft Bedwars.",
        "Your right click is so non-existent, the mouse sensor is checking its own pulse.",
        "Did you unplug your secondary mouse switch or did you forget you have a middle finger?",
        "Perfect 0. The mechanical switch inside is currently celebrating its longevity.",
        "Are your fingers currently locked? Not a single right-click.",
        "The right mouse switch is completely silent. Absolute zero action!",
        "Your right mouse button has been sitting in complete, dusty silence for an eternity.",
        "Did your middle finger take a personal day off? Click that mechanical switch!",
        "0 HPS. Perfect speed for not launching a single secondary ability.",
        "Your Omron switch is crying tears of absolute loneliness. Give it a clack!"
      );
    } else if (cps > 0 && cps < 2) {
      choices.push(
        "1-2 HPS. If you tried to right-click block-clutch in Minecraft, you'd fall into the void before the block even realized you clicked.",
        "Are you clicking with your toe? Your middle finger is moving like it's stuck in a vat of cold peanut butter.",
        "Very slow right clicking. The local snail just zoomed past your cursor.",
        "Did you buy a gaming mouse with Kailh switches just to look at them? Click it!",
        "Your middle finger's reactivity is comparable to frozen maple syrup.",
        "The microswitch has barely felt your presence. Push that mechanical spring!",
        "Your right clicks are so slow, the game server thinks you're typing with a physical broomstick.",
        "Are your Kailh switches lubricated with wet cement? Speed up!",
        "You click like you're checking your bank balance before committing to a purchase. Accelerate!",
        "Your middle finger reactivity is roughly comparable to a sleepy turtle on a sandy beach."
      );
    } else if (cps >= 2 && cps < 4) {
      choices.push(
        `${Math.round(cps)} HPS. Decent if you are opening a folder, but absolute doom in a PVP bridge fight.`,
        "You click like you're politely knocking on a door. Tap that button like it owes you lunch money!",
        "Continental drift is currently keeping up with your click speed. Accelerate!",
        "Your right-click button is yawning. It has never experienced such a lazy pace.",
        "Are you trying to not click too hard to save the mechanical switches? Mash it!",
        "This isn't a library! You can make some right-clacking noise, it's allowed!",
        "Decent for opening a context menu, but absolute doom in any PvP block-clutch duel.",
        "You click like you're politely asking the mouse button for permission. Smash it!",
        "Your right-click button is yawning. It has never experienced such a casual, lazy tempo.",
        "Are you afraid of wearing out the mechanical copper spring? Mechanical clicks are free, go fast!"
      );
    } else if (cps >= 4 && cps < 6) {
      choices.push(
        `${Math.round(cps)} HPS. Average middle finger. Not terrible, but you're definitely not winning any PVP matches.`,
        "The mouse switch is mildly amused. It expected a workout, not a gentle massage.",
        "Like a steady dripping faucet. We need a fire hose of right-clicking!",
        `Is your wrist braced? It should be, because ${Math.round(cps)} HPS is barely a warm-up!`,
        "Your mechanical right-click has standard-grade responsiveness. Time to overclock it.",
        "Perfect speed for opening a contextual menu on your desktop. Mediocre for gaming!",
        "Average right-click speed. Perfect for navigating a web browser, absolute failure for gaming.",
        "The mouse switch is mildly amused. It expected an earthquake, not a gentle massage.",
        "Steady clacking, but your wrist looks like it's daydreaming. Step on the gas!",
        "Your middle finger is running on basic battery-saver mode. Turn on high performance!"
      );
    } else if (cps >= 6 && cps < 8) {
      choices.push(
        `${Math.round(cps)} HPS! Respectable! Your middle finger has definitely spent time on a gaming mouse.`,
        "Your right clicks are getting fast. Is your middle finger secretly working out behind your back?",
        "Good speed! You can actually hold your ground with this touch rate.",
        "Your mouse switches are clacking happily now. Very solid speed!",
        "Solid performance! You are definitely ready for competitive PvP right-click actions.",
        "Your middle finger is moving with real purpose. Excellent speed runner potential!",
        "Respectable right clacking! Your middle finger is definitely showing some gaming experience.",
        "Solid tempo. The microswitch is clicking happily and getting a genuine mechanical workout.",
        "Good speed! Your right-click block-clutches must look very clean and reliable.",
        "You are skipping dialogues faster than a professional speedrunner. Solid speed!"
      );
    } else if (cps >= 8 && cps < 11) {
      choices.push(
        `${Math.round(cps)} HPS! Phenomenal! Your middle finger is moving so fast it's generating its own weather system.`,
        "Are you vibrating your wrist or did you drink four double espressos right before this?",
        "That is a professional level of right clicking. The mouse switch is crying tears of friction.",
        "Your block-clutches must look majestic. Exceptional finger control!",
        "The microswitches in your mouse are begging for a splash of liquid nitrogen.",
        "Omron and Kailh switches are singing your praises. Brilliant vibration control!",
        "Phenomenal wrist vibration! Your right mouse switch is screaming under your rapid clacks!",
        "Are you jitter-clicking your middle finger or did you spill cold brew all over your forearm?",
        "Superb speed! The microswitches are begging for a splash of liquid nitrogen.",
        "Kailh and Omron are celebrating your finger speed because you'll need a new mouse next week!"
      );
    } else if (cps >= 11 && cps < 20) {
      choices.push(
        `${Math.round(cps)} HPS! Incredible! You are basically the John Wick of right clicking.`,
        "Your mouse button is screaming for mercy. Phenomenal arm vibration!",
        "Did you replace your hand with a pneumatic piston? Absolute god-tier speed!",
        "The middle microswitch is tensing up. Let the absolute click density take over!",
        "You click faster than the speed of rumor propagation. Absolutely wild!",
        "If you clicked any faster, you'd rip a hole in the fabric of the space-time continuum.",
        "Incredible! Your middle finger is moving with the velocity of an automatic mechanical drill.",
        "Your mouse mouse button is begging for mercy. Phenomenal wrist and forearm coordination!",
        "Did you strap an electric toothbrush to your knuckle? This clicking rate is absolute magic!",
        "Unbelievable density! The copper contacts are vibrating at maximum thermal limits."
      );
    } else {
      choices.push(
        "⚡ Godlike Right Click PC Tier! 20+ HPS! Your right-click is clicking so fast the game server's anti-cheat is currently calling a board meeting.",
        "⚡ Godlike Right Click PC Tier! Did you replace your middle finger with an industrial drilling machine? Your mechanical switch has literally melted!",
        "⚡ Godlike Right Click PC Tier! 20+ HPS! You are block-clutching in mid-air with absolutely zero effort. Minecraft Bedwars players are trembling.",
        "⚡ Godlike Right Click PC Tier! Your mouse's right-side copper spring is crying out in mechanical agony. Truly legendary speed!",
        "⚡ Godlike Right Click PC Tier! Stop! The local gravity field cannot sustain this level of mechanical right-click vibration!",
        "⚡ Godlike Right Click PC Tier! 20+ HPS! Your right-click is clicking so fast the game server's anti-cheat has officially called an emergency board meeting to study your hand.",
        "⚡ Godlike Right Click PC Tier! Your mouse's right-side copper spring has officially welded itself shut from kinetic friction.",
        "⚡ Godlike Right Click PC Tier! You are block-clutching in mid-air with absolute cosmic confidence. Minecraft players are weeping.",
        "⚡ Godlike Right Click PC Tier! Stop! The mechanical switches are begging the laws of physics for early retirement!"
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
        "Perfect 0. The capacitive screen is wondering if you still exist.",
        "No tremor detected. Tense that forearm and let's shake the screen!",
        "Did you mistake the screen for a sleeping baby? Wake it up with a jitter!",
        "No Jitter detected. Is your forearm having an union strike right now?",
        "Zero vibration on screen. Lock your wrist and let the finger shake begin!",
        "You are holding the mobile screen so gently, it's starting to hum a lullaby."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Jitter clicking is about tensing your arm, not gently patting the glass. Wake those muscles up!",
        "Your fingers look like they are taking a leisurely stroll on the screen. Start shaking!",
        "Are you checking the temperature of the mobile device with your finger? Vibration required!",
        "Very weak hand vibration. Shake that index finger like it touched a static spark!",
        "You look like you're trying to carefully brush away dust. Vibrate that arm!",
        "That is not jittering, that's just a mild, lazy itch. Shake that finger!",
        "Are you afraid of cracking the touchscreen glass with your arm spasms? Vibrate!",
        "Your hand has the tension of a sleeping marshmallow. Grip tight and spasm!"
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Not a bad tremor, but your stability is all over the place. Tighten your forearm grip!",
        "Your hand is shaking, but it looks like you are holding a cup of hot tea. Tense that wrist!",
        "You have a tiny bit of vibration, but it's more like a polite wiggle. We need a jackhammer!",
        "Good start, but your muscle strain is too low. Grip that mobile device and vibrate!",
        "Steady wiggling. We need high-frequency alternate spasms!",
        "A decent wiggle, but your forearm needs 10x more tension. Shake harder!",
        "Steady light vibration. Good for checking a notification, mediocre for PvP!",
        "Your index finger is trying to shake, but the rest of your arm is on battery-saver mode."
      );
    } else if (cps >= 8 && cps < 15) {
      choices.push(
        "Incredible wrist vibration! You're making the phone glass rattle at high frequencies.",
        "Excellent jitter-tap form! Your screen's glass is getting quite warm from the pure friction.",
        "Your forearm is a blur of high-speed spasms. Exceptional mobile jitter speed!",
        "Awesome vibration frequency! Your mobile targets are shaking from your sheer tapping rate.",
        "A highly solid tremor! You've definitely mastered mobile jitter click mechanics.",
        "Wow! You are making the mobile glass vibrate like a tuning fork! Exceptional!",
        "Incredible wrist spasms! You've definitely spent hours practicing this technique.",
        "Solid Jitter! The phone digitizer is screaming under your high-frequency muscle shakes."
      );
    } else {
      choices.push(
        "⚡ Godlike Jitter Touch Tier! 15+ CPS! Your forearm is tensing so hard the physical phone is vibrating out of your hand.",
        "⚡ Godlike Jitter Touch Tier! Did you replace your finger with an electric sander, or is your arm powered by an industrial diesel turbine?",
        "⚡ Godlike Jitter Touch Tier! The capacitive screen digitizer is running on 100% CPU capacity just to track your fingertip spasms.",
        "⚡ Godlike Jitter Touch Tier! Corning Gorilla Glass is sweating under your atomic-vibration fingers!",
        "⚡ Godlike Jitter Touch Tier! Absolute cybernetic tremor! Your forearm has transcended biological limitations!",
        "⚡ Godlike Jitter Touch Tier! Your index finger is vibrating at a rate that violates local zoning laws!",
        "⚡ Godlike Jitter Touch Tier! Are you a humanoid android powered by an unstable lithium generator?",
        "⚡ Godlike Jitter Touch Tier! The capacitive screen has reached full quantum thermo-friction levels!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Did you even tense your forearm? Your mouse is sitting completely still, looking bored.",
        "0 CPS. Mechanical switches are fully asleep. Try shaking that hand!",
        "Your mouse is checking its USB connection because your finger didn't move a millimeter.",
        "No muscle tremor found. Grip that mouse tight and make your whole arm vibrate!",
        "Perfect zero. Your Omron switches are completely unbothered.",
        "0 Jitter CPS. Did you forget to tense your arm, or is your hand completely asleep?",
        "No forearm spasms detected. Your mouse is sitting in absolute, dusty silence.",
        "Your mechanical switch is wondering if you still have a pulse."
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Jittering requires localized muscle spasms. You click like you're browsing a cooking blog. Let's go!",
        "Are you clicking with your pinky? Forearm tension is nonexistent!",
        "This is a speed test, not a museum tour of mouse switch durability. Vibrate that arm!",
        "Your index finger looks like a sleepy caterpillar. Tense those muscles!",
        "You click like a polite librarian stamping a library card. Vibrate that wrist!",
        "You click like a sleepy accountant typing in spreadsheets. Tense that forearm!",
        "Are your Kailh switches made of lead? Vibrate that index finger like a jackhammer!",
        "You have the wrist tension of cooked spaghetti. Lock the elbow and shake!"
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Good hand tremor! The mouse sensor is tracking your shakes nicely. Lock that wrist for more stability!",
        "Your hand is shaking, but your mouse button is only half-convinced. Tense up your wrist!",
        "Decent shaking. The click frequency is climbing, but the microswitch wants more heat!",
        "Solid beginning. But your forearm looks like it's daydreaming. Lock the elbow!",
        "A very polite hand spasm. We need an earthquake, not a gentle breeze!",
        "Decent hand tremor! The mouse sensor is tracking your shakes nicely. Lock that wrist!",
        "You are shaking, but it's more like a polite wiggle. We need high-frequency spasms!",
        "Good baseline muscle strain, but step on the gas! Let's hear some rapid mechanical clacking!"
      );
    } else if (cps >= 8 && cps < 15) {
      choices.push(
        "Whoa! Your mouse switch is vibrating like a pneumatic drill. Excellent jitter-click form!",
        "The Omron switches are screaming under your forearm spasms. Highly optimized vibration!",
        "Your wrist is fully locked and your elbow is generating pure velocity. Fantastic jittering!",
        "Beautiful high-frequency click vibration. The clacking sound is perfectly steady!",
        "Excellent forearm tremor. You could definitely win any standard jitter duel with this.",
        "Incredible forearm tremor! Your mouse switch sounds like an active mechanical drill!",
        "Outstanding jitter-click form! You could hold your ground in any competitive PvP duel.",
        "Your Omron switches are literally singing under your rapid wrist spasms!"
      );
    } else {
      choices.push(
        "⚡ Godlike Jitter PC Tier! 15+ CPS! Your mouse is vibrating so hard it's literally drifting across your mousepad without you moving it.",
        "⚡ Godlike Jitter PC Tier! Razer and Logitech engineering teams just had an emergency meeting to study your muscle fibers.",
        "⚡ Godlike Jitter PC Tier! You're vibrating your wrist at 1000Hz. If we attach an alternator, we can power a small server rack.",
        "⚡ Godlike Jitter PC Tier! Insane forearm tremors! Your mouse switch has entered a separate dimension of mechanical strain!",
        "⚡ Godlike Jitter PC Tier! This click rate should be illegal in competitive play. Your wrist is tensing at atomic frequencies!",
        "⚡ Godlike Jitter PC Tier! Razer and Logitech are sending representatives to study your forearm muscle fibers!",
        "⚡ Godlike Jitter PC Tier! Your hand is vibrating so fast, the mouse has achieved full molecular escape velocity!",
        "⚡ Godlike Jitter PC Tier! Absolutely legendary arm spasms! The microswitches are begging for a fire extinguisher!"
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
        "Zero taps. The screen is staring back at you in absolute silence.",
        "Did both your drumming fingers fall asleep at once? Lift them up!",
        "Perfect 0. Capacitive sensors are waiting for some twin-finger action.",
        "Zero butterfly taps on the screen. Did both drumming fingers go on strike?",
        "No touch inputs. Did your fingers forget they have a screen to drum on?"
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Butterfly tapping requires alternating fingers. You look like you're tapping with a single tired thumb.",
        "Are you tapping with a single digit? The point of a butterfly is having TWO wings!",
        "Your alternate fingers are moving in slow motion. Synchronization error!",
        "One-finger drumming is not butterfly tapping. Let's see that double-finger lift!",
        "You look like you're trying to carefully count glass molecules. Tap faster!",
        "Butterfly tapping requires alternating fingers. You look like you're tapping with a single sleepy toe.",
        "Are you clicking with only one index finger? Give the middle finger some tapping action!"
      );
    } else if (cps >= 5 && cps < 10) {
      choices.push(
        "Decent alternating speed. Your fingers are starting to do gymnastics on the glass surface.",
        "Good rhythm! One-two, one-two. Keep the drumming tempo steady!",
        "The touchscreen is feeling the alternate drumming now. Pick up the pace for pro status.",
        "Nice, steady alternate touch. Now speed up the alternate lifting action!",
        "Good baseline synchronization. Let's see some real high-speed coordinate bursts!",
        "Decent alternate tapping tempo. One-two, one-two. Keep the drumming steady!",
        "Your alternate finger lifts are nice, but step on the gas! Let's hear some rapid drumming."
      );
    } else if (cps >= 10 && cps < 20) {
      choices.push(
        "Superb drumming! Your two fingers are hitting the screen like a rapid bongo drum solo.",
        "Excellent alternate lift technique! The glass is getting a serious beatdown.",
        "Your alternate finger lifts are highly synchronized. Great touch butterfly speed!",
        "Outstanding rhythm control! Both index and middle fingers are flying on the screen.",
        "Simply epic! The touchscreen is fully saturated with your rapid twin tapping.",
        "Excellent alternate glass-tapping speed! Both fingers are drumming in solid, rapid sync.",
        "Outstanding alternate touch agility! The capacitive matrix is really feeling your authority."
      );
    } else {
      choices.push(
        "⚡ Godlike Butterfly Touch Tier! 20+ CPS! Your two-finger drumming technique on the glass has reached supersonic speeds. Absolutely mindblowing!",
        "⚡ Godlike Butterfly Touch Tier! Are your index and middle fingers connected to a pneumatic actuator? The screen digitizer cannot fathom this speed!",
        "⚡ Godlike Butterfly Touch Tier! The glass has entered a state of thermo-kinetic overload. You're drumming faster than a professional bongo player on double espresso!",
        "⚡ Godlike Butterfly Touch Tier! Unbelievable! The capacitive digitizer is crying tears of pure electrostatic joy under your fingers!",
        "⚡ Godlike Butterfly Touch Tier! Unbelievable double-finger drumming! Your fingertips are a blur of static-electric joy!",
        "⚡ Godlike Butterfly Touch Tier! The capacitive screen has declared a localized thermal meltdown. Superb drumming!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Zero clicks! Did both your index and middle fingers go on strike at the same time?",
        "0 CPS. The mechanical mouse buttons are completely safe from your butterfly wings.",
        "Did you forget how to lift your fingers? Both switches are completely silent.",
        "Perfect zero clicks. Did you disconnect your mouse entirely?",
        "No butterfly wings found. Please place both fingers on the clicker!",
        "Zero butterfly clacks. Did you unplug your mouse, or did both clicking fingers fall asleep?",
        "No inputs. Your Omron switches are completely unbothered."
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Butterfly clicking requires drumming your index and middle fingers alternately on the left click. You click like a sleeping turtle.",
        "Are you clicking with only one finger? Give the middle finger some clicking duties!",
        "That alternating clack is so slow, it sounds like an old grandfather clock. Speed up!",
        "Your alternate click interval has its own ZIP code. Drum those fingers!",
        "Cherry MX or mechanical mouse switches want alternate clacks, not slow solo taps!",
        "That alternating clack is so slow, it sounds like a leaking pipe. Speed up!",
        "Are you clicking with only one finger? Give your middle finger some clicking duties!"
      );
    } else if (cps >= 5 && cps < 10) {
      choices.push(
        "Good double-finger drumming! The switches are clacking in tandem. Now synchronize your lifts!",
        "Solid alternating tempo. Your mouse switches are humming a nice, fast tune.",
        "Nice rhythm, but we need to see some real mechanical stress. Drum those switches faster!",
        "Your alternate fingers are starting to hum a fast tune. Lock that wrist and lift higher!",
        "Decent clack speed. Overclock your mechanical contacts for a proper speed boost!",
        "Good double-finger drumming! Your mouse switches are clacking in nice tandem.",
        "Nice steady alternate clack tempo. Now let's double that speed and wake up the springs!"
      );
    } else if (cps >= 10 && cps < 20) {
      choices.push(
        "Incredible butterfly speed! Your mechanical mouse switches are sounding like automatic gunfire. PVP gods are smiling.",
        "The alternate lifting of your index and middle fingers is extremely crisp. Double-clicks galore!",
        "Excellent bounce-clicking! You are definitely ready to dominate any block-clutch duel.",
        "The switches are singing in high-frequency succession. Brilliant lift control!",
        "Fabulous alternate drumming technique. Your clicking speed is simply exceptional.",
        "Incredible butterfly speed! Your mechanical mouse switches sound like automatic gunfire. Elite PvP tier!",
        "Beautiful alternate lifting of your index and middle fingers! Outstanding mechanical coordination."
      );
    } else {
      choices.push(
        "⚡ Godlike Butterfly PC Tier! 20+ CPS! Your mechanical mouse switches are tensing up on their own. Absolutely divine alternate-drumming velocity!",
        "⚡ Godlike Butterfly PC Tier! You are registering double-clicks at a rate that defies modern physics. Absolute butterfly master! Your switches are screaming in terror.",
        "⚡ Godlike Butterfly PC Tier! 20+ CPS! Did you grease your mouse click with butter or are your fingers literally mechanical pistons? Magnificent speed!",
        "⚡ Godlike Butterfly PC Tier! Razer/Logitech switches are praying to the mechanical gods for early retirement. Absolutely devastating click speed!",
        "⚡ Godlike Butterfly PC Tier! Absolute bounce-clicking mastery! Razer's switch engineering team is crying in the corner.",
        "⚡ Godlike Butterfly PC Tier! Your mouse switches have officially entered a state of quantum vibration. Absolute legend!"
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
        "Perfect 0. The Kohi server kicked you for being a stationary statue.",
        "No classic touches. Tap the screen like it's 2013 and you're fighting for your faction!",
        "0 classic touches. Even a fossilized dinosaur would click faster than this.",
        "No retro inputs. Tap the glass like it's 2013 and your faction is getting raided!"
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Very retro, indeed! Your tap speed is so slow it reminds us of 9600-baud dial-up internet.",
        "You tap like you're browsing a medieval library. Lift those digits!",
        "Your mobile retro sequence is moving like an old slow-loading VHS tape.",
        "At this speed, any 2013 pocket-edition PvP player would combo you in circles. Speed up!",
        "Your finger's retro reactivity is on par with a dial-up connection. Wake up!",
        "Your tap speed is so slow it reminds us of 1995 dial-up internet. Lift those digits!",
        "Very retro, indeed! Your hand has the reaction time of frozen molasses."
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Good old-school pacing. Respectable speed for classic touch gaming.",
        "Solid retro tap tempo. Your glass screen is feeling some classical pressure.",
        "A respectable classic touch rate. Perfect for some casual vintage pocket-edition combos.",
        "Decent rhythm. But legacy factions need real high-vibration finger action. Double down!",
        "Consistent retro clicks. Your hand is warmed up, now turn it up!",
        "Good old-school pacing. Respectable speed for classic touch gaming.",
        "Steady vintage tapping. Now let's see some arm power and double that frequency!"
      );
    } else if (cps >= 8 && cps < 16) {
      choices.push(
        "You are tapping like an absolute legend from the legacy mobile server days. Incredible speed!",
        "Excellent classic velocity! You are skip-dialogue comboing like a professional retro speedrunner.",
        "Your finger is moving fast enough to trigger nostalgia sensors in our server database!",
        "Spectacular vintage tapping rate! You are skipping retro cutscenes with elite agility.",
        "Brilliant touch speed. You are definitely a veteran of the classical mobile server lobbies.",
        "Excellent vintage velocity! You are clicking like a seasoned veteran of legacy pocket edition PvP.",
        "Incredible speed! Your finger is moving fast enough to trigger nostalgia sensors in our database."
      );
    } else {
      choices.push(
        "⚡ Godlike Kohi Retro Touch Tier! 16+ CPS! You are tapping that screen like a 2012 mobile PvP sweat god on double caffeine.",
        "⚡ Godlike Kohi Retro Touch Tier! The capacitive touch matrix has entered a parallel dimension of retro combos.",
        "⚡ Godlike Kohi Retro Touch Tier! Retro screen-tapping champions are shedding tears of joy watching your thumbs fly.",
        "⚡ Godlike Kohi Retro Touch Tier! Unbelievable classic velocity! The touchscreen digitizer has completely run out of registers!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "0 CPS. You would get instant-killed on Kohi in 0.2 seconds. Plug in the mouse!",
        "Did you get comboed into next week before clicking once? Wake up, PvP soldier!",
        "0 CPS. Your legacy mouse has been disconnected from the server for pure sleepiness.",
        "0 CPS. You would get comboed into orbit on Kohi in 0.1 seconds. Click!",
        "Did you forget your mouse is a physical device you have to press? Wake up, PvP soldier!"
      );
    } else if (cps > 0 && cps < 4) {
      choices.push(
        "Is your mouse a serial-port ball mouse from 1995? Click those retro switches faster!",
        "Your PvP speed is so slow, you're practically block-clutching in reverse.",
        "At this speed, you'd get comboed into orbit on any Kohi lobby. Shake that wrist!",
        "You clack like a sleepy legacy typist. Let's see some retro competitive effort!",
        "Is your mouse a serial-port ball mouse from 1995? Click those retro switches faster!",
        "Your click rate is so slow, you're practically block-clutching in reverse."
      );
    } else if (cps >= 4 && cps < 8) {
      choices.push(
        "Decent nostalgic pace. Good enough to fight some legacy mobs, but too slow for hardcore factions.",
        "Classic Minecraft PvP sweat speed is within reach. Now start vibrating your middle finger!",
        "Decent old-school clicking. Your mouse switches are recalling memories of 2013 Minecraft servers.",
        "Decent old-school clicking. Your switches are recalling memories of 2013 Minecraft lobbies.",
        "Classic PvP sweat speed is within reach. Now start tensing that wrist for more power!"
      );
    } else if (cps >= 8 && cps < 16) {
      choices.push(
        "Outstanding! You have that classic 2013 Minecraft PvP sweat speed. Your mechanical switches are screaming!",
        "Excellent Kohi clacking! You are definitely triggering those legacy double-click combos.",
        "Your click rate is high enough to make any legacy factions leader proud. Solid battle speed!",
        "Outstanding! You have that classic 2013 Minecraft PvP sweat speed. Your mechanical switches are screaming!",
        "Excellent Kohi clacking! You are definitely triggering those legacy double-click combos."
      );
    } else {
      choices.push(
        "⚡ Godlike Kohi Retro PC Tier! 16+ CPS! You are click-clutching, drag-clicking, and comboing like a caffeinated teenager from 2014 Kohi lobby.",
        "⚡ Godlike Kohi Retro PC Tier! Your Kailh mechanical switches are screaming for a liquid nitrogen cooling block. Pure physical sweat!",
        "⚡ Godlike Kohi Retro PC Tier! 16+ CPS! You just registered more old-school PvP combos in 5 seconds than entire factions did in a month.",
        "⚡ Godlike Kohi Retro PC Tier! Absolute Kohi Legend! All legacy forums are celebrating your phenomenal finger velocity!"
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
        "Zero drag-clicking registered. Give that glass surface a gentle drag!",
        "The screen's digitizer is wondering if your finger has been replaced by a block of frozen wood.",
        "0 drag clicks. Did you think dragging was forbidden by the local authorities?",
        "No sliding inputs. Let's see some glass-dragging friction!"
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Dragging on glass? Your finger is just squeaking like a wet window wiper. Try some dry sliding or tape!",
        "Very low friction detected. It feels like you are petting a sleeping cat on the screen.",
        "Your drag speed is so gentle, it wouldn't even activate a touch zoom!",
        "You are sliding your finger like you're trying to not disturb a light layer of morning dew.",
        "Very low friction. It feels like you're gently petting a sleeping kitten on the screen.",
        "Your sliding action is so gentle, it wouldn't even activate a scroll bar."
      );
    } else if (cps >= 5 && cps < 12) {
      choices.push(
        "Decent friction slide! The glass is warming up, but that screen digitizer isn't breaking a sweat yet.",
        "Good effort sliding on the touchscreen. Try adding a little bit of thumb-tip pressure!",
        "Nice, consistent drag-sliding tempo. Let's see some real screen squeaking!",
        "Decent friction slide! Try adding a little bit of thumb-tip pressure to get that sweet bounce.",
        "Nice consistent drag-sliding tempo. The capacitive sensor is starting to wake up.",
        "Your finger is sliding with a nice light rhythm. Time to turn up the heat!"
      );
    } else if (cps >= 12 && cps < 20) {
      choices.push(
        "Wow! Your finger is drumming on that glass like a rapid-fire woodpecker. Incredible touch control!",
        "Are you using grip-tape on your finger? That capacitive sensor is registering serious friction vibrations!",
        "Superb screen slide frequency! Highly responsive touch coordinate tracking.",
        "Incredible finger drumming! You are making the mobile glass vibrate at beautiful frequencies."
      );
    } else {
      choices.push(
        "⚡ Godlike Drag Touch Tier! Unbelievable glass vibration! Are you sure your finger isn't a high-frequency massage gun?",
        "⚡ Godlike Drag Touch Tier! You are registering drag-slides at a rate that defies modern physics on glass. Absolute slide master!",
        "⚡ Godlike Drag Touch Tier! The touchscreen is begging for mercy from your hyper-speed finger dragging gymnastics!",
        "⚡ Godlike Drag Touch Tier! Your skin is generating so much friction heat on the Gorilla glass, we need thermal pads!"
      );
    }
  } else {
    if (cps === 0) {
      choices.push(
        "Zero drag clicks. Did your finger slide completely off the mouse?",
        "0 Drag CPS. The switches didn't vibrate at all. Are you holding a block of wood?",
        "Did you forget to drag click or is your mouse switch made of solid steel?",
        "0 drag clicks. Did your finger slide completely off the mouse and hit your coffee cup?",
        "Did you forget to drag click, or is your mouse switch made of industrial concrete?",
        "Your mouse button has experienced absolute zero vibration. Pure stillness!"
      );
    } else if (cps > 0 && cps < 5) {
      choices.push(
        "Standard Mouse switch: Switch is too stiff or you aren't sliding with enough friction. Or did you forget to apply grip tape?",
        "Your finger is sliding too smoothly. We need switch-vibration, not a relaxing massage!",
        "At this rate, you aren't drag-clicking; you're just polishing your left mouse button.",
        "You are sliding too smoothly. We need mechanical bounce, not a gentle massage!",
        "At this rate, you aren't drag-clicking; you're just polishing your left mouse button for resale.",
        "No switch chatter detected. Apply some electrical tape for traction!"
      );
    } else if (cps >= 5 && cps < 12) {
      choices.push(
        "Decent drag-clicking potential. Try applying some electrical or grip tape for extra finger traction!",
        "Good vibration chatter! The switches are starting to hum nicely.",
        "Nice, consistent drag sliding. You are beginning to master the switch-bounce technique!",
        "Decent drag-clicking potential. Try applying some electrical or grip tape for extra finger traction!",
        "Good vibration chatter! The switches are starting to hum a nice rapid tune.",
        "Consistent sliding vibration. You are beginning to master the switch-bounce technique!"
      );
    } else if (cps >= 12 && cps < 20) {
      choices.push(
        "Excellent switch vibration! Your hardware has a highly optimized debounce threshold for insane drag chatter.",
        "Outstanding! You can hear those Omron switches screaming in rapid succession.",
        "Beautiful drag friction! Your Minecraft bridging is going to look incredibly smooth.",
        "Excellent switch vibration! Your hardware has a highly optimized debounce threshold for insane drag chatter.",
        "Outstanding! You can hear those Omron switches screaming in rapid succession.",
        "Beautiful drag friction! Your Minecraft bridging is going to look incredibly smooth and fast."
      );
    } else {
      choices.push(
        "⚡ Godlike Drag PC Tier! God-Tier Drag Clicker! Unrivaled switch chatter abuse detected. Your Minecraft opponents stand absolutely no chance!",
        "⚡ Godlike Drag PC Tier! Your mouse switches have officially entered a state of quantum vibration. Superb drag clacking!",
        "⚡ Godlike Drag PC Tier! Are you sure your mouse hasn't melted from all that friction? That's an legendary speed!",
        "⚡ Godlike Drag PC Tier! Simply sublime bounce-clicking mastery. The microswitch debounce filters have completely dissolved."
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
        "Consistent single touches. Excellent for accurate navigation on mobile screens.",
        "No ghosting clicks found. Your screen's capacitive controller is running with pristine logic.",
        "Extremely tidy touch coordinates. A model touchscreen citizen!"
      );
    } else if (ratio < 0.15) {
      choices.push(
        "Quick Tap-Double: Registering some rapid consecutive touches. Handy for double-tap zoom features!",
        "Sensitive touch sensing! A few swift multi-touches detected. Perfect for action games.",
        "Nice double-tapping rhythm. Great for skipping forward in mobile media players.",
        "You have a tiny double-tap frequency. Perfect for double-tap photo zooms."
      );
    } else {
      choices.push(
        "⚡ Godlike Double Tap Touch Tier! Ultra-Sonic Flutter: Your finger is fluttering on the screen like a rapid butterfly wings. Pure raw speed!",
        "⚡ Godlike Double Tap Touch Tier! Insane screen-drumming sensitivity! The capacitive grid can barely keep up with your double taps.",
        "⚡ Godlike Double Tap Touch Tier! Absolute flutter master! Your fingers are vibrating across the glass like static electricity.",
        "⚡ Godlike Double Tap Touch Tier! Your touch digitizer is completely confused by how many rapid double-taps you are throwing. Magnificent!"
      );
    }
  } else {
    if (doubleClicksCount === 0) {
      choices.push(
        "Standard Clicks Only: Safe and steady. Consistently registering single clicks. Perfect for general accuracy and desktop navigation.",
        "No unintended double clicks detected. Great for precision work, but maybe too slow for block-clutch duels.",
        "Perfect debounce filter. Your mouse is acting like a perfectly disciplined hardware citizen.",
        "No double-clicking found. Your mechanical switches are operating with perfect isolation.",
        "Tidy mechanical execution. Ideal for standard administrative and design work."
      );
    } else if (ratio < 0.15) {
      choices.push(
        "Moderate CPS Boost: Sensitive switches with moderate double-clicks detected. Great for gaining a quick mechanical speed advantage without sacrificing normal control.",
        "A hint of switch chatter detected! Just enough to help you squeeze out an extra CPS or two.",
        "Nice responsive switches. They are perfectly primed for rapid-fire trigger clicks.",
        "Excellent mechanical rebound. You are getting a decent double-click ratio to help PvP actions."
      );
    } else {
      choices.push(
        "⚡ Godlike Double Click PC Tier! High CPS Potential / Active Chatter: Highly responsive double-clicking active! Outstanding potential for pushing ultra-high CPS limits in competitive clicking or games like Minecraft.",
        "⚡ Godlike Double Click PC Tier! Your mouse switch is practically double-clicking on its own. That's a built-in mechanical cheat code!",
        "⚡ Godlike Double Click PC Tier! Incredible bounce chatter! If you play PvP, you are absolutely blessed with this mechanical sensitivity.",
        "⚡ Godlike Double Click PC Tier! The microswitches have entered a state of terminal chatter. Minecraft PvP sweats are salivating!"
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
        "The targets came and went, completely untouched. Like ships passing in the night.",
        "Perfect 0. Your fingers are actively dodging the targets. Truly remarkable avoidance!"
      );
    } else if (finalScore < 6) {
      choices.push(
        "Slow response on touch! Did you tap a target or just pet the screen? Keep your hand moving!",
        "Your finger is wandering around the screen like a lost tourist in a big city.",
        "Tapping too slow! Those micro-targets are laughing at your touch reflexes.",
        "You tap with the speed of an ice glacier. Accelerate that finger movement!",
        "Your touch accuracy is okay, but you're treating the screen like fragile ancient glass."
      );
    } else if (finalScore >= 6 && finalScore < 14) {
      choices.push(
        "Decent hand-eye coordination. Tapping glass with good rhythm. Practice more to lock your muscle memory.",
        "Nice, steady tapping. You're catching a solid amount of targets, but we need more speed!",
        "Solid touch accuracy. Now try to flick your finger to the next target instantly!",
        "Good performance. Your index finger has standard gaming-grade coordination.",
        "Steady pops. You're definitely hitting the target centers with respectable frequency."
      );
    } else if (finalScore >= 14 && finalScore < 22) {
      choices.push(
        "Excellent mobile aim! Highly competitive speed, popping targets like bubble wrap!",
        "Your touch reflexes are extremely sharp! Popping targets left and right with superb accuracy.",
        "Great hand-to-screen synchronization. You are definitely ready for mobile competitive action!",
        "Superb flick speed! Your thumb is navigating the capacitive field with exceptional agility.",
        "Fantastic rate! You're popping those dots faster than popcorn in a microwave."
      );
    } else {
      choices.push(
        "⚡ Godlike Aim Touch Tier! Superhuman finger speed! Your reflexes are sharper than a cat chasing a laser pointer!",
        "⚡ Godlike Aim Touch Tier! Absolute touch screen dominance! Are you tapping with multiple fingers or are you just a touch god?",
        "⚡ Godlike Aim Touch Tier! Phenomenal coordination! The targets are popping so fast the screen looks like a sparkling starry night.",
        "⚡ Godlike Aim Touch Tier! Your brain's latency has been measured in single-digit microseconds. Simply magnificent finger-flick velocity!"
      );
    }
  } else {
    if (hits === 0) {
      choices.push(
        "0 hits. Your crosshair is so far off, it has registered its own ZIP code.",
        "Did you click the arena or your desk? Not a single target was harmed in this test.",
        "Are you using a trackball or just aiming with your elbow? Complete silence on the targets.",
        "Zero hits! Your mouse sensor might be looking at the ceiling. Check your connection!"
      );
    } else if (finalScore < 6) {
      choices.push(
        "Slow response times. Keep your wrist loose, check your mouse DPI/sensitivity, and try again.",
        "You're tracking those targets with the velocity of a heavy freight train. Flick that mouse!",
        "Did your mouse cord get stuck? That reaction time has some serious network lag vibes.",
        "Your pointer movement looks like a slow slide-show. Overclock your wrist!",
        "Are you using your non-dominant hand? Let's loose that forearm tension!"
      );
    } else if (finalScore >= 6 && finalScore < 14) {
      choices.push(
        "Decent precision tracking. Your muscle memory is developing. Keep practicing to flick faster!",
        "Nice consistent target pops. Good accuracy, now let's crank up the speed dial!",
        "Not bad! A highly solid baseline accuracy. Work on your click-to-movement timing.",
        "Your wrist coordination is developing nicely. Focus on centering your flicks!",
        "Decent target-clipping rate. You can definitely hold your ground in standard FPS titles."
      );
    } else if (finalScore >= 14 && finalScore < 22) {
      choices.push(
        "Excellent aim and trigger control. Highly competitive speed. Shroud would be proud!",
        "Flick city! Your crosshair is landing perfectly on target centers with minimal overshoot.",
        "Outstanding wrist precision! You are definitely ready for some high-tier ranked lobby climbing.",
        "Superb centering and minimal friction drag. Your mousepad must be feeling like ice!",
        "Epic crosshair snaps! Your target clearance times are looking extremely clean."
      );
    } else {
      choices.push(
        "⚡ Godlike Aim PC Tier! Absolute aim bot! Are you sure you aren't running an aim script? Legendary mouse precision!",
        "⚡ Godlike Aim PC Tier! Your hand-eye coordination is practically digital. Superb crosshair snaps and perfect trigger pull!",
        "⚡ Godlike Aim PC Tier! You've popped so many targets, our server registers you as a serious hardware hazard. Phenomenal!",
        "⚡ Godlike Aim PC Tier! Shroud and TenZ are calling for your setup details. Your flicks look like instant teleports!"
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
        "Zero steps. Swipe up or down vigorously to start the scroll engine!",
        "Perfect 0. The touch digitizer is wondering if your screen is just a poster."
      );
    } else if (stepsSec < 15) {
      choices.push(
        "Lazy swipe! Are you trying to scroll past an ad, or did your thumb fall asleep?",
        "Very leisurely swiping. You look like you're reading a boring terms and conditions page.",
        "Slow, steady swiping. Good for reading recipes, bad for high-speed scrolling!",
        "Your swiping has the velocity of dry cement. Step on the scroll throttle!"
      );
    } else if (stepsSec >= 15 && stepsSec < 40) {
      choices.push(
        "Good casual scrolling speed. Perfect for scrolling through endless social media feeds.",
        "Nice, comfortable scroll swipes. Your thumb has a great, consistent travel distance.",
        "Solid scroll feedback! You are navigating through pages with excellent tactile rhythm.",
        "Good, steady thumb action. Ideal for finding a specific post in a dense timeline."
      );
    } else if (stepsSec >= 40 && stepsSec < 80) {
      choices.push(
        "Vigorous swiping! You're sliding down pages faster than a speedreader on caffeine.",
        "Amazing touchscreen swiping! Your thumb is practically sliding off the bezel.",
        "Super fast scrolling speed! You are looking for that specific meme with extreme velocity!",
        "Your thumb is generating actual aerodynamic drag. Solid swiping!"
      );
    } else {
      choices.push(
        "⚡ Godlike Scroll Touch Tier! Absolute thumb fire! You're scrolling so fast you might warp into the next article!",
        "⚡ Godlike Scroll Touch Tier! Whoa! Are you using multiple hands or did you lubricate your screen with Teflon? Legend!",
        "⚡ Godlike Scroll Touch Tier! The mobile browser is completely overwhelmed by your hyper-speed swipe rate. Phenomenal!",
        "⚡ Godlike Scroll Touch Tier! Your phone's screen has entered a state of anti-gravity fluid scroll. Magnificent!"
      );
    }
  } else {
    if (stepsSec === 0) {
      choices.push(
        "0 scroll steps. Did your mouse wheel get stuck with pocket lint?",
        "Zero scrolling detected. Did you buy a mouse without a scroll wheel, or are you just staring at it?",
        "The wheel hasn't turned a single notch. Give it a spin!",
        "Your scroll wheel has registered absolute silence. Is it a vintage mouse from 1990?"
      );
    } else if (stepsSec < 15) {
      choices.push(
        "Slow scrolling. Perfect for browsing light articles, but too slow for Minecraft hotbar toggling.",
        "Are you scrolling with a heavy stone wheel? Spin it with some passion!",
        "Slow, cautious index finger. Are you afraid of scrolling past something important?",
        "Your scroll rate is perfect for reading boring privacy policies. Speed it up!"
      );
    } else if (stepsSec >= 15 && stepsSec < 40) {
      choices.push(
        "Good, consistent scroll control. Solid scroll feedback rate.",
        "Nice steady wheel scrolling. Perfect for casual gaming and quick hotbar weapon swaps.",
        "Your index finger has a nice, healthy tempo. Steady scrolling keeps the scroll wheel happy!",
        "Decent rate. Perfect for standard map zooms and weapon selections."
      );
    } else if (stepsSec >= 40 && stepsSec < 80) {
      choices.push(
        "Fast index finger! Excellent scroll-wheel speed.",
        "Awesome! You are spinning that wheel like a game show host. Great velocity!",
        "Excellent scroll rate! Your finger-flick technique is highly optimized.",
        "Brilliant scroll wheel spin. You are flying through documents at a highly competitive rate!"
      );
    } else {
      choices.push(
        "⚡ Godlike Scroll PC Tier! God-like Scrolling! You must be using an unlocked free-spin mouse scroll wheel or an infinite-scroll mouse.",
        "⚡ Godlike Scroll PC Tier! The scroll wheel has turned into an alternator! You're producing enough energy to power our servers.",
        "⚡ Godlike Scroll PC Tier! Phenomenal! That wheel is spinning fast enough to generate lift and fly off your desk!",
        "⚡ Godlike Scroll PC Tier! Your index finger is a blur of kinetic energy. Simply outstanding scroll velocity!"
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
  isDarkMode,
  durations = [1, 2, 3, 5, 10, 15, 30, 60, -1]
}: {
  selected: number;
  disabled: boolean;
  onSelect: (duration: number) => void;
  isDarkMode: boolean;
  durations?: number[];
}) {
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
                ? "scale-105 theme-active-key text-white shadow-md"
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
  /** Aim Trainer only: reports the selected pill duration + test status so
   * App can scale the leaderboard (pill before a test, finished test's
   * duration while its result screen is up). Ignored by other modules. */
  onAimState?: (duration: number, status: 'idle' | 'running' | 'finished') => void;
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
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-spacebar-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-spacebar-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [duration]);

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
    try {
      const key = `cps-test-best-spacebar-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (hps > prevHigh) {
        localStorage.setItem(key, hps.toString());
        setHighScore(hps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

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
        className={`pv-glow relative flex min-h-64 h-auto w-full flex-col items-center justify-center rounded-3xl border-2 p-6 text-center select-none transition-all ${
          status === "finished" && !isTouchDevice ? "cursor-pointer hover:border-blue-400/40" : ""
        } ${
          isSpacePressed ? "scale-98 border-blue-400" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0b1a]" : "bg-white shadow-sm text-slate-800"}`}
      onPointerMove={handleGlowMove} >
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
              isSpacePressed ? "theme-bg-from-600 theme-border-from-800 translate-y-0.5 border-b" : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20"
            }`} />
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-3">
            <p className="text-xs theme-text-from-dynamic uppercase font-bold tracking-widest">Completed!</p>
            <p className="text-5xl font-black">{calculatedHps.toFixed(2)} HPS</p>
            <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed">"{humorousMessage}"</p>
            <div className="pt-2">
              <span className="text-xs font-bold theme-text-from-pulse-badge px-3 py-1.5 rounded-full inline-block animate-pulse">
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} HPS</span>
        </p>
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
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-right-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const rippleIdCounter = useRef(0);
  const lastFinishedClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-right-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [duration]);

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
    try {
      const key = `cps-test-best-right-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (cps > prevHigh) {
        localStorage.setItem(key, cps.toString());
        setHighScore(cps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

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
        className={`pv-glow relative flex min-h-64 h-auto py-6 px-6 w-full overflow-hidden select-none flex-col items-center justify-center rounded-3xl border-2 text-center cursor-pointer transition-all ${
          status === "running" ? "theme-border-to shadow-md" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0b1a]" : "bg-white shadow-sm text-slate-800"}`}
      onPointerMove={handleGlowMove} >
        {ripples.map(r => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full theme-bg-to-ripple"
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
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RIGHT CLICK HERE</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Regular click won't work! Disable context menu active.</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-1">
            <p className="text-6xl font-black">{count}</p>
            <p className="text-xs theme-text-to-dynamic uppercase tracking-wider font-bold">Right Clicks Registered</p>
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-3">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Finished!</p>
            <p className="text-5xl font-black">{calculatedCps.toFixed(2)} Right-Click CPS</p>
            <p className={`text-lg font-bold ${getRating(calculatedCps).color}`}>{getRating(calculatedCps).label}</p>
            <p className="text-xs italic py-1.5 px-3 rounded-xl max-w-sm mx-auto text-amber-800 dark:text-amber-200 bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 font-medium leading-relaxed">"{humorousMessage}"</p>
            <div className="pt-2">
              <span className="text-xs font-bold theme-pulse-badge px-3 py-1.5 rounded-full inline-block animate-pulse">
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} CPS</span>
        </p>
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

  useEffect(() => {
    if (isTouchDevice()) {
      setTouchWarning(getRandomPollingWarning());
    }
  }, []);

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
    handleGlowMove(e);
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
        className={`pv-glow relative flex h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
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
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-jitter-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  const clickTimestamps = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);
  const rippleIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-jitter-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [duration]);

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
    try {
      const key = `cps-test-best-jitter-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (cps > prevHigh) {
        localStorage.setItem(key, cps.toString());
        setHighScore(cps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

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
        className={`pv-glow relative flex min-h-64 h-auto w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-6 text-center cursor-pointer ${
          status === "running" ? "border-pink-500" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0c0c1c]" : "bg-white shadow-sm text-slate-800"}`}
      onPointerMove={handleGlowMove} >
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
              <span className="text-xs font-bold theme-pulse-badge px-3 py-1.5 rounded-full inline-block animate-pulse">
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} CPS</span>
        </p>
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
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-butterfly-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  const clickTimestamps = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);
  const rippleIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-butterfly-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [duration]);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const total = clickTimestamps.current.length;
    const cps = totalSeconds > 0 ? total / totalSeconds : 0;
    setFinalCps(cps);
    const rank = getRating(cps).label;
    addHistory("Butterfly Click Coach", totalSeconds, cps, rank);
    setHumorousMessage(getButterflyHumorousLine(cps, isTouchDevice));
    try {
      const key = `cps-test-best-butterfly-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (cps > prevHigh) {
        localStorage.setItem(key, cps.toString());
        setHighScore(cps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

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
        className={`pv-glow relative flex min-h-64 h-auto w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-6 text-center cursor-pointer ${
          status === "running" ? "border-blue-400" : isDarkMode ? "border-white/15" : "border-slate-200"
        } ${isDarkMode ? "bg-[#0b0c1c]" : "bg-white shadow-sm text-slate-800"}`}
      onPointerMove={handleGlowMove} >
        {ripples.map(r => (
          <span
            key={r.id}
            className="pointer-events-none absolute h-4 w-4 animate-[ripple_0.6s_ease-out_forwards] rounded-full bg-blue-400/40"
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
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">PRACTICE BUTTERFLY CLICKING</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drum your index and middle fingers alternately on the mouse button</p>
          </div>
        )}
        {status === "running" && (
          <div className="space-y-2">
            <p className="text-5xl font-black">{clicks.length}</p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: Math.min(12, clicks.length) }).map((_, i) => (
                <div key={i} className="h-4 w-1.5 bg-blue-500 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        )}
        {status === "finished" && (
          <div className="space-y-2">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Butterfly Results</p>
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
              <span className="text-xs font-bold theme-pulse-badge px-3 py-1.5 rounded-full inline-block animate-pulse">
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} CPS</span>
        </p>
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
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 font-mono text-xs">
      {durations.map(d => {
        const isSelected = d === selected;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(d)}
            className={`px-2 py-1 border transition-colors ${
              isSelected
                ? isDarkMode
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : isDarkMode
                  ? "bg-black text-emerald-500 border-emerald-500/30 hover:border-emerald-500"
                  : "bg-white text-emerald-800 border-emerald-500/50 hover:border-emerald-600 hover:bg-emerald-50/50"
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

export function KohiTest({ addHistory, isDarkMode, isTouchDevice = false }: { addHistory: (testType: string, duration: number, score: number, rating: string) => void; isDarkMode: boolean; isTouchDevice?: boolean }) {
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [finalCps, setFinalCps] = useState(0);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-kohi-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastRightClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-kohi-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [duration]);

  const handleFinished = useCallback((totalSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("finished");
    const cps = totalSeconds > 0 ? clicksRef.current / totalSeconds : 0;
    setFinalCps(cps);
    const rank = getRating(cps).label;
    addHistory("Kohi Retro Test", totalSeconds, cps, rank);
    setHumorousMessage(getKohiHumorousLine(cps, isTouchDevice));
    try {
      const key = `cps-test-best-kohi-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (cps > prevHigh) {
        localStorage.setItem(key, cps.toString());
        setHighScore(cps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

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
    <div className={`flex w-full max-w-md flex-col items-center gap-6 font-mono p-6 rounded-3xl border-2 select-none ${
      isDarkMode 
        ? "text-emerald-400 bg-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
        : "text-emerald-800 bg-white border-emerald-500 shadow-md"
    }`}>
      <div className={`w-full border-b pb-3 text-center ${
        isDarkMode ? "border-emerald-500/30" : "border-emerald-500/25"
      }`}>
        <p className={`text-sm tracking-widest uppercase font-bold ${
          isDarkMode ? "text-emerald-500" : "text-emerald-700"
        }`}>[KOHI_SPEED_TRIAL v1.8]</p>
      </div>

      <KohiDurationSelector
        selected={duration}
        disabled={status === "running"}
        isDarkMode={isDarkMode}
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
        <div className={`flex justify-between border-b py-1 ${
          isDarkMode ? "border-emerald-500/20" : "border-emerald-500/15"
        }`}>
          <span>{duration === -1 ? "TIME_ELAPSED:" : "TIME_REMAINING:"}</span>
          <span>{timeLeft.toFixed(2)}s</span>
        </div>
        <div className={`flex justify-between border-b py-1 ${
          isDarkMode ? "border-emerald-500/20" : "border-emerald-500/15"
        }`}>
          <span>TOTAL_CLICKS:</span>
          <span>{clicks}</span>
        </div>
        <div className={`flex justify-between border-b py-1 ${
          isDarkMode ? "border-emerald-500/20" : "border-emerald-500/15"
        }`}>
          <span>RUNNING_CPS:</span>
          <span>{currentCps.toFixed(2)}</span>
        </div>
      </div>

      <button
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        className={`pv-glow relative w-full min-h-60 md:min-h-64 py-6 px-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
          status === "running"
            ? isDarkMode
              ? "bg-emerald-500/10 border-emerald-400 animate-pulse"
              : "bg-emerald-500/5 border-emerald-500 animate-pulse"
            : isDarkMode
              ? "bg-[#050505] border-emerald-500/40 hover:border-emerald-400"
              : "bg-slate-50 border-emerald-500/30 hover:border-emerald-600 hover:bg-emerald-50/20"
        }`}
      onPointerMove={handleGlowMove} >
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
            className={`absolute top-3 right-3 z-30 flex items-center gap-1 rounded border px-2.5 py-1 text-[10px] font-bold cursor-pointer shadow-sm active:scale-95 transition-all ${
              isDarkMode
                ? "border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                : "border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
            }`}
          >
            <ResetIcon className="h-3 w-3" /> RESET
          </div>
        )}
        {status === "idle" && (
          <div className="space-y-1 text-center">
            <p className="text-base font-bold">&gt;&gt;&gt; TAP_PAD &lt;&lt;&lt;</p>
            <p className={`text-[10px] ${
              isDarkMode ? "text-emerald-500/60" : "text-emerald-700/60"
            }`}>CLICK TO COMMENCE SEQUENCE</p>
          </div>
        )}
        {status === "running" && (
          <p className="text-4xl font-black tracking-widest">{clicks}</p>
        )}
        {status === "finished" && (
          <div className="text-center space-y-2">
            <p className="text-sm font-bold">[SEQUENCE_TERMINATED]</p>
            <p className="text-3xl font-black">{finalCps.toFixed(2)} CPS</p>
            <p className={`text-xs font-bold tracking-widest ${
              isDarkMode ? "text-emerald-300" : "text-emerald-600"
            }`}>[RANK: {getRating(finalCps).label.toUpperCase()}]</p>
            {humorousMessage && (
              <p className={`text-[10px] italic py-1.5 px-2 rounded max-w-[280px] mx-auto font-medium leading-relaxed my-1 ${
                isDarkMode 
                  ? "text-emerald-300 bg-emerald-500/5 border border-emerald-500/20" 
                  : "text-emerald-800 bg-emerald-50/50 border border-emerald-500/20"
              }`}>
                &gt; "{humorousMessage.toUpperCase()}"
              </p>
            )}
            <div className="pt-1">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block animate-pulse ${
                isDarkMode 
                  ? "text-emerald-400 border border-emerald-500/20 bg-emerald-500/5" 
                  : "text-emerald-700 border border-emerald-500/25 bg-emerald-500/10"
              }`}>
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
              ? isDarkMode
                ? "bg-red-950/40 hover:bg-red-900/60 text-red-500 border-red-500/60 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse"
                : "bg-red-50 hover:bg-red-100 text-red-600 border-red-500/60 cursor-pointer animate-pulse"
              : isDarkMode
                ? "bg-black text-emerald-500/30 border-emerald-500/10 cursor-not-allowed"
                : "bg-white text-emerald-700/30 border-emerald-500/10 cursor-not-allowed"
          }`}
        >
          [STOP_SEQUENCE]
        </button>
      )}

      <div className="flex w-full flex-col gap-2 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className={isDarkMode ? "text-emerald-500/80" : "text-emerald-700/80"}>
          BEST_FOR_{duration === -1 ? "MANUAL" : `${duration}S`}: {highScore.toFixed(2)}_CPS
        </p>
        <button
          onClick={handleKohiReset}
          className={`px-4 py-2 font-bold uppercase tracking-widest cursor-pointer transition-colors rounded border ${
            isDarkMode
              ? "bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/25 text-emerald-400 text-[10px]"
              : "bg-emerald-50/50 border-emerald-500/40 hover:bg-emerald-100/50 text-emerald-700 text-[10px]"
          }`}
        >
          [RESET_TERMINAL]
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   DRAG CLICK TEST
   ========================================================================== */
export function DragClickTest({ addHistory, isDarkMode, isTouchDevice = false }: AltTestProps) {
  const [duration, setDuration] = useState(3);
  const [dragType, setDragType] = useState<"left" | "right">("left");
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [finalCps, setFinalCps] = useState(0);
  const [humorousMessage, setHumorousMessage] = useState("");
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-drag-${dragType}-${duration}`);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const clicksRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastResetClickRef = useRef<number>(0);

  useDisableScrollZoomOnTouch(status === "running", isTouchDevice);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cps-test-best-drag-${dragType}-${duration}`);
      setHighScore(saved ? parseFloat(saved) : 0);
    } catch {
      setHighScore(0);
    }
  }, [dragType, duration]);

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

    addHistory(
      dragType === "right" ? "Drag Right Click" : "Drag Left Click",
      totalSeconds,
      cps,
      getRating(cps).label
    );

    try {
      const key = `cps-test-best-drag-${dragType}-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (cps > prevHigh) {
        localStorage.setItem(key, cps.toString());
        setHighScore(cps);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, dragType, duration]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    clicksRef.current = 0;
    setCount(0);
    setFinalCps(0);
    setTimeLeft(duration === -1 ? 0 : duration);
    setStatus("idle");
    setHumorousMessage("");
    lastResetClickRef.current = 0;
  }, [duration]);

  const triggerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const isTargetClick = isTouchDevice || (dragType === "right" ? e.button === 2 : e.button === 0);
    const isResetClick = dragType === "right" ? e.button === 0 : e.button === 2;

    if (status === "finished") {
      if (isResetClick) {
        const now = Date.now();
        if (now - lastResetClickRef.current < 500) {
          handleReset();
        } else {
          lastResetClickRef.current = now;
        }
      }
      return;
    }

    if (!isTargetClick) return;

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
  }, [status, duration, dragType, isTouchDevice, handleFinished, handleReset]);

  const handleStopManual = () => {
    if (status !== "running" || duration !== -1) return;
    const elapsed = (Date.now() - (startTimeRef.current ?? Date.now())) / 1000;
    handleFinished(elapsed);
  };

  const elapsedSecs = status === "running" && startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : duration;
  const currentCps = status === "finished" ? finalCps : (status === "running" && elapsedSecs > 0 ? clicksRef.current / elapsedSecs : 0);
  const isTesting = status !== "idle";

  return (
        <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-fade-in">

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Left / Right Selector */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
              <button
                disabled={isTouchDevice || isTesting}
                onClick={() => setDragType("left")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isTouchDevice
                    ? "opacity-40 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : dragType === "left"
                      ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-white/10 " + (isTesting ? "opacity-70 cursor-not-allowed" : "cursor-pointer")
                      : "text-slate-500 " + (isTesting ? "opacity-30 cursor-not-allowed" : "hover:text-slate-900 dark:hover:text-white cursor-pointer")
                }`}
              >
                Left Click Drag
              </button>
              <button
                disabled={isTouchDevice || isTesting}
                onClick={() => setDragType("right")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isTouchDevice
                    ? "opacity-40 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : dragType === "right"
                      ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-white/10 " + (isTesting ? "opacity-70 cursor-not-allowed" : "cursor-pointer")
                      : "text-slate-500 " + (isTesting ? "opacity-30 cursor-not-allowed" : "hover:text-slate-900 dark:hover:text-white cursor-pointer")
                }`}
              >
                Right Click Drag
              </button>
            </div>

            {/* Durations */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 5, 10, -1].map(d => {
                const isSelected = duration === d;
                return (
                  <button
                    key={d}
                    disabled={isTesting}
                    onClick={() => {
                      setDuration(d);
                      setTimeLeft(d === -1 ? 0 : d);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      isSelected
                        ? "theme-active-key text-white border-transparent " + (isTesting ? "opacity-70 cursor-not-allowed" : "cursor-pointer")
                        : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 dark:text-slate-400 " + (isTesting ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer")
                    }`}
                  >
                    {d === -1 ? "Manual" : `${d}s`}
                  </button>
                );
              })}
            </div>
          </div>

      <button
        onMouseDown={triggerClick}
        onContextMenu={(e) => e.preventDefault()}
        className={`pv-glow w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 select-none outline-none cursor-pointer ${
          status === "running"
            ? "bg-emerald-500/5 border-emerald-500/50 scale-[0.99] shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            : status === "finished"
            ? "bg-slate-500/5 border-slate-300 dark:border-white/10"
            : "bg-transparent border-slate-200 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.01]"
        }`}
      onPointerMove={handleGlowMove} >
        {status === "idle" && (
          <div className="space-y-1 text-center px-4">
            <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 uppercase">
              {isTouchDevice ? "DRAG CLICK HERE" : `DRAG ${dragType === "left" ? "LEFT" : "RIGHT"} CLICK HERE`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
              {isTouchDevice 
                ? "Tap or slide your finger on the screen to simulate drag clicking" 
                : `Slide your finger on the ${dragType === "left" ? "Left" : "Right"} mouse button with friction to vibrate the switch`}
            </p>
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
            {!isTouchDevice && (
              <p className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 animate-pulse">
                DOUBLE TAP {dragType === "right" ? "LEFT" : "RIGHT"} CLICK TO RESET
              </p>
            )}
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best for {duration === -1 ? "Manual" : `${duration}s`}:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(2)} CPS</span>
        </p>
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
    if (isTouchDevice) return;
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

    const ratio = Math.min(1.0, (nextDoubles * 2) / Math.max(1, nextTotal));
    setHumorousMessage(getDoubleClickHumorousLine(ratio, isTouchDevice, nextDoubles));
  };

  const handleReset = () => {
    setClickLogs([]);
    setTotalClicks(0);
    setDoubleClicksCount(0);
    lastClickTimeRef.current = null;
    setHumorousMessage("");
  };

  let statusColor = "text-emerald-500 dark:text-emerald-400";
  let statusText = "Standard Clicks Only";
  let statusDesc = "Consistently registering single clicks. Perfect for general accuracy, desktop navigation, and precision tasks.";

  if (doubleClicksCount > 0) {
    const ratio = Math.min(1.0, (doubleClicksCount * 2) / Math.max(1, totalClicks));
    if (ratio > 0.15) {
      statusColor = "text-rose-500 dark:text-rose-400";
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
          <p className="text-2xl font-black text-rose-500 dark:text-rose-400">{doubleClicksCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Double-Click Rate</p>
          <p className="text-2xl font-black text-amber-500">
            {totalClicks > 0 ? `${Math.min(100, ((doubleClicksCount * 2) / totalClicks) * 100).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </div>

      <button
        onMouseDown={handleZoneClick}
        className="pv-glow w-full h-40 rounded-3xl border-2 border-dashed border-amber-500/20 bg-amber-500/[0.01] hover:border-amber-500/40 hover:bg-amber-500/[0.03] active:scale-[0.99] transition-all flex flex-col items-center justify-center relative select-none outline-none cursor-pointer"
      onPointerMove={handleGlowMove} >
        <p className="text-xl font-bold text-amber-500">CLICK TEST AREA</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click here continuously at normal or high speed</p>
      </button>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 flex flex-col justify-center">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">Double-Click Dynamic Status</p>
          <p className={`text-lg font-black ${statusColor}`}>{statusText}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{statusDesc}</p>
          {humorousMessage && (
            <p className={`text-[11px] italic mt-3 border-t border-slate-100 dark:border-white/5 pt-2 ${statusColor}`}>
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
                  <span className={log.isDouble ? "text-rose-500 dark:text-rose-400 font-bold" : "text-emerald-500 font-medium"}>
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
export function AimTrainer({ addHistory, isDarkMode, isTouchDevice = false, onAimState }: AltTestProps) {
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [duration, setDuration] = useState(15);
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

  // Report pill + status so App's leaderboard can follow the pill before
  // a test and pin to the finished test's duration while its result is
  // on screen. Fires on mount too (idle/15), which resets any stale
  // finished duration left over from a previous visit to this module.
  useEffect(() => {
    onAimState?.(duration, status);
  }, [duration, status, onAimState]);

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
          <p className="text-lg font-black theme-text-to-dynamic">{accuracy.toFixed(0)}%</p>
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

      <AltDurationSelector
        selected={duration}
        disabled={status !== "idle"}
        durations={[5, 10, 15, 30, 60]}
        onSelect={(d) => { setDuration(d); setTimeLeft(d); }}
        isDarkMode={isDarkMode}
      />
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className={`pv-glow w-full h-80 rounded-3xl relative border overflow-hidden transition-all duration-300 ${
          status === "running"
            ? "bg-slate-950 border-rose-500/20 cursor-crosshair"
            : "bg-slate-900/5 border-slate-200 dark:border-white/10"
        }`}
      onPointerMove={handleGlowMove} >
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/20">
              <Target className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Are you ready to test your precision?</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">The {duration}-second counter begins instantly when you hit START.</p>
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
              <span>ACCURACY: <b className="theme-text-to">{accuracy.toFixed(1)}%</b></span>
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
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem("cps-test-best-scroll-5");
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const scrollZoneRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const recentStepsRef = useRef<{ time: number }[]>([]);
  const peakSpeedRef = useRef(0);

  const [duration, setDuration] = useState(5);

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
    try {
      const key = `cps-test-best-scroll-${duration}`;
      const saved = localStorage.getItem(key);
      const prevHigh = saved ? parseFloat(saved) : 0;
      if (stepsSec > prevHigh) {
        localStorage.setItem(key, stepsSec.toString());
        setHighScore(stepsSec);
      }
    } catch (e) {
      console.error(e);
    }
  }, [addHistory, isTouchDevice, duration]);

  useEffect(() => {
    if (status !== "idle") return;
    setTimeLeft(duration);
    try {
      const saved = localStorage.getItem(`cps-test-best-scroll-${duration}`);
      if (saved) setHighScore(parseFloat(saved));
    } catch { /* ignore */ }
  }, [duration, status]);

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
    if (isTouchDevice) return;
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
          <p className="text-lg font-black theme-text-to-dynamic">{stepsSec.toFixed(1)}</p>
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

      <AltDurationSelector
        selected={duration}
        disabled={status === "running"}
        durations={[3, 5, 10, 15, 30]}
        onSelect={(d) => { setDuration(d); setTimeLeft(d); }}
        isDarkMode={isDarkMode}
      />
      <div
        ref={scrollZoneRef}
        className={`pv-glow w-full h-56 rounded-3xl relative border flex flex-col items-center justify-center transition-all duration-300 select-none overflow-hidden ${
          status === "running"
            ? "bg-sky-500/[0.02] border-sky-500/50 scale-[0.99] shadow-[0_0_20px_rgba(56,189,248,0.1)] cursor-ns-resize"
            : "bg-transparent border-slate-200 dark:border-white/10 hover:border-sky-500/30 hover:bg-sky-500/[0.01]"
        }`}
      onPointerMove={handleGlowMove} >
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
            <p className="text-sm font-bold theme-text-to-dynamic">{(scrollSteps / duration).toFixed(1)} Steps per Second</p>
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

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Best Score:{" "}
          <span className="font-semibold text-slate-800 dark:text-white">{highScore.toFixed(1)} steps/s</span>
        </p>
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
