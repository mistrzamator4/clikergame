import { showNotification } from './utils.js';

const missionsListEl = document.getElementById('missions-list');

const missions = [
  { id: 'click10',   description: "Kliknij 10 razy",      target: 10,    reward: 50,    progressKey: 'clicksMade' },
  { id: 'score1000', description: "Zdobądź 1000 punktów", target: 1000,  reward: 100,   progressKey: 'score' },
  { id: 'level3',    description: "Osiągnij poziom 3",    target: 3,     reward: 150,   progressKey: 'level' },
];

export function renderMissions(data) {
  missionsListEl.innerHTML = '';
  for (const mission of missions) {
    const progress = data[mission.progressKey] || 0;
    const done = progress >= mission.target;
    const li = document.createElement('li');
    li.textContent = `${mission.description} - ${done ? 'Wykonano!' : `${progress} / ${mission.target}`}`;
    if (done && !data.completedMissions?.includes(mission.id)) {
      li.style.fontWeight = 'bold';
      li.style.color = '#1db954';
    }
    missionsListEl.appendChild(li);
  }
}

export function updateMissions(data) {
  if (!data.completedMissions) data.completedMissions = [];
  for (const mission of missions) {
    if (data.completedMissions.includes(mission.id)) continue;
    const progress = data[mission.progressKey] || 0;
    if (progress >= mission.target) {
      data.completedMissions.push(mission.id);
      data.score += mission.reward;
      showNotification(`Misja wykonana: ${mission.description} +${mission.reward} punktów!`);
    }
  }
  renderMissions(data);
}
