document.addEventListener('DOMContentLoaded', () => {
    const lavalampBox = document.getElementById('lavalamp-box');
    const boxWidth = 500; // Width of the lavalamp-box
    const smallBoxWidth = 10; // Width of each small box
    const numberOfSmallBoxes = boxWidth / smallBoxWidth;

    for (let i = 0; i < numberOfSmallBoxes; i++) {
        const smallBox = document.createElement('div');
        smallBox.classList.add('small-box');
        smallBox.style.left = `${i * smallBoxWidth}px`;
        smallBox.style.animationDuration = `${Math.random() * 100 + 5}s`; // Random duration between 5s and 15s
        lavalampBox.appendChild(smallBox);
    }
});