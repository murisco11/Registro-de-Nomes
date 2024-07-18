document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('username', result.username);
      alert('Login bem-sucedido');
      window.location.href = '../index.html';
    } else {
      alert(result.message);
    }
  } catch (e) {
    console.log(e);
    alert('Erro ao fazer login');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    alert(result.message);
    if (result.status === 201) {
      window.location.href = '../login.html';
    }
  } catch (e) {
    console.log(e);
    alert('Erro ao registrar');
  }
});

document.getElementById('switchToRegister').addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
});

document.getElementById('switchToLogin').addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
});