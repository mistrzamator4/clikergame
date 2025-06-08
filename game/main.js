// main.js

// Firebase imports
import { initializeApp }   from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics }    from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebasestorage.app",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770",
  measurementId: "G-TNJ32PDHHR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Player ID setup
let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// Game state
let state = {
  score: 0,
  clickValue: 1,
  autoClickValue: 0,
  exp: 0,
  level: 0,
  prestigeLevel: 0,
  clickBoostActive: false,
  clickBoostMultiplier: 2,
  clickBoostTimeLeft: 0,
  missions: [],
  achievements: [],
  achievementsUnlocked: new Set()
};

// DOM Elements
const scoreEl = document.getElementById('score');
const expEl = document.getElementById('exp');
const levelEl = document.getElementById('level');
const expNeededEl = document.getElementById('expNeeded');
const prestigeLevelEl = document.getElementById('prestigeLevel');

const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const shopItems = document.querySelectorAll('.buy-item');
const missionListEl = document.getElementById('mission-list');
const achievementListEl = document.getElementById('achievement-list');
const prestigeBtn = document.getElementById('prestige-btn');
const notificationEl = document.getElementById('notification');

const clickSound = document.getElementById('click-sound');
const upgradeSound = document.getElementById('upgrade-sound');
const achievementSound = document.getElementById('achievement-sound');
const prestigeSound = document.getElementById('prestige-sound');

// Utility
function showNotification(message, time = 3000) {
  notificationEl.textContent = message;
  notificationEl.classList.remove('hidden');
  setTimeout(() => notificationEl.classList.add('hidden'), time);
}

// Calculate exp needed for next level
function expNeededForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.5, lvl));
}

// Update UI display
function updateDisplay() {
  scoreEl.textContent = Math.floor(state.score);
  expEl.textContent = Math.floor(state.exp);
  levelEl.textContent = state.level;
  expNeededEl.textContent = expNeededForLevel(state.level);
  prestigeLevelEl.textContent = state.prestigeLevel;

  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${upgradeClickCost()})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${upgradeAutoCost()})`;
}

// Upgrade costs (dynamic scaling)
function upgradeClickCost() {
  return 50 * Math.pow(1.7, state.clickValue - 1);
}

function upgradeAutoCost() {
  return 100 * Math.pow(1.8, state.autoClickValue);
}

// Click handler
function onClick() {
  const value = state.clickBoostActive ? state.clickValue * state.clickBoostMultiplier : state.clickValue;
  state.score += value;
  state.exp += value;

  clickSound.currentTime = 0;
  clickSound.play();

  checkLevelUp();
  checkMissions();
  checkAchievements();

  updateDisplay();
  animateClick();
}

// Animate button click
function animateClick() {
  clickBtn.classList.add('clicked');
  setTimeout(() => clickBtn.classList.remove('clicked'), 150);
}

// Level up
function checkLevelUp() {
  const needed = expNeededForLevel(state.level);
  if (state.exp >= needed) {
    state.exp -= needed;
    state.level++;
    showNotification(`Gratulacje! Awansowałeś na poziom ${state.level}!`);
    upgradeSound.currentTime = 0;
    upgradeSound.play();
  }
}

// Upgrades
function buyUpgradeClick() {
  const cost = upgradeClickCost();
  if (state.score >= cost) {
    state.score -= cost;
    state.clickValue++;
    upgradeSound.currentTime = 0;
    upgradeSound.play();
    updateDisplay();
    checkMissions();
    checkAchievements();
  } else {
    showNotification("Nie masz wystarczająco punktów!");
  }
}

function buyUpgradeAuto() {
  const cost = upgradeAutoCost();
  if (state.score >= cost) {
    state.score -= cost;
    state.autoClickValue++;
    upgradeSound.currentTime = 0;
    upgradeSound.play();
    updateDisplay();
    checkMissions();
    checkAchievements();
  } else {
    showNotification("Nie masz wystarczająco punktów!");
  }
}

// Auto click interval
setInterval(() => {
  if (state.autoClickValue > 0) {
    state.score += state.autoClickValue;
    state.exp += state.autoClickValue;
    updateDisplay();
    checkLevelUp();
    checkMissions();
    checkAchievements();
  }
}, 1000);

// Shop purchase handler
shopItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const cost = parseInt(btn.dataset.cost);
    if (state.score < cost) {
      showNotification("Nie masz wystarczająco punktów!");
      return;
    }
    const effect = btn.dataset.effect;
    const amount = parseInt(btn.dataset.amount) || 1;
    const duration = parseInt(btn.dataset.duration) || 0;

    state.score -= cost;

    if (effect === "extraClick") {
      state.clickValue += amount;
      showNotification(`Kliknięcie ulepszone o +${amount}!`);
    }
    else if (effect === "autoClick") {
      state.autoClickValue += amount;
      showNotification(`Dodano +${amount} automatycznych kliknięć!`);
    }
    else if (effect === "clickBoost" && duration > 0) {
      activateClickBoost(duration);
      showNotification(`Boost kliknięcia x${state.clickBoostMultiplier} aktywowany na ${duration} sekund!`);
    }

    upgradeSound.currentTime = 0;
    upgradeSound.play();

    updateDisplay();
    checkMissions();
    checkAchievements();
  });
});

// Click boost activation
function activateClickBoost(seconds) {
  state.clickBoostActive = true;
  state.clickBoostTimeLeft = seconds;
  if (!state.clickBoostInterval) {
    state.clickBoostInterval = setInterval(() => {
      state.clickBoostTimeLeft--;
      if (state.clickBoostTimeLeft <= 0) {
        clearInterval(state.clickBoostInterval);
        state.clickBoostInterval = null;
        state.clickBoostActive = false;
        showNotification("Boost kliknięcia wygasł");
      }
    }, 1000);
  }
}

// Missions system
const missions = [
  { id: 1, description: "Kliknij 100 razy", condition: () => state.score >= 100, reward: 50, completed: false },
  { id: 2, description: "Awansuj na poziom 3", condition: () => state.level >= 3, reward: 100, completed: false },
  { id: 3, description: "Kup ulepszenie kliknięcia", condition: () => state.clickValue > 1, reward: 150, completed: false },
  { id: 4, description: "Kup 3 automatyczne kliknięcia", condition: () => state.autoClickValue >= 3, reward: 200, completed: false },
  { id: 5, description: "Zdobyj 1000 punktów", condition: () => state.score >= 1000, reward: 500, completed: false }
];

// Display missions
function renderMissions() {
  missionListEl.innerHTML = "";
  missions.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.description} - ${m.completed ? "Wykonane" : "W trakcie"}`;
    if (m.completed) li.classList.add('completed');
    missionListEl.appendChild(li);
  });
}

