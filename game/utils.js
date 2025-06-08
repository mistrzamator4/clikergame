export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  return (num / 1_000_000_000).toFixed(1) + 'B';
}

export function showNotification(msg) {
  const notif = document.getElementById('notification');
  notif.textContent = msg;
  notif.classList.remove('hidden');
  clearTimeout(notif._timeout);
  notif._timeout = setTimeout(() => {
    notif.classList.add('hidden');
  }, 2500);
}
