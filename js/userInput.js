/*******************************************************
 * userInput.js
 *
 * Contains all keyboard event handlers:
 *   keyPressed(), keyTyped(), etc.
 ******************************************************/

// Prevent Firefox from opening search bar on apostrophe
document.addEventListener('keydown', function (event) {
    if (event.key === "'") {
        event.preventDefault();
        keyTypedHandler("'");
    }
});

function keyPressed() {
    // Unlock audio on first key press
    if (!audioStarted) {
        userStartAudio();
        audioStarted = true;
    }

    preventTyping = false;

    switch (gameState) {
        case "intro":
            handleIntroKeyPressed();
            break;
        case "freeplay":
            handleStoryKeyPressed();
            break;
    }

    // Toggle game states with 1,2,3,4 (example usage)
    if (key === '1') {
        gameState = "intro";
        preventTyping = true;
        return;
    } else if (key === '2') {
        gameState = "guided";
        loadGuided();
        preventTyping = true;
        return;
    } else if (key === '3') {
        gameState = "freeplay";
        loadFreeplay();
        preventTyping = true;
        return;
    }
}

function keyTyped() {
    if (preventTyping) {
        preventTyping = false;
        return;
    }

    switch (gameState) {
        case "intro":
            // do nothing special
            break;
        case "freeplay":
            // diagnostic logging
            if (!startedTyping) {
                console.log("started typing");
                startedTyping = true;
                timeStarted = millis();
                console.log("key: " + key + ", timing: " + 0);
            } else {
                let timeNow = millis();
                console.log("key: " + key + ", timing: " + (timeNow - timeStarted));
                timeStarted = timeNow;
            }
            handleStoryKeyTyped();
            break;
    }
}

// For timing log
let startedTyping = false;
let timeStarted = 0;

function handleIntroKeyPressed() {
    // If any key is pressed (other than 1..4) => go to freeplay
    if (key !== '1' && key !== '2' && key !== '3' && key !== '4') {
        gameState = "guided";
        loadGuided();
        preventTyping = true;
    }
}

function handleStoryKeyPressed() {
    // Only log timing for special keys (Backspace, Enter, etc.)
    if (key === 'Backspace' || key === 'Enter' || key === 'Return' || keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
        if (!startedTyping) {
            console.log("started typing");
            startedTyping = true;
            timeStarted = millis();
            console.log("special key: " + key + ", timing: " + 0);
        } else {
            let timeNow = millis();
            console.log("special key: " + key + ", timing: " + (timeNow - timeStarted));
            timeStarted = timeNow;
        }
    }

    // console.log("story keyPressed: " + key);
    if (key === 'Backspace') {
        // Prevent backspacing past a completed hint text section
        if (letters.length > 0) {
            // Check if we're at a point where we're about to delete a completed hint
            let twoNewlinesPattern = "\n\n";
            let lastTwoNewlines = letters.lastIndexOf(twoNewlinesPattern);

            // If we're at the beginning of a new hint text section
            if (lastTwoNewlines !== -1 && letters.length - lastTwoNewlines === 2) {
                // Don't allow backspacing that would delete a completed hint section
                if (currentHintTextIndex > 0) {
                    currentHintTextIndex--;
                }
                return;
            }

            // If we're at the start of a line (after a newline)
            if (letters.slice(-1) === '\n') {
                // Just remove the newline
                letters = letters.slice(0, -1);
                numberOfEnters--;

                // Recalculate scroll when moving up a line
                if (typedLetters.length > 0) {
                    let lastLetter = typedLetters[typedLetters.length - 1];
                    let currentY = lastLetter.y - scrollOffset;
                    if (currentY < height * SCROLL_THRESHOLD) {
                        scrollOffset = Math.max(0, lastLetter.y - (height * SCROLL_THRESHOLD));
                    }
                }
            } else {
                // Remove last TypedLetter and character
                typedLetters.pop();
                letters = letters.slice(0, -1);
            }
        }
    }
    else if (keyCode === UP_ARROW) {
        globalNoteShift += 12;
        if (globalNoteShift > maxNoteShift) {
            globalNoteShift = maxNoteShift;
        }
    }
    else if (keyCode === DOWN_ARROW) {
        globalNoteShift -= 12;
        if (globalNoteShift < -maxNoteShift) {
            globalNoteShift = -maxNoteShift;
        }
    }
    else if (key === 'Enter' || key === 'Return') {
        letters += "\n";
        numberOfEnters++;

        // Calculate new cursor position after Enter
        let newY = margin / 2 + 60 + numberOfEnters * leading;
        let currentY = newY - scrollOffset;

        // Check if we need to scroll
        if (currentY > height * SCROLL_THRESHOLD) {
            let scrollAmount = currentY - (height * SCROLL_THRESHOLD);
            scrollOffset += scrollAmount;
        }
    }
    else if (key in notesMap) {
        if (synth) {
            playNote(notesMap[key]);
            lastNote = notesMap[key]; // Store the last note played
        } else {
            console.error("synth is undefined");
        }
    }
    else if (key === ',' || key === '.') {
        if (lastNote && synth) {
            playNote(lastNote); // Replay the last note
        }
    }
}

