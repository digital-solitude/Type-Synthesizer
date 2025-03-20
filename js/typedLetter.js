/*******************************************************
 * typedLetter.js
 *
 * The TypedLetter class: each typed character that 
 * appears on screen. Can "wiggle".
 ******************************************************/

class TypedLetter {
    constructor(letter, x, y) {
        this.letter = letter;
        this.x = x;
        this.y = y;
        this.size = textsize;
        this.c = currentGreenShade;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.wiggle = false;
        this.wiggling = false;
        this.startedWigglingTime = 0;
    }

    display() {
        noStroke();
        fill(this.c);
        textSize(this.size);
        text(this.letter, this.x + this.shakeOffsetX, this.y + this.shakeOffsetY - scrollOffset);

        // If not wiggling, small chance to start
        if (!this.wiggling && this.wiggle && random(2) < chanceToWiggle) {
            this.wiggling = true;
            this.startedWigglingTime = millis();
        }
    }

    update() {
        if (this.wiggling) {
            let t = (millis() - this.startedWigglingTime) / 1000;
            this.shakeOffsetX = sin(t * 20) * 3;
            this.shakeOffsetY = cos(t * 20) * 3;
            if (t > 0.2) {
                this.wiggling = false;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }
}
