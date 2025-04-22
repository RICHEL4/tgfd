const isTouchDevice = () => {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
};

function hashTime(timeStr) {
    let hash = 0;
    for (let i = 0; i < timeStr.length; i++) {
        hash = ((hash << 5) - hash) + timeStr.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function seededRandom(seed, min, max) {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return min + random * (max - min);
}

function parseTimeInput(timeStr) {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!regex.test(timeStr)) {
        return null;
    }
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return { hours, minutes, seconds };
}

function generateOffsetTime(baseTime, offsetSeconds) {
    const totalSeconds = baseTime.hours * 3600 + baseTime.minutes * 60 + baseTime.seconds;
    const newTotalSeconds = (totalSeconds + offsetSeconds) % (24 * 3600);
    const newHours = Math.floor(newTotalSeconds / 3600);
    const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

function generateGameData(count, mode) {
    const data = [];
    for (let i = 0; i < count; i++) {
        let multiplier;
        multiplier = (Math.random() * (6 - 4) + 4).toFixed(2);
        data.push({
            round: i + 1,
            multiplier: multiplier,
            result: multiplier < 2 ? 'Fianjerana aloha' : 'Miorina'
        });
    }
    return data;
}

function generatePredictions(mode, timeInput) {
    let predictions = [];
    const parsedTime = timeInput ? parseTimeInput(timeInput) : null;
    const timeStr = parsedTime ? timeInput : 'Tsy voafaritra ny ora';
    const seed = hashTime(timeStr);
    const hoverClasses = isTouchDevice() ? '' : 'hover:border-blue-400 hover:scale-102';
    const hoverHighRiskClasses = isTouchDevice() ? '' : 'hover:scale-105';

    if (mode === 'hard') {
        const multiplier1 = seededRandom(seed + 1, 4, 6).toFixed(2);
        const multiplier2 = seededRandom(seed + 2, 4, 6).toFixed(2);
        const offsetTime1 = parsedTime ? generateOffsetTime(parsedTime, 540) : 'Tsy voafaritra ny ora';
        const offsetTime2 = parsedTime ? generateOffsetTime(parsedTime, 600) : 'Tsy voafaritra ny ora';
        predictions.push({
            text: `Vinavina manaraka : ${multiplier1}x amin'ny ${offsetTime1}`,
            classes: `text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-3 sm:p-4 rounded-lg ${hoverClasses} transition-all duration-300 animate__animated animate__fadeInUp`
        });
        predictions.push({
            text: `Vinavina manaraka : ${multiplier2}x amin'ny ${offsetTime2}`,
            classes: `text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-3 sm:p-4 rounded-lg ${hoverClasses} transition-all duration-300 animate__animated animate__fadeInUp`
        });
        if (seededRandom(seed + 3, 0, 1) < 0.3) {
            const highRiskMultiplier = seededRandom(seed + 4, 10, 150).toFixed(2);
            predictions.push({
                text: `Avo risika : ${highRiskMultiplier}x`,
                classes: `text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 font-bold shadow-md p-3 sm:p-4 rounded-lg ${hoverHighRiskClasses} text-glow transition-all duration-300 animate__animated animate__fadeInUp`
            });
        }
    } else {
        const multiplier1 = seededRandom(seed + 1, 4, 6).toFixed(2);
        const multiplier2 = seededRandom(seed + 2, 4, 6).toFixed(2);
        const offsetTime1 = parsedTime ? generateOffsetTime(parsedTime, 180) : 'Tsy voafaritra ny ora';
        const offsetTime2 = parsedTime ? generateOffsetTime(parsedTime, 240) : 'Tsy voafaritra ny ora';
        predictions.push({
            text: `Vinavina manaraka : ${multiplier1}x amin'ny ${offsetTime1}`,
            classes: `text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-3 sm:p-4 rounded-lg ${hoverClasses} transition-all duration-300 animate__animated animate__fadeInUp`
        });
        predictions.push({
            text: `Vinavina manaraka : ${multiplier2}x amin'ny ${offsetTime2}`,
            classes: `text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm p-3 sm:p-4 rounded-lg ${hoverClasses} transition-all duration-300 animate__animated animate__fadeInUp`
        });
        if (seededRandom(seed + 3, 0, 1) < 0.3) {
            const highRiskMultiplier = seededRandom(seed + 4, 10, 150).toFixed(2);
            predictions.push({
                text: `Avo risika : ${highRiskMultiplier}x`,
                classes: `text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 font-bold shadow-md p-3 sm:p-4 rounded-lg ${hoverHighRiskClasses} text-glow transition-all duration-300 animate__animated animate__fadeInUp`
            });
        }
    }
    return predictions;
}

function calculateStats(games) {
    const multipliers = games.map(game => parseFloat(game.multiplier));
    const avgMultiplier = (multipliers.reduce((sum, val) => sum + val, 0) / multipliers.length).toFixed(2);
    const maxMultiplier = Math.max(...multipliers).toFixed(2);
    const lowCrashCount = multipliers.filter(m => m < 2).length;
    const lowCrashRate = ((lowCrashCount / multipliers.length) * 100).toFixed(1);
    return { avgMultiplier, maxMultiplier, lowCrashRate };
}

function updateGameHistory(games) {
    const tbody = document.getElementById('gameHistory');
    tbody.innerHTML = '';
    games.forEach(game => {
        const row = document.createElement('tr');
        row.className = 'transition-all duration-300 animate__animated animate__fadeIn';
        row.innerHTML = `
            <td class="p-2 sm:p-3 text-sm sm:text-base">${game.round}</td>
            <td class="p-2 sm:p-3 text-sm sm:text-base">${game.multiplier}x</td>
            <td class="p-2 sm:p-3 ${game.result === 'Fianjerana aloha' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'} text-sm sm:text-base">${game.result}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateInterface(mode, timeInput) {
    const games = generateGameData(10, mode);
    const stats = calculateStats(games);
    document.getElementById('avgMultiplier').textContent = `${stats.avgMultiplier}x`;
    document.getElementById('maxMultiplier').textContent = `${stats.maxMultiplier}x`;
    document.getElementById('lowCrashRate').textContent = `${stats.lowCrashRate}%`;
    updateGameHistory(games);
    const predictions = generatePredictions(mode, timeInput);
    const predictionDiv = document.getElementById('prediction');
    predictionDiv.innerHTML = predictions.map(pred => `<p class="text-lg sm:text-xl font-semibold ${pred.classes}">${pred.text}</p>`).join('');
    document.getElementById('currentMode').textContent = mode === 'hard' ? 'Sarotra' : 'Ara-dalàna';
}

// Simulated backend storage
const users = [];
const validationCodes = new Map();
let currentUser = null;

// Generate a random 6-digit validation code
function generateValidationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate sending email with validation code
function sendValidationEmail(email, code) {
    console.log(`Validation code ${code} sent to ${email}`);
    validationCodes.set(email, { code, status: 'pending' });
    alert(`Kaody fanamarinana: ${code} (Nalefa tamin'ny ${email}).`);
}

// Handle registration
function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!email || !password || !confirmPassword) {
        alert("Fenoy ny saha rehetra.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Tsy mitovy ny tenimiafina.");
        return;
    }

    if (users.find(user => user.email === email)) {
        alert("Efa misy io email io.");
        return;
    }

    users.push({ email, password, isValidated: false });
    const code = generateValidationCode();
    sendValidationEmail(email, code);
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('validationModal').classList.remove('hidden');
}

// Handle login
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        alert("Email na tenimiafina diso.");
        return;
    }

    if (!user.isValidated) {
        alert("Tsy mbola voamarina ny kaontinao. Ampidiro ny kaody fanamarinana.");
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('validationModal').classList.remove('hidden');
        return;
    }

    currentUser = user;
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('gameContent').classList.remove('hidden');
    document.getElementById('loginButton').textContent = 'Hivoaka';
    document.getElementById('loginButton').classList.remove('bg-blue-500');
    document.getElementById('loginButton').classList.add('bg-red-500');
    document.getElementById('registerButton').classList.add('hidden');
}

// Handle validation code submission
function handleValidation() {
    const email = document.getElementById('registerEmail').value || document.getElementById('loginEmail').value;
    const code = document.getElementById('validationCode').value;

    const validation = validationCodes.get(email);

    if (!validation || validation.code !== code) {
        alert("Kaody fanamarinana diso.");
        return;
    }

    validation.status = 'submitted';
    document.getElementById('validationModal').classList.add('hidden');
    document.getElementById('adminValidationModal').classList.remove('hidden');
    document.getElementById('adminValidationInfo').textContent = `Email: ${email}, Kaody: ${code}`;
}

// Handle admin validation
function handleAdminValidation(approve) {
    const email = document.getElementById('registerEmail').value || document.getElementById('loginEmail').value;
    const user = users.find(user => user.email === email);

    if (approve) {
        user.isValidated = true;
        validationCodes.delete(email);
        alert("Voamarina ny kaonty!");
        document.getElementById('adminValidationModal').classList.add('hidden');
        document.getElementById('gameContent').classList.remove('hidden');
        currentUser = user;
        document.getElementById('loginButton').textContent = 'Hivoaka';
        document.getElementById('loginButton').classList.remove('bg-blue-500');
        document.getElementById('loginButton').classList.add('bg-red-500');
        document.getElementById('registerButton').classList.add('hidden');
    } else {
        validationCodes.delete(email);
        users.splice(users.indexOf(user), 1);
        alert("Nolavina ny kaonty.");
        document.getElementById('adminValidationModal').classList.add('hidden');
    }
}

// Initialize the app
function initialize() {
    let currentMode = 'normal';
    updateInterface(currentMode);

    // Mode selection
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

    // Modal controls
    document.getElementById('loginButton').addEventListener('click', () => {
        if (currentUser) {
            currentUser = null;
            document.getElementById('gameContent').classList.add('hidden');
            document.getElementById('loginButton').textContent = 'Hiditra';
            document.getElementById('loginButton').classList.remove('bg-red-500');
            document.getElementById('loginButton').classList.add('bg-blue-500');
            document.getElementById('registerButton').classList.remove('hidden');
        } else {
            document.getElementById('loginModal').classList.remove('hidden');
        }
    });
    document.getElementById('registerButton').addEventListener('click', () => {
        document.getElementById('registerModal').classList.remove('hidden');
    });
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
    });
    document.getElementById('closeRegisterModal').addEventListener('click', () => {
        document.getElementById('registerModal').classList.add('hidden');
    });
    document.getElementById('closeValidationModal').addEventListener('click', () => {
        document.getElementById('validationModal').classList.add('hidden');
    });
    document.getElementById('closeAdminValidationModal').addEventListener('click', () => {
        document.getElementById('adminValidationModal').classList.add('hidden');
    });

    // Form submissions
    document.getElementById('submitLogin').addEventListener('click', handleLogin);
    document.getElementById('submitRegister').addEventListener('click', handleRegister);
    document.getElementById('submitValidation').addEventListener('click', handleValidation);
    document.getElementById('approveValidation').addEventListener('click', () => handleAdminValidation(true));
    document.getElementById('rejectValidation').addEventListener('click', () => handleAdminValidation(false));
}

initialize();
