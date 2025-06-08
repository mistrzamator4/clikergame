import { showNotification } from './utils.js';
import { initShop, updateUI as updateShopUI } from './shop.js';
import { renderMissions, updateMissions } from './missions.js';
import { checkAchievements, renderAchievements } from './achievements.js';

const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const buyDoubleExpBtn = document.getElementById('buy-double-exp');

let gameData = {
  score: 0,
  exp: 0,
  expNeeded: 100,
  level: 0,
  clickValue: 1,
  autoClickValue: 0,
  premiumCurrency: 0,
  achievements: {},
  completedMissions: [],
  clicksMade: 0,
  doubleExpActive: false,
  doubleExpTimer: 0,
};

function saveGame() {
  localStorage.setItem('clickerGameData', JSON.stringify(gameData));
}

function loadGame() {
  const saved = localStorage.getItem('clickerGameData');
  if (saved) {
    gameData = JSON.parse(saved);
  }
}

function levelUp() {
  while (gameData.exp >= gameData.expNeeded) {
    gameData.exp -= gameData.expNeeded;
    gameData.level++;
    gameData.expNeeded = Math.floor(gameData.expNeeded * 1.25);
    showNotification(`Poziom wyższy! Teraz jesteś na poziomie ${gameData.level}`);
  }
}

function gainExp(amount) {
  if (gameData.doubleExpActive) amount *= 2;
  gameData.exp += amount;
  levelUp();
}

clickBtn.addEventListener('click', () => {
  gameData.score += gameData.clickValue;
  gameData.clicksMade++;
  gainExp(5);
  updateUI();
  updateMissions(gameData);
  checkAchievements(gameData);
  saveGame();
});

upgradeClickBtn.addEventListener('click', () => {
  const cost = 50 + gameData.clickValue * 20;
  if (gameData.score >= cost) {
    gameData.score -= cost;
    gameData.clickValue++;
    showNotification(`Kliknięcie ulepszone! Teraz +${gameData.clickValue}`);
    updateUI();
    saveGame();
  } else {
    showNotification("Za mało punktów!");
  }
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = 100 + gameData.autoClickValue * 30;
  if (gameData.score >= cost) {
    gameData.score -= cost;
    gameData.autoClickValue++;
    showNotification(`Automatyczne kliknięcie ulepszone! Teraz +${gameData.autoClickValue}`);
    updateUI();
    saveGame();
  } else {
    showNotification("Za mało punktów!");
  }
});

buyDoubleExpBtn.addEventListener('click', () => {
  const cost = 300;
  if (gameData.premiumCurrency >= cost) {
    if (!gameData.doubleExpActive) {
      gameData.premiumCurrency -= cost;
      gameData.doubleExpActive = true;
      gameData.doubleExpTimer = 60 * 60; // 60 sekund (lub 3600 jeśli chcesz 1h)
      showNotification("x2 EXP aktywne przez 60 sekund!");
      saveGame();
    } else {
      showNotification("Masz już aktywne x2 EXP!");
    }
  } else {
    showNotification("Za mało waluty premium!");
  }
});

function autoClicker() {
  if (gameData.autoClickValue > 0) {
    gameData.score += gameData.autoClickValue;
    gainExp(gameData.autoClickValue * 2);
    updateUI();
    updateMissions(gameData);
    checkAchievements(gameData);
    saveGame();
  }
}

function updateUI() {
  document.getElementById('score').textContent = gameData.score;
  document.getElementById('exp').textContent = gameData.exp;
  document.getElementById('expNeeded').textContent = gameData.expNeeded;
  document.getElementById('level').textContent = gameData.level;
  document.getElementById('premium-currency').textContent = gameData.premiumCurrency;
  document.getElementById('upgrade-click').textContent = `Ulepsz kliknięcie (koszt: ${50 + gameData.clickValue * 20}) - aktualnie: +${gameData.clickValue}`;
  document.getElementById('upgrade-auto').textContent = `Automatyczne kliknięcie (koszt: ${100 + gameData.autoClickValue * 30}) - aktualnie: +${gameData.autoClickValue}`;

  renderMissions(gameData);
  renderAchievements(gameData.achievements);
  updateShopUI(gameData);
}

function tick() {
  if (gameData.doubleExpActive) {
    gameData.doubleExpTimer--;
    if (gameData.doubleExpTimer <= 0) {
      gameData.doubleExpActive = false;
      showNotification("x2 EXP wygasło.");
    }
  }
  autoClicker();
  saveGame();
  updateUI();
}

loadGame();
initShop(gameData);
updateUI();

setInterval(tick, 1000);
