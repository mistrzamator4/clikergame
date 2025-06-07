// main.js

// 1) Importy Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

// 2) Twoja konfiguracja Firebase (z index.html)
const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebasestorage.app",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770",
  measurementId: "G-TNJ32PDHHR"
};

// 3) Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 4) Unikalny identyfikator gracza
let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// 5) Początkowe wartości
let score = 0;
let clickValue = 1;
let autoClickValue = 0;
let exp = 0;
let level = 0;

// 6) Referencje do DOM
const scoreEl = document.getElementById('score');
const expEl = document.getElementById('exp');
const levelEl = document.getElementById('level');
const expNeededEl = document.getElementById('expNeeded');
const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const shopBtn = document.getElementById('shop-btn');
const shopEl = document.getElementById('shop');
const closeShopBtn = document.getElementById('close-shop');
const buyItems = document.querySelectorAll('.buy-item');

// 7) Obliczanie EXP potrzebnego na poziom
function expNeededForLevel(lvl) {
  return 100 * (lvl + 1);
}

// 8) Aktualizacja widoku
function updateDisplay() {
  scoreEl.textContent = score;
  expEl.textContent = exp;
  levelEl.textContent = level;
  expNeededEl.textContent = expNeededForLevel(level);
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
}

// 9) Zapis stanu gry do Firestore
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

// 10) Wczytywanie stanu gry z Firestore
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

// 11) Sprawdzanie awansu poziomu
function checkLevelUp() {
  const needed = expNeededForLevel(level);
  if (exp >= needed) {
    exp -= needed;
    level++;
    alert(`Gratulacje! Wbiłeś poziom ${level}!`);
  }
}

// 12) Obsługa kliknięcia
clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp += clickValue;
  checkLevelUp();
  updateDisplay();
  saveProgress();
});

// 13) Ulepszenia
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

// 14) Auto-click co sekundę
setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp += autoClickValue;
    checkLevelUp();
    updateDisplay();
    saveProgress();
  }
}, 1000);

// 15) Sklep
shopBtn.addEventListener('click', () => shopEl.classList.remove('hidden'));
closeShopBtn.addEventListener('click', () => shopEl.classList.add('hidden'));

buyItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const cost = +btn.dataset.cost;
    const effect = btn.dataset.effect;
    const amt = +btn.dataset.amount;
    if (score >= cost) {
      score -= cost;
      if (effect === 'extraClick') clickValue += amt;
      else if (effect === 'autoClick') autoClickValue += amt;
      updateDisplay();
      saveProgress();
      alert('Zakupiono!');
    } else {
      alert('Za mało punktów!');
    }
  });
});

// 16) Start: wczytaj i pokaż
async function startGame() {
  await loadProgress();
  updateDisplay();
}

startGame();
