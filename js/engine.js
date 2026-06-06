// engine.js — Engine start/stop logic
// Depends on: car.js

// Engine idle sound — loops while engine is on
const idleSound = new Audio("assets/audio/engine-idle.mp3");
idleSound.loop = true;

function startStopEngine() {
    if (!car.engineOn) {
        car.startingSound.play();
        car.engineOn = true;
        document.querySelector(".ignition-indicator").style.backgroundColor = car.indicatorLight;

        // Idle sound is started/stopped by the physics loop based on movement

        // Flash gear lights and turn signals on startup
        setTimeout(() => {
            car.gearsSpanEl.forEach(element => {
                element.style.filter = "blur(.4px) brightness(5)";
                element.style.color = "rgba(255,255,255, 1)";
                car.c1TurnSig.forEach(element => {
                    element.style.display = car.turnOn;
                });
            });
        }, 1500);

        setTimeout(() => {
            car.c1TurnSig.forEach(element => {
                element.style.display = car.turnOff;
            });
        }, 3500);

    } else {
        car.engineOn = false;

        // Stop idle, play off sound
        idleSound.pause();
        idleSound.currentTime = 0;
        car.offingSound.play();

        document.querySelector(".ignition-indicator").style.backgroundColor = car.noColor;

        // Dim gear lights on shutdown
        car.gearsSpanEl.forEach(element => {
            element.style.filter = "blur(0px) brightness(1)";
            element.style.color = "rgba(170,170,170, .6)";
        });

        // Flash turn signals on shutdown
        setTimeout(() => {
            car.c1TurnSig.forEach(element => {
                element.style.display = car.turnOn;
            });
        }, 500);

        setTimeout(() => {
            car.c1TurnSig.forEach(element => {
                element.style.display = car.turnOff;
            });
        }, 2500);
    }
}
