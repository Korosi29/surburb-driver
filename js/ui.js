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
let _hintTimeout = null;

function showDriveHint() {
    if (document.getElementById("drive-hint")) return;
    const msg = !car.engineOn ? "Start the engine first! 🔑" : "Select a gear first! ⚙️";
    const el  = document.createElement("div");
    el.id = "drive-hint";
    el.textContent = msg;
    document.body.appendChild(el);
    // Trigger fade-in
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visible")));
    // Auto-dismiss after 2s
    clearTimeout(_hintTimeout);
    _hintTimeout = setTimeout(() => {
        el.classList.remove("visible");
        setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
    }, 2000);
}

onHold(
    car.throttle,
    () => {
        if (car.engineOn && car.gear !== 0) {
            car.throttleHeld = true;
        } else {
            showDriveHint();
        }
    },
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
    document.querySelector(".my-game").style.visibility = "visible";
    document.querySelector(".menu-con").style.display = "flex";
});
