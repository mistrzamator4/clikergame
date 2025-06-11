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

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db        = getFirestore(app);

let playerId = localStorage.getItem('playerId');
if (!playerId) {
  playerId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('playerId', playerId);
}
const userDoc = doc(db, "players", playerId);

let score          = 0;
let clickValue     = 1;
let autoClickValue = 0;
let exp            = 0;
let level          = 0;

// Missions system
const missionsData = [
  { id: 1, desc: "Kliknij 100 razy", goal: 100, progress: 0, reward: 50, completed: false },
  { id: 2, desc: "Zdobądź 500 punktów", goal: 500, progress: 0, reward: 100, completed: false },
  { id: 3, desc: "Osiągnij poziom 5", goal: 5, progress: 0, reward: 150, completed: false },
  { id: 4, desc: "Kup ulepszenie kliknięcia", goal: 1, progress: 0, reward: 200, completed: false, checkUpgrade: true }
];

const scoreEl        = document.getElementById('score');
const expEl          = document.getElementById('exp');
const levelEl        = document.getElementById('level');
const expNeededEl    = document.getElementById('expNeeded');
const clickBtn       = document.getElementById('click-btn');
const upgradeClickBtn= document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const shopBtn        = document.getElementById('shop-btn');
const shopEl         = document.getElementById('shop');
const closeShopBtn   = document.getElementById('close-shop');
const buyItems       = document.querySelectorAll('.buy-item');
const missionsListEl = document.getElementById('missions-list');
const notificationsEl= document.getElementById('notifications');

function expNeededForLevel(lvl) {
  return 100 * (lvl + 1);
}

function updateDisplay() {
  scoreEl.textContent         = score;
  expEl.textContent           = exp;
  levelEl.textContent         = level;
  expNeededEl.textContent     = expNeededForLevel(level);
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent  = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
}

function showNotification(text) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = text;
  notificationsEl.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}

function saveGame() {
  setDoc(userDoc, {
    score,
    clickValue,
    autoClickValue,
    exp,
    level,
    missionsData
  }).catch(console.error);
}

async function loadGame() {
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    const data = docSnap.data();
    score = data.score || 0;
    clickValue = data.clickValue || 1;
    autoClickValue = data.autoClickValue || 0;
    exp = data.exp || 0;
    level = data.level || 0;
    if (data.missionsData) {
      data.missionsData.forEach(m => {
        const mission = missionsData.find(md => md.id === m.id);
        if (mission) {
          mission.progress = m.progress;
          mission.completed = m.completed;
        }
      });
    }
  }
  updateDisplay();
  renderMissions();
}

function gainExp(amount) {
  exp += amount;
  while (exp >= expNeededForLevel(level)) {
    exp -= expNeededForLevel(level);
    level++;
    showNotification(`Poziom ${level}!`);
  }
  updateDisplay();
  saveGame();
}

function checkMissions() {
  missionsData.forEach(mission => {
    if (mission.completed) return;
    if (mission.checkUpgrade && clickValue > 1) {
      mission.completed = true;
      score += mission.reward;
      showNotification(`Misja ukończona: ${mission.desc} +${mission.reward} pkt`);
    } else if (!mission.checkUpgrade) {
      if (mission.id === 1 && mission.progress >= mission.goal) {
        mission.completed = true;
        score += mission.reward;
        showNotification(`Misja ukończona: ${mission.desc} +${mission.reward} pkt`);
      }
      if (mission.id === 2 && score >= mission.goal) {
        mission.completed = true;
        score += mission.reward;
        showNotification(`Misja ukończona: ${mission.desc} +${mission.reward} pkt`);
      }
      if (mission.id === 3 && level >= mission.goal) {
        mission.completed = true;
        score += mission.reward;
        showNotification(`Misja ukończona: ${mission.desc} +${mission.reward} pkt`);
      }
    }
  });
  updateDisplay();
  renderMissions();
  saveGame();
}

function renderMissions() {
  missionsListEl.innerHTML = '';
  missionsData.forEach(mission => {
    const li = document.createElement('li');
    li.textContent = mission.desc + (mission.completed ? ' (ukończona)' : ` (${mission.progress}/${mission.goal})`);
    if (mission.completed) li.classList.add('completed');
    missionsListEl.appendChild(li);
  });
}

clickBtn.addEventListener('click', () => {
  score += clickValue;
  gainExp(10);
  missionsData[0].progress++;
  checkMissions();
  updateDisplay();
  saveGame();
});

upgradeClickBtn.addEventListener('click', () => {
  const cost = 50 * clickValue;
  if (score >= cost) {
    score -= cost;
    clickValue++;
    showNotification(`Ulepszono kliknięcie! Teraz +${clickValue} pkt.`);
    checkMissions();
    updateDisplay();
    saveGame();
  } else {
    showNotification('Za mało punktów na ulepszenie kliknięcia.');
  }
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = 100 * (autoClickValue + 1);
  if (score >= cost) {
    score -= cost;
    autoClickValue++;
    showNotification(`Kupiono +1 automatyczne kliknięcie.`);
    checkMissions();
    updateDisplay();
    saveGame();
  } else {
    showNotification('Za mało punktów na automatyczne kliknięcie.');
  }
});

shopBtn.addEventListener('click', () => {
  shopEl.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
  shopEl.classList.add('hidden');
});

buyItems.forEach(button => {
  button.addEventListener('click', () => {
    const cost = Number(button.dataset.cost);
    const effect = button.dataset.effect;
    const amount = Number(button.dataset.amount);
    if (score >= cost) {
      score -= cost;
      if (effect === 'extraClick') clickValue += amount;
      if (effect === 'autoClick') autoClickValue += amount;
      showNotification(`Kupiono ${amount} ${effect === 'extraClick' ? 'kliknięć' : 'automatycznych kliknięć'}.`);
      updateDisplay();
      saveGame();
    } else {
      showNotification('Za mało punktów.');
    }
  });
});

// Automatyczne kliknięcie co sekundę
setInterval(() => {
  if (autoClickValue > 0) {
    score += autoClickValue;
    gainExp(autoClickValue * 5);
    updateDisplay();
    saveGame();
  }
}, 1000);

loadGame();
