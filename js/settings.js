// settings.js — Game settings panel
// Must load after all other scripts. Persists to localStorage.

// ── Defaults ──────────────────────────────────────────────────────────────────
const SETTINGS_DEFAULTS = {
    car:         "car1",
    lane:        "right",
    sound:       true,
    sensitivity: 2,   // 1=low 2=medium 3=high
};

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem("gameSettings") || "{}");
        return Object.assign({}, SETTINGS_DEFAULTS, saved);
    } catch(e) { return Object.assign({}, SETTINGS_DEFAULTS); }
}

function saveSettings(s) {
    localStorage.setItem("gameSettings", JSON.stringify(s));
}

window.gameSettings = loadSettings();

// ── Apply settings ────────────────────────────────────────────────────────────
function applySettings() {
    const s = window.gameSettings;

    // Car image + width
    const carWidths  = { car1: 80, car2: 240, car3: 190 };
    const carInsets  = { car1: 10, car2: 80,  car3: 60  };
    const w  = carWidths[s.car] || 80;
    const ix = carInsets[s.car] || 10;
    window._playerCarWidth     = w;
    window._playerHitboxInsetX = ix;

    const container = document.getElementById("c1-container");
    const playerImg = container ? container.querySelector("img") : null;
    if (playerImg) playerImg.src = `assets/images/${s.car}.png`;
    if (container) container.style.width = w + "px";

    // Lane + road boundaries
    const halfW = w / 2;
    const defaultX = s.lane === "left" ? (93 - halfW) : (208 - halfW);
    window._playerDefaultX   = defaultX;
    window._playerRoadLeft   = 10;
    window._playerRoadRight  = 300 - w - 5; // keep car inside road
    if (container) container.style.left = defaultX + "px";

    // Push into controls live vars
    if (typeof carX !== "undefined") {
        carX  = defaultX;
        restX = defaultX;
    }

    // Sensitivity
    const sensMap = { 1: 1.0, 2: 1.8, 3: 3.0 };
    window._driftSpeed = sensMap[s.sensitivity] || 1.8;

    // Sound — mute/unmute all Audio objects
    window._soundEnabled = s.sound;
    const audios = [];
    if (typeof idleSound       !== "undefined") audios.push(idleSound);
    if (typeof gearChangeSound !== "undefined") audios.push(gearChangeSound);
    if (typeof car             !== "undefined") {
        if (car.startingSound) audios.push(car.startingSound);
        if (car.offingSound)   audios.push(car.offingSound);
    }
    audios.forEach(a => { a.muted = !s.sound; });
}

// ── Open settings panel ───────────────────────────────────────────────────────
function openSettings() {
    if (document.getElementById("settings-overlay")) return;

    const s = window.gameSettings;

    const overlay = document.createElement("div");
    overlay.id = "settings-overlay";

    overlay.innerHTML = `
        <div class="sett-panel">
            <div class="sett-handle"></div>
            <div class="sett-header">
                <span class="sett-title">Settings</span>
                <button class="sett-close" id="sett-close-btn">✕</button>
            </div>
            <div class="sett-body">

                <div class="sett-section">
                    <div class="sett-label">Your Car</div>
                    <div class="sett-cars">
                        <div class="sett-car-card ${s.car==='car1'?'active':''}" data-car="car1">
                            <img src="assets/images/car1.png" alt="Sedan"/>
                            <span>Sedan</span>
                        </div>
                        <div class="sett-car-card ${s.car==='car2'?'active':''}" data-car="car2">
                            <img src="assets/images/car2.png" alt="SUV"/>
                            <span>SUV</span>
                        </div>
                        <div class="sett-car-card ${s.car==='car3'?'active':''}" data-car="car3">
                            <img src="assets/images/car3.png" alt="Hatch"/>
                            <span>Hatch</span>
                        </div>
                    </div>
                </div>

                <div class="sett-section">
                    <div class="sett-label">Driving Lane</div>
                    <div class="sett-toggle-row">
                        <button class="sett-toggle ${s.lane==='left'?'active':''}"  data-lane="left">◀ Left Lane</button>
                        <button class="sett-toggle ${s.lane==='right'?'active':''}" data-lane="right">Right Lane ▶</button>
                    </div>
                </div>

                <div class="sett-section">
                    <div class="sett-label">Sound</div>
                    <div class="sett-toggle-row">
                        <button class="sett-toggle ${s.sound?'active':''}"  data-sound="on">🔊 On</button>
                        <button class="sett-toggle ${!s.sound?'active':''}" data-sound="off">🔇 Off</button>
                    </div>
                </div>

                <div class="sett-section">
                    <div class="sett-label">Steering Sensitivity</div>
                    <div class="sett-toggle-row">
                        <button class="sett-toggle ${s.sensitivity===1?'active':''}" data-sens="1">Low</button>
                        <button class="sett-toggle ${s.sensitivity===2?'active':''}" data-sens="2">Medium</button>
                        <button class="sett-toggle ${s.sensitivity===3?'active':''}" data-sens="3">High</button>
                    </div>
                </div>

            </div>
            <button class="sett-save" id="sett-save-btn">Save &amp; Close</button>
        </div>`;

    // Append to body (not .my-game) so visibility:hidden never affects it
    document.body.appendChild(overlay);
    // Two rAF frames: first lets display:flex apply, second triggers the transition
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("visible")));

    overlay.querySelectorAll(".sett-car-card").forEach(el => {
        el.addEventListener("click", () => {
            overlay.querySelectorAll(".sett-car-card").forEach(c => c.classList.remove("active"));
            el.classList.add("active");
            window.gameSettings.car = el.dataset.car;
        });
    });

    overlay.querySelectorAll("[data-lane]").forEach(el => {
        el.addEventListener("click", () => {
            overlay.querySelectorAll("[data-lane]").forEach(b => b.classList.remove("active"));
            el.classList.add("active");
            window.gameSettings.lane = el.dataset.lane;
        });
    });

    overlay.querySelectorAll("[data-sound]").forEach(el => {
        el.addEventListener("click", () => {
            overlay.querySelectorAll("[data-sound]").forEach(b => b.classList.remove("active"));
            el.classList.add("active");
            window.gameSettings.sound = el.dataset.sound === "on";
        });
    });

    overlay.querySelectorAll("[data-sens]").forEach(el => {
        el.addEventListener("click", () => {
            overlay.querySelectorAll("[data-sens]").forEach(b => b.classList.remove("active"));
            el.classList.add("active");
            window.gameSettings.sensitivity = parseInt(el.dataset.sens);
        });
    });

    document.getElementById("sett-save-btn").addEventListener("click", closeSettings);
    document.getElementById("sett-close-btn").addEventListener("click", closeSettings);
}

function closeSettings() {
    const overlay = document.getElementById("settings-overlay");
    if (!overlay) return;
    saveSettings(window.gameSettings);
    applySettings();
    overlay.classList.remove("visible");
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 280);
}

// Apply immediately — script loads after DOM is ready so DOMContentLoaded already fired
applySettings();
