document.addEventListener('DOMContentLoaded', () => {
  const messageEl = document.getElementById('message');
  const btn = document.getElementById('actionBtn');

  messageEl.textContent = 'System is online and working!';

  btn.addEventListener('click', () => {
    alert('You are using the online system successfully!');
  });
});