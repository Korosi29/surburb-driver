let car = {
    engineOn: false,
    onGear: false,
    clutchReleased: false,
    revSpeed: 0,
    animationId: undefined,
    gearInMemory: undefined,
    speedIntervalId: undefined,
    coastingIntervalId: undefined,
    reverseGear: false,
    moving: false,
    gear: 0,
    neutralIndicator: document.getElementById("neutral"),
    gear1Indicator: document.getElementById("gear1"),
    gear2Indicator: document.getElementById("gear2"),
    gear3Indicator: document.getElementById("gear3"),
    gear4Indicator: document.getElementById("gear4"),
    gear5Indicator: document.getElementById("gear5"),
    gear6Indicator: document.getElementById("gear6"),
    reverseIndicator: document.getElementById("reverse"),
    noColor: "transparent",
    positiveGearLight: "rgb(0,100,220)",
    neutralGearLight: "rgb(150,150,0)",
    reverseGearLight: "rgb(100,30,0)",
    moveTransition: "all 1.3s linear",
    throttle: document.querySelector(".throttle-icon"),
    brake: document.querySelector(".brake-icon"),
    updateCurrentSpeedInDom: document.querySelector("#speed-display span"),
    c1TurnSig: document.querySelectorAll(".c1-turn-sig"),
    gearsSpanEl: document.querySelectorAll(".gears span"),
    gearsLightInDom: document.querySelectorAll(".gears"),
    controlLeft: document.getElementById("control-left"),
    controlRight: document.getElementById("control-right"),
    car1: document.getElementById("c1-container"),
    car1Headlight: document.querySelectorAll(
        ".c1-headlight-left, .c1-headlight-right"
    ),
    lowBeamSwitch: document.querySelector(".low-beam"),
    highBeamSwitch: document.querySelector(".full-beam"),
    emergencyLight: document.querySelector(".emergency-light-icon"),
    c1TurnSigLeft: document.querySelectorAll(
        ".c1-turn-sig-front-left, .c1-turn-sig-back-left"
    ),
    c1TurnSigRight: document.querySelectorAll(
        ".c1-turn-sig-front-right, .c1-turn-sig-back-right"
    ),
    c1turnLeftButton: document.querySelector(".turn-left"),
    c1turnRightButton: document.querySelector(".turn-right"),
    startingSound: new Audio("starter-on.mp3"),
    offingSound: new Audio("starter-off.mp3"),
    indicatorLight: "green",
    turnOn: "block",
    turnOff: "none"
};
function startStopEngine() {
    if (!car.engineOn) {
        car.startingSound.play();
        car.engineOn = true;
        document.querySelector(".ignition-indicator").style.backgroundColor =
            car.indicatorLight;

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
        car.offingSound.play();
        document.querySelector(".ignition-indicator").style.backgroundColor =
            car.noColor;

        car.gearsSpanEl.forEach(element => {
            element.style.filter = "blur(0px) brightness(1)";

            element.style.color = "rgba(170,170,170, .6)";
        });
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
car.throttle.addEventListener("click", revUp);
car.brake.addEventListener("click", brake);
car.controlLeft.addEventListener("click", goLeft);
car.controlRight.addEventListener("click", goRight);
function revUp() {
    if (car.engineOn) car.gear++;
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
    }
}
function pause(){
  document.querySelector('.menu-con').style.display = "flex";
  document.querySelector('.play').innerHTML = "Continue";
}
function goLeft() {
    if (car.engineOn && car.gear !== 0) {
        let cssProperty = getComputedStyle(car.car1);
        let cssValue = cssProperty.getPropertyValue("left");
        console.log(cssValue);
        if (cssValue === "100px") {
            car.car1.style.left = "20px";
            car.car1.style.transform = "rotate(-10deg)";
            setTimeout(() => {
                car.car1.style.transform = "rotate(0deg)";
            }, 300);
        } else {
            car.car1.style.left = "20px";
        }
        car.car1.style.transition = "all .85s linear";
    }
}
function goRight() {
    if (car.engineOn && car.gear !== 0) {
        let cssProperty = getComputedStyle(car.car1);
        let cssValue = cssProperty.getPropertyValue("left");
        console.log(cssValue);
        if (cssValue === "20px") {
            car.car1.style.left = "100px";
            car.car1.style.transform = "rotate(10deg)";
            setTimeout(() => {
                car.car1.style.transform = "rotate(0deg)";
            }, 300);
        } else {
            car.car1.style.left = "100px";
        }

        car.car1.style.transition = "all .85s linear";
    }
}
function updateGearInDom() {
    if (car.gear === 0) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.neutralIndicator.style.backgroundColor = car.neutralGearLight;
        
    } else if (car.gear === 1) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear1Indicator.style.backgroundColor = car.positiveGearLight;
    } else if (car.gear === 2) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear2Indicator.style.backgroundColor = car.positiveGearLight;
       
    } else if (car.gear === 3) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear3Indicator.style.backgroundColor = car.positiveGearLight;
        
    } else if (car.gear === 4) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear4Indicator.style.backgroundColor = car.positiveGearLight;
     
    } else if (car.gear === 5) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear5Indicator.style.backgroundColor = car.positiveGearLight;
       
    } else if (car.gear === 6) {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.gear6Indicator.style.backgroundColor = car.positiveGearLight;
        
    } else {
        Object.keys(car.gearsLightInDom).forEach(element => {
            car.gearsLightInDom[element].style.backgroundColor = car.noColor;
        });
        car.reverseIndicator.style.backgroundColor = car.reverseGearLight;
        
    }
}
updateGearInDom();

