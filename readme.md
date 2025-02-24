Collecting workspace information# Type Synthesizer

This project is a simple synthesizer built using the p5.js library and the p5.sound library. It allows users to play musical notes by typing specific keys on their keyboard. The typed keys are also displayed on the screen.

## How to Use

1. **Open the Project:**
   - Open this project in your browser using a web server (e.g., VSCode Live Server or another local server).

2. **Start the Audio Context:**
   - Click or press a key to allow the browser to start the audio context (some browsers need a user interaction before playing sound).

3. **Play Notes:**
   - Type keys that correspond to notes to hear the synth. The typed keys also get printed on the screen.

4. **Adjust Settings:**
   - Use arrow keys (UP, DOWN, LEFT, RIGHT) to change the attack time (ADSR) or the delay time.

5. **Resize the Window:**
   - Resize your browser window — the canvas will automatically resize.

## Project Structure

```
index.html
sketch.js
style.css
```

### index.html

This file sets up the HTML structure and includes the p5.js and p5.sound.js libraries. It also includes the sketch.js file which contains the main logic for the synthesizer.

### sketch.js

This file contains the main logic for the synthesizer. It includes functions for setting up the canvas, handling key presses, playing notes, and adjusting settings.

### style.css

This file contains the CSS styles for the project. It sets the font, text alignment, background color, and other styles.

## Key Mappings

The following keys are mapped to specific musical notes:

```
'q': 'F2', 'w': 'G2', 'e': 'A2', 'r': 'B2', 't': 'C3', 'y': 'D3', 'u': 'E3',
'i': 'F3', 'o': 'G3', 'p': 'A3', 'a': 'B3', 's': 'C4', 'd': 'D4', 'f': 'E4',
'g': 'F4', 'h': 'G4', 'j': 'A4', 'k': 'B4', 'l': 'C5', 'z': 'D5', 'x': 'E5',
'c': 'F5', 'v': 'G5', 'b': 'A5', 'n': 'B5', 'm': 'C6'
```

## Special Keys

- **Backspace:** Remove the last character from the displayed text.
- **Enter/Return:** Add a newline to the displayed text.
- **UP Arrow:** Increase the attack time.
- **DOWN Arrow:** Decrease the attack time.
- **LEFT Arrow:** Decrease the delay time.
- **RIGHT Arrow:** Increase the delay time.

## Dependencies

- [p5.js](https://p5js.org/)
- [p5.sound](https://p5js.org/reference/#/libraries/p5.sound)

## License

This project is made for Anisha Baid's Sally's Helpers project and is open for educational purposes.