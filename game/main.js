// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

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
getAnalytics(app);
const db = getFirestore(app);

let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

let score = 0, clickValue = 1, autoClickValue = 0, exp = 0, level = 0, expBonus = 0;

const scoreEl = document.getElementById('score'),
      expEl = document.getElementById('exp'),
      levelEl = document.getElementById('level'),
      expNeededEl = document.getElementById('expNeeded'),
      clickBtn = document.getElementById('click-btn'),
      upgradeClickBtn = document.getElementById('upgrade-click'),
      upgradeAutoBtn = document.getElementById('upgrade-auto'),
      shopBtn = document.getElementById('shop-btn'),
      shopEl = document.getElementById('shop'),
      cityEls = {
        house: document.getElementById('house'),
        factory: document.getElementById('factory'),
        school: document.getElementById('school')
      },
      missionsEl = document.getElementById('missions'),
      buyItems = document.querySelectorAll('.buy-item');

const buildings = {
  house: { built: false, cost: 100, effect: () => { clickValue += 1; } },
  factory: { built: false, cost: 300, effect: () => { autoClickValue += 1; } },
  school: { built: false, cost: 500, effect: () => { expBonus += 10; } }
};

function expNeededForLevel(l) { return 100 * (l + 1); }

function updateDisplay() {
  scoreEl.textContent = `Punkty: ${score}`;
  expEl.textContent = Math.floor(exp);
  levelEl.textContent = level;
  expNeededEl.textContent = expNeededForLevel(level);

  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;

  Object.keys(buildings).forEach(key => {
    if (buildings[key].built) cityEls[key].classList.add('built');
    else cityEls[key].classList.remove('built');
  });
}

async function saveProgress() {
  await setDoc(userDoc, {
    score, clickValue, autoClickValue, exp, level, expBonus,
    buildings: Object.fromEntries(Object.entries(buildings).map(([k,v])=>[k,v.built]))
  });
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
    expBonus = data.expBonus || 0;
    if (data.buildings) {
      Object.keys(data.buildings).forEach(k => buildings[k] && (buildings[k].built = data.buildings[k]));
    }
  }
  updateDisplay();
  updateMission();
}

function checkLevelUp() {
  const req = expNeededForLevel(level);
  if (exp >= req) {
    exp -= req;
    level++;
    alert(`Gratulacje! Wbiłeś poziom ${level}!`);
  }
}

clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp += clickValue * (1 + expBonus/100);
  checkLevelUp();
  updateDisplay();
  saveProgress();
});

upgradeClickBtn.addEventListener('click', () => {
  const cost = 50 * clickValue;
  if (score >= cost) {
    score -= cost; clickValue++; updateDisplay(); saveProgress();
  } else alert('Za mało punktów!');
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = 100 * (autoClickValue + 1);
  if (score >= cost) {
    score -= cost; autoClickValue++; updateDisplay(); saveProgress();
  } else alert('Za mało punktów!');
});

setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    exp += autoClickValue * (1 + expBonus/100);
    checkLevelUp();
    updateDisplay();
    saveProgress();
  }
}, 1000);

Object.keys(cityEls).forEach(key => {
  cityEls[key].addEventListener('click', () => {
    const b = buildings[key];
    if (b.built) return alert("Już zbudowane!");
    if (score >= b.cost) {
      score -= b.cost; b.built = true; b.effect();
      updateDisplay(); saveProgress(); updateMission(key);
      alert(`${key} zbudowane!`);
    } else alert("Za mało punktów!");
  });
});

shopBtn.addEventListener('click', () => shopEl.classList.remove('hidden'));
document.getElementById('close-shop').addEventListener('click', () => shopEl.classList.add('hidden'));
buyItems.forEach(btn =>
  btn.addEventListener('click', () => {
    const cost = +btn.dataset.cost, effect = btn.dataset.effect, amt = +btn.dataset.amount;
    if (score >= cost) {
      score -= cost;
      if (effect === 'extraClick') clickValue += amt;
      else if (effect === 'autoClick') autoClickValue += amt;
      updateDisplay(); saveProgress();
    } else alert('Za mało punktów!');
  })
);

function updateMission(last) {
  const next = last === 'house' ? 'Fabrykę (kliknij Fabrykę)' :
               last === 'factory' ? 'Szkołę (kliknij Szkołę)' :
               last === 'school' ? 'Wszystkie zbudowane!' : 'Zbuduj Dom';
  missionsEl.innerHTML = `<strong>Misja:</strong> ${next}`;
}

loadProgress();
