/*******************************************************
 * sticky.js
 *
 * The Sticky class: represents a sticky note with an image
 * that grows on hover.
 ******************************************************/

class Sticky {
    // Static property to track the currently hovered Sticky
    static currentlyHovered = null;
    static currentlyZoomed = null;

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
        this.transitionSpeed = 0.9; // Speed of size transition

        this.isZoomed = false;
        this.zoomWidth = stickySizeHovered * 1.3 * this.aspectRatio; // Even larger when zoomed
        this.zoomHeight = stickySizeHovered * 1.3;
    }

    update() {
        // Determine target dimensions based on state
        let targetWidth, targetHeight, targetX, targetY;
        
        if (this.isZoomed) {
            // When zoomed, use zoom dimensions
            targetWidth = this.zoomWidth;
            targetHeight = this.zoomHeight;
            
            // Position in the right section, not in the text area
            const rightSectionX = width * 0.85; // 85% of the screen width
            targetX = rightSectionX;
            targetY = height * 0.295;
        } else {
            // Normal state - position at bottom right but slightly higher and to the left
            targetWidth = this.baseWidth;
            targetHeight = this.baseHeight;
            
            // All stickies should be at the adjusted bottom right when not zoomed
            targetX = width - stickySize*1.5; // Positions slightly to the left
            targetY = height - stickySize*1.5; // Positions slightly higher
        }
        
        // Smoothly transition dimensions
        this.currentWidth += (targetWidth - this.currentWidth) * this.transitionSpeed;
        this.currentHeight += (targetHeight - this.currentHeight) * this.transitionSpeed;
        
        // Smoothly transition position
        this.x += (targetX - this.x) * this.transitionSpeed;
        this.y += (targetY - this.y) * this.transitionSpeed;
    }

    display() {
        // Draw the image centered at its position
        imageMode(CENTER);
        image(this.img, this.x, this.y, this.currentWidth, this.currentHeight);
        imageMode(CORNER);

    }

    checkHover(mouseX, mouseY) {
       /* // Skip hover check if this or any sticky is zoomed
        if (this.isZoomed || Sticky.currentlyZoomed) {
            return;
        }
        // Calculate the bounds of the sticky
        let halfWidth = this.currentWidth / 2;
        let halfHeight = this.currentHeight / 2;
        let left = this.x - halfWidth;
        let right = this.x + halfWidth;
        let top = this.y - halfHeight;
        let bottom = this.y + halfHeight;

        // Check if mouse is within bounds
        const isHovering = mouseX >= left && mouseX <= right &&
            mouseY >= top && mouseY <= bottom;

        // If this sticky is being hovered and it's not already the currently hovered one
        if (isHovering && Sticky.currentlyHovered !== this) {
            // If there was a previously hovered sticky, un-hover it
            if (Sticky.currentlyHovered) {
                Sticky.currentlyHovered.isHovered = false;
            }
            // Set this as the currently hovered sticky
            Sticky.currentlyHovered = this;
            this.isHovered = true;
        }
        // If this sticky is not being hovered and it was the currently hovered one
        else if (!isHovering && Sticky.currentlyHovered === this) {
            this.isHovered = false;
            Sticky.currentlyHovered = null;
        }*/
    }


    checkClick(mouseX, mouseY) {
        let halfWidth = this.currentWidth / 2;
        let halfHeight = this.currentHeight / 2;
        let left = this.x - halfWidth;
        let right = this.x + halfWidth;
        let top = this.y - halfHeight;
        let bottom = this.y + halfHeight;
        
        return (mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom);
    }
      // Add this method to toggle zoom state
      toggleZoomed() {
        this.isZoomed = !this.isZoomed;
    }
} 