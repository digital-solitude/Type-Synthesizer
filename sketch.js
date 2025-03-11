/*******************************************************
 * P5.JS Type Synthesizer example
 * made for Anisha Baid's Sally's Helpers project
 *
 * This example uses the p5.js library (https://p5js.org/)
 * and the p5.sound library (https://p5js.org/reference/#/libraries/p5.sound)
 * to create a simple synthesizer that responds to key presses.
 *
 * - A MonoSynth from p5.sound is used to generate audio.
 * - A Delay effect is applied to the synth's audio output.
 * - A Distortion effect is also available.
 * - Certain keys (like 'q', 'w', 'e', etc.) are mapped to
 *   specific musical notes (e.g., F2, G2, A2).
 * - Typing other characters (including uppercase letters if SHIFT is pressed)
 *   appends text to the screen AND spawns a quick visual effect.
 * - Three sliders control Attack time (ADSR), Delay amount, and Distortion.
 *
 * How to Use:
 * 1. Open this page in your browser with a web server (for example, using
 *    VSCode Live Server or another local server).
 * 2. Click or press a key to allow the browser to start the audio context
 *    (some browsers need a user interaction before playing sound).
 * 3. Type keys that correspond to notes to hear the synth. The typed keys
 *    also get printed on the screen.
 * 4. Adjust the Attack, Delay, and Distortion sliders near the bottom-left
 *    of the window to shape the sound.
 * 5. Resize your browser window — the canvas will automatically resize.
 *
 ******************************************************/

/**
 * Global Variables
 * ----------------
 */
let synth;               // p5.MonoSynth object that generates sound
let letters = "";        // A string to store typed text for display
let textsize = 32;       // The base text size in pixels
let margin = 100;        // Margin around the text display
let leading = textsize * 1.2; // Line spacing (leading) for text
let textboxOffset = 0;   // Vertical offset for the text box
let numberOfEnters = 0;  // How many times the user has pressed Enter (tracks new lines)
let cursorX = 0;         // Tracks the horizontal cursor position (not currently shown)
let boxWidth;            // Width of the text box (calculated in setup)
let manualOffsetVariable = 0; // Extra variable to control offset if needed
let audioStarted = false; // Flag to ensure we start the audio context only once
let sallyHintText = "Hello, my name is sally, I'm a secretary.";
let hintTextOpacity = 100; // Slightly higher opacity for readability
let backgroundImg; // Will store the loaded image
const percentageToStartWiggle = 0.5; // Percentage of the text box to start wiggling
const chanceToWiggle = 0.001; // Chance to start wiggling if not already wiggling
let preventTyping = false;

let gameState = "intro"; // Game state: intro, tutorial, freeplay

/**
 * Sound Effects Variables
 */
let globalNoteShift = 0;
const maxNoteShift = 96; // Maximum note shift (8 octaves)
// ADSR (Attack-Decay-Sustain-Release) Envelope settings
let attackTime = 0.1;    // Length of the 'attack' phase in seconds
let delayTime = 0.2;     // Amount of delay time in seconds
let distortionAmount = 0.0; // Amount of distortion (0.0 to 1.0)
// p5.Envelope, p5.Delay, and p5.Distortion objects
let envelope;
let delay;
let distortion;

// Color transition variables
let bgColorStart = [50, 50, 50];     // Dark grey
let bgColorEnd = [200, 200, 200];    // Light grey
let textColorStart = [100, 255, 100]; // Light green
let textColorEnd = [0, 100, 0];       // Dark green
let colorTransitionTime = 0;

/**
 * A mapping of keyboard keys to musical note names.
 * Each letter corresponds to a note like 'C4', 'D#3', 'F2', etc.
 * These note names will be converted to MIDI numbers, then to frequencies.
 */
let notesMap = {
    'q': 'F3', 'w': 'G3', 'e': 'A3', 'r': 'B3', 't': 'C4', 'y': 'D4', 'u': 'E4',
    'i': 'F4', 'o': 'G4', 'p': 'A4', 'a': 'B4', 's': 'C5', 'd': 'D5', 'f': 'E5',
    'g': 'F5', 'h': 'G5', 'j': 'A5', 'k': 'B5', 'l': 'C6', 'z': 'D6', 'x': 'E6',
    'c': 'F6', 'v': 'G6', 'b': 'A6', 'n': 'B6', 'm': 'C7', 'Q': 'F#3', 'W': 'G#3', 'E': 'A#3', 'R': 'B3', 'T': 'C#4', 'Y': 'D#4', 'U': 'E4',
    'I': 'F#4', 'O': 'G#4', 'P': 'A#4', 'A': 'B4', 'S': 'C#5', 'D': 'D#5', 'F': 'E5',
    'G': 'F#5', 'H': 'G#5', 'J': 'A#5', 'K': 'B5', 'L': 'C#6', 'Z': 'D#6', 'X': 'E6',
    'C': 'F#6', 'V': 'G#6', 'B': 'A#6', 'N': 'B6', 'M': 'C#7',
};


