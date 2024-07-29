document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const username = document.getElementById('loginUsername').value
  const password = document.getElementById('loginPassword').value
  const username_input = document.getElementById('loginUsername')
  const password_input = document.getElementById('loginPassword')

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const result = await response.json()
    if (result.token) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('username', result.username)
      window.location.href = '../index.html'
    } else {
      limpar_erro ()
      aplicando_erro(password_input, result.message)
      aplicando_erro(username_input, result.message)
    }
  } catch (e) {
    console.log(e)
  }
})

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const username = document.getElementById('registerUsername').value
  const password = document.getElementById('registerPassword').value
  const username_input = document.getElementById('registerUsername')
  const password_input = document.getElementById('registerPassword')

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const result = await response.json()
    limpar_erro ()
    aplicando_erro(password_input, result.message)
    aplicando_erro(username_input, result.message)
    if (result.status === 201) {
      window.location.href = '../login.html'
    }
  } catch (e) {
    console.log(e)
    alert('Erro ao registrar')
  }
})

document.getElementById('switchToRegister').addEventListener('click', (event) => {
  event.preventDefault()
  document.getElementById('loginSection').style.display = 'none'
  document.getElementById('registerSection').style.display = 'block'
})

document.getElementById('switchToLogin').addEventListener('click', (event) => {
  event.preventDefault()
  document.getElementById('registerSection').style.display = 'none'
  document.getElementById('loginSection').style.display = 'block'
})

function aplicando_erro (campo, texto) { 
  const div = document.createElement('div') 
  div.innerHTML = texto
  div.classList.add('small-text')
  campo.insertAdjacentElement('afterend', div)
}

function limpar_erro () {
  const divs_aplicando_erro = document.querySelectorAll('.small-text')
  divs_aplicando_erro.forEach(e => {
      e.remove()
  })
}