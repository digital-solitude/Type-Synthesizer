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
        
        // Store original position for returning to
        this.originalX = x;
        this.originalY = y;
        
        // Calculate aspect ratio
        this.aspectRatio = this.img.width / this.img.height;
        
        // Base dimensions
        this.baseWidth = stickySize * this.aspectRatio;
        this.baseHeight = stickySize;
        
        // Hover dimensions
        this.hoverWidth = stickySizeHovered * this.aspectRatio;
        this.hoverHeight = stickySizeHovered;
        
        // Current dimensions
        this.currentWidth = this.baseWidth;
        this.currentHeight = this.baseHeight;
        
        this.isHovered = false;
        this.transitionSpeed = 0.1; // Speed of size transition
    }

    update() {
        // Smoothly transition dimensions based on hover state
        let targetWidth = this.isHovered ? this.hoverWidth : this.baseWidth;
        let targetHeight = this.isHovered ? this.hoverHeight : this.baseHeight;
        
        this.currentWidth += (targetWidth - this.currentWidth) * this.transitionSpeed;
        this.currentHeight += (targetHeight - this.currentHeight) * this.transitionSpeed;

        // Adjust position to stay within screen bounds when hovered
        if (this.isHovered) {
            let halfWidth = this.currentWidth / 2;
            let halfHeight = this.currentHeight / 2;
            
            // Check right edge
            if (this.x + halfWidth > width) {
                this.x = width - halfWidth;
            }
            // Check left edge
            if (this.x - halfWidth < 0) {
                this.x = halfWidth;
            }
            // Check bottom edge
            if (this.y + halfHeight > height) {
                this.y = height - halfHeight;
            }
            // Check top edge
            if (this.y - halfHeight < 0) {
                this.y = halfHeight;
            }
        } else {
            // Smoothly return to original position when not hovered
            this.x += (this.originalX - this.x) * this.transitionSpeed;
            this.y += (this.originalY - this.y) * this.transitionSpeed;
        }
    }

    display() {
        // Draw the image centered at its position
        imageMode(CENTER);
        image(this.img, this.x, this.y, this.currentWidth, this.currentHeight);
        imageMode(CORNER);

    }

    checkHover(mouseX, mouseY) {
        // Calculate the bounds of the sticky
        let halfWidth = this.currentWidth / 2;
        let halfHeight = this.currentHeight / 2;
        let left = this.x - halfWidth;
        let right = this.x + halfWidth;
        let top = this.y - halfHeight;
        let bottom = this.y + halfHeight;

        // Check if mouse is within bounds
        this.isHovered = mouseX >= left && mouseX <= right &&
            mouseY >= top && mouseY <= bottom;
    }
} 