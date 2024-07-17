document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const username = document.getElementById('registerUsername').value
  const password = document.getElementById('registerPassword').value

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    alert(result.message)
    if (result.status === 201) {
      window.location.href = '../login.html'
    }
  } catch (e) {
    console.log(e)
    alert('Erro em registrar')
  }
})