document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  document.getElementById('actionBtn').addEventListener('click', () => {
    alert('You are using the online system successfully!');
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const value = document.getElementById('dataInput').value.trim();
    if (!value) return;

    const token = localStorage.getItem('token');
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: value })
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById('dataInput').value = '';
      loadData();
    } else {
      alert(result.message || result.error);
    }
  });
});

// --- Auth Functions ---
function showRegister() {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
}
function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

async function register() {
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value.trim();
  if (!username || !password) return alert('Fill all fields');

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) showLogin();
}

async function login() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  if (!username || !password) return alert('Fill all fields');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await res.json();
  if (result.success) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('username', result.username);
    checkLoginStatus();
  } else {
    alert(result.message);
  }
}

function logout() {
  localStorage.clear();
  checkLoginStatus();
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('systemSection').style.display = 'block';
    document.getElementById('userName').textContent = username;
    document.getElementById('message').textContent = 'System connected & ready!';
    loadData();
  } else {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('systemSection').style.display = 'none';
    showRegister();
  }
}

async function loadData() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  const listEl = document.getElementById('dataList');
  listEl.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.content;
    listEl.appendChild(li);
  });
}