/*******************************************
 * Visual Effects: typed "particles"
 *******************************************/
let typedParticles = [];  // small "sparkles" or circles

function preload() {
    // Replace 'your-image-path.jpg' with the path to your image file
    // Make sure the image is in the same directory as your sketch or provide the correct path
    backgroundImg = loadImage('background.png', img => {
        console.log("Image loaded successfully");
    }, err => {
        console.error("Error loading image:", err);
        backgroundImg = null; // Set to null if loading fails
    });
}

/**
 * setup()
 * 
 * This function is called once when the sketch first loads.
 * We set up our canvas, text settings, and audio objects here.
 */
function setup() {
    // Creates a canvas that fills the entire browser window
    createCanvas(windowWidth, windowHeight);

    // Set text size and font (we'll use a monospace font: Consolas)
    textSize(textsize);
    textFont('Consolas');
    // Set the leading (line spacing) for the text
    textLeading(leading);

    // Calculate boxWidth for positioning text. We take half the window width minus 100.
    boxWidth = width / 2 - 100;

    // MonoSynth (p5.MonoSynth) with its own internal envelope
    synth = new p5.PolySynth();

    // Extra envelope if you want more advanced control
    envelope = new p5.Envelope();
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

    // Create a Delay effect
    delay = new p5.Delay();

    // Create Distortion and connect to synth output
    distortion = new p5.Distortion(0.0, '2x');
    distortion.process(synth.output);

}


function draw() {
    switch (gameState) {
        case "intro":
            drawIntro();
            break;
        case "freeplay":
            drawFreeplay();
            break;
    }
    drawDiagnostic();
}

function drawDiagnostic() {
    fill(255);
    textSize(12);
    textAlign(LEFT, TOP);
    let levelText = "";
    switch (gameState) {
        case "intro":
            levelText = "Intro";
            break;
        case "freeplay":
            levelText = "freeplay";
            break;
    }
    const x = width - 420;
    const y = height - 20;
    text("Level: " + levelText + " (change with keys 1-4)", x, y - 0);
    text("Global Note Shift: " + globalNoteShift + "(change with UP/DOWN arrow keys)", x, y - 20);
}

function drawIntro() {
    // Set background color
    background(0);

    // Set text color
    fill(255);

    // Set text properties
    textSize(textsize);
    textAlign(CENTER, CENTER);

    // Display the title
    text("Sally's Helpers", width / 2, height / 2 - 50);

    // Display instructions
    textSize(24);
    text("Press any key to start", width / 2, height / 2 + 50);
}

let typedLetters = []; // Array to store TypedLetter instances

function loadFreeplay() {
    letters = "";
    typedLetters = [];
    numberOfEnters = 0;
}

function drawFreeplay() {

    // if the number of TypedLetters is greater than the percentageToStartWiggle of letters
    if (typedLetters.length >= int(sallyHintText.length * percentageToStartWiggle)) {
        // enable wiggling for all TypedLetters
        for (let i = 0; i < typedLetters.length; i++) {
            typedLetters[i].wiggle = true;
        }
    }

    transitionColors();

    fill(255, 255, 255, hintTextOpacity);
    // stroke(0);
    textAlign(LEFT, TOP);
    textSize(textsize);
    text(sallyHintText, margin / 2, margin / 2, width - margin, height * 5);

    // // Figure out how many lines of text fit in the window (minus margins).
    // let linesPossible = (height - margin) / leading;

    // // If typed text has more lines than fits, shift upwards
    // if (linesPossible - numberOfEnters <= 0) {
    //     textboxOffset = (linesPossible - numberOfEnters) * leading
    //         + margin / 2
    //         + manualOffsetVariable * leading;
    // } else {
    //     textboxOffset = margin / 2;
    // }

    // update and display each TypedLetter
    for (let i = 0; i < typedLetters.length; i++) {
        typedLetters[i].update();
        typedLetters[i].display();
    }

    // Visual effects: draw typed "particles"
    renderVisualEffects();
}

