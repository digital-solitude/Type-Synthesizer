
/*******************************************************
 * cursor.js
 *
 * The Cursor class to display a blinking line 
 * at the current typing position.
 ******************************************************/

class Cursor {
    constructor() {
        this.blinkInterval = 1000; // ms
        this.lastBlinkTime = 0;
        this.visible = true;
    }

    update() {
        let currentTime = millis();
        if (currentTime - this.lastBlinkTime > this.blinkInterval) {
            this.visible = !this.visible;
            this.lastBlinkTime = currentTime;
        }
    }

    display(x, y) {
        if (this.visible) {
            stroke(255, 127);
            strokeWeight(2);
            line(x, y, x, y + textsize);
        }
    }
}
