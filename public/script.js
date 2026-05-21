document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  // Dashboard page functions
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

  // Settings page functions
  if (window.location.pathname === '/settings') {
    const changePassBtn = document.getElementById('changePassBtn');
    if (changePassBtn) {
      changePassBtn.addEventListener('click', changePassword);
    }
  }
});

// --- Switch Forms ---
function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// --- Register Function ---
async function register() {
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value.trim();
  if (!username || !password) return alert('Please fill all fields!');

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) showLogin(); // Go back to login after success
}

// --- Login Function ---
async function login() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  if (!username || !password) return alert('Please fill all fields!');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await res.json();
  
  if (result.success) {
    // Save login data
    localStorage.setItem('token', result.token);
    localStorage.setItem('username', result.username);
    // Go to dashboard
    window.location.href = '/dashboard';
  } else {
    alert(result.message); // Show error: wrong user/pass
  }
}

// --- Logout ---
function logout() {
  localStorage.clear();
  window.location.href = '/';
}

// --- Check if Logged In ---
function checkLoginStatus() {
  const token = localStorage.getItem('token');

  // If not logged in AND not on login page → go to login
  if (!token && window.location.pathname !== '/') {
    window.location.href = '/';
    return;
  }

  // If logged in AND on login page → go to dashboard
  if (token && window.location.pathname === '/') {
    window.location.href = '/dashboard';
    return;
  }

  // Show username on dashboard/settings
  const userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = localStorage.getItem('username');
}

// --- Load + Edit + Delete Data ---
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
  const newText = prompt('Edit entry:', currentText);
  if (newText && newText.trim()) updateData(id, newText.trim());
}

async function updateData(id, newContent) {
  const token = localStorage.getItem('token');
  await fetch(`/api/update/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content: newContent })
  });
  loadData();
}

async function deleteData(id) {
  if (!confirm('Delete this entry?')) return;
  const token = localStorage.getItem('token');
  await fetch(`/api/delete/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  loadData();
}

// --- Change Password ---
async function changePassword() {
  const oldPass = document.getElementById('oldPass').value.trim();
  const newPass = document.getElementById('newPass').value.trim();
  if (!oldPass || !newPass) return alert('Fill both fields!');

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