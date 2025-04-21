// Simple fonction de hachage pour rendre les prédictions déterministes
function hashTime(timeStr) {
    let hash = 0;
    for (let i = 0; i < timeStr.length; i++) {
        hash = ((hash << 5) - hash) + timeStr.charCodeAt(i);
        hash = hash & hash; // Convertir en 32 bits
    }
    return Math.abs(hash);
}

// Générer un nombre pseudo-aléatoire déterministe entre min et max basé sur un seed
function seededRandom(seed, min, max) {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return min + random * (max - min);
}

// Valider et parser l'heure saisie
function parseTimeInput(timeStr) {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!regex.test(timeStr)) {
        return null;
    }
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return { hours, minutes, seconds };
}

// Générer une heure décalée (sans secondes)
function generateOffsetTime(baseTime, offsetSeconds) {
    const totalSeconds = baseTime.hours * 3600 + baseTime.minutes * 60 + baseTime.seconds;
    const newTotalSeconds = (totalSeconds + offsetSeconds) % (24 * 3600); // Gérer le dépassement de minuit
    const newHours = Math.floor(newTotalSeconds / 3600);
    const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// Simuler des données de jeu selon le mode
function generateGameData(count, mode) {
    const data = [];
    for (let i = 0; i < count; i++) {
        let multiplier;
        // Modes Normal et Difficile : multiplicateur entre 4x et 6x
        multiplier = (Math.random() * (6 - 4) + 4).toFixed(2);
        data.push({
            round: i + 1,
            multiplier: multiplier,
            result: multiplier < 2 ? 'Fianjerana aloha' : 'Miorina'
        });
    }
    return data;
}

// Générer deux ou trois prédictions simulées selon le mode
function generatePredictions(mode, timeInput) {
    let predictions = [];
    const parsedTime = timeInput ? parseTimeInput(timeInput) : null;
    const timeStr = parsedTime ? timeInput : 'Tsy voafaritra ny ora';
    const seed = hashTime(timeStr); // Hachage de l'heure pour prédictions déterministes

    if (mode === 'hard') {
        // Mode Difficile : deux prédictions entre 4x et 6x, décalées de 9 et 10 min
        const multiplier1 = seededRandom(seed + 1, 4, 6).toFixed(2);
        const multiplier2 = seededRandom(seed + 2, 4, 6).toFixed(2);
        const offsetTime1 = parsedTime ? generateOffsetTime(parsedTime, 540) : 'Tsy voafaritra ny ora';
        const offsetTime2 = parsedTime ? generateOffsetTime(parsedTime, 600) : 'Tsy voafaritra ny ora';
        predictions.push({
            text: `Vinavina manaraka : ${multiplier1}x amin'ny ${offsetTime1}`,
            classes: 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-4 rounded-lg hover:border-blue-400 hover:scale-102 transition-all duration-300 animate__animated animate__fadeInUp'
        });
        predictions.push({
            text: `Vinavina manaraka : ${multiplier2}x amin'ny ${offsetTime2}`,
            classes: 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-4 rounded-lg hover:border-blue-400 hover:scale-102 transition-all duration-300 animate__animated animate__fadeInUp'
        });
        // Ajout possible d'une prédiction de risque élevé (30% de chance)
        if (seededRandom(seed + 3, 0, 1) < 0.3) {
            const highRiskMultiplier = seededRandom(seed + 4, 10, 150).toFixed(2);
            predictions.push({
                text: `Risika avo : ${highRiskMultiplier}x`,
                classes: 'text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 font-bold shadow-md p-4 rounded-lg hover:scale-105 text-glow transition-all duration-300 animate__animated animate__fadeInUp'
            });
        }
    } else {
        // Mode Normal : deux prédictions entre 4x et 6x, décalées de 3 et 4 min
        const multiplier1 = seededRandom(seed + 1, 4, 6).toFixed(2);
        const multiplier2 = seededRandom(seed + 2, 4, 6).toFixed(2);
        const offsetTime1 = parsedTime ? generateOffsetTime(parsedTime, 180) : 'Tsy voafaritra ny ora';
        const offsetTime2 = parsedTime ? generateOffsetTime(parsedTime, 240) : 'Tsy voafaritra ny ora';
        predictions.push({
            text: `Vinavina manaraka : ${multiplier1}x amin'ny ${offsetTime1}`,
            classes: 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-4 rounded-lg hover:border-blue-400 hover:scale-102 transition-all duration-300 animate__animated animate__fadeInUp'
        });
        predictions.push({
            text: `Vinavina manaraka : ${multiplier2}x amin'ny ${offsetTime2}`,
            classes: 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-4 rounded-lg hover:border-blue-400 hover:scale-102 transition-all duration-300 animate__animated animate__fadeInUp'
        });
        // Ajout possible d'une prédiction de risque élevé (30% de chance)
        if (seededRandom(seed + 3, 0, 1) < 0.3) {
            const highRiskMultiplier = seededRandom(seed + 4, 10, 150).toFixed(2);
            predictions.push({
                text: `Risika avo : ${highRiskMultiplier}x`,
                classes: 'text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 font-bold shadow-md p-4 rounded-lg hover:scale-105 text-glow transition-all duration-300 animate__animated animate__fadeInUp'
            });
        }
    }
    return predictions;
}

// Calculer les statistiques
function calculateStats(games) {
    const multipliers = games.map(game => parseFloat(game.multiplier));
    const avgMultiplier = (multipliers.reduce((sum, val) => sum + val, 0) / multipliers.length).toFixed(2);
    const maxMultiplier = Math.max(...multipliers).toFixed(2);
    const lowCrashCount = multipliers.filter(m => m < 2).length;
    const lowCrashRate = ((lowCrashCount / multipliers.length) * 100).toFixed(1);

    return { avgMultiplier, maxMultiplier, lowCrashRate };
}

// Mettre à jour l'historique des parties
function updateGameHistory(games) {
    const tbody = document.getElementById('gameHistory');
    tbody.innerHTML = '';
    games.forEach(game => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-purple-100 transition-all duration-300 animate__animated animate__fadeIn';
        row.innerHTML = `
            <td class="p-3">${game.round}</td>
            <td class="p-3">${game.multiplier}x</td>
            <td class="p-3 ${game.result === 'Fianjerana aloha' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}">${game.result}</td>
        `;
        tbody.appendChild(row);
    });
}

// Mettre à jour l'interface selon le mode
function updateInterface(mode, timeInput) {
    const games = generateGameData(10, mode);
    const stats = calculateStats(games);

    // Mettre à jour les statistiques
    document.getElementById('avgMultiplier').textContent = `${stats.avgMultiplier}x`;
    document.getElementById('maxMultiplier').textContent = `${stats.maxMultiplier}x`;
    document.getElementById('lowCrashRate').textContent = `${stats.lowCrashRate}%`;

    // Mettre à jour l'historique
    updateGameHistory(games);

    // Mettre à jour les prédictions
    const predictions = generatePredictions(mode, timeInput);
    const predictionDiv = document.getElementById('prediction');
    predictionDiv.innerHTML = predictions.map(pred => `<p class="text-xl font-semibold ${pred.classes}">${pred.text}</p>`).join('');

    // Mettre à jour le mode affiché
    document.getElementById('currentMode').textContent = mode === 'hard' ? 'Sarotra' : 'Ara-dalàna';
}

// Initialiser le site
function initialize() {
    let currentMode = 'normal';
    updateInterface(currentMode);

    // Gestion des boutons de mode
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
}

// Lancer l'initialisation
initialize();
