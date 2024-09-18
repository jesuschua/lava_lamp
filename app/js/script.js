// Get the container element
const container = document.getElementById('lavalamp-box');

// Function to create a small box
function createSmallBox() {
    const box = document.createElement('div');
    box.className = 'small-box';
    
    // Random horizontal position
    box.style.left = `${Math.random() * 495}px`;
    
    // Random animation duration
    const duration = 5 + Math.random() * 10;
    box.style.animationDuration = `${duration}s`;
    
    // Random delay
    box.style.animationDelay = `${Math.random() * 5}s`;
    
    return box;
}

// Create multiple small boxes
function createMultipleBoxes(count) {
    for (let i = 0; i < count; i++) {
        container.appendChild(createSmallBox());
    }
}

// Initial creation of boxes
createMultipleBoxes(50);

// Periodically add new boxes
setInterval(() => {
    if (container.children.length < 100) {
        container.appendChild(createSmallBox());
    }
}, 2000);

// Periodically remove boxes
setInterval(() => {
    if (container.children.length > 50) {
        container.removeChild(container.firstChild);
    }
}, 2500);