// main.js - moduł ES, wymaga włączenia <script type="module">

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

// Firebase config (Twoje dane)
const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebasestorage.app",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770",
  measurementId: "G-TNJ32PDHHR"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Unikalny ID gracza
let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// --- Stan gry ---
let score = 0;
let clickValue = 1;
let autoClickValue = 0;
let exp = 0;
let level = 0;

// --- Elementy DOM ---
const scoreEl = document.querySelector('#score span');
const expEl = document.getElementById('exp');
const expNeededEl = document.getElementById('expNeeded');
const levelEl = document.getElementById('level');
const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const notificationEl = document.getElementById('notification');

const tabButtons = document.querySelectorAll('nav .tab-btn');
const tabs = document.querySelectorAll('main section.tab');

// --- Funkcje pomocnicze ---

function showNotification(message) {
  notificationEl.textContent = message;
  notificationEl.classList.add('show');
  setTimeout(() => {
    notificationEl.classList.remove('show');
  }, 2000);
}

function updateUI() {
  scoreEl.textContent = score;
  expEl.textContent = exp;
  expNeededEl.textContent = getExpNeeded(level);
  levelEl.textContent = level;

  // Aktualizuj teksty ulepszeń z kosztami dynamicznie
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${upgradeClickCost()})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${upgradeAutoCost()})`;
}

function getExpNeeded(lvl) {
  return 100 + lvl * 50;
}

function upgradeClickCost() {
  return 50 + level * 20;
}

function upgradeAutoCost() {
  return 100 + level * 50;
}

function levelUp() {
  while (exp >= getExpNeeded(level)) {
    exp -= getExpNeeded(level);
    level++;
    showNotification(`Gratulacje! Awansowałeś na poziom ${level}!`);
  }
}

// --- Logika gry ---

clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp += 5;
  levelUp();
  updateUI();
  animateScore('+ ' + clickValue);
});

upgradeClickBtn.addEventListener('click', () => {
  const cost = upgradeClickCost();
  if (score >= cost) {
    score -= cost;
    clickValue++;
    showNotification('Kliknięcie ulepszone!');
    updateUI();
  } else {
    showNotification('Nie masz wystarczająco punktów!');
  }
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = upgradeAutoCost();
  if (score >= cost) {
    score -= cost;
    autoClickValue++;
    showNotification('Automatyczne kliknięcie ulepszone!');
    updateUI();
  } else {
    showNotification('Nie masz wystarczająco punktów!');
  }
});

// Automatyczne kliknięcia
setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp += autoClickValue * 2;
    levelUp();
    updateUI();
    animateScore(`+${autoClickValue} (auto)`);
  }
}, 3000);

// Zakup w sklepie
document.querySelectorAll('.buy-item').forEach(button => {
  button.addEventListener('click', () => {
    const cost = Number(button.dataset.cost);
    const effect = button.dataset.effect;
    const amount = Number(button.dataset.amount);
    if (score >= cost) {
      score -= cost;
      if (effect === 'extraClick') {
        clickValue += amount;
      } else if (effect === 'autoClick') {
        autoClickValue += amount;
      }
      showNotification(`Zakupiono ${amount} ${effect === 'extraClick' ? 'kliknięć' : 'automatycznych kliknięć'}!`);
      updateUI();
    } else {
      showNotification('Nie masz wystarczająco punktów!');
    }
  });
});

// Animacja licznika punktów przy kliknięciu
function animateScore(text) {
  const anim = document.createElement('div');
  anim.textContent = text;
  anim.style.position = 'absolute';
  anim.style.left = clickBtn.offsetLeft + clickBtn.offsetWidth / 2 + 'px';
  anim.style.top = clickBtn.offsetTop + 'px';
  anim.style.color = '#76c7b7';
  anim.style.fontWeight = '700';
  anim.style.userSelect = 'none';
  anim.style.pointerEvents = 'none';
  anim.style.zIndex = 1000;
  anim.style.transition = 'all 1s ease';
  document.getElementById('app').appendChild(anim);

  setTimeout(() => {
    anim.style.transform = 'translateY(-50px)';
    anim.style.opacity = '0';
  }, 10);

  setTimeout(() => {
    anim.remove();
  }, 1000);
}

// Zakładki
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
  });
});

// --- Firebase - zapis i wczytywanie danych ---

async function loadGame() {
  try {
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      score = data.score || 0;
      clickValue = data.clickValue || 1;
      autoClickValue = data.autoClickValue || 0;
      exp = data.exp || 0;
      level = data.level || 0;
      updateUI();
    }
  } catch (err) {
    console.error("Błąd wczytywania danych:", err);
  }
}

async function saveGame() {
  try {
    await setDoc(userDoc, {
      score,
      clickValue,
      autoClickValue,
      exp,
      level,
      updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Błąd zapisu danych:", err);
  }
}

// Autosave co 10 sekund
setInterval(saveGame, 10000);

window.addEventListener('beforeunload', saveGame);

// Start
loadGame();
updateUI();
