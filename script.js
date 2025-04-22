import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, doc, setDoc, getDoc, updateDoc } from './firebase.js';

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

// Gestion de l'affichage des sections
function showSection(sectionId) {
    const sections = ['home-section', 'register-section', 'login-section'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === sectionId) {
            section.classList.remove('hidden');
            section.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            section.classList.add('hidden');
            section.classList.remove('animate__animated', 'animate__fadeIn');
        }
    });

    // Afficher/masquer le lien de déconnexion
    const logoutLink = document.getElementById('logout-link');
    if (sectionId === 'home-section') {
        logoutLink.classList.remove('hidden');
    } else {
        logoutLink.classList.add('hidden');
    }
}

// Initialisation
async function initialize() {
    let currentMode = 'normal';

    // Vérifier l'état de connexion
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Vérifier si le compte est activé
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().isActivated) {
                showSection('home-section');
                updateInterface(currentMode);
            } else {
                // Si le compte n'est pas activé, déconnecter et afficher l'inscription
                await signOut(auth);
                showSection('register-section');
            }
        } else {
            // Si non connecté, afficher l'inscription
            showSection('register-section');
        }
    });

    // Gestion des modes de jeu
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

    // Gestion de la navigation
    document.getElementById('home-link').addEventListener('click', async (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists() && userDoc.data().isActivated) {
                showSection('home-section');
            } else {
                showSection('register-section');
            }
        } else {
            showSection('register-section');
        }
    });
    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('register-section');
    });
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('login-section');
    });
    document.getElementById('logout-link').addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        showSection('register-section');
    });

    // Gestion de l'inscription
    document.getElementById('register-btn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');

        try {
            // Créer l'utilisateur
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Générer un code d'activation (6 chiffres)
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Stocker le code dans Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                activationCode: activationCode,
                isActivated: false
            });

            // Envoyer l'email de vérification
            await sendEmailVerification(user);

            // Afficher le formulaire de vérification
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('verify-form').classList.remove('hidden');
            successMessage.textContent = 'Fisoratana nahomby! Jereo ny mailakao ary ampidiro ny kaody fanamafisana.';
            successMessage.classList.remove('hidden');
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });

    // Gestion de la vérification du code
    document.getElementById('verify-btn').addEventListener('click', async () => {
        const code = document.getElementById('activation-code').value;
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');

        try {
            const user = auth.currentUser;
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists() && userDoc.data().activationCode === code) {
                // Marquer le compte comme activé
                await updateDoc(doc(db, 'users', user.uid), {
                    isActivated: true
                });
                successMessage.textContent = 'Kaonty nafamafisina soa aman-tsara! Hafindra...';
                successMessage.classList.remove('hidden');
                document.getElementById('verify-form').classList.add('hidden');
                setTimeout(() => {
                    showSection('home-section');
                    updateInterface(currentMode);
                }, 2000);
            } else {
                errorMessage.textContent = 'Kaody fanamafisana diso.';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });

    // Gestion de la connexion
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMessage = document.getElementById('login-error-message');
        const successMessage = document.getElementById('login-success-message');

        try {
            // Connecter l'utilisateur
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Vérifier si le compte est activé
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().isActivated) {
                successMessage.textContent = 'Hiditra nahomby! Hafindra...';
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    showSection('home-section');
                    updateInterface(currentMode);
                }, 2000);
            } else {
                errorMessage.textContent = 'Mbola tsy nafamafisina ny kaontinao.';
                errorMessage.classList.remove('hidden');
                await signOut(auth);
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });
}

initialize();
