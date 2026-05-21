document.addEventListener('DOMContentLoaded', () => {
  const messageEl = document.getElementById('message');
  const btn = document.getElementById('actionBtn');
  const dataInput = document.getElementById('dataInput');
  const saveBtn = document.getElementById('saveBtn');
  const dataList = document.getElementById('dataList');

  messageEl.textContent = 'System is online and working!';

  btn.addEventListener('click', () => {
    alert('You are using the online system successfully!');
  });

  // Save and show data
  saveBtn.addEventListener('click', () => {
    const value = dataInput.value.trim();
    if (value) {
      const li = document.createElement('li');
      li.textContent = value;
      dataList.appendChild(li);
      dataInput.value = '';
    }
  });
});