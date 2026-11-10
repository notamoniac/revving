const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let audioSrc = null;

let RPM = 0;
let enginePitch = 1;
let frames = 0; 
let maxRPM = 100;
let keys = {};

addEventListener("DOMContentLoaded", () => {
    const RPMometer = document.getElementById("RPMometer");
    const gearDisplay = document.getElementById("gear");
    const revButton = document.getElementById("rev");
    const shiftUpButton = document.getElementById("shiftup");
    const shiftDownButton = document.getElementById("shiftdown");
    const canvas = document.getElementById("rpm-canvas");
    const arrow = document.querySelector(".arrow");
    let ctx = canvas.getContext("2d");

    const soundButton = document.getElementById("toggle-sound");

    function toggleSound() {
    if (audioCtx.state === 'running') {
        audioCtx.suspend().then(() => {
        soundButton.textContent = "Unmute sound";
        });
    } else {
        audioCtx.resume().then(() => {
        soundButton.textContent = "Mute sound";
        });
    }
    }

    revButton.addEventListener('touchstart', () => { keys['KeyW'] = true;});
    revButton.addEventListener('touchend', () => { keys['KeyW'] = false;});
    revButton.addEventListener('mousedown', () => { keys['KeyW'] = true;});
    revButton.addEventListener('mouseup', () => { keys['KeyW'] = false;});

    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
    document.getElementById("toggle-sound").addEventListener('click', (e) => {
    if (e.target.innerHTML == "Mute sound") {
      audioCtx.suspend().then(e.target.innerHTML = "Unmute sound");
    } else {
      audioCtx.resume().then(e.target.innerHTML = "Mute sound");
    }
    });
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyM') {
            toggleSound();
        }
    });

  let gear = 0;
    if (gear == 0){
        gearDisplay.textContent = "N";
    }
    function shiftUp() {
        if (gear < 6) {
            gear++;
        }
        gearDisplay.textContent = gear;
    }
    function shiftDown() {
        if (gear > 0.2) {
            gear--;
        }
    if (gear == 0){
        gearDisplay.textContent = "N";
    }else{
    gearDisplay.textContent = gear;
    }
    }

    let RPMshift = 0;
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyV') {
            if (gear == 6) {
                RPMshift = 0;
            }
            else {
                RPMshift = 7-gear;
            }
        } else if (e.code === 'KeyC') {
            if(gear == 0){
                RPMshift = 0;
            }else{
                RPMshift = gear - 7;
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyV') {
            RPMshift = 0;
        }
        if (e.code === 'KeyC') {
            RPMshift = 0;
        }
    });
    if (RPMshift < 0){
        RPMshift = 0;
    }

    //shifting with buttons and keys
    shiftUpButton.addEventListener('click', shiftUp);
    shiftDownButton.addEventListener('click', shiftDown);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyV') {
            shiftUp();
        } else if (e.code === 'KeyC') {
            shiftDown();
        }
    });
    
 
  function loop(){
    maxRPM = 100 + (Math.random() * (5/((gear*2)+1))) + Math.sin(Date.now() / 153) - Math.min( Math.tan(Date.now() / 245), 4); 
    if (keys['KeyW']){
      RPM < maxRPM 
        ? RPM = RPM + (2/(Math.pow(gear,2.5) + 0.1)) - RPMshift
        : RPM = maxRPM; 
    } else {
      RPM > 0 
         ? RPM = RPM - 0.2 - Math.pow(RPM, (1.8 - (Math.pow(gear,1.3) / 5))) / 1000
         : RPM = 0; 
    }
    enginePitch = 1 + RPM / 100;
    updateVisuals(); 
    if (audioSrc && frames % 2 == 0) {
      audioSrc.playbackRate.value = 0.7 + (RPM / 60);
    }
    requestAnimationFrame(loop);
  }

  function updateVisuals(){
    if (frames < 300){
      frames++ 
    } else {
      frames = 0;
      void ctx.clearRect(0, 0, 300, 100);
    }
    ctx.fillStyle = `hsl(${160 - RPM * 1.6}, 90%, 70%)`;
    ctx.fillRect(frames, 100 - RPM, 1, 3);
    ctx.fillStyle = `hsla(${160 - RPM * 1.6}, 90%, 70%, 0.3)`;
    ctx.fillRect(frames, 100 - RPM, 1, RPM);
    RPMometer.style.width = ((enginePitch - 1) * 100) + "%";
    RPMometer.style.backgroundColor = `hsl(${160 - RPM * 1.6}, 90%, 70%)`;
    arrow.style.transform = `rotate(${(RPM * 1.7)+10+Math.random() * 1}deg)`;
  }

  loop();
});

fetch('https://ceramicsoda.github.io/publicFiles/audio/engine4.ogg')
  .then(response => response.arrayBuffer())
  .then(buffer => audioCtx.decodeAudioData(buffer))
  .then(decodedData => {
    audioSrc = audioCtx.createBufferSource();
    audioSrc.buffer = decodedData;
    audioSrc.loop = true; 
    audioSrc.connect(audioCtx.destination);
    audioSrc.start();
    audioCtx.suspend(); 
})
  .catch(error => console.error(error)
);