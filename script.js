// script.js
const isTouchDevice = () => {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
};

// ... [Tout le code JavaScript original ici] ...

function initialize() {
    let currentMode = 'normal';
    updateInterface(currentMode);

    document.getElementById('normalMode').addEventListener('click', () => {
        currentMode = 'normal';
        const timeInput = document.getElementById('normalTimeInput').value;
        updateInterface(currentMode, timeInput);
    });
    
    document.getElementById('hardMode').addEventListener('click', () => {
        currentMode = 'hard';
        const timeInput = document.getElementById('hardTimeInput').value;
        updateInterface(currentMode, timeInput);
    });

    // ... [Le reste du code d'initialisation] ...
}

initialize();
