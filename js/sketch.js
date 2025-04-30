/*******************************************************
 * sketch.js
 * 
 * The primary p5 entry point. Contains the preload(),
 * setup(), draw(), windowResized(), and other top-level
 * drawing functions that define the "game loop".
 ******************************************************/

let canvasElement; // To hold the p5 canvas element
let introImage;

// State Management & Sticky Notes
let cornerSticky = null;
let zoomedSticky = null;
let allStickyImages = []; // Holds all loaded p5.Image objects

// Game State
window.gameState = "intro"; // Ensure gameState is globally accessible via window

// Helper function for shuffling arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function preload() {

    introImage = loadImage('images/background.png');

    // Define available sticky note numbers
    const availableStickies = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    // Shuffle the array to get random order
    shuffleArray(availableStickies);

    // Load all sticky images into allStickyImages array
    allStickyImages = []; // Clear before loading
    console.log("Loading sticky images...");
    for (const imgNum of availableStickies) {
        try {
            let img = loadImage(`images/stickies/sticky${imgNum}.png`);
            allStickyImages.push(img);
        } catch (error) {
            console.error(`Failed to load image images/stickies/sticky${imgNum}.png:`, error);
        }
    }
    console.log(`Loaded ${allStickyImages.length} sticky images.`);
    // stickyImages map is no longer needed with this approach
}

function setup() {

    window.gameState = "intro";

    //appendToArenaBlock('test');

    // Creates a canvas that fills the entire browser window
    canvasElement = createCanvas(windowWidth, windowHeight); // Store the canvas element

    // Set text properties
    textSize(textsize);
    textFont('Consolas');
    textLeading(leading);

    // Initialize color
    letterColor = color(25, 150, 25);

    const bottomRightX = width - stickySize - 20;
    const bottomRightY = height - stickySize - 20;

    // Initialize sticky state
    stickyQueue = [...allStickyImages]; // Copy all loaded images into the queue
    cornerSticky = null; // Will hold the Sticky object in the corner
    zoomedSticky = null; // Will hold the zoomed Sticky object

    // Set the first corner sticky if images are available
    if (stickyQueue.length > 0) {
        const firstImg = stickyQueue.shift(); // Take the first image from the queue
        if (firstImg) {
             cornerSticky = new Sticky(firstImg, bottomRightX, bottomRightY);
             console.log("Initial corner sticky set.");
        } else {
             console.error("First image from queue was undefined.");
        }
    } else {
        console.warn("No sticky images loaded or queue is empty, cannot set initial corner sticky.");
    }

    // Remove old stickies array initialization
    // stickies = [];
    // if (allStickyImages.length > 0) { ... } // Old logic removed
    // stickyQueue = []; // Old queue logic removed
    // for (let i = 1; i < allStickyImages.length; i++) { ... } // Old logic removed


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
    blinkingCursor = new Cursor();

    // calculate border inset
    borderInsetPixels = cmToPixels(0.65)
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
    // Use the same color transition logic as freeplay

    document.querySelector('.page-title').style.display = 'none';
    document.querySelector('.play-button').style.display = 'none'; // Hide play button too

    let { backgroundColor, textColor } = transitionColors();

    background(backgroundColor);
    drawBorder(backgroundColor);
    
    // Use letterColor for text - same as guided mode
    fill(letterColor);
    textAlign(CENTER, CENTER);
    
    noStroke();

    // Set smaller text size (80% of original size)
    textSize(textsize * 0.8);  
    textFont('Consolas');  // Use the same font as guided mode
    
    // Calculate vertical spacing based on the same leading value as guided mode
    let yPos = height / 2 - 270;  // Adjusted to center all content
    
    // Main title text - use formatting from guided mode
    textStyle(BOLD);
    text("Sally's Helpers", width / 2, yPos);
    yPos += leading * 1;  // Increased space after title
    
    textStyle(ITALIC);
    text("a distributed lament", width / 2, yPos);
    yPos += leading * 1;  // Adjusted space between subtitle and image
    
    // Draw the small PNG image directly below "a distributed lament"
    let imgHeight = 0;
    let isHoveringImage = false; // Flag to track hover state

    if (introImage) {
        // Define a reasonable size for the image (adjust as needed)
        const imgWidth = 150;  // Width in pixels
        imgHeight = imgWidth * (introImage.height / introImage.width);  // Keep aspect ratio

        // Calculate image position
        const imgX = width / 2;
        const imgY = yPos + imgHeight / 2;

        // Check if mouse is hovering over the image
        if (mouseX > imgX - imgWidth / 2 && mouseX < imgX + imgWidth / 2 &&
            mouseY > imgY - imgHeight / 2 && mouseY < imgY + imgHeight / 2) {
            isHoveringImage = true;
        }

        imageMode(CENTER);
        image(introImage, imgX, imgY, imgWidth, imgHeight);
        imageMode(CORNER);  // Reset to default mode
    }

    // Change canvas CSS style based on hover state
    if (isHoveringImage) {
        canvasElement.style('cursor', 'pointer'); // Set CSS cursor to pointer
    } else {
        canvasElement.style('cursor', 'default'); // Reset CSS cursor to default
    }

    // Update yPos after image to continue the text below it
    yPos += imgHeight + leading * 3;  // Adjust yPos after image
    
    // Description text
    textStyle(NORMAL);
    text("This experience requires sound, a keyboard, and your attention.", width / 2, yPos);
    yPos += leading * 1  // Slightly more space before the requirements list
    
    // Requirements list
    textStyle(ITALIC);
    text("Please wear headphones and switch to fullscreen [F11], if possible.", width / 2, yPos);
    yPos += leading * 2;  // More space between requirement and call to action
    
    // Call to action - use bold for emphasis
    textStyle(BOLD);
    text("When you are ready, press any key to begin.", width / 2, yPos);
    yPos += leading * 2;  // Add space before the image

    textStyle(NORMAL);
}

