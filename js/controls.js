// controls.js — Steering, pause and play controls
// Depends on: car.js

// Road: 300px wide, divider at 152px. Car is 80px wide.
// Right lane: 152–265px → center 208px → left edge = 208 - 40 = 168px
// Left  lane:   35–152px → center  93px → left edge =  93 - 40 =  53px
// Full road boundaries for the car (80px wide)
const ROAD_LEFT  = 10;   // slight inset from road edge
const ROAD_RIGHT = 215;  // keeps right edge within road (215 + 80 = 295)
const DEFAULT_X  = 168;  // right lane center — starting position

// Speeds — DRIFT_SPEED is overridden at runtime by settings.js via window._driftSpeed
const DRIFT_SPEED  = 1.8;  // default; settings.js may change window._driftSpeed
const RETURN_SPEED = 1.4;  // px per frame returning to rest
// Inline getter so sensitivity changes take effect immediately without reload
function getDrift() { return window._driftSpeed || DRIFT_SPEED; }

// ── Gyroscope config ──────────────────────────────────────────────────────────
// In portrait mode, gamma = left/right tilt (-90 left … 0 neutral … +90 right)
// We use a dead zone around 0 so slight hand tremor doesn't move the car.
const GYRO_DEAD_ZONE   = 3;   // degrees — ignored near centre
const GYRO_MAX_TILT    = 25;  // degrees — full-speed steering reached at this tilt
const GYRO_SPEED_MAX   = 3.5; // max px per frame from gyro at full tilt

let gyroEnabled  = false;
let gammaTilt    = 0;   // smoothed gamma value

// ── State ─────────────────────────────────────────────────────────────────────
// Use settings lane position if available, else fall back to DEFAULT_X
let carX   = window._playerDefaultX || DEFAULT_X;
let restX  = window._playerDefaultX || DEFAULT_X;  // where car returns to when released

let steerLeft  = false;
let steerRight = false;

// ── Steering tick ─────────────────────────────────────────────────────────────
function steerTick() {
    const moving = car.engineOn && car.gear !== 0 && car.revSpeed > 0;

    if (moving) {
        let moved = false;
        const roadL = window._playerRoadLeft  || ROAD_LEFT;
        const roadR = window._playerRoadRight || ROAD_RIGHT;

        // Button input takes priority
        if (steerLeft) {
            carX  = Math.max(roadL, carX - getDrift());
            restX = carX;
            moved = true;
        } else if (steerRight) {
            carX  = Math.min(roadR, carX + getDrift());
            restX = carX;
            moved = true;
        }

        // Gyroscope input (only when no button held)
        if (!moved && gyroEnabled) {
            const tilt = gammaTilt;
            if (Math.abs(tilt) > GYRO_DEAD_ZONE) {
                // Normalise tilt to 0–1 range beyond the dead zone
                const effective  = (Math.abs(tilt) - GYRO_DEAD_ZONE) /
                                   (GYRO_MAX_TILT - GYRO_DEAD_ZONE);
                const speed      = Math.min(1, effective) * GYRO_SPEED_MAX;
                if (tilt < 0) {
                    carX  = Math.max(roadL, carX - speed);
                } else {
                    carX  = Math.min(roadR, carX + speed);
                }
                restX = carX;
            } else {
                // Within dead zone — drift back to rest
                returnToRest();
            }
        } else if (!moved) {
            returnToRest();
        }
    } else {
        // Not moving — always return to rest
        returnToRest();
    }

    car.car1.style.left      = Math.round(carX) + "px";
    car.car1.style.transform = "none";
    requestAnimationFrame(steerTick);
}

function returnToRest() {
    if (Math.abs(carX - restX) < RETURN_SPEED) {
        carX = restX;
    } else {
        carX += carX < restX ? RETURN_SPEED : -RETURN_SPEED;
    }
}

requestAnimationFrame(steerTick);

// ── Gyroscope setup ───────────────────────────────────────────────────────────
function setupGyro() {
    // iOS 13+ requires explicit permission
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(state => {
                if (state === "granted") attachGyroListener();
            })
            .catch(() => {});
    } else if (window.DeviceOrientationEvent) {
        // Android and older browsers — no permission needed
        attachGyroListener();
    }
}

function attachGyroListener() {
    window.addEventListener("deviceorientation", e => {
        if (e.gamma === null) return;
        gyroEnabled = true;
        // Low-pass filter to smooth jitter: blend 20% new reading, 80% old
        gammaTilt = gammaTilt * 0.8 + e.gamma * 0.2;
    }, true);
}

// Request gyro on first user interaction (required by browsers)
let gyroRequested = false;
function requestGyroOnce() {
    if (gyroRequested) return;
    gyroRequested = true;
    setupGyro();
}

document.addEventListener("touchstart", requestGyroOnce, { once: true });
document.addEventListener("pointerdown", requestGyroOnce, { once: true });

// ── Button event wiring ───────────────────────────────────────────────────────
function addHold(el, onStart, onEnd) {
    el.addEventListener("touchstart",  e => { e.preventDefault(); onStart(); }, { passive: false });
    el.addEventListener("touchend",    e => { e.preventDefault(); onEnd();   }, { passive: false });
    el.addEventListener("touchcancel", e => { e.preventDefault(); onEnd();   }, { passive: false });
    el.addEventListener("pointerdown",  onStart);
    el.addEventListener("pointerup",    onEnd);
    el.addEventListener("pointerleave", onEnd);
}

addHold(car.controlLeft,
    () => { steerLeft = true;  steerRight = false; },
    () => { steerLeft = false; }
);

addHold(car.controlRight,
    () => { steerRight = true;  steerLeft = false; },
    () => { steerRight = false; }
);

// ── Pause / play ──────────────────────────────────────────────────────────────
function pause() {
    document.querySelector(".menu-con").style.display = "flex";
    document.querySelector(".play").innerHTML = "Continue";
}

function play() {
    document.querySelector(".menu-con").style.display = "none";
}

// goToAboutPage removed — replaced by How to Play tutorial
