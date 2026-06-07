// npc.js — NPC traffic system
//
// COORDINATE MODEL:
//   All NPC elements are position:absolute inside #main-road-con.
//   The road TEXTURE scrolls via backgroundPositionY — NPC elements do NOT
//   automatically scroll with it. So NPCs must be moved manually each frame.
//
// LEFT LANE  (oncoming):  spawns at top (y near 0), moves DOWN each frame.
// RIGHT LANE (same-dir):  spawns above the player, drifts DOWN slowly.
//   The player car is fixed at ~60% of road height. Same-dir NPCs start
//   above that (lower y value) and drift downward at the difference between
//   road scroll speed and their own slower speed — so the player slowly
//   catches up to them from behind.

(function () {

    // ── Config ────────────────────────────────────────────────────────────────
    const ONCOMING_BASE    = 3.5;   // px/frame oncoming cars move DOWN
    const ONCOMING_VAR     = 2.0;
    // Same-dir traffic moves at gear2-3 equivalent speed (revSpeed 5-8 range)
    // so player needs gear 4+ to visibly overtake them
    const TRAFFIC_DRIFT    = 5.5;   // px/frame same-dir cars drift DOWN (gear2-3 pace)
    const TRAFFIC_VAR      = 2.0;   // variance: some faster, some slower
    const SAFE_GAP         = 25;
    const BRAKE_ZONE       = 100;
    const NPC_HEIGHT       = 160;   // px — visual height of a spawned NPC el
    const MIN_SPAWN_GAP    = 300;   // min px between consecutive NPCs in a lane

    const LEFT_LANE_CENTER  = 93;
    const RIGHT_LANE_CENTER = 208;

    const NPC_VARIANTS = [
        { src: "assets/images/car1.png", width: 80,
          leftL: LEFT_LANE_CENTER - 40,  leftR: RIGHT_LANE_CENTER - 40,
          insetX: 10, insetY: 10 },
        { src: "assets/images/car2.png", width: 240,
          leftL: LEFT_LANE_CENTER - 120, leftR: RIGHT_LANE_CENTER - 120,
          insetX: 80, insetY: 30 },
        { src: "assets/images/car3.png", width: 190,
          leftL: LEFT_LANE_CENTER - 95,  leftR: RIGHT_LANE_CENTER - 95,
          insetX: 60, insetY: 25 },
    ];

    let leftLaneNPCs  = [];
    let rightLaneNPCs = [];
    let crashed       = false;
    let crashOverlay  = null;

    function getRoadCon() { return document.getElementById("main-road-con"); }

    // ── Create NPC element ────────────────────────────────────────────────────
    function makeNPC(variant, x, y, flipped) {
        const el = document.createElement("div");
        el.className = "npc-car";
        el.style.cssText = `
            position: absolute;
            left: ${x}px;
            top:  ${y}px;
            width: ${variant.width}px;
            z-index: 5;
            pointer-events: none;
            ${flipped ? "transform: scaleY(-1);" : ""}
        `;
        const img = document.createElement("img");
        img.src = variant.src;
        img.style.cssText = "width:100%; display:block;";
        el.appendChild(img);
        getRoadCon().appendChild(el);
        return el;
    }

    // ── Spawn ─────────────────────────────────────────────────────────────────

    // Oncoming: starts just off the top, moves downward
    function spawnLeft() {
        if (leftLaneNPCs.length > 0) {
            const last = leftLaneNPCs[leftLaneNPCs.length - 1];
            if (last.y < MIN_SPAWN_GAP) return; // last one hasn't cleared gap yet
        }
        const v  = NPC_VARIANTS[Math.floor(Math.random() * NPC_VARIANTS.length)];
        const y  = -NPC_HEIGHT;
        const el = makeNPC(v, v.leftL, y, true);
        leftLaneNPCs.push({ el, y, speed: ONCOMING_BASE + Math.random() * ONCOMING_VAR, variant: v });
    }

    // Same-direction: starts above the player (y = 20–40% of road height),
    // drifts downward slowly so the player catches up from behind.
    function spawnRight() {
        const roadCon = getRoadCon();
        const roadH   = roadCon.offsetHeight;
        const playerY = roadH * 0.60; // player fixed at 60%

        if (rightLaneNPCs.length > 0) {
            // Don't spawn if the most-recently-spawned NPC is still near the top
            const last = rightLaneNPCs[rightLaneNPCs.length - 1];
            if (last.y < MIN_SPAWN_GAP) return;
        }

        // Spawn off the top of screen — player's speed will catch up to them
        const y  = -(NPC_HEIGHT + Math.random() * 200);
        const v  = NPC_VARIANTS[Math.floor(Math.random() * NPC_VARIANTS.length)];
        const el = makeNPC(v, v.leftR, y, false); // no flip — car faces forward (away from player)
        rightLaneNPCs.push({ el, y, speed: TRAFFIC_DRIFT + Math.random() * TRAFFIC_VAR, variant: v });
    }

    // ── Crash overlay ─────────────────────────────────────────────────────────
    function showCrashOverlay() {
        if (crashOverlay) return;
        car.throttleHeld = false;
        car.brakeHeld    = false;
        car.revSpeed     = 0;

        crashOverlay = document.createElement("div");
        crashOverlay.id = "crash-overlay";
        crashOverlay.style.cssText = `
            position:absolute; inset:0;
            background:rgba(200,0,0,0.55);
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            z-index:100; font-family:sans-serif;
            animation: crash-flash 0.15s steps(1) 4;
        `;
        crashOverlay.innerHTML = `
            <div style="font-size:3rem">💥</div>
            <div style="color:#fff;font-size:1.4rem;font-weight:bold;margin-top:8px;text-shadow:0 2px 6px #000">CRASHED!</div>
            <button id="crash-restart-btn" style="
                margin-top:18px; padding:10px 28px; font-size:1rem;
                font-weight:bold; border:none; border-radius:8px;
                background:#fff; color:#c00; cursor:pointer;
                box-shadow:0 3px 8px rgba(0,0,0,0.4);">Try Again</button>
        `;
        if (!document.getElementById("crash-keyframes")) {
            const s = document.createElement("style");
            s.id = "crash-keyframes";
            s.textContent = `@keyframes crash-flash {
                0%  {background:rgba(255,255,255,0.85)}
                50% {background:rgba(200,0,0,0.55)}
                100%{background:rgba(200,0,0,0.55)}
            }`;
            document.head.appendChild(s);
        }
        getRoadCon().appendChild(crashOverlay);
        document.getElementById("crash-restart-btn").addEventListener("click", resetAfterCrash);
    }

    function resetAfterCrash() {
        crashed = false;
        if (crashOverlay) { crashOverlay.remove(); crashOverlay = null; }
        leftLaneNPCs.forEach(n => n.el.remove());
        rightLaneNPCs.forEach(n => n.el.remove());
        leftLaneNPCs = [];
        rightLaneNPCs = [];
        car.revSpeed = 0;
    }

    // ── Collision ─────────────────────────────────────────────────────────────
    function overlap(a, b) {
        return a.left < b.right && a.right > b.left &&
               a.top  < b.bottom && a.bottom > b.top;
    }

    function playerRect() {
        const r  = car.car1.getBoundingClientRect();
        const ix = window._playerHitboxInsetX || 10;
        return { left: r.left+ix, right: r.right-ix, top: r.top+10, bottom: r.bottom-10 };
    }

    function npcRect(npc) {
        const r  = npc.el.getBoundingClientRect();
        const ix = npc.variant.insetX;
        const iy = npc.variant.insetY;
        return { left: r.left+ix, right: r.right-ix, top: r.top+iy, bottom: r.bottom-iy };
    }

    function checkCrashes() {
        if (crashed || !car.car1) return;
        const pr = playerRect();
        for (const npc of [...leftLaneNPCs, ...rightLaneNPCs]) {
            if (overlap(pr, npcRect(npc))) { crashed = true; showCrashOverlay(); return; }
        }
    }

    // ── Tick ──────────────────────────────────────────────────────────────────
    function tick() {
        if (window._tutorialPaused) { requestAnimationFrame(tick); return; }

        if (!crashed) {
            const roadCon = getRoadCon();
            const roadH   = roadCon.offsetHeight;
            const scroll  = Math.max(0, car.revSpeed); // how fast road is scrolling this frame

            // LEFT LANE — oncoming: move down by own speed PLUS road scroll
            // Road texture moves up at car.revSpeed px/frame, so NPCs must move
            // down by the same amount to stay fixed on the road visually,
            // plus their own approach speed on top.
            leftLaneNPCs = leftLaneNPCs.filter(npc => {
                npc.y += npc.speed + scroll;
                npc.el.style.top = npc.y + "px";
                if (npc.y > roadH + NPC_HEIGHT) { npc.el.remove(); return false; }
                return true;
            });

            // RIGHT LANE — same direction traffic
            // NPCs travel at gear2-3 speed (TRAFFIC_DRIFT ~5.5 px/frame).
            // Road scrolls at car.revSpeed (gear4 = ~12, gear5 = ~16).
            // Net downward drift = scroll - npc.speed:
            //   gear3 player (scroll=8) vs traffic(speed=5.5) → drift 2.5px/frame (slow catch-up)
            //   gear4 player (scroll=12) vs traffic(speed=5.5) → drift 6.5px/frame (clear overtake)
            //   stopped player (scroll=0) → npc drifts up slightly (they drive away from you)
            rightLaneNPCs = rightLaneNPCs.filter(npc => {
                const drift = scroll - npc.speed;
                if (drift > 0) {
                    // Player faster than NPC — NPC drifts toward and past player
                    npc.y += drift;
                } else {
                    // Player slower — NPC drives away (moves up screen)
                    npc.y += drift * 0.4; // soften upward movement
                }
                npc.el.style.top = npc.y + "px";
                if (npc.y > roadH + NPC_HEIGHT) { npc.el.remove(); return false; }
                if (npc.y < -NPC_HEIGHT * 3)    { npc.el.remove(); return false; }
                return true;
            });

            checkCrashes();
        }

        requestAnimationFrame(tick);
    }

    // ── Schedule ──────────────────────────────────────────────────────────────
    function scheduleLeft() {
        const d = 1800 + Math.random() * 2400;
        setTimeout(() => { spawnLeft(); scheduleLeft(); }, d);
    }

    function scheduleRight() {
        const d = 2200 + Math.random() * 2600;
        setTimeout(() => { spawnRight(); scheduleRight(); }, d);
    }

    scheduleLeft();
    scheduleRight();
    tick();

})();
