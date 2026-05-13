// lights.js — Headlights and turn signal logic
// Depends on: car.js

let lowBeamOn = false;
let highBeamOn = false;
let turnSigLeft = false;
let turnSigRight = false;

// --- Headlights ---

function lowBeamSwitch() {
    if (!lowBeamOn) {
        car.car1Headlight.forEach(el => el.classList.remove("on-full-beam-headlight"));
        car.car1Headlight.forEach(el => el.style.display = car.turnOn);
        lowBeamOn = true;
        highBeamOn = false;
    } else {
        car.car1Headlight.forEach(el => el.style.display = car.turnOff);
        lowBeamOn = false;
        highBeamOn = false;
    }
}

function highBeamSwitch() {
    if (!highBeamOn) {
        lowBeamOn = false;
        car.car1Headlight.forEach(el => el.style.display = car.turnOn);
        car.car1Headlight.forEach(el => el.classList.add("on-full-beam-headlight"));
        highBeamOn = true;
    } else {
        car.car1Headlight.forEach(el => el.style.display = car.turnOff);
        car.car1Headlight.forEach(el => el.classList.remove("on-full-beam-headlight"));
        lowBeamOn = false;
        highBeamOn = false;
    }
}

// --- Turn Signals ---

function onTunSigLeft() {
    if (!turnSigLeft) {
        car.c1turnLeftButton.style.backgroundColor = "rgba(255, 255, 255, .55)";
        car.c1turnRightButton.style.backgroundColor = car.noColor;
        turnSigLeft = true;
        turnSigRight = false;
        car.c1TurnSigLeft.forEach(el => el.style.display = car.turnOn);
        car.c1TurnSigRight.forEach(el => el.style.display = car.turnOff);
    } else {
        car.c1turnLeftButton.style.backgroundColor = car.noColor;
        turnSigLeft = false;
        car.c1TurnSigLeft.forEach(el => el.style.display = car.turnOff);
    }
}

function onTunSigRight() {
    if (!turnSigRight) {
        car.c1turnRightButton.style.backgroundColor = "rgba(255, 255, 255, .55)";
        car.c1turnLeftButton.style.backgroundColor = car.noColor;
        turnSigRight = true;
        turnSigLeft = false;
        car.c1TurnSigRight.forEach(el => el.style.display = car.turnOn);
        car.c1TurnSigLeft.forEach(el => el.style.display = car.turnOff);
    } else {
        car.c1turnRightButton.style.backgroundColor = car.noColor;
        turnSigRight = false;
        car.c1TurnSigRight.forEach(el => el.style.display = car.turnOff);
    }
}
