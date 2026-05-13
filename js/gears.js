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

            lanes.style.transition = "all .7s linear";
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

function updateGearInDom() {
    // Reset all gear indicators
    Object.keys(car.gearsLightInDom).forEach(element => {
        car.gearsLightInDom[element].style.backgroundColor = car.noColor;
    });

    // Light up the active gear
    if (car.gear === 0) {
        car.neutralIndicator.style.backgroundColor = car.neutralGearLight;
    } else if (car.gear === 1) {
        car.gear1Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 2) {
        car.gear2Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 3) {
        car.gear3Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 4) {
        car.gear4Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 5) {
        car.gear5Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 6) {
        car.gear6Indicator.style.backgroundColor = car.positiveGearLight;
    } else {
        car.reverseIndicator.style.backgroundColor = car.reverseGearLight;
    }
}

// Initialise gear display on page load
updateGearInDom();
