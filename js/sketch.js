/*******************************************************
 * sketch.js
 * 
 * The primary p5 entry point. Contains the preload(),
 * setup(), draw(), windowResized(), and other top-level
 * drawing functions that define the "game loop".
 ******************************************************/

function preload() {
    // Attempt to load your background image
    backgroundImg = loadImage('background.png',
        img => {
            console.log("Image loaded successfully");
        },
        err => {
            console.error("Error loading image:", err);
            backgroundImg = null;
        }
    );
}

function setup() {
    // Creates a canvas that fills the entire browser window
    createCanvas(windowWidth, windowHeight);
    currentGreenShade = color(25, 150, 25);

    // Set text properties
    textSize(textsize);
    textFont('Consolas');
    textLeading(leading);

    // p5.PolySynth
    synth = new p5.PolySynth();

    // Envelope
    envelope = new p5.Envelope();
    envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

    // Delay
    delay = new p5.Delay();

    // Distortion
    distortion = new p5.Distortion(0.0, '2x');
    distortion.process(synth.output);

    // Create the blinking cursor
    cursor = new Cursor();
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

function drawIntro() {
    background(0);
    fill(255);
    textSize(textsize);
    textAlign(CENTER, CENTER);

    // Simple prompt
    textSize(20);
    text("press any key", width / 2 + 760, height / 2 + 190);
}

function loadFreeplay() {
    letters = "";
    typedLetters = [];
    numberOfEnters = 0;

    cursorCeiling = margin / 2 + 60;
}

function drawFreeplay() {
    noStroke();

    // If enough letters are typed, enable wiggling
    if (typedLetters.length >= int(sallyHintText.length * percentageToStartWiggle)) {
        for (let i = 0; i < typedLetters.length; i++) {
            typedLetters[i].wiggle = true;
        }
    }

    // Gradually transition background & text colors
    transitionColors();

    // Print out the big text chunk in the background
    fill(255, 255, 255, hintTextOpacity);
    textAlign(LEFT, TOP);
    textSize(textsize);
    text(sallyHintText, margin / 2 + 60, margin / 2 + 60, width - margin, height * 5);

    // Update & display typed letters
    for (let i = 0; i < typedLetters.length; i++) {
        typedLetters[i].update();
        typedLetters[i].display();
    }

    // Cursor position calculation
    let lastNewlineIndex = letters.lastIndexOf('\n');
    let lineText = lastNewlineIndex === -1 ? letters : letters.slice(lastNewlineIndex + 1);
    let cursorX = margin / 2 + 60 + textWidth(lineText);
    let cursorY = margin / 2 + 60 + numberOfEnters * leading;

    // do not let cursor go above the ceiling
    if (cursorY < cursorCeiling) {
        cursorY = cursorCeiling;
    }

    // Update & display the cursor
    cursor.update();
    cursor.display(cursorX, cursorY);

    // Render typed "particles"
    renderVisualEffects();
}

function transitionColors() {
    // Slowly transition background and text colors
    colorTransitionTime += 0.0005;

    let t = sin(colorTransitionTime) * 0.5 + 0.5;

    let bgColor = [
        lerp(bgColorStart[0], bgColorEnd[0], t),
        lerp(bgColorStart[1], bgColorEnd[1], t),
        lerp(bgColorStart[2], bgColorEnd[2], t)
    ];

    let textColor = [
        lerp(textColorStart[0], textColorEnd[0], t),
        lerp(textColorStart[1], textColorEnd[1], t),
        lerp(textColorStart[2], textColorEnd[2], t)
    ];

    // Check contrast ratio:
    let brightness = (bgColor[0] * 299 + bgColor[1] * 587 + bgColor[2] * 114) / 1000;
    let textBrightness = (textColor[0] * 299 + textColor[1] * 587 + textColor[2] * 114) / 1000;
    let contrastRatio = (Math.max(brightness, textBrightness) + 0.05) / (Math.min(brightness, textBrightness) + 0.05);

    if (contrastRatio < 4.5) {
        // Attempt to boost or reduce text color while maintaining green hue
        if (brightness > textBrightness) {
            textColor[0] = Math.max(0, textColor[0] * 0.5);
            textColor[1] = Math.max(0, textColor[1] * 0.5);
            textColor[2] = Math.max(0, textColor[2] * 0.5);
        } else {
            textColor[0] = Math.min(255, textColor[0] * 1.5);
            textColor[1] = Math.min(255, textColor[1] * 1.5);
            textColor[2] = Math.min(255, textColor[2] * 1.5);
        }
    }

    background(bgColor[0], bgColor[1], bgColor[2]);
    fill(textColor[0], textColor[1], textColor[2]);
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
    // Example debugging if you want:
    // text("Level: " + levelText + " (change with keys 1-4)", x, y - 0);
    // text("Global Note Shift: " + globalNoteShift, x, y - 20);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