function transitionColors() {
    // Slowly transition background and text colors
    colorTransitionTime += 0.0005; // Very slow transition

    // Ensure smooth transition between 0 and 1
    let t = sin(colorTransitionTime) * 0.5 + 0.5;

    // Interpolate background color
    let bgColor = [
        lerp(bgColorStart[0], bgColorEnd[0], t),
        lerp(bgColorStart[1], bgColorEnd[1], t),
        lerp(bgColorStart[2], bgColorEnd[2], t)
    ];

    // Interpolate text color
    let textColor = [
        lerp(textColorStart[0], textColorEnd[0], t),
        lerp(textColorStart[1], textColorEnd[1], t),
        lerp(textColorStart[2], textColorEnd[2], t)
    ];

    // Calculate perceived brightness of background
    let brightness = (bgColor[0] * 299 + bgColor[1] * 587 + bgColor[2] * 114) / 1000;

    // Calculate perceived brightness of text
    let textBrightness = (textColor[0] * 299 + textColor[1] * 587 + textColor[2] * 114) / 1000;

    // Calculate contrast ratio
    let contrastRatio = (Math.max(brightness, textBrightness) + 0.05) /
        (Math.min(brightness, textBrightness) + 0.05);

    // If contrast is too low, adjust text color while maintaining green hue
    if (contrastRatio < 4.5) {
        // Increase contrast by adjusting green components
        if (brightness > textBrightness) {
            // If background is lighter, darken green
            textColor[0] = Math.max(0, textColor[0] * 0.5);     // Reduce red component
            textColor[1] = Math.max(0, textColor[1] * 0.5);     // Reduce green component
            textColor[2] = Math.max(0, textColor[2] * 0.5);     // Reduce blue component
        } else {
            // If background is darker, brighten green
            textColor[0] = Math.min(255, textColor[0] * 1.5);   // Increase red component
            textColor[1] = Math.min(255, textColor[1] * 1.5);   // Increase green component
            textColor[2] = Math.min(255, textColor[2] * 1.5);   // Increase blue component
        }
    }

    // Set background with interpolated color
    background(bgColor[0], bgColor[1], bgColor[2]);
    // Set text color with interpolated color
    fill(textColor[0], textColor[1], textColor[2]);
}

/**
 * keyPressed()
 * - Handles special keys (Backspace, Enter)
 * - Plays notes if the key is in notesMap
 * - Ensures audio is started on first press
 */
function keyPressed() {
    // Unlock audio on first key press
    if (!audioStarted) {
        userStartAudio();
        audioStarted = true;
    }

    preventTyping = false; // Reset flag

    switch (gameState) {
        case "intro":
            handleIntroKeyPressed();
            break;
        case "freeplay":
            handleStoryKeyPressed();
            break;
    }

    // Change game state
    if (key === '1') {
        gameState = "intro";
        preventTyping = true;
        return;
    } else if (key === '2') {
        gameState = "freeplay";
        loadFreeplay();
        preventTyping = true;
        return;
    }
}

function handleIntroKeyPressed() {
    // if any key is pressed other than 1-4, start the story
    if (key !== '1' && key !== '2' && key !== '3' && key !== '4') {
        gameState = "freeplay";
        preventTyping = true; // Prevent typing the key that advances to story
    }
}

function handleStoryKeyPressed() {

    console.log("story keyPressed: " + key);
    if (key === 'Backspace') {
        // remove the last TypedLetter
        typedLetters.pop();
        // remove the last character from the string
        letters = letters.slice(0, - 1);
        // if the last character was a newline, decrement the counter
        if (letters.slice(-1) === '\n') {
            numberOfEnters--;
        }
    }
    // for UP/DOWN arrow keys, adjust the globalNoteShift
    else if (keyCode === UP_ARROW) {
        // shift it up but cap it at maxNoteShift
        globalNoteShift += 12;
        if (globalNoteShift > maxNoteShift) {
            globalNoteShift = maxNoteShift;
        }
    } else if (keyCode === DOWN_ARROW) {
        globalNoteShift -= 12;
        if (globalNoteShift < -maxNoteShift) {
            globalNoteShift = -maxNoteShift;
        }
    }
    else if (key === 'Enter' || key === 'Return') {
        // Just do a newline, do NOT type the word "Enter"
        letters += "\n";
        numberOfEnters++;
    }
    else if (key in notesMap) {
        if (synth) {
            playNote(notesMap[key]);
        } else {
            console.error("synth is undefined");
        }
    }
}

/**
 * keyTyped() calls handleStoryKeyTyped()
 * - This function is called for each key typed
 * - Appends the typed character to `letters`
 * - Spawns a visual effect for typed characters
 * - Ignores "Enter" so we don't get literal "Enter" text
 */
function keyTyped() {
    if (preventTyping) {
        preventTyping = false; // Reset for next keypress
        return;
    }

    switch (gameState) {
        case "intro":
            break;
        case "freeplay":
            handleStoryKeyTyped();
            break;
    }
}


function handleStoryKeyTyped() {
    if (key !== 'Enter' && key !== 'Return') {
        //console.log("sending key to keyTypedHandler: " + key);
        keyTypedHandler(key);
    }
}

