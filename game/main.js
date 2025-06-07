// main.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Unique player ID
let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// Game state variables
let score = 0;
let clickValue = 1;
let autoClickValue = 0;
let exp = 0;
let level = 0;

// DOM elements
const scoreEl = document.getElementById('score');
const expEl = document.getElementById('exp');
const levelEl = document.getElementById('level');
const expNeededEl = document.getElementById('expNeeded');
const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const shopBtn = document.getElementById('shop-btn');
const shopEl = document.getElementById('shop');

// Upgrades available in the shop
const upgrades = [
  { id: 'extraClick', name: '+1 do kliknięcia', cost: 200, amount: 1 },
  { id: 'autoClick', name: '+2 automatyczne kliknięcia', cost: 500, amount: 2 },
  { id: 'megaClick', name: '+10 do kliknięcia', cost: 2000, amount: 10 },
  { id: 'megaAutoClick', name: '+10 automatyczne kliknięcia', cost: 4000, amount: 10 },
];

// Calculate EXP needed for next level (exponential growth)
function expNeededForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.5, lvl));
}

// Update UI elements
function updateDisplay() {
  scoreEl.textContent = score;
  expEl.textContent = exp;
  levelEl.textContent = level;
  expNeededEl.textContent = expNeededForLevel(level);
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
}

// Save progress to Firestore
async function saveProgress() {
  try {
    await setDoc(userDoc, {
      score,
      clickValue,
      autoClickValue,
      exp,
      level
    });
  } catch (e) {
    console.error("Błąd zapisu do Firebase:", e);
  }
}

// Load progress from Firestore
async function loadProgress() {
  try {
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const data = snap.data();
      score = data.score || 0;
      clickValue = data.clickValue || 1;
      autoClickValue = data.autoClickValue || 0;
      exp = data.exp || 0;
      level = data.level || 0;
    }
  } catch (e) {
    console.error("Błąd wczytywania z Firebase:", e);
  }
  updateDisplay();
}

// Animate level up effect
function animateLevelUp() {
  levelEl.classList.add('level-up');
  setTimeout(() => levelEl.classList.remove('level-up'), 1000);
}

// Check if player can level up, allow multiple level ups if enough EXP
function checkLevelUp() {
  let leveledUp = false;
  while (exp >= expNeededForLevel(level)) {
    exp -= expNeededForLevel(level);
    level++;
    leveledUp = true;
  }
  if (leveledUp) {
    animateLevelUp();
    alert(`Gratulacje! Wbiłeś poziom ${level}!`);
  }
}

// Handle click button
clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp += clickValue;
  checkLevelUp();
  updateDisplay();
  saveProgress();
});

// Handle upgrades
upgradeClickBtn.addEventListener('click', () => {
  const cost = 50 * clickValue;
  if (score >= cost) {
    score -= cost;
    clickValue++;
    updateDisplay();
    saveProgress();
  } else {
    alert('Za mało punktów!');
  }
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = 100 * (autoClickValue + 1);
  if (score >= cost) {
    score -= cost;
    autoClickValue++;
    updateDisplay();
    saveProgress();
  } else {
    alert('Za mało punktów!');
  }
});

// Auto-click every second
setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp += autoClickValue;
    checkLevelUp();
    updateDisplay();
    saveProgress();
  }
}, 1000);

// Shop UI render and functionality
function renderShopItems() {
  shopEl.innerHTML = '<h2>Sklep</h2>';
  upgrades.forEach(upg => {
    shopEl.innerHTML += `<button class="buy-item" data-cost="${upg.cost}" data-effect="${upg.id}" data-amount="${upg.amount}">
      Kup ${upg.name} (${upg.cost} punktów)
    </button>`;
  });
  shopEl.innerHTML += `<button id="close-shop">Zamknij sklep</button>`;

  document.getElementById('close-shop').addEventListener('click', () => {
    shopEl.classList.add('hidden');
  });

  document.querySelectorAll('.buy-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const cost = +btn.dataset.cost;
      const effect = btn.dataset.effect;
      const amt = +btn.dataset.amount;
      if (score >= cost) {
        score -= cost;
        if (effect === 'extraClick' || effect === 'megaClick') clickValue += amt;
        else if (effect === 'autoClick' || effect === 'megaAutoClick') autoClickValue += amt;

        updateDisplay();
        saveProgress();
        alert('Zakupiono!');
      } else {
        alert('Za mało punktów!');
      }
    });
  });
}

// Shop button toggles
shopBtn.addEventListener('click', () => {
  renderShopItems();
  shopEl.classList.remove('hidden');
});

// Initial load
(async () => {
  await loadProgress();
  updateDisplay();
})();
