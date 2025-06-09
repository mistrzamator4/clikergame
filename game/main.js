let score = 0, clickPower = 1, autoClick = 0, exp = 0, level = 0;
let expNeeded = 100, m1 = 0, m2 = 0;

const scoreEl = document.getElementById('score');
const expEl = document.getElementById('exp');
const levelEl = document.getElementById('level');
const expNeededEl = document.getElementById('expNeeded');
const clickBtn = document.getElementById('click-btn');
const upClick = document.getElementById('upgrade-click');
const upAuto = document.getElementById('upgrade-auto');
const m1El = document.getElementById('m1');
const m2El = document.getElementById('m2');

function updAll() {
  scoreEl.textContent = score;
  expEl.textContent = exp;
  levelEl.textContent = level;
  expNeededEl.textContent = expNeeded;
  m1El.textContent = `${m1}/10`;
  m2El.textContent = `${m2}/500`;
}

function gainExp(x) {
  exp += x;
  while (exp >= expNeeded) {
    exp -= expNeeded;
    level++;
    expNeeded = Math.floor(expNeeded * 1.2);
  }
}

clickBtn.onclick = () => {
  score += clickPower; gainExp(clickPower);
  m1++; updAll();
};

upClick.onclick = () => {
  let cost = 50 * clickPower;
  if (score >= cost) {
    score -= cost; clickPower++; m2 += cost; updAll();
  }
};

upAuto.onclick = () => {
  let cost = 100 * (autoClick + 1);
  if (score >= cost) {
    score -= cost; autoClick++; m2 += cost; updAll();
  }
};

setInterval(() => {
  if (autoClick > 0) {
    score += autoClick;
    gainExp(autoClick);
    updAll();
  }
},1000);

document.querySelectorAll('.buy-item').forEach(b => {
  b.onclick = () => {
    const cost = +b.dataset.cost;
    const effect = b.dataset.effect;
    const amt = +b.dataset.amount;
    if (score >= cost) {
      score -= cost; m2 += cost;
      if (effect === 'extraClick') clickPower += amt;
      if (effect === 'autoClick') autoClick += amt;
      updAll();
    }
  };
});

// Init
updAll();
