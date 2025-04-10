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
const MAX_TEXT_WIDTH_PERCENTAGE_FREEPLAY = 0.7;

let letterColor; // Will be initialized in setup


// Sticky notes
let stickies = [];  // Array to store Sticky instances
let stickyImages = {};  // Object to store preloaded sticky images
const stickySize = 100;
const stickySizeHovered = 360;


// Text styling
let textsize = 32;
let margin = 100;
let leading = textsize * 1.2;
let manualOffsetVariable = 0;
let scrollOffset = 0;  // Track how far we've scrolled up
const SCROLL_THRESHOLD = 0.85;  // When to start scrolling (85% of screen height)

// For tracking which hint text is currently being shown
let currentHintTextIndex = 0;  // Index of the current hint text being displayed

// For color transitions
let bgColorStart = [50, 50, 50];      // Dark grey
let bgColorEnd = [200, 200, 200];     // Light grey
let textColorStart = [100, 255, 100]; // Light green
let textColorEnd = [0, 100, 0];       // Dark green
let colorTransitionTime = 0;

// Slightly higher opacity for readability
let hintTextOpacity = 100;

// Big chunk of text
let sallyHintText = [
    "testing",
    "testing again",
    "pumpkin pie",
    "apple sauce"
];

sallyHintText = [];

