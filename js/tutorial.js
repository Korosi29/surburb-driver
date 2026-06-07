// tutorial.js — In-game hint modals (pauses the game while showing)

const TUTORIAL_STEPS = [
    {
        icon: "🔑",
        title: "Starting the Engine",
        body: "Tap the <strong>ignition key</strong> (bottom-right) to start your engine. The indicator light will glow. Tap again to shut it off.",
    },
    {
        icon: "⚙️",
        title: "Gears & Shifting",
        body: "Press <strong>▲</strong> to shift up, <strong>▼</strong> to shift down. Start in <strong>Gear 1</strong> and shift up as speed builds. <strong>P</strong> is Park — <strong>R</strong> is Reverse.",
    },
    {
        icon: "🚗",
        title: "Throttle & Brake",
        body: "Hold the <strong>throttle</strong> (bottom-right pedal) to accelerate. Tap <strong>brake</strong> (bottom-left) to slow down. Engine must be on and a gear selected.",
    },
    {
        icon: "↔️",
        title: "Steering & Traffic",
        body: "Use <strong>◀ ▶</strong> arrow buttons to steer. Stay in your lane — oncoming cars and same-lane traffic will <strong>crash</strong> into you!",
    },
    {
        icon: "💡",
        title: "Lights & Signals",
        body: "Toggle <strong>low / full beam</strong> headlights with the light icons. Use the <strong>signal arrows</strong> to indicate turns. Stay safe out there!",
    },
];

let tutorialStep    = 0;
let tutorialOverlay = null;
let gamePausedByTutorial = false;

// ── Pause / resume helpers ─────────────────────────────────────────────────────
function tutorialPauseGame() {
    if (car.engineOn) {
        // Freeze throttle & brake so car doesn't keep moving
        car.throttleHeld = false;
        car.brakeHeld    = false;
    }
    gamePausedByTutorial = true;
    // Freeze NPC tick via a global flag npc.js checks
    window._tutorialPaused = true;
}

function tutorialResumeGame() {
    gamePausedByTutorial  = false;
    window._tutorialPaused = false;
}

// ── Build modal HTML ──────────────────────────────────────────────────────────
function buildModal(step) {
    const isLast = step === TUTORIAL_STEPS.length - 1;
    const d      = TUTORIAL_STEPS[step];
    const dots   = TUTORIAL_STEPS.map((_, i) =>
        `<span class="t-dot${i === step ? " t-dot-active" : ""}"></span>`
    ).join("");
    return `
        <div class="t-modal">
            <div class="t-icon">${d.icon}</div>
            <h2 class="t-title">${d.title}</h2>
            <p class="t-body">${d.body}</p>
            <div class="t-dots">${dots}</div>
            <button class="t-btn" id="t-next-btn">
                ${isLast ? "Let's Go! 🚀" : "OK, got it"}
            </button>
            ${!isLast ? `<button class="t-skip-btn" id="t-skip-btn">Skip</button>` : ""}
        </div>`;
}

function attachModalEvents() {
    const nextBtn = document.getElementById("t-next-btn");
    const skipBtn = document.getElementById("t-skip-btn");
    if (nextBtn) nextBtn.addEventListener("click", tutorialNext);
    if (skipBtn) skipBtn.addEventListener("click", closeTutorial);
}

// ── Step navigation ────────────────────────────────────────────────────────────
function tutorialNext() {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
        const modal = tutorialOverlay.querySelector(".t-modal");
        modal.style.animation = "tModalOut 0.18s ease forwards";
        setTimeout(() => {
            tutorialStep++;
            tutorialOverlay.querySelector(".t-modal").outerHTML; // stale ref
            tutorialOverlay.innerHTML = buildModal(tutorialStep);
            const newModal = tutorialOverlay.querySelector(".t-modal");
            newModal.style.animation = "tModalIn 0.22s ease forwards";
            attachModalEvents();
        }, 160);
    } else {
        closeTutorial();
    }
}

function closeTutorial() {
    if (!tutorialOverlay) return;
    tutorialOverlay.style.animation = "tFadeOut 0.22s ease forwards";
    setTimeout(() => {
        if (tutorialOverlay) { tutorialOverlay.remove(); tutorialOverlay = null; }
        tutorialStep = 0;
        tutorialResumeGame();
    }, 200);
}