// Custom function to handle adding characters
function keyTypedHandler(typedChar) {
    // Prevent number keys from being added to letters when changing game state
    if (typedChar === '1' || typedChar === '2' || typedChar === '3' || typedChar === '4') {
        return;
    }

    letters += typedChar;

    spawnVisualEffect(typedChar);  // Ensure the visual effect works

    textSize(textsize);

    // Calculate the x and y position for the new TypedLetter
    let lastNewlineIndex = letters.lastIndexOf('\n');
    let lineText = lastNewlineIndex === -1 ? letters : letters.slice(lastNewlineIndex + 1);
    let x = margin / 2 + textWidth(lineText.slice(0, -1));
    let y = margin / 2 + numberOfEnters * leading;
    typedLetters.push(new TypedLetter(typedChar, x, y));

    console.log(`Added letter: ${typedChar}, x: ${x}, y: ${y}`);
}

/**
 * playNote(note)
 * - Convert note name (e.g. 'C4') to frequency
 * - Play it on the MonoSynth
 * - Apply Delay effect
 */
function playNote(note) {
    if (synth) {
        let midiNum = noteToMidi(note);
        let freq = midiToFreq(midiNum);

        // Update envelope with new attack
        envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

        // Update distortion effect
        distortion.set(distortionAmount, '2x');

        // minimum frequency is 0 hz
        const playFreq = Math.max(0, freq + globalNoteShift);

        synth.play(playFreq, 0.5, 0, 0.5);
        envelope.play(synth.output);

        // Send synth output through delay with current `delayTime`
        delay.process(synth.output, delayTime, 0.5, 2300);
    } else {
        console.error("synth is undefined");
    }
}

/**
 * noteToMidi(note)
 * - Converts a note name like "C4", "G#3" to a MIDI number
 * - Returns 60 (C4) if parsing fails
 */
function noteToMidi(note) {
    let notes = {
        "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4,
        "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9,
        "A#": 10, "B": 11
    };
    let match = note.match(/([A-G]#?)(\d)/);
    if (match) {
        let pitch = match[1];
        let octave = parseInt(match[2]);
        return 12 * (octave + 1) + notes[pitch];
    }
    return 60; // default to middle C
}

/**
 * windowResized()
 * - Adjust the canvas when window size changes
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/*******************************************
 * Visual Effects: typed "particles"
 *******************************************/

/**
 * spawnVisualEffect(key)
 * - Creates a new particle each time a character is typed.
 */
function spawnVisualEffect(key) {
    let p = {
        x: random(margin, width - margin),
        y: random(textboxOffset - 20, textboxOffset + 50),
        size: random(10, 30),
        life: 255, // fade-out timer
        c: color(random(255), random(255), random(255))
    };
    typedParticles.push(p);
}

/**
 * renderVisualEffects()
 * - Draws & updates each particle, removing it when life <= 0
 */
function renderVisualEffects() {
    for (let i = typedParticles.length - 1; i >= 0; i--) {
        let p = typedParticles[i];

        noStroke();
        fill(p.c);
        ellipse(p.x, p.y, p.size);

        // Move upward slightly & fade out
        p.y -= 0.5;
        p.life -= 4;
        p.c.setAlpha(p.life);

        // Remove if fully faded
        if (p.life <= 0) {
            typedParticles.splice(i, 1);
        }
    }
}

// prevent Firefox from opening search bar on ' press
document.addEventListener('keydown', function (event) {
    // Check if the pressed key is `'` (apostrophe)
    if (event.key === "'") {
        event.preventDefault(); // Prevent Firefox Quick Find
        keyTypedHandler("'");  // Manually trigger the keyTyped function
    }
});

// create a class called TypedLetter
class TypedLetter {
    constructor(letter, x, y) {
        this.letter = letter;
        this.x = x;
        this.y = y;
        this.size = textsize;
        this.c = color(random(255), random(255), random(255));
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.wiggle = false;
        this.wiggling = false;
        this.startedWigglingTime = 0;
    }

    display() {
        noStroke();
        fill(this.c);
        textSize(this.size);
        text(this.letter, this.x + this.shakeOffsetX, this.y + this.shakeOffsetY);

        // if not wiggling, small chance to start wiggling
        if (!this.wiggling && this.wiggle && random(1) < chanceToWiggle) {
            this.wiggling = true;
            this.startedWigglingTime = millis();
        }
    }

    update() {
        // if wiggling, shake the letter
        if (this.wiggling) {
            let t = (millis() - this.startedWigglingTime) / 1000;
            this.shakeOffsetX = sin(t * 50) * 3;
            this.shakeOffsetY = cos(t * 50) * 3;
            if (t > 0.5) {
                this.wiggling = false;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }
}