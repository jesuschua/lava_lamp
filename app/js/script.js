// Get the container element
const container = document.getElementById('lavalamp-box');
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Set background gradient for the lava lamp
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Blob {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = (Math.random() - 0.5) * 0.4; // Horizontal initial velocity
        this.vy = -0.8 - Math.random() * 0.8;  // Even stronger initial upward velocity
        this.baseR = r;
        this.color = {
            r: 255,
            g: 50 + Math.floor(Math.random() * 50),
            b: 20 + Math.floor(Math.random() * 30)
        };
        // Add smoothing factors
        this.targetVx = 0;
        this.targetVy = 0;
        // Add unique oscillation phase for each blob
        this.phase = Math.random() * Math.PI * 2;
        this.oscillationSpeed = 0.002 + Math.random() * 0.001; // Faster oscillation
    }

    update() {
        // Update phase for smooth oscillation
        this.phase += this.oscillationSpeed;
        
        // Simulate buoyancy: blobs rise when near the bottom, slow near the top
        const bottomThird = canvas.height * 2/3;
        const topThird = canvas.height * 1/3;
        
        if (this.y > bottomThird) {
            // Much stronger upward force near the bottom
            this.targetVy = -0.1 - Math.sin(this.phase) * 0.4;
        } else if (this.y < topThird) {
            // Strong downward force near the top
            this.targetVy = 0.1 + Math.sin(this.phase) * 0.4;
        } else {
            // Moderate forces in the middle with more randomness
            this.targetVy = (Math.random() > 0.5 ? 0.4 : -0.4) + Math.sin(this.phase) * 0.5;
        }
        
        // Add gentle horizontal oscillation
        this.targetVx = Math.sin(this.phase * 0.7) * 0.3;
        
        // Smooth velocity changes using easing
        this.vx += (this.targetVx - this.vx) * 0.015;
        this.vy += (this.targetVy - this.vy) * 0.035; // Even faster vertical easing
        
        // Apply even less damping to maintain more momentum
        this.vx *= 0.997;
        this.vy *= 0.999; // Almost no damping for vertical movement
        
        // Adjust velocity caps for more vertical movement
        this.vy = Math.max(Math.min(this.vy, 2.0), -2.0); // Much higher vertical velocity caps
        this.vx = Math.max(Math.min(this.vx, 0.6), -0.6);
        
        // Update position
        this.y += this.vy;
        this.x += this.vx;
        
        // Bounce off walls with gentler response
        if (this.x < this.r) {
            this.x = this.r;
            this.vx *= -0.6;
        }
        if (this.x > canvas.width - this.r) {
            this.x = canvas.width - this.r;
            this.vx *= -0.6;
        }
        
        // Reverse direction at top and bottom, with smoother damping
        if (this.y < this.r) {
            this.y = this.r;
            this.vy = Math.abs(this.vy) * 0.8; // Stronger bounce at top
        }
        if (this.y > canvas.height - this.r) {
            this.y = canvas.height - this.r;
            this.vy = -Math.abs(this.vy) * 0.8; // Stronger bounce at bottom
        }
        
        // More noticeable radius pulsation
        this.r = this.baseR + Math.sin(this.phase * 2) * 3;
    }
}

// Update the createBlobs function to distribute blobs more at the bottom
function createBlobs(count) {
    blobs = [];
    for (let i = 0; i < count; i++) {
        // Start more blobs at the bottom
        const yPos = Math.random() < 0.7 ? 
            // 70% chance to start in bottom half
            canvas.height/2 + Math.random() * canvas.height/2 : 
            // 30% chance to start in top half
            Math.random() * canvas.height/2;
            
        blobs.push(new Blob(
            Math.random() * canvas.width,
            yPos,
            30 + Math.random() * 20
        ));
    }
}

// Metaball effect
function metaballField(x, y) {
    let sum = 0;
    for (let blob of blobs) {
        let dx = x - blob.x;
        let dy = y - blob.y;
        sum += (blob.r * blob.r) / (dx * dx + dy * dy + 0.5); // Reduced divisor for stronger effect
    }
    return sum;
}

function drawMetaballs() {
    let image = ctx.createImageData(canvas.width, canvas.height);
    let data = image.data;
    
    // Lower threshold for more visible blobs
    const threshold = 0.9;
    
    for (let y = 0; y < canvas.height; y += 1) { // Sample every pixel for higher quality
        for (let x = 0; x < canvas.width; x += 1) {
            let v = metaballField(x, y);
            if (v > threshold) {
                let idx = (y * canvas.width + x) * 4;
                
                // Create gradient effect based on field strength
                const intensity = Math.min(1, (v - threshold) * 2);
                
                // Brighter, more vibrant colors
                data[idx] = 255; // Red
                data[idx + 1] = 50 + 150 * intensity; // Green - increases with intensity
                data[idx + 2] = 20 + 100 * intensity; // Blue - increases with intensity
                data[idx + 3] = Math.min(255, intensity * 255); // Alpha - fully opaque
            }
        }
    }
    ctx.putImageData(image, 0, 0);
    
    // Add glow effect
    for (let blob of blobs) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.r * 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 150, 50, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 100, 20, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(blob.x, blob.y, blob.r * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    for (let blob of blobs) {
        blob.update();
    }
    drawMetaballs();
    
    requestAnimationFrame(animate);
}

createBlobs(15);
animate();