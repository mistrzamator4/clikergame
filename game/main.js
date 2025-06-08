import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebaseapp.com",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Gracz
let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// Zmienne
let score = 0, clickValue = 1, autoClickValue = 0, exp = 0, level = 0;

// DOM
const scoreEl = document.getElementById("score");
const expEl = document.getElementById("exp");
const levelEl = document.getElementById("level");
const expNeededEl = document.getElementById("expNeeded");
const clickBtn = document.getElementById("click-btn");
const upgradeClickBtn = document.getElementById("upgrade-click");
const upgradeAutoBtn = document.getElementById("upgrade-auto");
const buyItems = document.querySelectorAll(".buy-item");

// Obliczenia
function expNeededForLevel(lvl) {
  return 100 * (lvl + 1);
}

function updateDisplay() {
  scoreEl.textContent = Math.floor(score);
  expEl.textContent = Math.floor(exp);
  levelEl.textContent = level;
  expNeededEl.textContent = expNeededForLevel(level);
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Auto-klikanie (koszt: ${100 * (autoClickValue + 1)})`;
}

async function saveProgress() {
  await setDoc(userDoc, { score, clickValue, autoClickValue, exp, level });
}

async function loadProgress() {
  const snap = await getDoc(userDoc);
  if (snap.exists()) {
    const data = snap.data();
    score = data.score || 0;
    clickValue = data.clickValue || 1;
    autoClickValue = data.autoClickValue || 0;
    exp = data.exp || 0;
    level = data.level || 0;
  }
  updateDisplay();
}

function checkLevelUp() {
  const needed = expNeededForLevel(level);
  if (exp >= needed) {
    exp -= needed;
    level++;
    alert(`Awansowałeś na poziom ${level}!`);
  }
}

clickBtn.addEventListener("click", () => {
  score += clickValue;
  exp += clickValue;
  checkLevelUp();
  updateDisplay();
  saveProgress();
});

upgradeClickBtn.addEventListener("click", () => {
  const cost = 50 * clickValue;
  if (score >= cost) {
    score -= cost;
    clickValue++;
    updateDisplay();
    saveProgress();
  } else {
    alert("Za mało punktów!");
  }
});

upgradeAutoBtn.addEventListener("click", () => {
  const cost = 100 * (autoClickValue + 1);
  if (score >= cost) {
    score -= cost;
    autoClickValue++;
    updateDisplay();
    saveProgress();
  } else {
    alert("Za mało punktów!");
  }
});

buyItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const cost = parseInt(btn.dataset.cost);
    const amount = parseInt(btn.dataset.amount);
    const effect = btn.dataset.effect;

    if (score >= cost) {
      score -= cost;
      if (effect === "extraClick") clickValue += amount;
      if (effect === "autoClick") autoClickValue += amount;
      updateDisplay();
      saveProgress();
      alert("Zakupiono!");
    } else {
      alert("Za mało punktów!");
    }
  });
});

setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp += autoClickValue;
    checkLevelUp();
    updateDisplay();
    saveProgress();
  }
}, 1000);

await loadProgress();
