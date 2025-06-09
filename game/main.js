let score = 0;
let clickPower = 1;
let autoClickPower = 0;
let exp = 0;
let level = 0;
let expNeeded = 100;

const scoreEl = document.getElementById("score");
const clickBtn = document.getElementById("click-btn");
const expEl = document.getElementById("exp");
const levelEl = document.getElementById("level");
const expNeededEl = document.getElementById("expNeeded");

const mission1El = document.getElementById("mission1");
const mission2El = document.getElementById("mission2");

let mission1Clicks = 0;
let mission2Spent = 0;

function updateUI() {
  scoreEl.textContent = Math.floor(score);
  expEl.textContent = Math.floor(exp);
  levelEl.textContent = level;
  expNeededEl.textContent = expNeeded;
  mission1El.textContent = `${mission1Clicks}/10`;
  mission2El.textContent = `${mission2Spent}/500`;
}

function gainExp(amount) {
  exp += amount;
  if (exp >= expNeeded) {
    level++;
    exp -= expNeeded;
    expNeeded = Math.floor(expNeeded * 1.3);
  }
}

clickBtn.addEventListener("click", () => {
  score += clickPower;
  gainExp(clickPower);
  mission1Clicks++;
  updateUI();
});

document.getElementById("upgrade-click").addEventListener("click", () => {
  if (score >= 50) {
    score -= 50;
    clickPower++;
    mission2Spent += 50;
    updateUI();
  }
});

document.getElementById("upgrade-auto").addEventListener("click", () => {
  if (score >= 100) {
    score -= 100;
    autoClickPower++;
    mission2Spent += 100;
    updateUI();
  }
});

setInterval(() => {
  if (autoClickPower > 0) {
    score += autoClickPower;
    gainExp(autoClickPower);
    updateUI();
  }
}, 1000);

document.querySelectorAll(".buy-item").forEach(button => {
  button.addEventListener("click", () => {
    const cost = parseInt(button.getAttribute("data-cost"));
    const effect = button.getAttribute("data-effect");
    const amount = parseInt(button.getAttribute("data-amount"));
    if (score >= cost) {
      score -= cost;
      mission2Spent += cost;
      if (effect === "extraClick") clickPower += amount;
      if (effect === "autoClick") autoClickPower += amount;
      updateUI();
    }
  });
});

updateUI();