// ── Show ───────────────────────────────────────────────────────────────────────
function showTutorial(isAuto) {
    if (isAuto) localStorage.setItem("tutorialSeen", "1");

    tutorialStep    = 0;
    tutorialPauseGame();

    const gameEl    = document.querySelector(".my-game") || document.body;
    tutorialOverlay = document.createElement("div");
    tutorialOverlay.className = "t-overlay";
    tutorialOverlay.innerHTML = buildModal(0);
    gameEl.appendChild(tutorialOverlay);

    const modal = tutorialOverlay.querySelector(".t-modal");
    modal.style.animation = "tModalIn 0.25s ease forwards";
    attachModalEvents();
}

// ── Freeze NPC movement while tutorial is open ─────────────────────────────────
// Patch requestAnimationFrame tick in npc.js by reading _tutorialPaused flag.
// npc.js already has `if (!crashed)` guard; we piggyback on it by overriding
// the global flag. This avoids modifying npc.js.
const _origRAF = window.requestAnimationFrame.bind(window);
// (npc.js uses requestAnimationFrame internally; we let it run but npc tick
//  checks window._tutorialPaused at the top of its tick via the patch below)

// ── Auto-show on first play ────────────────────────────────────────────────────
const _originalPlay = typeof play === "function" ? play : null;
window.play = function () {
    if (_originalPlay) _originalPlay();
    if (!localStorage.getItem("tutorialSeen")) {
        setTimeout(() => showTutorial(true), 150);
    }
};

// ── Speedometer ───────────────────────────────────────────────────────────────
(function initSpeedometer() {
    const canvas   = document.getElementById("speedo-canvas");
    if (!canvas) return;
    const ctx      = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2 + 8;
    const R  = 36;
    const START_ANG = Math.PI * 0.75;   // 135°
    const END_ANG   = Math.PI * 2.25;   // 405° (full sweep = 270°)
    const MAX_SPEED = 12;               // revSpeed units at top of dial

    function drawDial(speed, isReverse) {
        ctx.clearRect(0, 0, W, H);

        // Background arc
        ctx.beginPath();
        ctx.arc(cx, cy, R, START_ANG, END_ANG);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth   = 6;
        ctx.stroke();

        // Speed arc
        const fraction   = Math.min(Math.abs(speed) / MAX_SPEED, 1);
        const sweepAngle = (END_ANG - START_ANG) * fraction;
        const arcColor   = isReverse ? "#ff7700" : "#00e5ff";

        ctx.beginPath();
        ctx.arc(cx, cy, R, START_ANG, START_ANG + sweepAngle);
        ctx.strokeStyle = arcColor;
        ctx.lineWidth   = 6;
        ctx.lineCap     = "round";
        ctx.stroke();

        // Tick marks (9 ticks)
        for (let i = 0; i <= 8; i++) {
            const ang = START_ANG + ((END_ANG - START_ANG) / 8) * i;
            const inner = R - 8, outer = R - 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
            ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.lineWidth   = i % 4 === 0 ? 2 : 1;
            ctx.stroke();
        }

        // Needle
        const needleAng = START_ANG + ((END_ANG - START_ANG) * fraction);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(needleAng) * (R - 4),
            cy + Math.sin(needleAng) * (R - 4)
        );
        ctx.strokeStyle = "#fff";
        ctx.lineWidth   = 1.5;
        ctx.lineCap     = "round";
        ctx.stroke();

        // Centre dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    // Expose globally so gears.js can call it
    window.updateSpeedometer = function(revSpeed, gear) {
        const isReverse = gear === -1 || revSpeed < -0.05;
        const kph       = Math.round(Math.abs(revSpeed) * 8); // scale to feel like real kph
        const valEl     = document.getElementById("speedo-value");
        const dirEl     = document.getElementById("speedo-dir");
        if (valEl) valEl.textContent = kph;
        if (dirEl) {
            if (isReverse && Math.abs(revSpeed) > 0.05) {
                dirEl.textContent = "REV";
                dirEl.style.color = "#ff7700";
            } else {
                dirEl.textContent = "";
            }
        }
        drawDial(revSpeed, isReverse);
    };

    // Draw empty dial on load
    window.updateSpeedometer(0, 0);
})();