car.lowBeamSwitch.addEventListener("click", lowBeamSwitch);
let lowBeamOn = false;
let highBeamOn = false;
function lowBeamSwitch() {
    if (!lowBeamOn) {
        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].classList.remove(
                "on-full-beam-headlight"
            );
        });

        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].style.display = car.turnOn;
        });

        lowBeamOn = true;
        highBeamOn = false;
    } else {
        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].style.display = car.turnOff;
        });
        lowBeamOn = false;
        highBeamOn = false;
    }
}
car.highBeamSwitch.addEventListener("click", highBeamSwitch);

function highBeamSwitch() {
    if (!highBeamOn) {
        lowBeamOn = false;
        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].style.display = car.turnOn;
        });

        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].classList.add("on-full-beam-headlight");
        });
        highBeamOn = true;
    } else {
        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].style.display = car.turnOff;
        });

        Object.keys(car.car1Headlight).forEach(element => {
            car.car1Headlight[element].classList.remove(
                "on-full-beam-headlight"
            );
        });
        lowBeamOn = false;
        highBeamOn = false;
    }
}

car.c1turnLeftButton.addEventListener("click", onTunSigLeft);
let turnSigLeft = false;
function onTunSigLeft() {
    if (!turnSigLeft) {
        car.c1turnLeftButton.style.backgroundColor = "rgba(255, 255, 255, .55)";
        turnSigLeft = true;

        Object.keys(car.c1TurnSigLeft).forEach(element => {
            car.c1TurnSigLeft[element].style.display = car.turnOn;
        });
        Object.keys(car.c1TurnSigRight).forEach(element => {
            car.c1TurnSigRight[element].style.display = car.turnOff;
        });

        car.c1turnRightButton.style.backgroundColor = car.noColor;
        car.c1turnLeftButton.style.backgroundColor = "rgba(255, 255, 255, .55)";
        turnSigRight = false;
    } else {
        car.c1turnLeftButton.style.backgroundColor = car.noColor;
        turnSigLeft = false;

        Object.keys(car.c1TurnSigLeft).forEach(element => {
            car.c1TurnSigLeft[element].style.display = car.turnOff;
        });
    }
}

car.c1turnRightButton.addEventListener("click", onTunSigRight);
let turnSigRight = false;
function onTunSigRight() {
    if (!turnSigRight) {
        car.c1turnRightButton.style.backgroundColor =
            "rgba(255, 255, 255, .55)";

        turnSigRight = true;
        turnSigLeft = false;

        Object.keys(car.c1TurnSigRight).forEach(element => {
            car.c1TurnSigRight[element].style.display = car.turnOn;
        });
       Object.keys(car.c1TurnSigLeft).forEach(element => {
            car.c1TurnSigLeft[element].style.display = car.turnOff;
        });
        car.c1turnLeftButton.style.backgroundColor = car.noColor;
    } else {
        car.c1turnRightButton.style.backgroundColor = car.noColor;
        turnSigRight = false;
        Object.keys(car.c1TurnSigRight).forEach(element => {
            car.c1TurnSigRight[element].style.display = car.turnOff;
        });
    }
}
document.querySelector('.loading-bar').addEventListener('animationend', function(){
  document.querySelector('.loading-main').style.display = "none";
  document.querySelector('.menu-con').style.display = "flex";
})
function play(){
  document.querySelector('.menu-con').style.display = "none";
}
function goToAboutPage() {
    window.location.href = "about.html"; // Replace with your desired URL
}