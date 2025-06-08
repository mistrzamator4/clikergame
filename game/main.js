const scoreEl = document.getElementById('score');
const clickBtn = document.getElementById('click-btn');
const missionsEl = document.getElementById('missions');

let score = 0;
let clickValue = 1;

let missionsData = [
  { id: 1, description: "Kliknij 10 razy", goal: 10, progress: 0, reward: 50, done: false },
  { id: 2, description: "Kliknij 50 razy", goal: 50, progress: 0, reward: 200, done: false },
  { id: 3, description: "Kliknij 100 razy", goal: 100, progress: 0, reward: 500, done: false }
];

// Kliknięcie
clickBtn.addEventListener('click', () => {
  score += clickValue;
  updateMissionsProgress(1);
  updateDisplay();
  saveGame();
});

// Aktualizuj misje
function updateMissionsProgress(amount) {
  missionsData.forEach(mission => {
    if (!mission.done) {
      mission.progress += amount;
      if (mission.progress >= mission.goal) {
        mission.done = true;
        score += mission.reward;
        alert(`Misja ukończona: "${mission.description}"! Otrzymujesz ${mission.reward} punktów.`);
      }
    }
  });
  updateMissionsDisplay();
}

// Wyświetl punkty i kliknięcia
function updateDisplay() {
  scoreEl.textContent = score;
}

// Wyświetl misje i ich status
function updateMissionsDisplay() {
  missionsEl.innerHTML = "";
  missionsData.forEach(mission => {
    const div = document.createElement('div');
    div.className = 'mission' + (mission.done ? ' done' : '');
    div.textContent = `${mission.description} (${Math.min(mission.progress, mission.goal)} / ${mission.goal})`;
    missionsEl.appendChild(div);
  });
}

// Zapis i wczytanie stanu gry
function saveGame() {
  localStorage.setItem('score', score);
  localStorage.setItem('clickValue', clickValue);
  localStorage.setItem('missionsData', JSON.stringify(missionsData));
}

function loadGame() {
  const savedScore = localStorage.getItem('score');
  if (savedScore) score = +savedScore;

  const savedClickValue = localStorage.getItem('clickValue');
  if (savedClickValue) clickValue = +savedClickValue;

  const savedMissions = localStorage.getItem('missionsData');
  if (savedMissions) missionsData = JSON.parse(savedMissions);

  updateDisplay();
  updateMissionsDisplay();
}

loadGame();
