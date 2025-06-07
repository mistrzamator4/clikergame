// Pobieramy dane z localStorage lub ustawiamy na start
let score = parseInt(localStorage.getItem('score')) || 0;
let clickValue = parseInt(localStorage.getItem('clickValue')) || 1;
let autoClickValue = parseInt(localStorage.getItem('autoClickValue')) || 0;

let exp = parseInt(localStorage.getItem('exp')) || 0;
let level = parseInt(localStorage.getItem('level')) || 0;
const expNeededBase = 100; // bazowy exp na lvl 1

// Elementy DOM
const scoreElem = document.getElementById('score');
const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');
const expElem = document.getElementById('exp');
const levelElem = document.getElementById('level');
const expNeededElem = document.getElementById('expNeeded');
const shopBtn = document.getElementById('shop-btn');
const shopElem = document.getElementById('shop');
const closeShopBtn = document.getElementById('close-shop');
const buyItems = document.querySelectorAll('.buy-item');

function expNeededForLevel(lvl) {
  return expNeededBase * (lvl + 1);
}

function updateDisplay() {
  scoreElem.textContent = score;
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
  
  expElem.textContent = exp;
  levelElem.textContent = level;
  expNeededElem.textContent = expNeededForLevel(level);
}

function saveData() {
  localStorage.setItem('score', score);
  localStorage.setItem('clickValue', clickValue);
  localStorage.setItem('autoClickValue', autoClickValue);
  localStorage.setItem('exp', exp);
  localStorage.setItem('level', level);
}

function checkLevelUp() {
  const needed = expNeededForLevel(level);
  if (exp >= needed) {
    level++;
    exp -= needed;
    alert(`Gratulacje! Wbiłeś poziom ${level}!`);
  }
}

clickBtn.addEventListener('click', () => {
  score += clickValue;
  exp += clickValue; // Za każde kliknięcie dajemy exp
  checkLevelUp();
  updateDisplay();
  saveData();
});

upgradeClickBtn.addEventListener('click', () => {
  const cost = 50 * clickValue;
  if (score >= cost) {
    score -= cost;
    clickValue += 1;
    updateDisplay();
    saveData();
  } else {
    alert('Za mało punktów na ulepszenie kliknięcia!');
  }
});

upgradeAutoBtn.addEventListener('click', () => {
  const cost = 100 * (autoClickValue + 1);
  if (score >= cost) {
    score -= cost;
    autoClickValue += 1;
    updateDisplay();
    saveData();
  } else {
    alert('Za mało punktów na automatyczne kliknięcie!');
  }
});

// Automatyczne kliknięcie co sekundę
setInterval(() => {
  score += autoClickValue;
  exp += autoClickValue;
  checkLevelUp();
  updateDisplay();
  saveData();
}, 1000);

// Sklep
shopBtn.addEventListener('click', () => {
  shopElem.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
  shopElem.classList.add('hidden');
});

buyItems.forEach(button => {
  button.addEventListener('click', () => {
    const cost = parseInt(button.dataset.cost);
    const effect = button.dataset.effect;
    const amount = parseInt(button.dataset.amount);

    if (score >= cost) {
      score -= cost;
      if (effect === 'extraClick') {
        clickValue += amount;
      } else if (effect === 'autoClick') {
        autoClickValue += amount;
      }
      updateDisplay();
      saveData();
      alert(`Kupiono za ${cost} punktów!`);
    } else {
      alert('Za mało punktów na zakup!');
    }
  });
});

updateDisplay();
