// ui.js — UI bindings and loading screen
// Depends on: car.js, engine.js, gears.js, controls.js, lights.js
// This file runs last and wires everything together.

// ─── Helper: attach both touch and mouse hold events ─────────────────────────
function onHold(el, onStart, onEnd) {
    el.addEventListener("touchstart",  e => { e.preventDefault(); onStart(); }, { passive: false });
    el.addEventListener("touchend",    e => { e.preventDefault(); onEnd();   }, { passive: false });
    el.addEventListener("touchcancel", e => { e.preventDefault(); onEnd();   }, { passive: false });
    el.addEventListener("mousedown",   onStart);
    el.addEventListener("mouseup",     onEnd);
    el.addEventListener("mouseleave",  onEnd);
}

// ─── Throttle — hold to accelerate ──────────────────────────────────────────
onHold(
    car.throttle,
    () => { if (car.engineOn && car.gear !== 0) car.throttleHeld = true; },
    () => { car.throttleHeld = false; }
);

// ─── Brake — hold to slow down ───────────────────────────────────────────────
onHold(
    car.brake,
    () => { if (car.engineOn) car.brakeHeld = true; },
    () => { car.brakeHeld = false; }
);

// ─── Gear up / Gear down — tap the gear indicators ───────────────────────────
// Add two dedicated shift buttons (gear+ and gear-) wired in HTML,
// AND make each gear indicator tappable for direct selection.
const gearUpBtn   = document.getElementById("gear-up");
const gearDownBtn = document.getElementById("gear-down");

if (gearUpBtn)   gearUpBtn.addEventListener("click",   gearUp);
if (gearDownBtn) gearDownBtn.addEventListener("click",  gearDown);

// ─── Steering — handled entirely by controls.js (hold-to-drift) ──────────────

// ─── Lights & signals ────────────────────────────────────────────────────────
car.lowBeamSwitch.addEventListener("click",    lowBeamSwitch);
car.highBeamSwitch.addEventListener("click",   highBeamSwitch);
car.c1turnLeftButton.addEventListener("click", onTunSigLeft);
car.c1turnRightButton.addEventListener("click",onTunSigRight);

// ─── Init ─────────────────────────────────────────────────────────────────────
initGears();

// ─── Loading screen ───────────────────────────────────────────────────────────
document.querySelector(".loading-bar").addEventListener("animationend", function () {
    document.querySelector(".loading-main").style.display = "none";
    document.querySelector(".menu-con").style.display = "flex";
});
