const token = localStorage.getItem('token')
const username = localStorage.getItem('username')
if (!token || !username) {
  window.location.href = '../login-register.html'
}
console.log(token)
console.log(username)

document.getElementById('formLocal').addEventListener('submit', async (event) => {
  event.preventDefault()
  try {
    const local = document.getElementById('localInput').value
    if (!local) {
      alert('ERRO')
      return
    }
    const response = await fetch('/adicionando_locais', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ local })
    })
    if (response.status === 401 || response.status === 403) {
      alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
      window.location.href = '../login-register.html'
      return
    }
    const result = await response.json()
    alert(result.message)
    colocarEventos()
  }
  catch (error) {
    console.log(`Ocorreu um erro em adicionar os locais: ${error}`)
  }
})

async function colocarEventos() {
  const lista = document.getElementById('listaLocais')
  lista.innerHTML = ''
  try {
    const response = await fetch('/locais', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.status === 401 || response.status === 403) {
      alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
      window.location.href = '../login-register.html'
      return
    }
    const locais = await response.json()
    locais.forEach(local => {
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.setAttribute('href', '../equipamentos.html')
      a.innerHTML = local.local
      a.addEventListener('click', (event) => {
        event.preventDefault()
        localStorage.setItem('localSelecionado', local.local)
        window.location.href = a.href
      })
      li.appendChild(a)
      lista.appendChild(li)
    })
  }
  catch (error) {
    console.log(`Ocorreu um erro em pegar os locais: ${error}`)
  }
}

colocarEventos()