function loadGuided() {
    // Initialize guided mode variables
    guidedStartTime = millis();
    guidedCurrentNoteIndex = 0;
    guidedNextNoteTime = guidedStartTime + 2000; // Wait 2 seconds before starting
    guidedSequenceComplete = false;
    guidedEndTime = 0;

     // Add this line to update the global gameState variable
     window.gameState = "guided";

    // Reset guided mode text display
    guidedTypedText = "";
    guidedLetterX = margin / 2 + 60;
    guidedLetterY = margin / 2 + 60;

    // Initialize scrolling for guided mode
    scrollOffset = 0;

    // Clear any existing typed letters
    typedLetters = [];
    letters = "";
    numberOfEnters = 0;
}

function drawGuided() {

    document.querySelector('.page-title').style.display = 'none';
    document.querySelector('.play-button').style.display = 'none'; // Hide play button

    let { backgroundColor, textColor } = transitionColors();

    background(backgroundColor);

    // Display existing typed letters (same as freeplay)
    for (let i = 0; i < typedLetters.length; i++) {
        typedLetters[i].update();
        typedLetters[i].display(0, -scrollOffset); // Apply scroll offset
    }

    // Display cursor at current position
    blinkingCursor.update();
   //
   // blinkingCursor.display(guidedLetterX, guidedLetterY - scrollOffset);

    const currentTime = millis();

    // Play through the note sequence
    if (!guidedSequenceComplete) {
        if (guidedCurrentNoteIndex < guidedNoteSequence.length) {
            // Time to play the next note?
            if (currentTime >= guidedNextNoteTime) {
                // Get the character and duration
                const [char, duration] = guidedNoteSequence[guidedCurrentNoteIndex];

                // Skip shift key presses
                if (char !== 'Shift') {
                    // Handle Enter character
                    if (char === 'Enter') {
                        guidedLetterX = margin / 2 + 60;
                        guidedLetterY += leading;
                        letters += '\n';
                        numberOfEnters++;

                        checkAndScrollCanvas();

                    } else if (char === 'Backspace') {
                        // Handle backspace by removing the last character
                        if (letters.length > 0) {
                            // Remove the last character from the display text
                            guidedTypedText = guidedTypedText.slice(0, -1);
                            letters = letters.slice(0, -1);

                            // Remove the last typed letter from visualization
                            if (typedLetters.length > 0) {
                                typedLetters.pop();
                            }

                            // Update cursor position
                            if (guidedLetterX > margin / 2 + 60) {
                                guidedLetterX -= textWidth(letters.slice(-1));
                            } else if (numberOfEnters > 0) {
                                // If we're at the start of a line, move up a line
                                numberOfEnters--;
                                guidedLetterY -= leading;
                                // Find the last line's width
                                const lastNewlineIndex = letters.lastIndexOf('\n');
                                const lastLine = letters.slice(lastNewlineIndex + 1);
                                guidedLetterX = margin / 2 + 60 + textWidth(lastLine);
                            }
                        }
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

                            checkAndScrollCanvas();

                        }
                    }

                    // If the character is in the notes map, play the note
                    if (char in notesMap) {
                        playNote(notesMap[char]);
                    }
                }

                // Set up for the next note
                guidedCurrentNoteIndex++;
                // Use duration directly if in milliseconds, convert to milliseconds if in seconds
                guidedNextNoteTime = currentTime + (useMilliseconds ? duration : duration * 1000);
            }
        } else {
            // All notes have been played
            guidedSequenceComplete = true;
            guidedEndTime = currentTime + 3000; // Wait 3 more seconds before continuing
        }
    }

    if (guidedSequenceComplete) {
        // Use the same color transition logic as elsewhere
        let { backgroundColor, textColor } = transitionColors();
        
        // Clear the screen first with push/pop to isolate styling changes
        push();
        background(backgroundColor);
        drawBorder(backgroundColor);
        
        // Reset all text formatting to ensure clean centering
        textAlign(CENTER, CENTER);
        textFont('Consolas');
        textSize(textsize * 0.8);
        fill(letterColor);
        noStroke();
        textStyle(NORMAL);
        
        // Type out the text one character at a time
        if (currentChar < fullMessage.length) {
            if (millis() - lastTypedTime > typingSpeed) {
                typingText += fullMessage.charAt(currentChar);
                currentChar++;
                lastTypedTime = millis();
            }
        } else if (!showContinuePrompt) {
            // Show "Press any key to continue" after the full message is typed
            showContinuePrompt = true;
        }
        
        // First split by explicit line breaks
        let paragraphs = typingText.split('\n');
        let lines = [];
        
        // Then handle word wrapping within each paragraph
        for (let paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                // Add empty line for paragraph breaks
                lines.push('');
                continue;
            }
            
            let words = paragraph.split(' ');
            let currentLine = "";
            
            // Create lines of reasonable length
            for (let word of words) {
                if (currentLine.length + word.length + 1 <= 95) { // adjust line length as needed 
                    currentLine += (currentLine === "" ? "" : " ") + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine !== "") {
                lines.push(currentLine);
            }
        }
        
        // Calculate vertical spacing and center the text block
        let lineHeight = textsize * 1.3;
        let totalHeight = lines.length * lineHeight;
        let startY = (height - totalHeight) / 2;
        
        // Draw each line centered
        for (let i = 0; i < lines.length; i++) {
            text(lines[i], width / 2, startY + i * lineHeight);
        }
        
        // Add blinking cursor after the text if still typing
        if (currentChar < fullMessage.length) {
            let lastLine = lines[lines.length - 1];
            let cursorX = width / 2 + textWidth(lastLine) / 2 + 5;
            let cursorY = startY + (lines.length - 1) * lineHeight;
            
            // Cursor logic would go here
        }
        
        // Show "Press any key to continue" after the message is fully typed
        if (showContinuePrompt) {
            textStyle(BOLD);
            text("Press any key to continue", width / 2, startY + totalHeight + lineHeight * 2);
        }
        
        pop();
        
        // Check for key press to advance to freeplay (only after message is fully typed)
        if (showContinuePrompt && keyIsPressed) {
            gameState = "freeplay";
            loadFreeplay();
        }
    }
    drawBorder(backgroundColor);
}

