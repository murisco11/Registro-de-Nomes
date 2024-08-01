document.getElementById('loginForm').addEventListener('submit', async (event) => { // Função para o login
  event.preventDefault() // Previne restart do formulário
  // Coletando valores importantes
  const username = document.getElementById('loginUsername').value.trim()
  const password = document.getElementById('loginPassword').value
  const username_input = document.getElementById('loginUsername')
  const password_input = document.getElementById('loginPassword')

  try {
    const response = await fetch('/login', { // Criando requisição
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }) // Envia o usuário e a senha para o servidor
    })
    const result = await response.json() // Resposta do servidor
    if (result.token) { // Se o token estiver válido
      localStorage.setItem('token', result.token) // Adiciona o token no localStorage
      localStorage.setItem('username', result.username) // Adiciona o usuário no localStorage
      window.location.href = '../index.html' // Encaminha para a sessão de locais
    } else { // Se o token não existir...
      limpar_texto()
      aplicando_mensagem(password_input, result.message)
      aplicando_mensagem(username_input, result.message)
    }
  } catch (e) {
    console.log(e)
  }
})

document.getElementById('registerForm').addEventListener('submit', async (event) => { // Função para o registro
  event.preventDefault() // Previne restart do formulário
  // Coletando valores importantes
  const username = document.getElementById('registerUsername').value.trim()
  const password = document.getElementById('registerPassword').value
  const username_input = document.getElementById('registerUsername')
  const password_input = document.getElementById('registerPassword')

  try {
    const response = await fetch('/register', { // Criando requisição
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }) // Enviando o usuário e a senha para o servidor
    })
    const result = await response.json() // Pegando a resposta do servidor
    limpar_texto()
    aplicando_mensagem(password_input, result.message)
    aplicando_mensagem(username_input, result.message)
    if (result.status === 201) {
      window.location.href = '../login.html'
    }
  } catch (e) {
    console.log(e)
    alert('Erro ao registrar')
  }
})

document.getElementById('switchToRegister').addEventListener('click', (event) => { // Função para mudar entre registro e login
  event.preventDefault()
  document.getElementById('loginSection').style.display = 'none'
  document.getElementById('registerSection').style.display = 'block'
})

document.getElementById('switchToLogin').addEventListener('click', (event) => { // Função para mudar entre registro e login
  event.preventDefault()
  document.getElementById('registerSection').style.display = 'none'
  document.getElementById('loginSection').style.display = 'block'
})

function aplicando_mensagem(campo, texto) { // Função para aplicar texto
  const div = document.createElement('div')
  div.innerHTML = texto
  div.classList.add('small-text')
  campo.insertAdjacentElement('afterend', div)
}

function limpar_texto() { // Função para limpar texto
  const divs_aplicando_mensagem = document.querySelectorAll('.small-text')
  divs_aplicando_mensagem.forEach(e => {
    e.remove()
  })
}