// Check missions progress
function checkMissions() {
  missions.forEach(m => {
    if (!m.completed && m.condition()) {
      m.completed = true;
      state.score += m.reward;
      showNotification(`Misja ukończona! +${m.reward} punktów`);
      achievementSound.currentTime = 0;
      achievementSound.play();
      renderMissions();
    }
  });
}

// Achievements system
const achievements = [
  { id: 1, description: "Pierwszy klik", condition: () => state.score >= 1 },
  { id: 2, description: "100 punktów", condition: () => state.score >= 100 },
  { id: 3, description: "Poziom 5", condition: () => state.level >= 5 },
  { id: 4, description: "10 ulepszeń kliknięcia", condition: () => state.clickValue >= 10 },
  { id: 5, description: "Prestiż 1", condition: () => state.prestigeLevel >= 1 }
];

function renderAchievements() {
  achievementListEl.innerHTML = "";
  achievements.forEach(a => {
    const li = document.createElement('li');
    const unlocked = state.achievementsUnlocked.has(a.id);
    li.textContent = `${a.description} - ${unlocked ? "Odblokowane" : "Zablokowane"}`;
    if (unlocked) li.classList.add('completed');
    achievementListEl.appendChild(li);
  });
}

function checkAchievements() {
  achievements.forEach(a => {
    if (!state.achievementsUnlocked.has(a.id) && a.condition()) {
      state.achievementsUnlocked.add(a.id);
      showNotification(`Osiągnięcie odblokowane: ${a.description}`);
      achievementSound.currentTime = 0;
      achievementSound.play();
      renderAchievements();
    }
  });
}

// Prestige system
function canPrestige() {
  return state.level >= 10;
}

function prestige() {
  if (!canPrestige()) {
    showNotification("Musisz osiągnąć co najmniej poziom 10, aby aktywować prestiż!");
    return;
  }
  state.prestigeLevel++;
  showNotification(`Prestiż aktywowany! Poziom prestiżu: ${state.prestigeLevel}`);
  prestigeSound.currentTime = 0;
  prestigeSound.play();

  // Reset podstawowych wartości, zachowując prestiż
  state.score = 0;
  state.exp = 0;
  state.level = 0;
  state.clickValue = 1 + state.prestigeLevel; // bonus z prestiżu
  state.autoClickValue = 0;
  state.clickBoostActive = false;
  state.clickBoostTimeLeft = 0;
  missions.forEach(m => m.completed = false);
  state.achievementsUnlocked.clear();

  renderMissions();
  renderAchievements();
  updateDisplay();
}

prestigeBtn.addEventListener('click', prestige);

// Event listeners
clickBtn.addEventListener('click', onClick);
upgradeClickBtn.addEventListener('click', buyUpgradeClick);
upgradeAutoBtn.addEventListener('click', buyUpgradeAuto);

// Init render
renderMissions();
renderAchievements();
updateDisplay();

// Save/load state could be added here with Firebase or localStorage