function loadFreeplay() {

    window.gameState = "freeplay";

    letters = "";
    typedLetters = [];
    numberOfEnters = 0;
    scrollOffset = 0;
    currentHintTextIndex = 0;  // Reset to the first hint text
    lastSentIndex = 0; // Initialize index for Arena tracking

    cursorCeiling = margin / 2 + 60;

    // Set the initial hint text position
    hintTextPositions = [margin / 2 + 60]; // Start the first hint at the top margin
}

function drawFreeplay() {
    document.querySelector('.page-title').style.display = 'none'; // CORRECTED: Hide title in freeplay
    document.querySelector('.play-button').style.display = 'none';

    // Gradually transition colors
    let { backgroundColor, textColor } = transitionColors();

    background(backgroundColor);
    // drawBorder(backgroundColor);

    // --- Start Sticky Drawing ---
    // Draw the corner sticky first (if it exists)
    if (cornerSticky) {
        cornerSticky.update(); // Assume update handles hover effects etc.
        cornerSticky.display();
    }

    // Draw the zoomed sticky on top (if it exists)
    if (zoomedSticky) {
        // Ensure zoomed sticky displays correctly (may need specific logic in Sticky class)
        zoomedSticky.update(); // Update position/size for zoom effect
        zoomedSticky.display();
    }
    // --- End Sticky Drawing ---

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
    let cursorX = margin / 2 + 60 + textWidth(lineText);
    let cursorY = margin / 2 + 60 + numberOfEnters * leading;

    // Check if we need to wrap to next line based on freeplay width limit
    if (cursorX > width * MAX_TEXT_WIDTH_PERCENTAGE_FREEPLAY) {
        cursorX = margin / 2 + 60;
        cursorY += leading;
        letters += '\n';
        numberOfEnters++;
    }

    // do not let cursor go above the ceiling
    if (cursorY < cursorCeiling) {
        cursorY = cursorCeiling;
    }

    // Update & display the cursor
    blinkingCursor.update();
    blinkingCursor.display(cursorX, cursorY - scrollOffset);

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
    // Use MAX_TEXT_WIDTH_PERCENTAGE_FREEPLAY to ensure text doesn't go into sticky area
    text(sallyHintText[currentHintTextIndex], margin / 2 + 60, currentHintY - scrollOffset,
        width * MAX_TEXT_WIDTH_PERCENTAGE_FREEPLAY - margin, height * 5);

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

// Enforce a minimum contrast ratio by adjusting text color while keeping it green-ish
if (contrastRatio < 4.5) {
    let adjustment = brightness > 127 ? -40 : 40;  // Make text darker or lighter
    textColor[0] = constrain(textColor[0] + adjustment, 0, 100);  // R channel (keep low to stay green)
    textColor[1] = constrain(textColor[1] + adjustment, 80, 255); // G channel (mainly adjust this)
    textColor[2] = constrain(textColor[2] + adjustment, 0, 100);  // B channel (keep low to stay green)
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

function checkAndScrollCanvas() {
    // Calculate visible area (adjust these values based on your layout)
    const visibleAreaBottom = height - borderInsetPixels - 120;
    
    // Check if text position is going below the visible area
    if (guidedLetterY - scrollOffset > visibleAreaBottom) {
        // Adjust scrollOffset to keep text in view
        scrollOffset = guidedLetterY - visibleAreaBottom + (leading / 2);
    }
}
  
function mouseMoved() {
    // Check hover state for all stickies
    for (let sticky of stickies) {
        sticky.checkHover(mouseX, mouseY);
    }
}

function mousePressed() {
    // Handle intro click specifically for the image
    if (gameState === "intro") {
        // Calculate image bounds based on drawIntro logic
        const imgWidth = 150;
        const imgHeight = imgWidth * (introImage.height / introImage.width);
        const imgX = width / 2;
        // Approximate Y position calculation from drawIntro
        let yPos = height / 2 - 270;
        yPos += leading * 1; // After "Sally's Helpers"
        yPos += leading * 1; // After "a distributed lament"
        const imgY = yPos + imgHeight / 2; // Center Y of the image

        if (mouseX > imgX - imgWidth / 2 && mouseX < imgX + imgWidth / 2 &&
            mouseY > imgY - imgHeight / 2 && mouseY < imgY + imgHeight / 2) {
            console.log("Intro image clicked, redirecting to info.html");
            window.location.href = "info.html";
            return; // Prevent further actions
        }
        // If not clicking the image during intro, do nothing else in mousePressed
        return;
    }

    // Only handle sticky clicks if in freeplay mode
    if (gameState !== "freeplay") {
        return;
    }

    const bottomRightX = width - stickySize - 20;
    const bottomRightY = height - stickySize - 20;

    // 1. Check click on ZOOMED sticky first
    if (zoomedSticky && zoomedSticky.checkClick(mouseX, mouseY)) {
        console.log("Clicked zoomed sticky. Unzooming.");
        // Action: Unzoom the sticky. It becomes the new corner sticky.
        // The *old* corner sticky goes back into the queue.

        // Put the image from the current corner sticky back into the queue (if one exists)
        if (cornerSticky && cornerSticky.img) {
            stickyQueue.push(cornerSticky.img);
            shuffleArray(stickyQueue); // Keep the queue randomized
            console.log("Added old corner image back to queue.");
        } else {
            console.log("No corner sticky existed to return to queue.");
        }

        // Make the previously zoomed sticky the new corner sticky
        zoomedSticky.isZoomed = false; // Update its state
        // Reset its position to the corner (Sticky class might handle this based on isZoomed)
        zoomedSticky.x = bottomRightX;
        zoomedSticky.y = bottomRightY;
        cornerSticky = zoomedSticky; // It's now the corner sticky
        zoomedSticky = null; // Nothing is zoomed anymore
        Sticky.currentlyZoomed = null; // Update static tracker if used

        console.log("Unzoom complete. New corner sticky is set.");
        return; // Click handled
    }

    // 2. Check click on CORNER sticky (only if not clicking zoomed)
    if (cornerSticky && cornerSticky.checkClick(mouseX, mouseY)) {
        console.log("Clicked corner sticky. Zooming.");
        // Action: Zoom the corner sticky. Get a new corner sticky from the queue.

        const clickedCornerSticky = cornerSticky;

        // Promote the corner sticky to zoomed state
        clickedCornerSticky.isZoomed = true;
        // Let the Sticky class handle visual zoom animation/positioning
        zoomedSticky = clickedCornerSticky;
        Sticky.currentlyZoomed = zoomedSticky; // Update static tracker if used

        // Get the next image from the queue for the new corner sticky
        if (stickyQueue.length > 0) {
            const newCornerImg = stickyQueue.shift();
            cornerSticky = new Sticky(newCornerImg, bottomRightX, bottomRightY);
            console.log("Set new corner sticky from queue.");
        } else {
            // Queue is empty. Refill it with all available images *except* the one currently zoomed.
            console.log("Queue empty. Refilling...");
            stickyQueue = []; // Clear just in case
            for (const img of allStickyImages) {
                // Add all images that aren't the one we just zoomed
                if (img !== zoomedSticky.img) {
                    stickyQueue.push(img);
                }
            }
            shuffleArray(stickyQueue); // Randomize the refilled queue

            // Try to get a new corner sticky again after refill
            if (stickyQueue.length > 0) {
                const newCornerImg = stickyQueue.shift();
                cornerSticky = new Sticky(newCornerImg, bottomRightX, bottomRightY);
                console.log("Set new corner sticky after refill.");
            } else {
                // This happens if there was only 1 image total.
                cornerSticky = null; // No possible corner sticky
                console.warn("Could not set new corner sticky after refill (only 1 image available?).");
            }
        }
        return; // Click handled
    }

    // Optional: Log if a click happened but didn't hit either interactive sticky
    // console.log("Mouse press in freeplay, but not on corner or zoomed sticky.");
}