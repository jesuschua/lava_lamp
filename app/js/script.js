// Get the container element
const container = document.getElementById('lavalamp-box');
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

class Blob {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -0.5 - Math.random() * 0.8;
        this.baseR = r;
    }

    update() {
        // Simulate buoyancy: blobs rise when near the bottom, slow near the top
        const centerY = canvas.height / 2;
        if (this.y > centerY) {
            this.vy -= 0.000007; // gentler buoyancy upwards
        } else {
            this.vy += 0.00005; // gentler gravity downwards
        }

        // Add some random wobble for organic movement
        this.vx += (Math.random() - 0.5) * 0.05;

        // Clamp velocities for stability
        this.vy = Math.max(Math.min(this.vy, 2), -2);
        this.vx = Math.max(Math.min(this.vx, 1), -1);

        this.y += this.vy;
        this.x += this.vx;

        // Bounce off walls
        if (this.x < this.r) {
            this.x = this.r;
            this.vx *= -0.8;
        }
        if (this.x > canvas.width - this.r) {
            this.x = canvas.width - this.r;
            this.vx *= -0.8;
        }

        // Reverse direction at top and bottom, with damping
        if (this.y < this.r) {
            this.y = this.r;
            this.vy = Math.abs(this.vy) * 0.7;
        }
        if (this.y > canvas.height - this.r) {
            this.y = canvas.height - this.r;
            this.vy = -Math.abs(this.vy) * 0.7;
        }

        // Slightly change radius for organic feel
        this.r = this.baseR + Math.sin(Date.now() / 500 + this.x) * 2;
    }
}

let blobs = [];
function createBlobs(count) {
    blobs = [];
    for (let i = 0; i < count; i++) {
        blobs.push(new Blob(
            Math.random() * canvas.width,
            canvas.height - Math.random() * 100,
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
        sum += (blob.r * blob.r) / (dx * dx + dy * dy + 1);
    }
    return sum;
}

function drawMetaballs() {
    let image = ctx.createImageData(canvas.width, canvas.height);
    let data = image.data;
    for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
            let v = metaballField(x, y);
            if (v > 1.1) {
                let idx = (y * canvas.width + x) * 4;
                data[idx] = 255;
                data[idx + 1] = 99;
                data[idx + 2] = 71;
                data[idx + 3] = Math.min(255, (v - 1.1) * 180);
            }
        }
    }
    ctx.putImageData(image, 0, 0);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let blob of blobs) {
        blob.update();
    }
    drawMetaballs();
    requestAnimationFrame(animate);
}

createBlobs(15);
animate();

// Periodically add new particles
setInterval(() => {
    if (particles.length < 100) {
        particles.push(new Particle(Math.random() * canvas.width, canvas.height));
    }
}, 2000);

// Periodically remove particles
setInterval(() => {
    if (particles.length > 50) {
        particles.shift();
    }
}, 2500);