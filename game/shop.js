import { showNotification } from './utils.js';

const shopEl = document.getElementById('shop');
const shopBtn = document.getElementById('shop-btn');
const closeShopBtn = document.getElementById('close-shop');

let gameData = null;

export function initShop(data) {
  gameData = data;
  shopBtn.addEventListener('click', () => {
    shopEl.classList.remove('hidden');
  });
  closeShopBtn.addEventListener('click', () => {
    shopEl.classList.add('hidden');
  });

  shopEl.querySelectorAll('.buy-item').forEach(button => {
    button.addEventListener('click', () => {
      const cost = Number(button.dataset.cost);
      const effect = button.dataset.effect;
      const amount = Number(button.dataset.amount);

      if (gameData.score < cost) {
        showNotification("Nie masz wystarczająco punktów!");
        return;
      }
      gameData.score -= cost;

      switch (effect) {
        case 'extraClick':
          gameData.clickValue += amount;
          showNotification(`Kliknięcie ulepszone o +${amount}!`);
          break;
        case 'autoClick':
          gameData.autoClickValue += amount;
          showNotification(`Automatyczne kliknięcie +${amount}!`);
          break;
        case 'premium':
          gameData.premiumCurrency += amount;
          showNotification(`Otrzymano ${amount} waluty premium!`);
          break;
      }
      updateUI(gameData);
    });
  });
}

export function updateUI(data) {
  document.getElementById('score').textContent = data.score;
  document.getElementById('premium-currency').textContent = data.premiumCurrency;
  document.getElementById('upgrade-click').textContent = `Ulepsz kliknięcie (koszt: 50) - aktualnie: +${data.clickValue}`;
  document.getElementById('upgrade-auto').textContent = `Automatyczne kliknięcie (koszt: 100) - aktualnie: +${data.autoClickValue}`;
}
