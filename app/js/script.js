// Get the container element
const container = document.getElementById('lavalamp-box');
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.2 + Math.random() * 0.8;
        this.radius = 3 + Math.random() * 2;
        this.direction = 1;
    }

    update() {
        this.y -= this.speed * this.direction;
        if (this.y < 0 || this.y > canvas.height) {
            this.direction *= -1;
        }
    }
}

let particles = [];

function createParticles(count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function findBlobs() {
    let blobs = [];
    let assigned = new Set();

    for (let i = 0; i < particles.length; i++) {
        if (assigned.has(i)) continue;

        let blob = [particles[i]];
        assigned.add(i);

        for (let j = i + 1; j < particles.length; j++) {
            if (assigned.has(j)) continue;

            if (distance(particles[i], particles[j]) < 30) {
                blob.push(particles[j]);
                assigned.add(j);
            }
        }

        blobs.push(blob);
    }

    return blobs;
}

function drawBlob(blob) {
    ctx.beginPath();
    let avgX = blob.reduce((sum, p) => sum + p.x, 0) / blob.length;
    let avgY = blob.reduce((sum, p) => sum + p.y, 0) / blob.length;
    ctx.moveTo(avgX, avgY);

    for (let i = 0; i <= 20; i++) {
        let angle = (i / 20) * Math.PI * 2;
        let radius = 10 + blob.length * 2;
        let x = avgX + radius * Math.cos(angle);
        let y = avgY + radius * Math.sin(angle);
        ctx.lineTo(x, y);
    }

    ctx.fillStyle = 'rgba(255, 99, 71, 0.8)';
    ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => particle.update());

    let blobs = findBlobs();
    blobs.forEach(drawBlob);

    requestAnimationFrame(animate);
}

createParticles(50);
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