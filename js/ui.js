// ui.js — UI bindings and loading screen
// Depends on: car.js, engine.js, gears.js, controls.js, lights.js
// This file runs last and wires everything together.

// --- Control event listeners ---
car.throttle.addEventListener("click", revUp);
car.brake.addEventListener("click", brake);
car.controlLeft.addEventListener("click", goLeft);
car.controlRight.addEventListener("click", goRight);
car.lowBeamSwitch.addEventListener("click", lowBeamSwitch);
car.highBeamSwitch.addEventListener("click", highBeamSwitch);
car.c1turnLeftButton.addEventListener("click", onTunSigLeft);
car.c1turnRightButton.addEventListener("click", onTunSigRight);

// --- Loading screen ---
document.querySelector(".loading-bar").addEventListener("animationend", function () {
    document.querySelector(".loading-main").style.display = "none";
    document.querySelector(".menu-con").style.display = "flex";
});
