// controls.js — Steering, pause and play controls
// Depends on: car.js

function goLeft() {
    if (car.engineOn && car.gear !== 0) {
        let cssProperty = getComputedStyle(car.car1);
        let cssValue = cssProperty.getPropertyValue("left");

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

function pause() {
    document.querySelector(".menu-con").style.display = "flex";
    document.querySelector(".play").innerHTML = "Continue";
}

function play() {
    document.querySelector(".menu-con").style.display = "none";
}

function goToAboutPage() {
    window.location.href = "about.html";
}
