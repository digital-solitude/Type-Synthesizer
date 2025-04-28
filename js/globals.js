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

// Variable to track text sent to Arena
let lastSentIndex = 0;

let letterColor; // Will be initialized in setup

let typingText = "";
let fullMessage = "It is now your turn to type... \nYour keyboard is your instrument, you may be familiar but try to slow down. \nType with your whole body, your full breath, blink often. \nClick on the sticky prompts for inspiration or... a score.";
let currentChar = 0;
let lastTypedTime = 0;
let typingSpeed = 130; // milliseconds per character
let showContinuePrompt = false;

// Sticky notes
let availableStickies = []; 
let stickies = [];  // Array to store Sticky instances
let stickyImages = {};  // Object to store preloaded sticky images
const stickySize = 70;
const stickySizeHovered = 380;
let stickyQueue = [];


// Text styling
let textsize = 32;
let margin = 100;
let leading = textsize * 1.2;
let manualOffsetVariable = 0;
let scrollOffset = 0;  // Track how far we've scrolled up
const SCROLL_THRESHOLD = 0.9;  // When to start scrolling (85% of screen height)

// For tracking which hint text is currently being shown
let currentHintTextIndex = 0;  // Index of the current hint text being displayed

// For color transitions
let bgColorStart = [50, 50, 50] ;     // Dark grey
let bgColorEnd = [245, 245, 245];  // Light grey
let textColorStart = [150, 255, 150]; // Light green
let textColorEnd = [0, 200, 0];       // Dark green
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

const useMilliseconds = true;

