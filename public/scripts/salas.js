const token = localStorage.getItem('token')
const username = localStorage.getItem('username')
if (!token || !username) {
  window.location.href = '../login-register.html'
}
console.log(token)
console.log(username)
document.getElementById('btnEquipamentosDeletados').addEventListener('click', async () => {
  try {
    const response = await fetch('/equipamentos_deletados', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.status === 401 || response.status === 403) {
      alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
      window.location.href = '../login-register.html'
      return
    }

    const equipamentos_deletados = await response.json()
    const data = equipamentos_deletados.map(equipamento => ({
      Tombamento: equipamento.tombamento,
      Equipamento: equipamento.equipamento,
      "Usuário que deletou": equipamento.usuario,
      Motivo: equipamento.motivo
    }))

    const planilha = XLSX.utils.json_to_sheet(data)
    const pasta_trabalho = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(pasta_trabalho, planilha, 'Relatorio')

    XLSX.writeFile(pasta_trabalho, 'relatorio.xlsx')
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
  }
})

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
    colocar_eventos()
  }
  catch (error) {
    console.error(`Ocorreu um erro em adicionar os locais: ${error}`)
  }
})

async function colocar_eventos() {
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
    console.error(`Ocorreu um erro em pegar os locais: ${error}`)
  }
}

colocar_eventos()