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
        gameState = "freeplay";
        preventTyping = true;
    }
}

function handleStoryKeyPressed() {
    console.log("story keyPressed: " + key);
    if (key === 'Backspace') {
        // Remove last TypedLetter
        typedLetters.pop();
        // Remove last character from letters
        letters = letters.slice(0, -1);
        // If last character was newline
        if (letters.slice(-1) === '\n') {
            numberOfEnters--;
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
    spawnVisualEffect(typedChar);

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

    typedLetters.push(new TypedLetter(typedChar, x, y));
    // console.log(`Added letter: ${typedChar}, x: ${x}, y: ${y}`);
}
