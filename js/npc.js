// npc.js — Two-lane NPC traffic
// Left lane  (oncoming):  spawns at top,    moves downward  (scaleY(-1))
// Right lane (same dir):  spawns at bottom, moves upward    (no flip)
// Each NPC has its own random speed. NPCs brake to 20px behind a slower car ahead.

(function () {

    // ── Config ────────────────────────────────────────────────────────────────
    const SPAWN_INTERVAL_MIN = 2200;
    const SPAWN_INTERVAL_MAX = 4800;
    const NPC_BASE_SPEED     = 1.8;   // minimum per-NPC speed
    const NPC_SPEED_VARIANCE = 2.0;   // random extra speed added per NPC
    const SAFE_GAP           = 20;    // px to maintain behind the car ahead
    const BRAKE_ZONE         = 80;    // px distance at which braking begins
    const NPC_HEIGHT         = 280;   // assumed car height for gap calculation
    const MIN_SPAWN_GAP      = 320;   // min spacing between spawns

    // Road 300px wide, divider at 152px.
    // Left lane:  35–152px  → center ≈ 93px
    // Right lane: 152–265px → center ≈ 208px
    const LEFT_LANE_CENTER  = 93;
    const RIGHT_LANE_CENTER = 208;

    const NPC_VARIANTS = [
        { src: "assets/images/car1.png", width: 80,
          leftL: LEFT_LANE_CENTER - 40,   leftR: RIGHT_LANE_CENTER - 40  },
        { src: "assets/images/car2.png", width: 240,
          leftL: LEFT_LANE_CENTER - 120,  leftR: RIGHT_LANE_CENTER - 120 },
        { src: "assets/images/car3.png", width: 190,
          leftL: LEFT_LANE_CENTER - 95,   leftR: RIGHT_LANE_CENTER - 95  },
    ];

    // Each pool is ordered front-to-back in travel direction:
    //   leftLaneNPCs[0]  = furthest down  (leader of the downward convoy)
    //   rightLaneNPCs[0] = furthest up    (leader of the upward convoy)
    let leftLaneNPCs  = [];
    let rightLaneNPCs = [];

    function getRoadCon() {
        return document.getElementById("main-road-con");
    }

    function randomNPCSpeed() {
        return NPC_BASE_SPEED + Math.random() * NPC_SPEED_VARIANCE;
    }

    // ── Spawn ─────────────────────────────────────────────────────────────────

    function spawnLeftLane() {
        const roadCon = getRoadCon();
        if (leftLaneNPCs.length > 0) {
            const last = leftLaneNPCs[leftLaneNPCs.length - 1];
            if (last.y < MIN_SPAWN_GAP - NPC_HEIGHT) return;
        }
        const variant = NPC_VARIANTS[Math.floor(Math.random() * NPC_VARIANTS.length)];
        const el = document.createElement("div");
        el.className = "npc-car";
        el.style.cssText = `
            position: absolute;
            left: ${variant.leftL}px;
            top: -${NPC_HEIGHT}px;
            width: ${variant.width}px;
            z-index: 5;
            transform: scaleY(-1);
            pointer-events: none;
        `;
        const img = document.createElement("img");
        img.src = variant.src;
        img.style.cssText = "width:100%; display:block;";
        el.appendChild(img);
        roadCon.appendChild(el);
        leftLaneNPCs.push({ el, y: -NPC_HEIGHT, speed: randomNPCSpeed() });
    }

    function spawnRightLane() {
        const roadCon    = getRoadCon();
        const roadHeight = roadCon.offsetHeight;
        if (rightLaneNPCs.length > 0) {
            const last = rightLaneNPCs[rightLaneNPCs.length - 1];
            if (last.y > roadHeight - MIN_SPAWN_GAP + NPC_HEIGHT) return;
        }
        const variant = NPC_VARIANTS[Math.floor(Math.random() * NPC_VARIANTS.length)];
        const startY  = roadHeight + NPC_HEIGHT;
        const el = document.createElement("div");
        el.className = "npc-car";
        el.style.cssText = `
            position: absolute;
            left: ${variant.leftR}px;
            top: ${startY}px;
            width: ${variant.width}px;
            z-index: 5;
            pointer-events: none;
        `;
        const img = document.createElement("img");
        img.src = variant.src;
        img.style.cssText = "width:100%; display:block;";
        el.appendChild(img);
        roadCon.appendChild(el);
        rightLaneNPCs.push({ el, y: startY, speed: randomNPCSpeed() });
    }

    // ── Collision avoidance ───────────────────────────────────────────────────
    // Returns the effective speed for `npc` given the car directly ahead of it.
    // `ahead` is the NPC object in front, or null if this NPC leads the pack.
    // `direction`: 1 = moving down (left lane), -1 = moving up (right lane).

    function safeSpeed(npc, ahead, direction) {
        const ownSpeed = npc.speed;

        if (!ahead) return ownSpeed; // leader — full speed

        // Gap = distance between the front edge of this NPC and rear edge of ahead
        // Down-moving: this car's top (npc.y) vs ahead's bottom (ahead.y + NPC_HEIGHT)
        // Up-moving:   this car's bottom (npc.y + NPC_HEIGHT) vs ahead's top (ahead.y)
        const gap = direction === 1
            ? npc.y - (ahead.y + NPC_HEIGHT)      // left lane (downward)
            : ahead.y - (npc.y + NPC_HEIGHT);     // right lane (upward)  — ahead is above

        if (gap <= SAFE_GAP) return 0;            // hold — already at safe distance
        if (gap <= SAFE_GAP + BRAKE_ZONE) {
            // Ease off proportionally as gap shrinks toward SAFE_GAP
            return ownSpeed * ((gap - SAFE_GAP) / BRAKE_ZONE);
        }
        return ownSpeed;
    }

    // ── Player car virtual obstacle ───────────────────────────────────────────
    // Returns a pseudo-NPC object representing the player car's position so
    // right-lane NPCs can brake for it just like they do for each other.

    function getPlayerObstacle(roadCon) {
        const playerEl = car.car1;
        if (!playerEl) return null;
        const roadTop = roadCon.getBoundingClientRect().top;
        const carRect = playerEl.getBoundingClientRect();
        const playerY = carRect.top - roadTop;
        const playerH = carRect.height || NPC_HEIGHT;
        return { y: playerY, _height: playerH };
    }

    // ── Tick ──────────────────────────────────────────────────────────────────

    function tick() {
        const roadCon    = getRoadCon();
        const roadHeight = roadCon.offsetHeight;

        // Left lane — moves downward; index 0 is the leader (furthest down)
        leftLaneNPCs = leftLaneNPCs.filter((npc, i) => {
            const ahead = i > 0 ? leftLaneNPCs[i - 1] : null;
            const speed = safeSpeed(npc, ahead, 1);
            npc.y += speed;
            npc.el.style.top = npc.y + "px";
            if (npc.y > roadHeight + NPC_HEIGHT) {
                npc.el.remove();
                return false;
            }
            return true;
        });

        // Player car as a virtual obstacle for right-lane NPCs
        const playerObstacle = getPlayerObstacle(roadCon);

        // Right lane — moves upward; index 0 is the leader (furthest up)
        rightLaneNPCs = rightLaneNPCs.filter((npc, i) => {
            // Determine what's ahead: either the NPC in front, or the player car
            let ahead = i > 0 ? rightLaneNPCs[i - 1] : null;

            // Check if the player car is closer/more-blocking than the NPC ahead
            if (playerObstacle) {
                const playerH = playerObstacle._height || NPC_HEIGHT;
                // Player is "ahead" (above) this NPC if the player's bottom is
                // above this NPC's top edge (i.e. player is further up the road).
                const playerAbove = playerObstacle.y < npc.y;
                if (playerAbove) {
                    const gapToPlayer    = npc.y - (playerObstacle.y + playerH);
                    const gapToNpcAhead  = ahead ? ahead.y - (npc.y + NPC_HEIGHT) : Infinity;
                    if (gapToPlayer < gapToNpcAhead) {
                        ahead = { y: playerObstacle.y };
                    }
                }
            }

            const speed = safeSpeed(npc, ahead, -1);
            npc.y -= speed;
            npc.el.style.top = npc.y + "px";
            if (npc.y < -NPC_HEIGHT) {
                npc.el.remove();
                return false;
            }
            return true;
        });

        requestAnimationFrame(tick);
    }

    // ── Spawn scheduling ──────────────────────────────────────────────────────

    function scheduleLeft() {
        const delay = SPAWN_INTERVAL_MIN +
            Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
        setTimeout(() => { spawnLeftLane(); scheduleLeft(); }, delay);
    }

    function scheduleRight() {
        const delay = (SPAWN_INTERVAL_MIN + 600) +
            Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
        setTimeout(() => { spawnRightLane(); scheduleRight(); }, delay);
    }

    scheduleLeft();
    // Right-lane (same-direction) NPCs disabled
    // scheduleRight();
    tick();

})();
