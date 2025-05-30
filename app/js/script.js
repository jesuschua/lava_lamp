// Get the container element
const container = document.getElementById('lavalamp-box');
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Add lamp state and controls
let lampOn = true;

// Create toggle switch
const switchContainer = document.createElement('div');
switchContainer.className = 'switch-container';
switchContainer.innerHTML = `
  <label class="switch">
    <input type="checkbox" id="lamp-toggle" checked>
    <span class="slider round"></span>
  </label>
  <span class="switch-label">Lamp ${lampOn ? 'ON' : 'OFF'}</span>
`;
container.parentNode.insertBefore(switchContainer, container.nextSibling);

// Add event listener to the toggle
const lampToggle = document.getElementById('lamp-toggle');
const switchLabel = document.querySelector('.switch-label');
lampToggle.addEventListener('change', function() {
    lampOn = this.checked;
    switchLabel.textContent = `Lamp ${lampOn ? 'ON' : 'OFF'}`;
});

// Set background gradient for the lava lamp
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Configuration parameters with defaults
let config = {
    blobCount: 15,
    blobBaseSize: 30,
    speedMultiplier: 1.0,
    blobColor: {
        r: 255,
        g: 100,
        b: 50
    }
};

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

class Blob {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = (Math.random() - 0.5) * 0.4 * config.speedMultiplier; 
        this.vy = (-0.8 - Math.random() * 0.8) * config.speedMultiplier;  
        this.baseR = r;
        this.color = {
            r: config.blobColor.r,
            g: config.blobColor.g + Math.floor(Math.random() * 30),
            b: config.blobColor.b + Math.floor(Math.random() * 20)
        };
        // Add smoothing factors
        this.targetVx = 0;
        this.targetVy = 0;
        // Add unique oscillation phase for each blob
        this.phase = Math.random() * Math.PI * 2;
        this.oscillationSpeed = (0.002 + Math.random() * 0.001) * config.speedMultiplier; // Faster oscillation
    }

    update() {
        // Update phase for smooth oscillation
        this.phase += this.oscillationSpeed;
        
        if (lampOn) {
            // Lamp is ON - normal lava lamp behavior
            // Simulate buoyancy: blobs rise when near the bottom, slow near the top
            const bottomThird = canvas.height * 2/3;
            const topThird = canvas.height * 1/3;
            
            if (this.y > bottomThird) {
                // Much stronger upward force near the bottom
                this.targetVy = (-0.1 - Math.sin(this.phase) * 0.4) * config.speedMultiplier;
            } else if (this.y < topThird) {
                // Strong downward force near the top
                this.targetVy = (0.1 + Math.sin(this.phase) * 0.4) * config.speedMultiplier;
            } else {
                // Moderate forces in the middle with more randomness
                this.targetVy = ((Math.random() > 0.5 ? 0.4 : -0.4) + Math.sin(this.phase) * 0.5) * config.speedMultiplier;
            }
            
            // Add gentle horizontal oscillation
            this.targetVx = Math.sin(this.phase * 0.7) * 0.3 * config.speedMultiplier;
        } else {
            // Lamp is OFF - apply gravity and less movement
            this.targetVy = 0.5 * config.speedMultiplier; // Constant downward force (gravity)
            this.targetVx = Math.sin(this.phase * 0.3) * 0.1 * config.speedMultiplier; // Very subtle horizontal movement
        }
        
        // Smooth velocity changes using easing
        this.vx += (this.targetVx - this.vx) * 0.015;
        this.vy += (this.targetVy - this.vy) * 0.035;
        
        // Apply damping based on lamp state
        if (lampOn) {
            // Less damping when lamp is on
            this.vx *= 0.997;
            this.vy *= 0.999;
        } else {
            // More damping when lamp is off
            this.vx *= 0.95;
            this.vy *= 0.98;
        }
        
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

// Update the createBlobs function to use the config
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
            config.blobBaseSize + Math.random() * 20
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
    
    const threshold = 0.9;
    
    for (let y = 0; y < canvas.height; y += 1) {
        // Calculate illumination at this y-coordinate
        const illumination = calculateIllumination(y);
        
        for (let x = 0; x < canvas.width; x += 1) {
            let v = metaballField(x, y);
            if (v > threshold) {
                let idx = (y * canvas.width + x) * 4;
                
                // Create gradient effect based on field strength
                const intensity = Math.min(1, (v - threshold) * 3);
                
                // Apply illumination to the colors
                const lightBoost = illumination * 5; // How much extra brightness from the light
                
                // Brighter colors with light effect using the config color
                data[idx] = Math.min(255, config.blobColor.r * (1 + lightBoost * 0.2)); 
                data[idx + 1] = Math.min(255, config.blobColor.g * (1 + lightBoost * 0.5));
                data[idx + 2] = Math.min(255, config.blobColor.b * (1 + lightBoost));
                data[idx + 3] = Math.min(255, intensity * 255); // Alpha
            }
        }
    }
    ctx.putImageData(image, 0, 0);
    
    // Also update the glow effect
    for (let blob of blobs) {
        ctx.beginPath();
        
        const blobIllumination = calculateIllumination(blob.y);
        const illuminationBoost = blobIllumination * 1.2;
        
        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.r * 1.5
        );
        
        const glowIntensity = 0.1 + illuminationBoost * 0.5;
        gradient.addColorStop(0, `rgba(${config.blobColor.r}, ${config.blobColor.g}, ${config.blobColor.b}, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(${config.blobColor.r}, ${config.blobColor.g}, ${config.blobColor.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(blob.x, blob.y, blob.r * (1.5 + illuminationBoost * 1.5), 0, Math.PI * 2);
        ctx.fill();
    }
}

function calculateIllumination(y) {
    // Calculate how bright a point should be based on distance from bottom light
    // 1.0 = full brightness (at bottom), decreasing as we go up
    const distanceFromBottom = canvas.height - y;
    const normalizedDistance = distanceFromBottom / canvas.height;
    
    // Use exponential falloff for more dramatic difference
    // This will make blobs at the bottom much brighter than those at the top
    return lampOn ? Math.max(0, Math.pow(1 - normalizedDistance, 2)) : 0;
}

function drawLightSource() {
    if (!lampOn) return; // No light when lamp is off
    
    // Draw a light glow at the bottom center
    const lightX = canvas.width / 2;
    const lightY = canvas.height - 5;
    const lightRadius = 30;
    
    const gradient = ctx.createRadialGradient(
        lightX, lightY, 0,
        lightX, lightY, lightRadius * 3
    );
    gradient.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 180, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(lightX, lightY, lightRadius * 3, 0, Math.PI * 2);
    ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    // Draw light source before blobs
    drawLightSource();
    
    for (let blob of blobs) {
        blob.update();
    }
    drawMetaballs();
    
    requestAnimationFrame(animate);
}

// Add fullscreen functionality
let isFullscreen = false;
const originalWidth = canvas.width;
const originalHeight = canvas.height;
const fullscreenToggle = document.getElementById('fullscreen-toggle');

// Set up fullscreen toggle
fullscreenToggle.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

function enterFullscreen() {
    const lampBox = document.getElementById('lavalamp-box');
    
    if (lampBox.requestFullscreen) {
        lampBox.requestFullscreen();
    } else if (lampBox.mozRequestFullScreen) { // Firefox
        lampBox.mozRequestFullScreen();
    } else if (lampBox.webkitRequestFullscreen) { // Chrome, Safari and Opera
        lampBox.webkitRequestFullscreen();
    } else if (lampBox.msRequestFullscreen) { // IE/Edge
        lampBox.msRequestFullscreen();
    }
    
    // Update state
    isFullscreen = true;
    fullscreenToggle.innerHTML = '<span class="fullscreen-icon">⤢</span> Exit Fullscreen';
    
    // Add class for fullscreen styling
    lampBox.classList.add('fullscreen-mode');
    
    // Request wake lock to prevent screen from turning off
    requestWakeLock();
    
    // Move controls to fullscreen overlay
    createFullscreenControls();
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

// Handle fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const lampBox = document.getElementById('lavalamp-box');
    
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        // Exited fullscreen
        isFullscreen = false;
        fullscreenToggle.innerHTML = '<span class="fullscreen-icon">⛶</span> Fullscreen';
        
        // Remove fullscreen class
        lampBox.classList.remove('fullscreen-mode');
        
        // Release wake lock when exiting fullscreen
        releaseWakeLock();
        
        // Remove the fullscreen controls if they exist
        const fullscreenControls = document.querySelector('.fullscreen-controls');
        if (fullscreenControls) {
            fullscreenControls.remove();
        }
        
        // No need to recreate blobs or resize canvas - it's already at the original size
    }
}

// Remove or comment out the resizeCanvas function since we're not using it anymore
// function resizeCanvas() { ... }

// Update the window resize event handler
window.addEventListener('resize', function() {
    // No need to do anything since we're using CSS scaling
    // The browser will handle scaling the canvas properly
});

function createFullscreenControls() {
    // Create a container for fullscreen controls
    const fullscreenControls = document.createElement('div');
    fullscreenControls.className = 'fullscreen-controls';
    
    // Add exit fullscreen button
    const exitButton = document.createElement('button');
    exitButton.className = 'fullscreen-button';
    exitButton.innerHTML = '<span class="fullscreen-icon">⤢</span> Exit Fullscreen';
    exitButton.addEventListener('click', exitFullscreen);
    
    fullscreenControls.appendChild(exitButton);
    
    // Add to the fullscreen container
    const lampBox = document.getElementById('lavalamp-box');
    lampBox.appendChild(fullscreenControls);
    
    // Add wake lock indicator
    const wakeLockIndicator = document.createElement('div');
    wakeLockIndicator.className = 'wake-lock-indicator';
    wakeLockIndicator.innerHTML = '<span class="wake-lock-icon">⚡</span> Screen will stay on';
    
    // Only show as active if the browser supports wake lock
    if ('wakeLock' in navigator) {
        wakeLockIndicator.classList.add('active');
    }
    
    lampBox.appendChild(wakeLockIndicator);
}

// Add event listeners for the controls
document.addEventListener('DOMContentLoaded', function() {
    // Set up blob count slider
    const blobCountSlider = document.getElementById('blob-count');
    const blobCountValue = document.getElementById('blob-count-value');
    
    blobCountSlider.addEventListener('input', function() {
        const newCount = parseInt(this.value);
        blobCountValue.textContent = newCount;
        config.blobCount = newCount;
        createBlobs(newCount);
    });
    
    // Set up blob size slider
    const blobSizeSlider = document.getElementById('blob-size');
    const blobSizeValue = document.getElementById('blob-size-value');
    
    blobSizeSlider.addEventListener('input', function() {
        const newSize = parseInt(this.value);
        blobSizeValue.textContent = newSize;
        config.blobBaseSize = newSize;
        createBlobs(config.blobCount);
    });
    
    // Set up blob speed slider
    const blobSpeedSlider = document.getElementById('blob-speed');
    const blobSpeedValue = document.getElementById('blob-speed-value');
    
    blobSpeedSlider.addEventListener('input', function() {
        const newSpeed = parseFloat(this.value);
        blobSpeedValue.textContent = newSpeed.toFixed(1);
        config.speedMultiplier = newSpeed;
        // No need to recreate blobs, just let the speed change take effect
    });
    
    // Set up blob color picker
    const blobColorPicker = document.getElementById('blob-color');
    
    blobColorPicker.addEventListener('input', function() {
        const newColor = hexToRgb(this.value);
        config.blobColor = newColor;
        createBlobs(config.blobCount);
    });
    
    // Set up fullscreen toggle
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', toggleFullscreen);
    }
});

// Initialize with default values
config.blobColor = hexToRgb('#ff6432'); // Set initial color
createBlobs(config.blobCount);
animate();

// Add wake lock functionality to prevent screen from turning off
let wakeLock = null;

// Function to request a wake lock
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            // Request a screen wake lock
            wakeLock = await navigator.wakeLock.request('screen');
            
            console.log('Wake Lock is active');
            
            // Add a listener for when the wake lock is released
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
                wakeLock = null;
            });
        } else {
            console.warn('Wake Lock API not supported in this browser');
        }
    } catch (err) {
        console.error(`Wake Lock error: ${err.message}`);
    }
}

// Function to release wake lock
async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock released');
        } catch (err) {
            console.error(`Wake Lock release error: ${err.message}`);
        }
    }
}

// Update enterFullscreen to request wake lock
function enterFullscreen() {
    const lampBox = document.getElementById('lavalamp-box');
    
    if (lampBox.requestFullscreen) {
        lampBox.requestFullscreen();
    } else if (lampBox.mozRequestFullScreen) { // Firefox
        lampBox.mozRequestFullScreen();
    } else if (lampBox.webkitRequestFullscreen) { // Chrome, Safari and Opera
        lampBox.webkitRequestFullscreen();
    } else if (lampBox.msRequestFullscreen) { // IE/Edge
        lampBox.msRequestFullscreen();
    }
    
    // Update state
    isFullscreen = true;
    fullscreenToggle.innerHTML = '<span class="fullscreen-icon">⤢</span> Exit Fullscreen';
    
    // Add class for fullscreen styling
    lampBox.classList.add('fullscreen-mode');
    
    // Request wake lock to prevent screen from turning off
    requestWakeLock();
    
    // Move controls to fullscreen overlay
    createFullscreenControls();
}

// Update handleFullscreenChange to release wake lock when exiting fullscreen
function handleFullscreenChange() {
    const lampBox = document.getElementById('lavalamp-box');
    
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        // Exited fullscreen
        isFullscreen = false;
        fullscreenToggle.innerHTML = '<span class="fullscreen-icon">⛶</span> Fullscreen';
        
        // Remove fullscreen class
        lampBox.classList.remove('fullscreen-mode');
        
        // Release wake lock when exiting fullscreen
        releaseWakeLock();
        
        // Remove the fullscreen controls if they exist
        const fullscreenControls = document.querySelector('.fullscreen-controls');
        if (fullscreenControls) {
            fullscreenControls.remove();
        }
    }
}

// Update the page visibility handling to manage wake lock appropriately
document.addEventListener('visibilitychange', () => {
    if (isFullscreen) {
        if (document.visibilityState === 'visible') {
            // Re-request wake lock if page becomes visible again
            requestWakeLock();
        } else {
            // Release wake lock if page is hidden
            releaseWakeLock();
        }
    }
});