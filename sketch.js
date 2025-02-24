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
 * - Certain keys (like 'q', 'w', 'e', etc.) are mapped to
 *   specific musical notes (e.g., F2, G2, A2).
 * - Typing other characters (including uppercase letters if SHIFT is pressed)
 *   appends text to the screen.
 *
 * How to Use:
 * 1. Open this page in your browser with a web server (for example, using
 *    VSCode Live Server or another local server).
 * 2. Click or press a key to allow the browser to start the audio context
 *    (some browsers need a user interaction before playing sound).
 * 3. Type keys that correspond to notes to hear the synth. The typed keys
 *    also get printed on the screen.
 * 4. Use arrow keys (UP, DOWN, LEFT, RIGHT) to change the attack time (ADSR)
 *    or the delay time.
 * 5. Resize your browser window — the canvas will automatically resize.
 *
 ******************************************************/

/**
 * Global Variables
 * ----------------
 * We'll declare all variables at the top so it's easy to see what's available.
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

let envelope;            // A separate p5.Envelope object (optional if we want more control)
let delay;               // p5.Delay effect object

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

/**
 * setup()
 * 
 * This function is called once when the sketch first loads.
 * We set up our canvas, text settings, and audio objects here.
 */
function setup() {
    // Creates a canvas that fills the entire browser window
    createCanvas(windowWidth, windowHeight);

    // Set the text size and font (we'll use a monospace font: Consolas)
    textSize(textsize);
    textFont('Consolas');

    // Calculate boxWidth for positioning text. We take half the window width minus 100.
    boxWidth = width / 2 - 100;

    // Initialize the MonoSynth, a built-in synthesizer that has its own envelope.
    synth = new p5.MonoSynth();

    // Create an additional envelope if you want more advanced control.
    // If you only want to use the MonoSynth's built-in envelope, this can be optional.
    envelope = new p5.Envelope();
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

    // Create a Delay effect. We'll connect it to the MonoSynth's output in playNote().
    delay = new p5.Delay();
}

/**
 * draw()
 * 
 * The draw function runs continuously (roughly 60 times per second by default).
 * We handle our background, text display, and any UI drawing here.
 */
function draw() {
    // Fill the background with red (R=255, G=0, B=0)
    background(255, 0, 0);

    // Set fill color for text to white (R=255, G=255, B=255)
    fill(255);

    // Figure out how many lines of text fit in the window (minus margins).
    let linesPossible = (height - margin) / leading;

    // If our typed text has more lines than what fits, we shift everything upwards
    // so the newest lines are always visible.
    if (linesPossible - numberOfEnters <= 0) {
        textboxOffset = (linesPossible - numberOfEnters) * leading
            + margin / 2
            + manualOffsetVariable * leading;
    } else {
        // Otherwise, we start near the top margin
        textboxOffset = margin / 2;
    }

    // Set the leading (line spacing) for the text
    textLeading(leading);

    // Draw the typed text onto the canvas.
    // (x position = margin/2, y position = textboxOffset, width = width-margin,
    //  height= height * 5 to allow for large overflow)
    text(letters, margin / 2, textboxOffset, width - margin, height * 5);

    // Display UI text (attack and delay times) at the bottom-left corner
    textSize(16);
    text(`Attack: ${attackTime.toFixed(2)}s`, 20, height - 40);
    text(`Delay: ${delayTime.toFixed(2)}s`, 20, height - 20);

    // (Optional) If you want to track the cursor position, you can do:
    // cursorX = textWidth(letters);
    // But it's not displayed right now.
}

/**
 * keyPressed()
 * - Fires on every key press, including special keys (arrows, SHIFT, etc.)
 * - We handle special keys here (Backspace, Enter, arrows) & notes.
 */
