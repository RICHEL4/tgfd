// Fonction de hachage améliorée
function hashTime(timeStr) {
    let hash = 5381;
    for (let i = 0; i < timeStr.length; i++) {
        hash = (hash << 5) + hash + timeStr.charCodeAt(i);
    }
    return Math.abs(hash);
}

// Génération aléatoire plus précise
function seededRandom(seed, min, max) {
    seed = (seed * 9301 + 49297) % 233280;
    const random = seed / 233280;
    return min + random * (max - min);
}

// Validation améliorée de l'heure
function parseTimeInput(timeStr) {
    const regex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!regex.test(timeStr)) return null;
    return timeStr.split(':').map(Number);
}

// Génération des temps avec gestion d'erreur
function generateOffsetTime(parsedTime, offsetSeconds) {
    if (!parsedTime) return 'Heure invalide';
    
    try {
        const total = parsedTime[0] * 3600 + parsedTime[1] * 60 + parsedTime[2];
        const newTotal = (total + offsetSeconds) % 86400;
        return [
            Math.floor(newTotal / 3600).toString().padStart(2, '0'),
            Math.floor((newTotal % 3600) / 60).toString().padStart(2, '0')
        ].join(':');
    } catch {
        return 'Erreur de calcul';
    }
}

// Génération des données de jeu réaliste
function generateGameData(count, mode) {
    const results = [];
    const crashProbability = mode === 'hard' ? 0.4 : 0.2;
    
    for (let i = 0; i < count; i++) {
        const crash = Math.random() < crashProbability;
        const multiplier = crash 
            ? (Math.random() * 1.5 + 0.5).toFixed(2)
            : (Math.random() * (mode === 'hard' ? 10 : 5) + 1).toFixed(2);
        
        results.push({
            round: i + 1,
            multiplier,
            result: multiplier < 2 ? 'Fianjerana aloha' : 'Miorina'
        });
    }
    return results;
}

// Génération des prédictions corrigée
function generatePredictions(mode, timeInput) {
    const parsedTime = parseTimeInput(timeInput);
    const predictions = [];
    const baseSeed = hashTime(timeInput || Date.now().toString());

    // Génération pour 2 prédictions
    [1, 2].forEach(i => {
        const seed = baseSeed + i;
        const offset = mode === 'hard' ? i * 600 : i * 180;
        const time = generateOffsetTime(parsedTime, offset);
        
        const multiplier = seededRandom(seed, 
            mode === 'hard' ? 2 : 1.5, 
            mode === 'hard' ? 15 : 8
        ).toFixed(2);

        predictions.push({
            text: `Vinavina ${i}: ${multiplier}x @ ${time}`,
            class: mode === 'hard' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
        });
    });

    return predictions;
}

// Calcul des statistiques
function calculateStats(games) {
    const values = games.map(g => parseFloat(g.multiplier));
    return {
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
        max: Math.max(...values).toFixed(2),
        crashRate: ((values.filter(v => v < 2).length / values.length) * 100).toFixed(1)
    };
}

// Mise à jour de l'historique
function updateHistory(games) {
    const tbody = document.getElementById('gameHistory');
    tbody.innerHTML = games.map(game => `
        <tr class="hover:bg-gray-50">
            <td class="p-3">${game.round}</td>
            <td class="p-3">${game.multiplier}x</td>
            <td class="p-3 font-medium ${game.multiplier < 2 ? 'text-red-600' : 'text-green-600'}">
                ${game.result}
            </td>
        </tr>
    `).join('');
}

// Gestion de l'interface
function updateUI(mode, time) {
    const games = generateGameData(10, mode);
    const stats = calculateStats(games);
    
    // Mise à jour des stats
    document.getElementById('avgMultiplier').textContent = `${stats.avg}x`;
    document.getElementById('maxMultiplier').textContent = `${stats.max}x`;
    document.getElementById('lowCrashRate').textContent = `${stats.crashRate}%`;
    
    // Mise à jour historique
    updateHistory(games);
    
    // Prédictions
    const predictions = generatePredictions(mode, time);
    document.getElementById('prediction').innerHTML = predictions.map(p => `
        <p class="p-4 rounded-lg ${p.class}">
            ${p.text}
        </p>
    `).join('');
    
    // Mode courant
    document.getElementById('currentMode').textContent = 
        mode === 'hard' ? 'Sarotra' : 'Ara-dalàna';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    let currentMode = 'normal';
    
    document.getElementById('normalMode').addEventListener('click', () => {
        currentMode = 'normal';
        updateUI(currentMode, document.getElementById('normalTimeInput').value);
    });
    
    document.getElementById('hardMode').addEventListener('click', () => {
        currentMode = 'hard';
        updateUI(currentMode, document.getElementById('hardTimeInput').value);
    });

    // Premier chargement
    updateUI(currentMode);
});
