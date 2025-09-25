const display = document.getElementById('displayimage');

// global vars
var i = 0;
var logoVisible = false;
var buttonsVisible = false;

// speed vars
const animationSpeed = 41; // this is ~24fps

// volume vars
let volthreshold = Number(localStorage.getItem("volumethreshold"));
if (volthreshold === null || volthreshold === NaN) {
    volthreshold = 0.05;
};
document.getElementById('currentvol').innerText = volthreshold;


// Frames


// FUNCTIONS -----------------------------

function showLogo() {
    let logoViews = document.querySelectorAll('.logoview');
    logoVisible = !logoVisible;
    if (logoVisible === true) {
        logoViews.forEach(element => {
            element.style = 'display: block';
        });
        document.getElementById('main').style.display = 'none';
    } else if (logoVisible === false) {
        logoViews.forEach(element => {
            element.style = 'display: none';
        });
        document.getElementById('main').style.display = 'block';
    }
}

function reload() {
    location.reload();
}

function setButtonsVisible() {
    buttonsVisible = !buttonsVisible;
    let buttons = document.querySelectorAll('.buttons');
    let volumecontrols = document.querySelectorAll('.volumecontrols');
    if (buttonsVisible === true) {
        buttons.forEach(element => {
            element.style = 'border: 2px black solid;';
        });
        volumecontrols.forEach(element => {
            element.style = 'visibility: visible;'
        });
    } else {
        buttons.forEach(element => {
            element.style = 'border: none;';
        });
        volumecontrols.forEach(element => {
            element.style = 'visibility: hidden;'
        });
    }
};

function volup() {
    volthreshold += 0.01;
    document.getElementById('currentvol').innerText = Math.round(volthreshold * 100) / 100;
    localStorage.setItem("volumethreshold", `${volthreshold}`);
};

function voldown() {
    volthreshold -= 0.01;
    document.getElementById('currentvol').innerText = Math.round(volthreshold * 100) / 100;
    localStorage.setItem("volumethreshold", `${volthreshold}`);
};

function animate(animation, element) {
    var iterator = 0;
    return new Promise(resolve => {
        let interval = setInterval(() => {
            element.src = animation[iterator];
            iterator++;
            if (iterator === 0) {
                clearInterval(interval);
                element.src = animation[animation.length - 1];
                resolve();
            }
        }, animationSpeed);
    });
};

document.onkeydown = function (event) {
    if (!event) {
        // do nothing
    } else if (event.code === 'Space') {
        tiltEnabled = !tiltEnabled;
    } else {
        lastKey = event.code;
        console.log(lastKey)
    }
};

document.onkeyup = function (event) {
    if (!event) {
        // do nothing
    } else {
        lastKey = null;
    }
};

// --------------------

window.onload = async function () {

    // ------------------ VOLUME FUNCTIONS - this needs to be inside window.onload I'm pretty sure. why? don't remember.

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);
    const pcmData = new Float32Array(analyserNode.fftSize)

    var volume = 0;

    function setVolVar() {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude * amplitude; }
        volume = Math.sqrt(sumSquares / pcmData.length);
    }

    // --------------

    let threshold = 15;

    var fucker = {};

    fucker.oldTilt = 'def';
    fucker.oldScreen = null;
    fucker.volume = false;

    function handleMotionEvent(event) {

        fucker.x = event.accelerationIncludingGravity.x;
        fucker.y = event.accelerationIncludingGravity.z;

        let alpha = event.rotationRate.alpha;
        let beta = event.rotationRate.beta;
        let gamma = event.rotationRate.gamma;

        fucker.oldTilt = fucker.tilt;

        if (tiltEnabled === true) {
            if (alpha < -threshold || alpha > threshold || beta < -threshold || beta > threshold || gamma < -threshold || gamma > threshold) {
                return;
            } else {
                chosen = false;
                if (fucker.x < -2.5 && -1 < fucker.y < 4) {
                    fucker.tilt = 'left'
                } else if (fucker.x > 2.5 && -1 < fucker.y < 4) {
                    fucker.tilt = 'right'
                } else if (-2.5 < fucker.x < 2.5 && fucker.y > 4) {
                    fucker.tilt = 'up'
                } else if (-2.5 < fucker.x < 2.5 && fucker.y < -1) {
                    fucker.tilt = 'down'
                } else if (-2.5 < fucker.x < 2.5 && -1 < fucker.y < 4) {
                    if (volume > volthreshold) {
                        fucker.tilt = 'talking'
                    } else {
                        fucker.tilt = 'def'
                    }
                }
            }
        } else {
            if (lastKey === 'Digit1') {
                console.log('fired')
            }
        }
    }

    setInterval(setVolVar, 10)

    // vvvvvvv MAIN ANIMATION FUNCTION SHOULD BE HERE vvvvvv

    // main anim function

    // ^^^^^^^ MAIN ANIMATION FUNCTION SHOULD BE HERE ^^^^^^

    window.addEventListener("devicemotion", handleMotionEvent, true);

}