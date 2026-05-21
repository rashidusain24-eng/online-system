document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  // Dashboard functions
  if (window.location.pathname === '/dashboard') {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
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
    }
    loadData();
  }

  // Settings function
  if (window.location.pathname === '/settings') {
    const changePassBtn = document.getElementById('changePassBtn');
    if (changePassBtn) {
      changePassBtn.addEventListener('click', changePassword);
    }
  }
});

// --- Auth Functions ---
function showRegister() {
  const regForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  if (regForm && loginForm) {
    regForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
}

function showLogin() {
  const regForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  if (regForm && loginForm) {
    regForm.style.display = 'none';
    loginForm.style.display = 'block';
  }
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
    window.location.href = '/dashboard';
  } else {
    alert(result.message);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (!token && window.location.pathname !== '/') {
    window.location.href = '/';
    return;
  }

  if (token && window.location.pathname === '/') {
    window.location.href = '/dashboard';
    return;
  }

  if (username && document.getElementById('userName')) {
    document.getElementById('userName').textContent = username;
  }
}

// --- Data Functions (Edit & Delete Added) ---
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
    li.innerHTML = `
      <span class="data-text">${item.content}</span>
      <div class="btn-group">
        <button onclick="editData('${item._id}', '${item.content}')" class="edit-btn">Edit</button>
        <button onclick="deleteData('${item._id}')" class="delete-btn">Delete</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

function editData(id, currentText) {
  const newText = prompt('Edit your entry:', currentText);
  if (newText && newText.trim() !== '') {
    updateData(id, newText.trim());
  }
}

async function updateData(id, newContent) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content: newContent })
  });
  const result = await res.json();
  if (result.success) {
    loadData();
  } else {
    alert('Error: ' + result.error);
  }
}

async function deleteData(id) {
  if (!confirm('Delete this entry?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/delete/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await res.json();
  if (result.success) {
    loadData();
  } else {
    alert('Error: ' + result.error);
  }
}

// --- Settings: Change Password ---
async function changePassword() {
  const oldPass = document.getElementById('oldPass').value.trim();
  const newPass = document.getElementById('newPass').value.trim();
  if (!oldPass || !newPass) return alert('Fill both fields');

  const token = localStorage.getItem('token');
  const res = await fetch('/api/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) {
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
  }
}