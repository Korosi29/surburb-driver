// gears.js — Gear shifting, speed loop, and gear indicator updates
// Depends on: car.js

// Maximum speed allowed per gear
const maxSpeed = { 1: 30, 2: 60, 3: 100, 4: 150, 5: 210, 6: 280 };

function revUp() {
    if (!car.engineOn) return;

    // Shift up one gear, capped at 6
    if (car.gear < 6) car.gear++;

    if (!car.moving) {
        car.moving = true;

        // Set transition once here — no need to repeat inside the animation loop
        const lanes = document.getElementById("lanes");
        lanes.style.transition = "all .7s linear";

        function startMoving() {
            if (car.gear <= -1) {
                car.revSpeed += -1.8;
                car.gear = -1;
                updateGearInDom();
            } else if (car.gear === 0) {
                car.revSpeed += 0;
                updateGearInDom();
            } else if (car.gear === 1) {
                car.revSpeed += 0.8;
                updateGearInDom();
            } else if (car.gear === 2) {
                car.revSpeed += 1.8;
                updateGearInDom();
            } else if (car.gear === 3) {
                car.revSpeed += 3.2;
                updateGearInDom();
            } else if (car.gear === 4) {
                car.revSpeed += 4.8;
                updateGearInDom();
            } else if (car.gear === 5) {
                car.revSpeed += 6.8;
                updateGearInDom();
            } else if (car.gear === 6) {
                car.revSpeed += 8.3;
                updateGearInDom();
            } else {
                car.gear = 6;
            }

            // Enforce max speed cap for the current gear
            if (car.gear >= 1 && car.revSpeed > maxSpeed[car.gear]) {
                car.revSpeed = maxSpeed[car.gear];
            }

            lanes.style.backgroundPositionY = car.revSpeed + "px";

            car.animationId = requestAnimationFrame(startMoving);
        }

        startMoving();
    }
}

function brake() {
    if (car.engineOn) {
        car.gear--;
        if (car.gear < -1) car.gear = -1; // floor at reverse
    }
}

// Gear indicator lookup map — maps gear number to its DOM element and colour
const gearIndicatorMap = {
    "-1": { el: () => car.reverseIndicator, color: () => car.reverseGearLight },
     "0": { el: () => car.neutralIndicator, color: () => car.neutralGearLight },
     "1": { el: () => car.gear1Indicator,   color: () => car.positiveGearLight },
     "2": { el: () => car.gear2Indicator,   color: () => car.positiveGearLight },
     "3": { el: () => car.gear3Indicator,   color: () => car.positiveGearLight },
     "4": { el: () => car.gear4Indicator,   color: () => car.positiveGearLight },
     "5": { el: () => car.gear5Indicator,   color: () => car.positiveGearLight },
     "6": { el: () => car.gear6Indicator,   color: () => car.positiveGearLight },
};

// Track the currently lit indicator so we only touch two elements per update
let activeGearIndicator = car.neutralIndicator;

function updateGearInDom() {
    // Turn off the previously active indicator
    activeGearIndicator.style.backgroundColor = car.noColor;

    // Look up and light up the new active indicator
    const entry = gearIndicatorMap[String(car.gear)] || gearIndicatorMap["-1"];
    activeGearIndicator = entry.el();
    activeGearIndicator.style.backgroundColor = entry.color();
}

// Initialise gear display on page load
updateGearInDom();
