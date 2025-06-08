import { initializeApp }   from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics }    from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfMD9KaoaiBse0JT450AW3d4hr6a-iLeQ",
  authDomain: "clickerprostagra.firebaseapp.com",
  projectId: "clickerprostagra",
  storageBucket: "clickerprostagra.firebasestorage.app",
  messagingSenderId: "918100413777",
  appId: "1:918100413777:web:27b56666de3d3eb1421770",
  measurementId: "G-TNJ32PDHHR"
};

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db        = getFirestore(app);

let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

// Game state
let score          = 0;
let clickValue     = 1;
let autoClickValue = 0;
let exp            = 0;
let level          = 0;

const scoreEl        = document.getElementById('score');
const expEl          = document.getElementById('exp');
const levelEl        = document.getElementById('level');
const expNeededEl    = document.getElementById('expNeeded');
const clickBtn       = document.getElementById('click-btn');
const upgradeClickBtn= document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const shopEl         = document.getElementById('shop');
const upgradesEl     = document.getElementById('upgrades');
const toggleShopBtn  = document.getElementById('toggle-shop-btn');
const toggleUpgradesBtn = document.getElementById('toggle-upgrades-btn');
const buyItems       = document.querySelectorAll('.buy-item');

function expNeededForLevel(lvl) {
  return 100 * (lvl + 1);
}

function updateDisplay() {
  scoreEl.textContent         = Math.floor(score);
  expEl.textContent           = Math.floor(exp);
  levelEl.textContent         = level;
  expNeededEl.textContent     = expNeededForLevel(level);
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent  = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
}

async function saveProgress() {
  try {
    await setDoc(userDoc, {
      score: Math.floor(score),
      clickValue,
      autoClickValue,
      exp: Math.floor(exp),
      level
    });
  } catch(e) {
    console.error("Błąd zapisu do Firebase:", e);
  }
}

async function loadProgress() {
  try {
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const data = snap.data();
      score          = data.score || 0;
      clickValue     = data.clickValue || 1;
      autoClickValue = data.autoClickValue || 0;
      exp            = data.exp || 0;
      level          = data.level || 0;
    }
  } catch(e) {
    console.error("Błąd wczytywania z Firebase:", e);
  }
  updateDisplay();
}

function checkLevelUp() {
  const needed = expNeededForLevel(level);
  if (exp >= needed) {
    exp -= needed;
    level++;
    alert(`Gratulacje! Wbiłeś poziom ${level}!`);
  }
}

clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp   += clickValue;
  checkLevelUp();
  updateDisplay();
  saveProgress();
});

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

setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp   += autoClickValue;
    checkLevelUp();
    updateDisplay();
    saveProgress();
  }
}, 1000);

toggleShopBtn.addEventListener('click', () => {
  shopEl.classList.toggle('hidden');
  if (!shopEl.classList.contains('hidden')) upgradesEl.classList.add('hidden');
});
toggleUpgradesBtn.addEventListener('click', () => {
  upgradesEl.classList.toggle('hidden');
  if (!upgradesEl.classList.contains('hidden')) shopEl.classList.add('hidden');
});

buyItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const cost  