// note sequence with associated timing
const guidedNoteSequence = [

    
    ['Shift', 0],
    ['Shift', 827.7],
    ['H', 1254.6],
    ['e', 1651],
    ['l', 1159.7],
    ['l', 802],
    ['o', 912.4],

    [',', 4029.7],
    [' ', 415.7],
    ['m', 584.5],
    ['y', 389.9],
    [' ', 439.1],
    ['n', 444.9],
    ['a', 336.9],
    ['m', 441.1],
    ['e', 919.4],
    [' ', 709.4],
    ['i', 375.7],
    ['s', 447.4],
    [' ', 2535.6],
    ['Shift', 2487.4],
    ['S', 536],
    ['a', 863.4],
    ['l', 946.8],
    ['l', 859.5],
    ['y', 831.6],
    ['Backspace', 598],
    ['Backspace', 160.5],
    ['Backspace', 151.7],
    ['Backspace', 144],
    ['Backspace', 136.1],
    ['Shift', 2415.5],
    ['S', 536],
    ['a', 963.4],
    ['l', 946.8],
    ['l', 1059.5],
    ['y', 831.6],
    ['.', 559.2],
    [' ', 6479.6],
    ['Shift', 488.3],
    ['I', 295.4],
    [' ', 377.3],
    ['w', 366.1],
    ['i', 351.1],
    ['l', 431.2],
    ['l', 806.6],
    [' ', 735.1],
    ['m', 1055.6],
    ['e', 1439.7],
    ['d', 310.4],
    ['i', 319.3],
    ['a', 487.4],
    ['t', 992.6],
    ['e', 382.5],
    [' ', 1525],
    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    ['r', 1039.2],
    [' ', 1558.6],
    ['u', 521.9],
    ['s', 373.4],
    ['e', 399.1],
    ['r', 375.9],
    [' ', 840],
    ['e', 1326.9],
    ['x', 334.7],
    ['p', 271.8],
    ['e', 311.6],
    ['r', 327.1],
    ['i', 360.4],
    ['e', 721.8],
    ['n', 461.3],
    ['c', 1485.7],
    ['e', 544.7],

    ['.', 525.8],
    [' ', 2585.2],
    ['Enter', 1149.5],
    ['Shift', 1824.1],
    ['I', 991.3],
    [' ', 1471.8],
    ['i', 1976.2],
    ['n', 784.1],
    ['v', 863.8],
    ['i', 1263.2],
    ['t', 1145],
    ['e', 812.6],
    [' ', 913.7],
    ['y', 289.9],
    ['o', 367.3],
    ['u', 495.6],
    [' ', 810.9],
    ['t', 619.3],
    ['o', 359.8],
    [' ', 449.8],
    ['b', 400.6],
    ['e', 356],
    [' ', 752],
    ['p', 1207.3],
    ['a', 2215.5],
    ['t', 2319.8],
    ['i', 2969.1],
    ['e', 2357.5],
    ['n', 3143.6],
    ['t', 8850.5],
    ['.', 5589.2],

    ['Enter', 2785.4],
    ['Shift', 7860.9],

    ['R', 1500],
    ['e', 1500.7],
    ['l', 1502.4],
    ['a', 1500.8],
    ['x', 1500.6],
    [' ', 2583.4],

    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    ['r', 1039.2],

    [' ', 711],
    ['s', 363.7],
    ['h', 1028.1],
    ['o', 326.7],
    ['u', 631.8],
    ['l', 608],
    ['d', 751.2],
    ['e', 696.3],
    ['r', 766.2],
    ['s', 1465.5],
    [',', 3052.6],

    [' ', 727.6],
    ['g', 712.1],
    ['e', 292.7],
    ['n', 336.3],
    ['t', 318.5],
    ['l', 343.9],
    ['y', 369.2],

    [' ', 1372.8],
    ['p', 561.7],
    ['l', 381.3],
    ['a', 798.6],
    ['c', 1256.1],
    ['e', 1110.4],
    [' ', 1159.7],
    
    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    ['r', 1039.2],
    [' ', 613.3],
    ['f', 535.9],
    ['i', 329.2],
    ['n', 685.7],
    ['g', 369.1],
    ['e', 660.7],
    ['r', 463.4],
    ['s', 340.1],

    [' ', 2522.9],
    ['o', 383.5],
    ['n', 1008.4],
    [' ', 1168.9],

    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    ['r', 1039.2],

    [' ', 730.6],
    ['k', 430.4],
    ['e', 2483.6],
    ['y', 767.2],
    ['b', 735.5],
    ['o', 407.4],
    ['a', 639.5],
    ['r', 407.6],
    ['d', 583.5],
    ['.', 6607.2],
    
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],

 
    ['Shift', 5072.2],
    ['C', 1256.2],
    ['l', 2502.8],
    ['o', 1126.9],
    ['s', 1151.7],
    ['e', 1567.5],
    [' ', 494.8],
    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    ['r', 1039.2],
    [' ', 479.8],
    ['e', 579.4],
    ['y', 443.6],
    ['e', 527.4],
    ['s', 251.1],
    ['.', 6967.9],
    ['.', 6300.8],
    ['.', 6009.4],
    [' ', 4999.5],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],

    ['Shift', 2337.1],
    ['A', 1274.3],
    ['r', 631.6],
    ['e', 687.9],
    [' ', 942.5],
    ['y', 432.5],
    ['o', 359.5],
    ['u', 1091.6],
    [' ', 1098.9],
    ['t', 950.2],
    ['i', 397.3],
    ['r', 417.8],
    ['e', 453.2],
    ['d', 680.1],
    ['?', 2523],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                        ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],


    ['b', 2282.3],
    ['r', 518.3],
    ['e', 399],
    ['a', 454.1],
    ['t', 414.8],
    ['h', 457.9],
    ['e', 441.6],
    ['.', 822.6],
    ['.', 822.6],
    ['.', 3822.6],

                ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
                ['Backspace',0],['Backspace',0],
    ['b', 2282.3],
    ['l', 518.3],
    ['i', 399],
    ['n', 454.1],
    ['k', 414.8],
    ['.', 2457.9],
    ['.', 3441.6],
    ['.', 4022.6],
               ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
               ['Backspace',0],['Backspace',0],['Backspace',0],['Backspace',0],
    ['b', 2282.3],
    ['r', 518.3],
    ['e', 399],
    ['a', 454.1],
    ['t', 414.8],
    ['h', 457.9],
    ['e', 441.6],
    ['.', 822.6],
    ['.', 822.6],
    ['.', 3822.6],
    ['Enter', 2227.7],
    ['              ', 0],
           
    ['i', 453.1],
    ['n', 407.3],
    ['s', 833.3],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],
   
    ['Enter', 527.7],
    ['               ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],

    ['o', 455],
    ['u', 426.3],
    ['t', 754.7],
    ['s', 833.6],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],

    ['Enter', 2563.8],
    ['               ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
   
    ['i', 553.1],
    ['n', 307.3],
    ['s', 833.3],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],

    ['Enter', 527.7],
    ['               ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],
    [' ', 0],

    ['o', 455],
    ['u', 426.3],
    ['t', 754.7],
    ['s', 833.6],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 2007.6],


    ['q', 893.2],
    ['Backspace', 0],
    ['.', 1],

    ['Enter', 0],    
    ['                                        ', 0], 

    ['u', 294.7],
    ['Backspace', 0],
    ['.', 294.7],
    ['Enter', 0],
    ['                                        ', 0], 
    ['i', 311.9],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['e', 312.5],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['t', 616],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['w', 625.1],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
     
    ['o', 342.5],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['r', 343.8],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['d', 359],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0], 
    ['                                        ', 0], 
    ['s', 1095.9],
    ['Backspace', 0],
    ['.', 1],
    ['Enter', 0],
    ['                                        ', 0], 
    ['.', 452.2],
    ['Backspace', 0],

    
    ['p', 1009.9],
    ['e', 264.3],
    ['o', 281.8],
    ['p', 280.6],
    ['l', 196.7],
    ['e', 276.9],

    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    
    ['p', 327.8],
    ['o', 303.5],
    ['w', 327.3],
    ['e', 319.7],
    ['r', 571.9],
    ['Backspace', 10],
    ['r', 578.9],
    [' ', 578.9],

    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],

    ['p', 996.3],
    ['e', 297.4],
    ['o', 281.8],
    ['p', 268.5],
    ['l', 231],
    ['e', 307.3],
    ['p', 427.5],
    ['o', 278.8],
    ['w', 368],
    ['e', 328.9],
    ['r', 486.2],
    ['Backspace', 1],
    ['r', 667.7],
    [' ', 578.9],

    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['c', 532.1],
    ['o', 180],
    ['m', 390.2],
    ['i', 327.8],
    ['n', 672.1],
    ['g', 404.6],
    ['Backspace', 100],
    ['g', 836.8],
    ['t', 679.1],
    ['h', 298.4],
    ['r', 268.8],
    ['o', 227.1],
    ['u', 321.9],
    ['g', 297.2],
    ['h', 255.5],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],

    ['c', 588.8],
    ['o', 319.2],
    ['m', 480],
    ['i', 273.2],
    ['n', 749.2],
    ['g', 975.4],
    ['t', 799.1],
    ['h', 279],
    ['r', 283.1],
    ['o', 215],
    ['u', 292.1],
    ['g', 255.6],
    ['h', 288.6],
    ['t', 637.5],
    ['h', 431.8],
    ['e', 777.9],
    ['h', 336],
    ['o', 583.8],
    ['r', 232.4],
    ['i', 318],
    ['z', 291.7],
    ['o', 355.8],
    ['n', 495.6],
    ['Backspace', 100],
    ['n', 839.7],
    ['.', 191.2],
    ['.', 191.2],
    ['.', 1049.6],
    ['Backspace', 1203.1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 1],
    ['Backspace', 3000],

    ['i', 553.1],
    ['n', 307.3],
    ['s', 833.3],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],

    ['Enter', 727.7],
    ['                                              ', 0],

    ['o', 455],
    ['u', 426.3],
    ['t', 754.7],
    ['s', 833.6],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],

    ['Enter', 2527.7],
    ['                                                     ', 0],
   
    ['i', 553.1],
    ['n', 307.3],
    ['s', 833.3],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],

    ['Enter', 727.7],
    ['                                                           ', 0],

    ['o', 455],
    ['u', 426.3],
    ['t', 754.7],
    ['s', 833.6],
    ['i', 379.6],
    ['d', 904.9],
    ['e', 967.6],
    ['.', 455],
    ['.', 455],
    ['.', 455],


];