function handleStoryKeyTyped() {
    if (key !== 'Enter' && key !== 'Return') {
        keyTypedHandler(key);
    }
}

function keyTypedHandler(typedChar) {
    // Avoid capturing 1..4 used for state switching
    if (typedChar === '1' || typedChar === '2' ||
        typedChar === '3' || typedChar === '4') {
        return;
    }

    letters += typedChar;

    textSize(textsize);

    let lastNewlineIndex = letters.lastIndexOf('\n');
    let lineText = lastNewlineIndex === -1
        ? letters
        : letters.slice(lastNewlineIndex + 1);

    // x position = left margin + textWidth of current line so far
    let x = margin / 2 + 60 + textWidth(lineText.slice(0, -1));
    // y position = top margin + #enters * line spacing
    let y = margin / 2 + 60 + numberOfEnters * leading;

    // Check if the text width exceeds the max width percentage
    if (textWidth(lineText) > width * MAX_TEXT_WIDTH_PERCENTAGE) {
        letters += '\n';
        numberOfEnters++;
        x = margin / 2 + 60;
        y += leading;
    }

    // Check if we need to scroll
    let currentY = y - scrollOffset;
    if (currentY > height * SCROLL_THRESHOLD) {
        // Calculate how much we need to scroll
        let scrollAmount = currentY - (height * SCROLL_THRESHOLD);
        scrollOffset += scrollAmount;
    }

    // Create the TypedLetter at the calculated position
    typedLetters.push(new TypedLetter(typedChar, x, y));

    // Check if the user has fully typed the current hint text
    // Create a string from the typed letters
    let typedText = "";
    for (let i = 0; i < typedLetters.length; i++) {
        typedText += typedLetters[i].letter;
    }

    // Get the current hint text without any extra spaces or newlines
    let currentHint = "";
    if (sallyHintText && sallyHintText.length > 0 && currentHintTextIndex < sallyHintText.length) {
        currentHint = sallyHintText[currentHintTextIndex].trim();
    }

    // Only check the most recent typed characters, not the entire history
    // This prevents false matches with earlier hint text content
    let recentTypedText = typedText;
    if (typedText.length > currentHint.length * 2) {
        recentTypedText = typedText.slice(-currentHint.length * 2);
    }

    // Check if the entire current hint text has been typed
    // Allow for some extra characters (since users might add spaces, etc.)
    if (recentTypedText.length >= currentHint.length && recentTypedText.includes(currentHint)) {
        // Move to the next hint text
        if (currentHintTextIndex < sallyHintText.length - 1) {
            currentHintTextIndex++;

            // Insert two newlines to position the next hint text below
            letters += "\n\n";
            numberOfEnters += 2;

            // We keep all the existing typed letters, but need to mark where the next hint begins
            // This will be used for backspace handling
            let nextHintStartIndex = typedLetters.length;

            // Update cursor position for the next hint text
            let newY = margin / 2 + 60 + numberOfEnters * leading;

            // Update scroll position if needed
            let currentY = newY - scrollOffset;
            if (currentY > height * SCROLL_THRESHOLD) {
                scrollOffset += currentY - (height * SCROLL_THRESHOLD);
            }
        }
    }
}