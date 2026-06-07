// gears.js — Gear shifting, throttle/brake physics, and gear indicator updates
// Depends on: car.js

// Maximum forward speed allowed per gear (km/h equivalent units)
// Unchanged — each gear still reaches the same top speed
const maxSpeed = { 1: 3, 2: 5, 3: 8, 4: 12, 5: 16, 6: 20 };

// Acceleration per frame — gear 1 unchanged, gears 2-6 progressively slower to build
// so the player must start from gear 1 and shift up to reach high speeds efficiently
const accelRate = { "-1": 0.13, 1: 0.06, 2: 0.038, 3: 0.028, 4: 0.020, 5: 0.013, 6: 0.008 };

// How fast speed bleeds off per frame when coasting (no throttle, no brake)
const COAST_DECAY   = 0.03;
// How fast speed bleeds off per frame when braking
const BRAKE_DECAY   = 0.25;

// Input state flags — set/cleared by pointer events in ui.js
car.throttleHeld = false;
car.brakeHeld    = false;

// ─── Gear shifting ────────────────────────────────────────────────────────────

const gearChangeSound = new Audio("assets/audio/gear-change.mp3");

function playGearChange() {
    gearChangeSound.currentTime = 0;
    gearChangeSound.play();
}

function gearUp() {
    if (!car.engineOn) return;
    if (car.gear < 6) {
        car.gear++;
        playGearChange();
        updateGearInDom();
    }
}

function gearDown() {
    if (!car.engineOn) return;
    if (car.gear > -1) {
        car.gear--;
        playGearChange();
        updateGearInDom();
    }
}

// ─── Physics loop ─────────────────────────────────────────────────────────────

function physicsTick() {
    if (window._tutorialPaused) { car.animationId = requestAnimationFrame(physicsTick); return; }
    const lanes = document.getElementById("lanes");
    const gear  = car.gear;

    if (gear === 0) {
        // Neutral / Park — bleed to a stop, no acceleration possible
        if (car.revSpeed > 0)       car.revSpeed = Math.max(0, car.revSpeed - COAST_DECAY);
        else if (car.revSpeed < 0)  car.revSpeed = Math.min(0, car.revSpeed + COAST_DECAY);

    } else if (gear === -1) {
        // Reverse — throttle pushes negative speed, brake pulls toward 0
        const cap = -maxSpeed[1]; // reverse capped at gear-1 speed
        if (car.throttleHeld && car.revSpeed > cap) {
            car.revSpeed = Math.max(cap, car.revSpeed - accelRate["-1"]);
        } else if (car.brakeHeld) {
            car.revSpeed = Math.min(0, car.revSpeed + BRAKE_DECAY);
        } else {
            // coast
            car.revSpeed = Math.min(0, car.revSpeed + COAST_DECAY);
        }

    } else {
        // Forward gears 1–6
        const cap = maxSpeed[gear];
        if (car.throttleHeld && car.revSpeed < cap) {
            car.revSpeed = Math.min(cap, car.revSpeed + accelRate[gear]);
        } else if (car.brakeHeld) {
            car.revSpeed = Math.max(0, car.revSpeed - BRAKE_DECAY);
        } else {
            // coast
            car.revSpeed = Math.max(0, car.revSpeed - COAST_DECAY);
        }

        // If the driver downshifted while above the new gear's cap, clamp speed
        if (car.revSpeed > cap) car.revSpeed = cap;
    }

    // Scroll the road
    car.bgPosition += car.revSpeed;
    lanes.style.backgroundPositionY = car.bgPosition + "px";

    // Update speedometer (function defined in tutorial.js which loads after this file;
    // guard prevents crash if called before it is ready)
    if (typeof updateSpeedometer === "function") updateSpeedometer(car.revSpeed, car.gear);

    // Fade idle sound in/out based on movement
    const isMoving = Math.abs(car.revSpeed) > 0.05;
    if (car.engineOn && isMoving) {
        if (idleSound.paused) {
            idleSound.currentTime = 0;
            idleSound.volume = 0;
            idleSound.play();
        }
        // Fade in
        if (idleSound.volume < 1) {
            idleSound.volume = Math.min(1, idleSound.volume + 0.04);
        }
    } else {
        if (!idleSound.paused) {
            // Fade out
            idleSound.volume = Math.max(0, idleSound.volume - 0.04);
            if (idleSound.volume === 0) {
                idleSound.pause();
                idleSound.currentTime = 0;
            }
        }
    }

    car.animationId = requestAnimationFrame(physicsTick);
}

// Start the loop once on page load; it runs forever and reacts to flags
function startPhysicsLoop() {
    if (car.animationId) return; // already running
    physicsTick();
}

// ─── Gear indicator ───────────────────────────────────────────────────────────

const gearIndicatorMap = {
    "-1": { el: () => car.reverseIndicator,  color: () => car.reverseGearLight },
     "0": { el: () => car.neutralIndicator,  color: () => car.neutralGearLight },
     "1": { el: () => car.gear1Indicator,    color: () => car.positiveGearLight },
     "2": { el: () => car.gear2Indicator,    color: () => car.positiveGearLight },
     "3": { el: () => car.gear3Indicator,    color: () => car.positiveGearLight },
     "4": { el: () => car.gear4Indicator,    color: () => car.positiveGearLight },
     "5": { el: () => car.gear5Indicator,    color: () => car.positiveGearLight },
     "6": { el: () => car.gear6Indicator,    color: () => car.positiveGearLight },
};

let activeGearIndicator = null; // set after DOM is ready

function updateGearInDom() {
    if (activeGearIndicator) activeGearIndicator.style.backgroundColor = car.noColor;
    const entry = gearIndicatorMap[String(car.gear)] || gearIndicatorMap["0"];
    activeGearIndicator = entry.el();
    activeGearIndicator.style.backgroundColor = entry.color();
}

// Initialise after DOM is ready (called from ui.js)
function initGears() {
    activeGearIndicator = car.neutralIndicator;
    updateGearInDom();
    startPhysicsLoop();
}
