/*******************************************************
 * effects.js
 *
 * Functions for spawning and rendering small 
 * particle "sparks" each time a key is typed.
 ******************************************************/

function spawnVisualEffect(key) {
    // Could vary properties based on the key
    let p = {
        x: random(width),
        y: random(height),
        size: 10,
        life: 255,
        c: color(255, 255, 255, 255)
    };
    typedParticles.push(p);
}

function renderVisualEffects() {
    for (let i = typedParticles.length - 1; i >= 0; i--) {
        let p = typedParticles[i];

        noStroke();
        fill(p.c);
        ellipse(p.x, p.y, p.size);

        // Float upward
        p.y -= 0.5;
        // Fade
        p.life -= 4;
        p.c.setAlpha(p.life);

        if (p.life <= 0) {
            typedParticles.splice(i, 1);
        }
    }
}
