/*******************************************************
 * sticky.js
 *
 * The Sticky class: represents a sticky note with an image
 * that grows on hover.
 ******************************************************/

class Sticky {
    constructor(img, x, y) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.baseSize = stickySize;  // Initial size
        this.hoverSize = stickySizeHovered; // Size when hovered
        this.currentSize = this.baseSize;
        this.isHovered = false;
        this.transitionSpeed = 0.1; // Speed of size transition
    }

    update() {
        // Smoothly transition size based on hover state
        let targetSize = this.isHovered ? this.hoverSize : this.baseSize;
        this.currentSize += (targetSize - this.currentSize) * this.transitionSpeed;
    }

    display() {
        // Draw the image centered at its position
        imageMode(CENTER);
        image(this.img, this.x, this.y, this.currentSize, this.currentSize);
        imageMode(CORNER);
    }

    checkHover(mouseX, mouseY) {
        // Calculate the bounds of the sticky
        let halfSize = this.currentSize / 2;
        let left = this.x - halfSize;
        let right = this.x + halfSize;
        let top = this.y - halfSize;
        let bottom = this.y + halfSize;

        // Check if mouse is within bounds
        this.isHovered = mouseX >= left && mouseX <= right &&
            mouseY >= top && mouseY <= bottom;
    }
} 