// border stuff
let borderInsetPixels = 0;

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
    ['H', 0.00], ['e', 1.74], ['l', 1.82], ['l', 0.88], ['o', 0.93],
    [' ', 1.78], ['m', 1.82], ['y', 0.43], [' ', 0.53], ['n', 0.82],
    ['a', 0.86], ['m', 0.78], ['e', 0.47], [' ', 0.54], ['i', 0.27],
    ['s', 0.46], [' ', 4.51], ['S', 1.19], ['a', 0.80], ['l', 0.93],
    ['l', 0.97], ['y', 0.98], ['Enter', 2.13], ['I', 3.63], [' ', 1.47],
    ['w', 2.15], ['i', 0.50], ['l', 0.43], ['l', 0.77], [' ', 1.02],
    ['m', 0.78], ['e', 0.38], ['d', 0.41], ['i', 0.39], ['a', 0.36],
    ['t', 0.43], ['e', 0.41], [' ', 0.51], ['y', 0.45], ['o', 0.42],
    ['u', 0.42], ['r', 0.82], [' ', 0.93], ['e', 0.34], ['x', 0.43],
    ['p', 0.43], ['e', 0.44], ['r', 0.42], ['i', 0.43], ['e', 0.42],
    ['n', 0.51], ['c', 0.79], ['e', 1.34], [',', 2.58], ['.', 2.75],
    ['Enter', 3.51], ['Enter', 0.41], ['I', 4.61], [' ', 0.43], ['i', 0.41],
    ['n', 0.41], ['v', 0.39], ['i', 0.77], ['t', 1.30], ['e', 0.45],
    [' ', 0.60], ['y', 0.28], ['o', 0.42], ['u', 0.50], [' ', 0.98],
    ['t', 0.41], ['o', 0.41], [' ', 1.04], ['b', 0.86], ['e', 1.22],
    [' ', 1.33], ['p', 0.98], ['a', 0.73], ['t', 0.87], ['i', 1.34],
    ['e', 2.17], ['n', 1.76], ['t', 4.92], ['.', 10.05], [' ', 0.17],
    ['R', 0.50], ['e', 0.50], ['l', 0.42], ['a', 0.38], ['x', 0.77],
    [' ', 0.99], ['y', 0.26], ['o', 0.40], ['u', 0.39], ['r', 0.46],
    [' ', 1.78], ['s', 1.60], ['h', 0.40], ['o', 0.38], ['u', 0.82],
    ['l', 0.71], ['d', 0.36], ['e', 0.38], ['r', 0.38], ['s', 0.83],
    ['s', 1.47], ['.', 0.79], [' ', 1.78], ['G', 1.65], ['e', 0.34],
    ['n', 0.36], ['t', 0.39], ['l', 0.36], ['y', 0.41], [',', 0.76],
    [' ', 0.89], ['p', 1.03], ['l', 0.40], ['a', 0.30], ['c', 0.36],
    ['e', 0.36], [' ', 0.81], ['y', 0.82], ['o', 0.34], ['u', 0.45],
    ['r', 0.78], [' ', 1.14], ['f', 0.56], ['i', 0.38], ['n', 0.42],
    ['g', 0.39], ['e', 0.82], ['r', 0.45], ['s', 0.84], ['.', 1.46],
    [' ', 2.82], ['o', 0.59], ['n', 0.41], [' ', 0.38], ['y', 0.42],
    ['o', 0.46], ['u', 0.45], ['r', 0.86], [' ', 0.92], ['k', 0.74],
    ['e', 0.40], ['y', 0.43], ['b', 0.41], ['o', 0.43], ['a', 0.42],
    ['r', 0.42], ['d', 0.43], ['.', 1.36], ['Enter', 1.70], ['Enter', 0.45],
    ['C', 19.25], ['l', 2.90], ['o', 2.54], ['s', 2.47], ['e', 2.34],
    [' ', 2.00], ['y', 2.48], ['o', 0.40], ['u', 0.43], ['r', 0.81],
    [' ', 0.90], ['e', 0.43], ['y', 0.44], ['e', 0.41], ['s', 0.47],
    ['.', 13.56], ['.', 0.81], ['.', 0.90], ['n', 3.71], ['o', 1.17],
    ['w', 0.62], ['t', 38.90], ['r', 0.39], ['y', 0.45], ['Enter', 14.25],
    ['Enter', 0.39], ['A', 39.41], ['r', 1.24], ['e', 0.43], [' ', 0.77],
    ['y', 0.48], ['o', 0.38], ['u', 0.43], [' ', 0.82], ['t', 0.37],
    ['i', 0.42], ['r', 0.41], ['e', 0.42], ['d', 0.75], ['?', 0.60],
    ['Enter', 1.42], [' ', 1.67], ['B', 3.68], ['r', 0.79], ['e', 0.45],
    ['a', 0.50], ['t', 0.79], ['h', 0.43], ['e', 0.83], ['.', 1.26],
    ['Enter', 0.75], ['i', 1.88], ['n', 0.40], ['s', 0.36], ['i', 0.85],
    ['d', 0.44], ['e', 0.89], [' ', 0.62], ['o', 0.57], ['u', 0.39],
    ['t', 0.40], ['s', 0.87], ['i', 0.73], ['d', 0.38], ['e', 0.94],
    ['Enter', 0.77], [' ', 0.40], ['i', 3.58], ['n', 0.34], ['s', 0.30],
    ['i', 0.62], ['d', 0.33], ['e', 0.66], [' ', 0.46], ['o', 0.35],
    ['u', 0.30], ['t', 0.36], ['s', 0.47], ['i', 0.80], ['d', 0.30],
    ['e', 0.63], ['Enter', 1.74], [' ', 1.02], [' ', 0.98], ['i', 1.67],
    ['n', 0.29], ['s', 0.33], ['i', 0.60], ['d', 0.33], ['e', 0.62],
    [' ', 0.45], ['o', 0.50], ['u', 0.37], ['t', 0.30], ['s', 0.37],
    ['i', 0.97], ['d', 0.40], ['e', 0.82], ['q', 1.64], ['u', 0.28],
    ['i', 0.37], ['e', 0.30], ['t', 0.38], ['w', 1.36], ['o', 0.40],
    ['r', 0.35], ['d', 0.45], ['s', 0.41], ['q', 2.87], ['u', 0.29],
    ['i', 0.31], ['e', 0.23], ['t', 0.29], ['w', 0.63], ['o', 0.31],
    ['r', 0.31], ['d', 0.41], ['s', 0.56], ['p', 0.61], ['e', 0.35],
    ['o', 0.30], ['p', 0.19], ['l', 0.20], ['e', 0.19], ['p', 0.37],
    ['o', 0.29], ['w', 0.37], ['e', 0.34], ['r', 0.31], ['r', 1.10],
    ['p', 2.95], ['e', 0.28], ['o', 0.32], ['p', 0.27], ['l', 0.22],
    ['e', 0.18], ['p', 0.33], ['o', 0.23], ['w', 0.33], ['e', 0.22],
    ['r', 0.24], ['.', 0.44], ['c', 1.87], ['o', 0.36], ['m', 0.46],
    ['i', 0.40], ['n', 0.41], ['g', 1.02], ['g', 1.81], ['t', 1.78],
    ['h', 0.41], ['r', 0.37], ['o', 0.30], ['u', 0.29], ['g', 0.33],
    ['h', 0.38], ['c', 0.83], ['o', 0.26], ['m', 0.33], ['i', 0.28],
    ['n', 0.43], ['g', 0.33], ['t', 1.20], ['h', 0.30], ['r', 0.27],
    ['o', 0.30], ['u', 0.27], ['g', 0.30], ['h', 0.24], ['t', 0.34],
    ['h', 0.30], ['e', 0.35], ['h', 0.51], ['o', 0.29], ['r', 0.24],
    ['i', 1.19], ['z', 0.27], ['o', 0.30], ['n', 0.35], ['n', 0.54],
    ['Enter', 7.03], ['Enter', 0.61], ['i', 6.71], ['n', 0.26], ['s', 0.32],
    ['i', 0.62], ['d', 0.36], ['e', 0.75], [' ', 0.53], ['o', 0.55],
    ['u', 0.30], ['t', 0.33], ['s', 0.41], ['i', 1.20], ['d', 0.45],
    ['e', 1.22], ['.', 2.78], ['.', 3.31], ['Enter', 4.72], ['O', 1.74],
    ['n', 0.29], [' ', 0.23], ['t', 0.31], ['h', 0.28], ['e', 0.30],
    [' ', 0.22], ['n', 0.16], ['e', 0.22], ['x', 0.30], ['t', 0.18],
    [' ', 0.15], ['s', 0.18], ['c', 0.19], ['r', 0.34], ['e', 0.18],
    ['e', 0.32], ['n', 0.31], ['m', 0.50], [',', 1.32], [' ', 0.86],
    ['y', 0.35], ['o', 0.24], ['u', 0.20], [' ', 0.21], ['w', 0.33],
    ['i', 0.20], ['l', 0.30], ['l', 0.38], [' ', 0.46], ['s', 0.61],
    ['e', 0.28], ['e', 0.45], [' ', 0.30], ['s', 0.32], ['o', 0.19],
    ['m', 0.26], ['e', 0.26], [' ', 0.17], ['n', 0.22], ['o', 0.24],
    ['t', 0.22], ['e', 0.20], ['s', 0.30], ['.', 2.50], [' ', 2.06],
    ['t', 0.27], ['o', 0.32], [' ', 0.29], ['r', 0.41], ['e', 0.29],
    ['.', 2.68], [' ', 0.67], ['Enter', 0.41], ['R', 3.76], ['f', 0.39],
    ['e', 0.71], ['f', 0.35], ['e', 0.35], ['l', 0.58], ['e', 0.24],
    ['c', 0.31], ['t', 0.27], [' ', 0.18], ['o', 0.33], ['n', 0.20],
    [' ', 0.25], ['t', 0.16], ['h', 0.14], ['e', 0.22], ['m', 0.28],
    [',', 1.78], [' ', 0.20], ['u', 0.38], ['s', 0.01], ['e', 0.68],
    [' ', 0.30], ['t', 0.20], ['h', 0.23], ['e', 0.18], [' ', 0.32],
    ['k', 0.62], ['e', 0.18], ['y', 0.16], ['b', 0.26], ['o', 0.23],
    ['a', 0.18], ['r', 0.20], ['d', 0.25], [',', 1.96], [' ', 0.41],
    ['b', 0.53], ['l', 0.16], ['i', 0.25], ['n', 0.15], ['k', 0.22],
    [' ', 0.17], ['o', 0.15], ['f', 0.11], ['t', 0.23], ['e', 0.17],
    ['n', 0.18], ['.', 0.36], ['n', 5.55], ['m', 0.89], ['.', 5.31],
    ['.', 0.59], ['.', 0.43], ['.', 0.43]
];
