let score = parseInt(localStorage.getItem('score')) || 0;
let clickValue = parseInt(localStorage.getItem('clickValue')) || 1;
let autoClickValue = parseInt(localStorage.getItem('autoClickValue')) || 0;

const scoreElem = document.getElementById('score');
const clickBtn = document.getElementById('click-btn');
const upgradeClickBtn = document.getElementById('upgrade-click');
const upgradeAutoBtn = document.getElementById('upgrade-auto');

function updateDisplay() {
  scoreElem.textContent = score;
  upgradeClickBtn.textContent = `Ulepsz kliknięcie (koszt: ${50 * clickValue})`;
  upgradeAutoBtn.textContent = `Automatyczne kliknięcie (koszt: ${100 * (autoClickValue + 1)})`;
}

function saveData() {
  localStorage.setItem('score', score);
  localStorage.setItem('clickValue', clickValue);
  localStorage.setItem('autoClickValue', autoClickValue);
}

clickBtn.addEventListener('click', () => {
  score += clickValue;
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
  updateDisplay();
  saveData();
}, 1000);

updateDisplay();
