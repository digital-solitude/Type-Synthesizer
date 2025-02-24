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

// ADSR (Attack-Decay-Sustain-Release) Envelope settings
let attackTime = 0.1;    // Length of the 'attack' phase in seconds
let delayTime = 0.2;     // Amount of delay time in seconds

// p5.Envelope, p5.Delay, and p5.Distortion objects
let envelope;
let delay;
let distortion;

// Distortion amount (0.0 to 1.0)
let distortionAmount = 0;

/**
 * A mapping of keyboard keys to musical note names.
 * Each letter corresponds to a note like 'C4', 'D#3', 'F2', etc.
 * These note names will be converted to MIDI numbers, then to frequencies.
 */
let notesMap = {
    'q': 'F2', 'w': 'G2', 'e': 'A2', 'r': 'B2', 't': 'C3', 'y': 'D3', 'u': 'E3',
    'i': 'F3', 'o': 'G3', 'p': 'A3', 'a': 'B3', 's': 'C4', 'd': 'D4', 'f': 'E4',
    'g': 'F4', 'h': 'G4', 'j': 'A4', 'k': 'B4', 'l': 'C5', 'z': 'D5', 'x': 'E5',
    'c': 'F5', 'v': 'G5', 'b': 'A5', 'n': 'B5', 'm': 'C6'
};

// =======================
// Sliders & Labels
// =======================
let attackSlider, attackLabel;
let delaySlider, delayLabel;
let distSlider, distLabel;

/*******************************************
 * Visual Effects: typed "particles"
 *******************************************/
let typedParticles = [];  // small "sparkles" or circles

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

    // Calculate boxWidth for positioning text. We take half the window width minus 100.
    boxWidth = width / 2 - 100;

    // MonoSynth (p5.MonoSynth) with its own internal envelope
    synth = new p5.MonoSynth();

    // Extra envelope if you want more advanced control
    envelope = new p5.Envelope();
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

    // Create a Delay effect
    delay = new p5.Delay();

    // Create Distortion and connect to synth output
    distortion = new p5.Distortion(0.0, '2x');
    distortion.process(synth.output);

    // ================
    // Create Sliders
    // ================
    attackSlider = createSlider(0, 1, attackTime, 0.01);
    delaySlider = createSlider(0, 1, delayTime, 0.01);
    distSlider = createSlider(0, 1, 0, 0.01);

    // Create label elements for each slider
    attackLabel = createDiv();
    delayLabel = createDiv();
    distLabel = createDiv();

    // Some styling for labels
    attackLabel.style('color', '#fff');
    delayLabel.style('color', '#fff');
    distLabel.style('color', '#fff');
}

/**
 * draw()
 * 
 * The draw function runs ~60 times per second.
 * We handle background, text display, slider updates, and visuals here.
 */
function draw() {
    background(255, 0, 0); // red background
    fill(255);             // white text

    // Read slider values each frame
    attackTime = attackSlider.value();
    delayTime = delaySlider.value();
    distortionAmount = distSlider.value();

    // Update envelope with new attack
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

    // Update distortion effect
    distortion.set(distortionAmount, '2x');

    // Figure out how many lines of text fit in the window (minus margins).
    let linesPossible = (height - margin) / leading;

    // If typed text has more lines than fits, shift upwards
    if (linesPossible - numberOfEnters <= 0) {
        textboxOffset = (linesPossible - numberOfEnters) * leading
            + margin / 2
            + manualOffsetVariable * leading;
    } else {
        textboxOffset = margin / 2;
    }

    // Set the leading (line spacing) for the text
    textLeading(leading);

    // Draw the typed text
    text(letters, margin / 2, textboxOffset, width - margin, height * 5);

    // Visual effects: draw typed "particles"
    renderVisualEffects();

    // ===============
    // Position sliders & labels near bottom-left
    // ===============
    let sliderX = 20;
    let sliderSpacing = 30;
    let bottom = height - 20;

    // Attack
    attackSlider.position(sliderX, bottom - sliderSpacing);
    attackLabel.position(sliderX + 180, bottom - sliderSpacing);
    attackLabel.html(`Attack: ${attackTime.toFixed(2)}`);

    // Delay
    delaySlider.position(sliderX, bottom - sliderSpacing * 2);
    delayLabel.position(sliderX + 180, bottom - sliderSpacing * 2);
    delayLabel.html(`Delay: ${delayTime.toFixed(2)}`);

    // Distortion
    distSlider.position(sliderX, bottom - sliderSpacing * 3);
    distLabel.position(sliderX + 180, bottom - sliderSpacing * 3);
    distLabel.html(`Distortion: ${distortionAmount.toFixed(2)}`);
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

    if (key === 'Backspace') {
        letters = letters.slice(0, -1);
    }
    else if (key === 'Enter' || key === 'Return') {
        // Just do a newline, do NOT type the word "Enter"
        letters += "\n";
        numberOfEnters++;
    }
    else if (key in notesMap) {
        playNote(notesMap[key]);
    }
}

/**
 * keyTyped()
 * - Appends the typed character to `letters`
 * - Spawns a visual effect for typed characters
 * - Ignores "Enter" so we don't get literal "Enter" text
 */
function keyTyped() {
    if (key !== 'Enter' && key !== 'Return') {
        letters += key;
        spawnVisualEffect(key);
    }
}

/**
 * playNote(note)
 * - Convert note name (e.g. 'C4') to frequency
 * - Play it on the MonoSynth
 * - Apply Delay effect
 */
function playNote(note) {
    let midiNum = noteToMidi(note);
    let freq = midiToFreq(midiNum);

    synth.play(freq, 0.5, 0, 0.5);
    envelope.play(synth.output);

    // Send synth output through delay with current `delayTime`
    delay.process(synth.output, delayTime, 0.5, 2300);
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
