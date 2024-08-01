const token = localStorage.getItem('token') // Acessando o token
const username = localStorage.getItem('username') // Acessando o usuário
if (!token || !username) { // Se qualquer um dos dois for inválido...
  window.location.href = '../login-register.html' // Direciona para área de registro
}

document.querySelectorAll('.usernameNav').forEach(elemento => { // Adicionado a string do usuário em elementos HTML
  elemento.innerHTML += username
})

const local_input = document.getElementById('localInput')

document.getElementById('btnEquipamentosDeletados').addEventListener('click', async () => { // Função para puxar os equipamentos deletados
  try {
    const response = await fetch('/equipamentos_deletados', { // Início da requisição
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.status === 401 || response.status === 403) {
      window.location.href = '../login-register.html'
      return
    }

    const equipamentos_deletados = await response.json() // Pegando um array com os equipamentos deletados
    const data = equipamentos_deletados.map(equipamento => ({ // Criando dados para ser usado no SheetJS
      Tombamento: equipamento.tombamento,
      Equipamento: equipamento.equipamento,
      "Usuário que deletou": equipamento.usuario,
      Motivo: equipamento.motivo
    }))

    const planilha = XLSX.utils.json_to_sheet(data) // Cria a planilha com os dados
    const pasta_trabalho = XLSX.utils.book_new() // Cria a pasta de trabalho
    XLSX.utils.book_append_sheet(pasta_trabalho, planilha, 'Relatorio') // Junta tudo e coloca nome

    XLSX.writeFile(pasta_trabalho, 'relatorio.xlsx') // Adicionando a planila na pasta de trabalho com o nome
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
  }
})

document.getElementById('formLocal').addEventListener('submit', async (event) => { // Form para adicionar local
  event.preventDefault() // Previne restart do formulário
  try {
    const local = document.getElementById('localInput').value.trim() // Coletando o nome do local
    if (!local) { // Se a área estiver sem nada...
      aplicando_mensagem(local_input, "Insira o nome do local")
      return
    }
    const response = await fetch('/adicionando_locais', { // Início da requisição
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ local }) // Mandando o local para o servidor
    })
    if (response.status === 401 || response.status === 403) {
      window.location.href = '../login-register.html'
      return
    }
    const result = await response.json()
    aplicando_mensagem(local_input, result.message)
    colocar_eventos()
  }
  catch (error) {
    console.error(`Ocorreu um erro em adicionar os locais: ${error}`)
  }
})

async function colocar_eventos() { // Function para adicionar na listade locais
  const lista = document.getElementById('listaLocais') // Coletando a lista de lociais
  lista.innerHTML = '' // Limpa a lista de locais
  try {
    const response = await fetch('/locais', { // Início da requisição
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.status === 401 || response.status === 403) {
      window.location.href = '../login-register.html'
      return
    }
    const locais = await response.json() // Coletando os locais
    locais.forEach(local => { // Para cada local... (cria li, cria hiperlink, adiciona no local storage e etc.)
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

function aplicando_mensagem(campo, texto) { // Função para aplicar texto nas divs
  const divs_aplicando_mensagem = document.querySelectorAll('.small-text')
  divs_aplicando_mensagem.forEach(e => {
    e.remove()
  })
  const div = document.createElement('div')
  div.innerHTML = texto
  div.classList.add('small-text')
  campo.insertAdjacentElement('afterend', div)
}

colocar_eventos()