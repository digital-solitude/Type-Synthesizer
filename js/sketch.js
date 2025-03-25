/*******************************************************
 * sketch.js
 * 
 * The primary p5 entry point. Contains the preload(),
 * setup(), draw(), windowResized(), and other top-level
 * drawing functions that define the "game loop".
 ******************************************************/

function preload() {

}

function setup() {
    appendToArenaBlock('test'); 

    // Creates a canvas that fills the entire browser window
    createCanvas(windowWidth, windowHeight);

    // Set text properties
    textSize(textsize);
    textFont('Consolas');
    textLeading(leading);

    // Initialize color
    letterColor = color(25, 150, 25);

    // p5.PolySynth
    try {
        if (typeof p5.PolySynth === 'undefined') {
            console.error('p5.sound library not loaded properly. PolySynth is undefined.');
            alert('Audio components failed to load. Please refresh the page or check console for errors.');
        } else {
            synth = new p5.PolySynth();
            console.log('Synthesizer initialized successfully');
        }
    } catch (e) {
        console.error('Error initializing synthesizer:', e);
        alert('Audio components failed to load. Please refresh the page or check console for errors.');
    }

    // Envelope
    try {
        if (typeof p5.Envelope !== 'undefined') {
            envelope = new p5.Envelope();
            envelope.setADSR(attackTime, 0.1, 0.5, 0.5);
        } else {
            console.error('p5.sound library not loaded properly. Envelope is undefined.');
        }
    } catch (e) {
        console.error('Error initializing envelope:', e);
    }

    // Delay
    try {
        if (typeof p5.Delay !== 'undefined') {
            delay = new p5.Delay();
        } else {
            console.error('p5.sound library not loaded properly. Delay is undefined.');
        }
    } catch (e) {
        console.error('Error initializing delay:', e);
    }

    // Distortion
    try {
        if (typeof p5.Distortion !== 'undefined') {
            distortion = new p5.Distortion(0.0, '2x');
            if (synth && synth.output) {
                distortion.process(synth.output);
            }
        } else {
            console.error('p5.sound library not loaded properly. Distortion is undefined.');
        }
    } catch (e) {
        console.error('Error initializing distortion:', e);
    }

    // Create the blinking cursor
    cursor = new Cursor();

    // calculate border inset
    borderInsetPixels = cmToPixels(1);
}

function draw() {
    switch (gameState) {
        case "intro":
            drawIntro();
            break;
        case "guided":
            drawGuided();
            break;
        case "freeplay":
            drawFreeplay();
            break;
    }
    drawDiagnostic();
}

function drawBorder(backgroundColor) {
    // draw background color rectangles so that outside the border is the background color
    fill(backgroundColor);
    noStroke();
    rect(0, 0, width, borderInsetPixels);
    rect(0, 0, borderInsetPixels, height);
    rect(width - borderInsetPixels, 0, borderInsetPixels, height);
    rect(0, height - borderInsetPixels, width, borderInsetPixels);

    // draw a border around the screen, 2px wide #a31caf, inset from the edges by 1cm
    noFill();
    stroke(163, 28, 175);
    strokeWeight(2);
    rect(borderInsetPixels, borderInsetPixels, width - borderInsetPixels * 2, height - borderInsetPixels * 2);
}

function drawIntro() {
    background(0);

    fill(255);
    textAlign(CENTER, CENTER);
    // Simple prompt
    textSize(20);
    text("press any key", width / 2, height / 2);

    drawBorder(color(0, 0, 0));
}

function loadGuided() {
    // Initialize guided mode variables
    guidedStartTime = millis();
    guidedCurrentNoteIndex = 0;
    guidedNextNoteTime = guidedStartTime + 2000; // Wait 2 seconds before starting
    guidedSequenceComplete = false;
    guidedEndTime = 0;

    // Reset guided mode text display
    guidedTypedText = "";
    guidedLetterX = margin / 2 + 60;
    guidedLetterY = margin / 2 + 60;

    // Clear any existing typed letters
    typedLetters = [];
    letters = "";
    numberOfEnters = 0;
}

