import { showNotification } from './utils.js';

const achievementsListEl = document.getElementById('achievements-list');

const achievements = [
  { id: 'firstClick',     name: "Pierwszy klik",       description: "Kliknij pierwszy raz",          condition: data => data.score >= 1 },
  { id: 'level5',         name: "Poziom 5",            description: "Osiągnij poziom 5",             condition: data => data.level >= 5 },
  { id: 'clickerMaster',  name: "Mistrz Kliknięć",     description: "Kup 10 ulepszeń kliknięcia",    condition: data => data.clickValue >= 10 },
  { id: 'autoClicker',    name: "AutoKlik",            description: "Kup 5 automatycznych kliknięć", condition: data => data.autoClickValue >= 5 },
];

export function checkAchievements(data) {
  let unlocked = [];
  for (const ach of achievements) {
    if (!data.achievements) data.achievements = {};
    if (!data.achievements[ach.id] && ach.condition(data)) {
      data.achievements[ach.id] = true;
      showNotification(`Osiągnięcie odblokowane: ${ach.name}!`);
      unlocked.push(ach.id);
    }
  }
  renderAchievements(data.achievements);
  return unlocked;
}

export function renderAchievements(achievementsData = {}) {
  achievementsListEl.innerHTML = '';
  for (const ach of achievements) {
    const li = document.createElement('li');
    li.textContent = ach.name + ": " + ach.description;
    li.style.textDecoration = achievementsData[ach.id] ? 'line-through' : 'none';
    achievementsListEl.appendChild(li);
  }
}
