const display = document.getElementById('displayimage');

// global vars
var i = 0;
var logoVisible = false;
var buttonsVisible = false;

// speed vars
const animationSpeed = 41; // this is ~24fps
const blinkSpeed = 30;

// starting frame
var displayImage = './resources/???';

// volume vars
let volthreshold = Number(localStorage.getItem("volumethreshold"));
if (volthreshold === null || volthreshold === NaN) {
    volthreshold = 0.05;
}
document.getElementById('currentvol').innerText = volthreshold;


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
}

function volup() {
    volthreshold += 0.01;
    document.getElementById('currentvol').innerText = Math.round(volthreshold * 100) / 100;
    localStorage.setItem("volumethreshold", `${volthreshold}`);
}

function voldown() {
    volthreshold -= 0.01;
    document.getElementById('currentvol').innerText = Math.round(volthreshold * 100) / 100;
    localStorage.setItem("volumethreshold", `${volthreshold}`);
}

function forwardAnimate(animation) {
    var i = 0; // establish iterator counter
    return new Promise(resolve => { // "promise" allows it to kinda ping the rest of the software when the animation is complete
        let localInterval = setInterval(() => { // create the interval for the animation
            displayImage = animation[i]; // set the main display image to the animation frame corresponding to the iterating counter
            i++; // increment the iterating counter by 1
            if (i === animation.length) { // if the iterator is equal to the total number of frames in the animation, then
                clearInterval(localInterval); // stop the interval
                displayImage = animation[animation.length - 1]; // set the final static frame at the end of the animation
                resolve(); // send the ping saying the animation is complete
            }
        }, animationSpeed) // this allows me to use a single variable for the animation speed instead of coding the same number into every animate function
    })
}

function reverseAnimate(animation) {
    var iterator = animation.length - 1;
    return new Promise(resolve => {
        let localInterval = setInterval(() => {
            displayImage = animation[iterator];
            iterator--;
            if (iterator < 0) {
                clearInterval(localInterval);
                displayImage = animation[0];
                resolve();
            }
        }, animationSpeed)
    })
}

document.onkeydown = function(event) {
    if (!event) {
        // do nothing
    } else if (event.code === 'Space') {
        tiltEnabled = !tiltEnabled;
    } else {
        lastKey = event.code;
        console.log(lastKey)
    }
}

document.onkeyup = function(event) {
    if (!event) {
        // do nothing
    } else {
        lastKey = null;
    }
}

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
    var chosen = false;

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

    // obviously there is no function written yet.

    // ^^^^^^^ MAIN ANIMATION FUNCTION SHOULD BE HERE ^^^^^^

    setTimeout(setAnimate, 10);

    window.addEventListener("devicemotion", handleMotionEvent, true);

}