function drawGuided() {
    background(0);

    // Display existing typed letters (same as freeplay)
    for (let i = 0; i < typedLetters.length; i++) {
        typedLetters[i].update();
        typedLetters[i].display();
    }

    // Display cursor at current position
    cursor.update();
    cursor.display(guidedLetterX, guidedLetterY);

    const currentTime = millis();

    // Play through the note sequence
    if (!guidedSequenceComplete) {
        if (guidedCurrentNoteIndex < guidedNoteSequence.length) {
            // Time to play the next note?
            if (currentTime >= guidedNextNoteTime) {
                // Get the character and duration
                const [char, duration] = guidedNoteSequence[guidedCurrentNoteIndex];

                // Handle Enter character
                if (char === 'Enter') {
                    guidedLetterX = margin / 2 + 60;
                    guidedLetterY += leading;
                    letters += '\n';
                    numberOfEnters++;
                } else {
                    // Add character to display text
                    guidedTypedText += char;
                    letters += char;

                    // Create a TypedLetter for visualization
                    textSize(textsize);
                    typedLetters.push(new TypedLetter(char, guidedLetterX, guidedLetterY));

                    // Update position for next letter
                    guidedLetterX += textWidth(char);

                    // Check if we need to wrap to next line
                    if (guidedLetterX > width * MAX_TEXT_WIDTH_PERCENTAGE) {
                        guidedLetterX = margin / 2 + 60;
                        guidedLetterY += leading;
                        letters += '\n';
                        numberOfEnters++;
                    }
                }

                // If the character is in the notes map, play the note
                if (char in notesMap) {
                    playNote(notesMap[char]);
                }

                // Set up for the next note
                guidedCurrentNoteIndex++;
                guidedNextNoteTime = currentTime + (duration * 1000);
            }
        } else {
            // All notes have been played
            guidedSequenceComplete = true;
            guidedEndTime = currentTime + 3000; // Wait 3 more seconds before continuing
        }
    }

    // Handle the waiting period after the sequence is complete
    if (guidedSequenceComplete) {
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text("Sequence complete! Moving to freeplay mode...", width / 2, height / 2 + 100);

        // After 3-second wait, advance to freeplay
        if (currentTime >= guidedEndTime) {
            gameState = "freeplay";
            loadFreeplay();
        }
    }

    drawBorder(color(0, 0, 0));

}

function loadFreeplay() {
    letters = "";
    typedLetters = [];
    numberOfEnters = 0;
    scrollOffset = 0;
    currentHintTextIndex = 0;  // Reset to the first hint text

    cursorCeiling = margin / 2 + 60;
    
    // Set the initial hint text position
    hintTextPositions = [margin / 2 + 60]; // Start the first hint at the top margin
}

function drawFreeplay() {

    // Gradually transition colors
    let { backgroundColor, textColor } = transitionColors();

    background(backgroundColor);

    // If enough letters are typed, enable wiggling
    if (sallyHintText && sallyHintText.length > 0 && currentHintTextIndex < sallyHintText.length) {
        if (typedLetters.length >= int(sallyHintText[currentHintTextIndex].length * percentageToStartWiggle)) {
            for (let i = 0; i < typedLetters.length; i++) {
                typedLetters[i].wiggle = true;
            }
        }
    }

    // Calculate position for the current hint text
    // It should be at the current cursor position
    let hintTextY = margin / 2 + 60 + numberOfEnters * leading;
    
    // Display all hint texts - completed ones and the current one being typed
    displayHintTexts();

    // Update & display typed letters
    for (let i = 0; i < typedLetters.length; i++) {
        typedLetters[i].update();
        typedLetters[i].display();
    }

    // Calculate cursor position
    let lastNewlineIndex = letters.lastIndexOf('\n');
    let lineText = lastNewlineIndex === -1 ? letters : letters.slice(lastNewlineIndex + 1);
    //console.log("lineText: " + lineText);
    let cursorX = margin / 2 + 60 + textWidth(lineText);
    let cursorY = margin / 2 + 60 + numberOfEnters * leading;

    // do not let cursor go above the ceiling
    if (cursorY < cursorCeiling) {
        cursorY = cursorCeiling;
    }

    // Update & display the cursor
    cursor.update();
    cursor.display(cursorX, cursorY - scrollOffset);

    drawBorder(backgroundColor);

}

// Function to display all hint texts
function displayHintTexts() {
    noStroke();
    fill(255, 255, 255, hintTextOpacity);
    textAlign(LEFT, TOP);
    textSize(textsize);
    
    // Display the current hint text only
    let currentHintY = margin / 2 + 60 + numberOfEnters * leading;
    text(sallyHintText[currentHintTextIndex], margin / 2 + 60, currentHintY - scrollOffset, width - margin, height * 5);
    
    // We don't need to display completed hint texts separately since they're already visible as typed letters
    // The previous version was causing duplicate text to appear
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
    
    // Return the calculated colors
    return {
        backgroundColor: color(bgColor[0], bgColor[1], bgColor[2]),
        textColor: color(textColor[0], textColor[1], textColor[2])
    };
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
        case "guided":
            levelText = "Guided";
            break;
        case "freeplay":
            levelText = "Freeplay";
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


function appendToArenaBlock(text) {
    fetch('arena.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ append_text: text })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Updated block data:', data);
    })
    .catch(err => console.error('Error updating block:', err));
}
  

function cmToPixels(cm) {
    // Get screen DPI using a hidden div method
    let div = document.createElement("div");
    div.style.width = "1in"; // Set width to 1 inch
    div.style.visibility = "hidden"; // Hide the element
    document.body.appendChild(div);
    let dpi = div.offsetWidth; // Measure pixel width of 1 inch
    document.body.removeChild(div); // Clean up

    return cm * (dpi / 2.54); // Convert cm to pixels
}
