// car.js — Central car state object
// All game state and DOM references live here.
// Import this module first before any others.

const car = {
    // Engine & movement state
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

    // Gear indicator DOM elements
    neutralIndicator: document.getElementById("neutral"),
    gear1Indicator: document.getElementById("gear1"),
    gear2Indicator: document.getElementById("gear2"),
    gear3Indicator: document.getElementById("gear3"),
    gear4Indicator: document.getElementById("gear4"),
    gear5Indicator: document.getElementById("gear5"),
    gear6Indicator: document.getElementById("gear6"),
    reverseIndicator: document.getElementById("reverse"),

    // Colour constants
    noColor: "transparent",
    positiveGearLight: "rgb(0,100,220)",
    neutralGearLight: "rgb(150,150,0)",
    reverseGearLight: "rgb(100,30,0)",
    indicatorLight: "green",

    // Animation constants
    moveTransition: "all 1.3s linear",
    turnOn: "block",
    turnOff: "none",

    // Control DOM elements
    throttle: document.querySelector(".throttle-icon"),
    brake: document.querySelector(".brake-icon"),
    controlLeft: document.getElementById("control-left"),
    controlRight: document.getElementById("control-right"),

    // Speed display
    updateCurrentSpeedInDom: document.querySelector("#speed-display span"),

    // Gear display DOM elements
    gearsSpanEl: document.querySelectorAll(".gears span"),
    gearsLightInDom: document.querySelectorAll(".gears"),

    // Car 1 DOM elements
    car1: document.getElementById("c1-container"),
    car1Headlight: document.querySelectorAll(".c1-headlight-left, .c1-headlight-right"),
    c1TurnSig: document.querySelectorAll(".c1-turn-sig"),
    c1TurnSigLeft: document.querySelectorAll(".c1-turn-sig-front-left, .c1-turn-sig-back-left"),
    c1TurnSigRight: document.querySelectorAll(".c1-turn-sig-front-right, .c1-turn-sig-back-right"),
    c1turnLeftButton: document.querySelector(".turn-left"),
    c1turnRightButton: document.querySelector(".turn-right"),

    // Light switches
    lowBeamSwitch: document.querySelector(".low-beam"),
    highBeamSwitch: document.querySelector(".full-beam"),
    emergencyLight: document.querySelector(".emergency-light-icon"),

    // Audio
    startingSound: new Audio("assets/audio/starter-on.mp3"),
    offingSound: new Audio("assets/audio/starter-off.mp3"),
};