function keyPressed() {
    // Unlock audio on the first key press
    if (!audioStarted) {
        userStartAudio();
        audioStarted = true;
    }

    // Handle special keys:
    if (key === 'Backspace') {
        // Remove last character from letters
        letters = letters.slice(0, -1);
    }
    else if (key === 'Enter' || key === 'Return') {
        // Add newline and track number of Enters
        letters += "\n";
        numberOfEnters++;
    }
    else if (keyCode === UP_ARROW) {
        // Increase attack time
        attackTime = min(attackTime + 0.05, 1);
        envelope.setADSR(attackTime, 0.1, 0.5, 0.5);
    }
    else if (keyCode === DOWN_ARROW) {
        // Decrease attack time
        attackTime = max(attackTime - 0.05, 0);
        envelope.setADSR(attackTime, 0.1, 0.5, 0.5);
    }
    else if (keyCode === LEFT_ARROW) {
        // Decrease delay time
        delayTime = max(delayTime - 0.05, 0);
    }
    else if (keyCode === RIGHT_ARROW) {
        // Increase delay time
        delayTime = min(delayTime + 0.05, 1);
    }
    else if (key in notesMap) {
        // Play a note if key is mapped
        playNote(notesMap[key]);
        // (We do NOT add the note to `letters` here, 
        //   because keyTyped() will handle normal characters)
    }
    // If none of these conditions match, 
    // we let keyTyped() catch it (for normal letters, punctuation, etc.)
}

/**
 * keyTyped()
 * - Only fires on normal typed characters 
 *   (letters, numbers, punctuation). 
 * - SHIFT, CTRL, ALT, arrow keys, etc. do NOT trigger keyTyped().
 */
function keyTyped() {
    // Append the typed character to our `letters` string
    letters += key;
}

/**
 * playNote(note)
 * 
 * This function handles converting a note name (like 'C4') to a frequency,
 * then playing it on the MonoSynth. It also applies a Delay effect.
 *
 * @param {string} note - e.g. "C4", "G#3", "A5"
 */
function playNote(note) {
    // Convert the textual note (e.g., "C4") into a MIDI number (e.g., 60)
    let midiNum = noteToMidi(note);
    // Convert the MIDI number into a frequency in hertz
    let freq = midiToFreq(midiNum);

    // p5.MonoSynth has its own internal envelope, so we can simply call .play().
    // The arguments are: frequency, velocity (0.0 to 1.0), startTime, duration
    synth.play(freq, 0.5, 0, 0.5);

    // Manually control the amplitude or another parameter with the envelope
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);
    envelope.play(synth.output);

    // Route the synth's OUTPUT into the delay effect.
    // This is important because the Delay expects an audio node, not the synth object itself.
    // (p5.MonoSynth.output is the underlying Web Audio node.)
    delay.process(synth.output, delayTime, 0.5, 2300);
}

/**
 * noteToMidi(note)
 * 
 * Converts a textual note name like "C4", "G#3", "F2" into a MIDI number.
 * If it fails to parse, it defaults to 60 (which is Middle C).
 *
 * @param {string} note - A string representing the note (example: "C4", "A#3").
 * @return {number} A MIDI note number (0-127 in typical range).
 */
function noteToMidi(note) {
    // A lookup table for note names to their semitone offsets from C
    let notes = {
        "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4,
        "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9,
        "A#": 10, "B": 11
    };

    // Use a regular expression to separate the pitch (like 'C#') from the octave (like '4')
    let match = note.match(/([A-G]#?)(\d)/);

    // If we successfully match the note pattern, calculate the MIDI number
    if (match) {
        let pitch = match[1];       // e.g. "C#", "F", "G#"
        let octave = parseInt(match[2]); // e.g. 4, 3, 2
        // MIDI formula: (octave + 1) * 12 + noteIndex
        // The +1 in the octave is because MIDI starts at octave -1 for note 0
        return 12 * (octave + 1) + notes[pitch];
    }
    // If parsing fails, return 60 (Middle C) by default
    return 60;
}

/**
 * windowResized()
 * 
 * A p5.js callback function that automatically fires whenever the browser
 * window is resized. We call resizeCanvas to make our canvas match
 * the new window size.
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}