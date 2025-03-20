/*******************************************************
 * globals.js
 *
 * Holds *all* the global variables that various files 
 * need to access (e.g., game state, p5 objects, 
 * typed text, etc.).
 ******************************************************/

// Game state
let gameState = "intro"; // "intro", "guided", "freeplay"

// Audio
let synth;               // p5.PolySynth object that generates sound
let envelope;            // p5.Envelope
let delay;               // p5.Delay
let distortion;          // p5.Distortion
let audioStarted = false; // Add this line to declare the variable
let lastNote = null; // Add this line to declare the variable

// Guided mode variables
let guidedStartTime = 0;        // When the guided mode started
let guidedCurrentNoteIndex = 0; // Current note being played in the sequence
let guidedNextNoteTime = 0;     // When to play the next note
let guidedSequenceComplete = false; // Whether the sequence has finished playing
let guidedEndTime = 0;          // When the guided mode should end

// Typed text & display
let letters = "";        // A string to store typed text
let typedLetters = [];   // Array to store TypedLetter instances
let numberOfEnters = 0;  // Tracks how many times the user pressed Enter
let preventTyping = false;
const MAX_TEXT_WIDTH_PERCENTAGE = 0.8;

// Text styling
let textsize = 32;
let margin = 100;
let leading = textsize * 1.2;
let manualOffsetVariable = 0;

// For color transitions
let bgColorStart = [50, 50, 50];      // Dark grey
let bgColorEnd = [200, 200, 200];     // Light grey
let textColorStart = [100, 255, 100]; // Light green
let textColorEnd = [0, 100, 0];       // Dark green
let colorTransitionTime = 0;

// Current green shade for typed letters
let currentGreenShade;

// Slightly higher opacity for readability
let hintTextOpacity = 100;

// Big chunk of text
let sallyHintText = 
[
    "“Before there were computers - indeed before there were any technologies - people were just in the world. They experienced the natural world in three dimensions and they moved around with six degrees of freedom. They could touch and manipulate things directly; there were no keyboards and no mice. A good digital interface gets us as close as possible to that natural state, allowing us to interact by movement and direct manipulation.” Gomala, Diane, and Jay Bolter. 2005. Windows and Mirrors: Interaction Design, Digital Art, and the Myth of Transparency",
    "testing line 2",
    "testing line 3"
]
sallyHintText = []; // blank it out for now

// Background image
let backgroundImg;

// Wiggle logic
const percentageToStartWiggle = 0.005;
const chanceToWiggle = 0.0001;

// Cursor object
let cursor;
let cursorCeiling = 0;

// Note shifting
let globalNoteShift = 0;
const maxNoteShift = 96; // 8 octaves up/down

// ADSR and effects parameters
let attackTime = 0.1;
let delayTime = 0.2;
let distortionAmount = 0.0;

// Typed "particles" (visual effects)
let typedParticles = [];

// Mapping of keyboard keys to notes
const notesMap = {
    'q': 'F3', 'w': 'G3', 'e': 'A3', 'r': 'B3', 't': 'C4', 'y': 'D4', 'u': 'E4',
    'i': 'F4', 'o': 'G4', 'p': 'A4', 'a': 'B4', 's': 'C5', 'd': 'D5', 'f': 'E5',
    'g': 'F5', 'h': 'G5', 'j': 'A5', 'k': 'B5', 'l': 'C6', 'z': 'D6', 'x': 'E6',
    'c': 'F6', 'v': 'G6', 'b': 'A6', 'n': 'B6', 'm': 'C7',
    'Q': 'F#3', 'W': 'G#3', 'E': 'A#3', 'R': 'B3', 'T': 'C#4', 'Y': 'D#4', 'U': 'E4',
    'I': 'F#4', 'O': 'G#4', 'P': 'A#4', 'A': 'B4', 'S': 'C#5', 'D': 'D#5', 'F': 'E5',
    'G': 'F#5', 'H': 'G#5', 'J': 'A#5', 'K': 'B5', 'L': 'C#6', 'Z': 'D#6', 'X': 'E6',
    'C': 'F#6', 'V': 'G#6', 'B': 'A#6', 'N': 'B6', 'M': 'C#7',
};

// note sequence with associated timing
const guidedNoteSequence = [
    ['T', 0.5], ['e', 0.25], ['s', 0.25], ['t', 0.5], ['i', 1.0], ['n', 0.5], ['g', 0.5]
];