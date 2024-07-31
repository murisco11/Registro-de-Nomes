// Seleção de elementos e storage local
const username = localStorage.getItem('username')
const local_selecionado = localStorage.getItem('localSelecionado')
const token = localStorage.getItem('token')
const h1_local = document.getElementById('localH1')
const local_input = document.getElementById('local')
const btn_sair_barras = document.querySelector('#btnSairBarras')
const div_barras = document.getElementById('divBarras')
const lista_selecionados = document.getElementById('listaSelecionados')
const adicionar_equipamentos_section = document.getElementById('addNomeSection')

// Desativando o display de adicionar equipamentos em locais que não pode
if (local_selecionado === 'BRASIL' || local_selecionado === 'GALPÕES' || local_selecionado === 'EVENTOS') {
    adicionar_equipamentos_section.style.display = 'none'
}

// Adicionando o nome do usuário nas navs
document.querySelectorAll('.usernameNav').forEach(elemento => {
    elemento.innerHTML += username
})

// Se o token for inválido ou não ter usuário logado, redireciona para o login
if (!token || !username) {
    window.location.href = '../login-register.html'
}

// Desativar a opção de ler código de barras
btn_sair_barras.addEventListener('click', () => {
    div_barras.style.display = 'none'
})

// Adicionando o nome dos locais nos elementos HTML
local_input.value = local_selecionado.trim()
h1_local.innerHTML = local_selecionado.trim()

let selecionados = new Set() // O Set serve para colecionar valores únicos, ideal para IDs (retorna um objeto)
let resultado = ''
let barcode = ''
let reading = false // Não ficar lendo enquanto não estiver na div de ler o código de barras

document.getElementById('leitorBarras').addEventListener('click', () => { // Ativa o leitor de código de barras
    div_barras.style.display = 'block'
    reading = true // Ativa o reading
    barcode = ''
})

document.addEventListener('keydown', async (event) => {
    if (!reading) return // Não ocorrer nada se o leitor estiver falso

    if (event.key === 'Enter') { // Quando o leitor acaba de ler, ele 'aperta enter', assim, executa essa função
        const resultado = barcode.replace(/Shift/g, "").toUpperCase() // Ele pega o que o leitor escreveu e tira o 'Shift', que é algo padrão, e coloca em caixa alta
        barcode = '' // Já limpa a caixa de texto do leitor
        reading = false // Desativa o leitor

        div_barras.style.display = 'none' // Tira o display

        const response = await fetch(`/equipamentos?local=${encodeURIComponent(local_selecionado)}`, { // Testei o query kkk mas to mandando pro equipamentos
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        const equipamentos = await response.json() // Pegando todos os equipamentos do local

        const equipamento = equipamentos.find(equipamento => equipamento.tombamento === resultado) // Retorna true or false, relacionado a se exise um equipamento com o mesmo tombamento
        if (equipamento) { // Se existir
            const checkbox = document.getElementById('checkbox-' + equipamento.tombamento) // Pega a checkbox respectiva do equipamentos
            if (checkbox) {
                checkbox.checked = true // Marca a checkbox (fica selecionado)
                selecionados.add(`${equipamento.nome_equipamento} (${equipamento.tombamento})`) // Adiciona na lista de selecionados
                atualizar_lista_selecionados() // Atualiza a lista de equipamentos
            }
        } else { // Se o tombamento não existir, ele coloca na sessão de adicionar equipamento
            const equipamento_input = document.getElementById('tombamento')
            equipamento_input.value = resultado.trim()
            div_barras.style.display = 'none'
        }
    } else {
        barcode += event.key
    }
})

// Função de baixar o relatório
document.querySelector('#btnBaixarRelatorio').addEventListener('click', async () => {
    try {
        const response = await fetch(`/equipamentos?local=${encodeURIComponent(local_selecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }

        const equipamentos = await response.json() // Pegando os equipamentos

        const data = equipamentos.map(equipamento => ({ // Criandos os dados que será utilizado no SheetJS
            "Tombamento": equipamento.tombamento,
            "Equipamento": equipamento.nome_equipamento,
            "Local": equipamento.local,
            "Data de Criação": equipamento.data_criacao,
            "Vezes usado": equipamento.vezes_usado,
            "Últime vez alterado por": equipamento.usuario_modificou
        }))

        const planilha = XLSX.utils.json_to_sheet(data) // Criando uma planilha com o SheetJS
        const pasta_trabalho = XLSX.utils.book_new() // Criando a pasta de trabalho
        XLSX.utils.book_append_sheet(pasta_trabalho, planilha, 'Histórico') // Adicionando a planila na pasta de trabalho com o nome

        XLSX.writeFile(pasta_trabalho, 'historico.xlsx') // Baixando a planilha
    }
    catch (error) {
        console.log(error)
    }
})

// Function para criar equipamento
document.getElementById('nomeForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
        // Pegando todos os valores necessários
        const tombamento_input = document.getElementById('tombamento')
        const tombamento = document.getElementById('tombamento').value.trim()
        const nome_equipamento = document.getElementById('nome_equipamento').value.trim()
        const local = document.getElementById('local').value.trim()
        const usuario_modificou = username

        const response = await fetch('/adicionando_equipamentos', { // Requisição
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tombamento, nome_equipamento, local, usuario_modificou }) // Mandando para o servidor
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }

        const result = await response.json()
        aplicando_mensagem(tombamento_input, result.message)
        atualizar_lista_equipamentos()
    } catch (e) {
        alert('Erro ao adicionar equipamento')
    }
})

async function atualizar_lista_equipamentos() {
    try {
        const response = await fetch(`/equipamentos?local=${encodeURIComponent(local_selecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        const equipamentos = await response.json() // Pegando todos os equipamentos

        // Pegando elementos importantes para a execução
        const equipamentos_list = document.getElementById('equipamentosList')
        const input_search_tombamento = document.getElementById('inputSearchTombamento')
        const input_search_nome = document.getElementById('inputSearchNome')

        // Limpando os espaços
        equipamentos_list.innerHTML = ''
        lista_selecionados.innerHTML = ''

        function criar_equipamento(equipamento) { // Function para criar cada elemento
            const li = document.createElement('li') // Criando o elemento HTML do elemento
            li.textContent = `${equipamento.nome_equipamento} (${equipamento.tombamento}) - ${equipamento.local} - Data de criação do produto: ${equipamento.data_criacao} - Quantas vezes usado: ${equipamento.vezes_usado}` // Criando o texto do LI

            const btn_excluir = document.createElement('button') // Criando o botão excluir
            btn_excluir.classList.add('button')
            btn_excluir.style.margin = '0 10px'
            li.appendChild(btn_excluir)
            btn_excluir.textContent = 'Excluir'
            btn_excluir.addEventListener('click', () => {
                const motivo = prompt(`Insira o motivo do porque deletar o ${equipamento.nome_equipamento} (${equipamento.tombamento})`) // Prevenir que exclua o equipamento sem querer
                if (!motivo) {
                    aplicando_mensagem(li, "Equipamento não deletado!")
                    return
                }
                deletar_equipamentos(equipamento.tombamento, motivo) // Function para deletar o equipamento
            })

            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.id = 'checkbox-' + equipamento.tombamento // Permitir que quando selecione o equipamento, apareça o equipamento específico na lista

            const label = document.createElement('label')
            label.htmlFor = checkbox.id

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selecionados.add(`${equipamento.nome_equipamento} (${equipamento.tombamento})`) // Adiciona no Set de selecionados
                } else {
                    selecionados.delete(`${equipamento.nome_equipamento} (${equipamento.tombamento})`) // Remove no Set de selecionados
                }
                atualizar_lista_selecionados()
            })

            li.appendChild(checkbox)
            li.appendChild(label)
            return li
        }

        equipamentos.forEach(equipamento => { // Para cada equipamentos
            equipamentos_list.appendChild(criar_equipamento(equipamento)) // Ele adiciona na lista de equipamentos com tudo certinho
        })

        input_search_tombamento.addEventListener('input', () => { // Function para pesquisar por tombamento
            input_search_nome.value = ''
            pesquisa_search(input_search_tombamento.value, 'tombamento')
        })

        input_search_nome.addEventListener('input', () => {
            input_search_tombamento.value = ''
            pesquisa_search(input_search_nome.value, 'nome_equipamento') // Function para pequisar por nome do equipamento
        })

        function pesquisa_search(pesquisa, chave) {
            const pesquisa_lower = pesquisa.toLowerCase().trim() // Coloca o valor em lower case para simplificar e tira os espaços
            equipamentos_list.innerHTML = '' // Limpa a lista

            equipamentos
                .filter(equipamento => equipamento[chave].toLowerCase().includes(pesquisa_lower)) //Filtra os equipamentos combase no que está sendo escrito, e se não tiver nada, aparece todos os equipamentos, pois ''.includes('Maurício') é true (por exemplo)
                .forEach(equipamento => {
                    equipamentos_list.appendChild(criar_equipamento(equipamento)) // Depois adiciona os equipamentos na lista
                })
        }

    } catch (e) {
        alert('Erro ao atualizar lista de equipamentos')
    }
}

function atualizar_lista_selecionados() { // Function para atualizar a lista de selecionados
    lista_selecionados.innerHTML = '' // Limpa a lista

    selecionados.forEach(equipamento => {
        const li = document.createElement('li') // Cria um LI
        li.innerHTML = equipamento // Adiciona o conteúdo
        lista_selecionados.appendChild(li) // Adiciona o LI 
    })
}

async function deletar_equipamentos(equipamento, motivo) { // Fucntion para deletar os equipamentos
    try {
        const response = await fetch(`/deletando_equipamentos/${equipamento}?motivo=${encodeURIComponent(motivo)}`, { // Requisição para deletar o equipamento
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        atualizar_lista_equipamentos() // Atualiza a lista de equipamentos
    } catch (e) {
        alert('Erro ao excluir equipamento')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => { // Function para atualizar os equipamentos
    event.preventDefault()
    try {
        if (selecionados.size === 0) { // Se não estiver nada nos selecionados, a function retorna
            aplicando_mensagem(atualizarEquipamentoBtn, "Não há nenhum equipamento selecionado!")
            return
        }

        // Pegando valores úteis para a function
        const nome_equipamento = document.getElementById('updateNomeEquipamento').value.trim()
        const local = document.getElementById('selectLocal').value.trim()
        let vezes_usado = document.getElementById('updateVezesUsado').value.trim()
        const usuario_modificou = username

        if (!vezes_usado) { // Se vezes_usado não tiver nada, ele atualiza automaticamente para undefined
            vezes_usado = undefined
        }

        const promises = Array.from(selecionados).map(equipamento => { // Para cada equipamento, eu atualizo todos
            return fetch(`/atualizando_equipamentos/${equipamento}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome_equipamento, local, usuario_modificou, vezes_usado }),
            })
        })

        const responses = await Promise.all(promises)
        responses.forEach(async response => {
            await response.json()
        })
        if (responses.status === 401 || responses.status === 403) {
            window.location.href = '../login-register.html'
            return
        }

        aplicando_mensagem(atualizarEquipamentoBtn, "Equipamentos atualizados com sucesso!")
        selecionados.clear()
        atualizar_lista_equipamentos()
    } catch (e) {
        alert('Erro ao atualizar equipamento')
    }
})

async function preencher_select_locais() {
    try {
        const response = await fetch('/locais', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        const locais = await response.json()

        const locais_filtrados = locais.filter(local =>
            local.local !== 'GALPÕES' &&
            local.local !== 'EVENTOS' &&
            local.local !== 'BRASIL'
        )

        const select = document.getElementById('selectLocal')

        locais_filtrados.forEach(local => {
            const option = document.createElement('option')
            option.innerText = local.local.trim()
            option.value = local.local.trim()
            select.appendChild(option)
        })
    } catch (e) {
        alert('Erro ao preencher o select de locais')
    }
}

function aplicando_mensagem(campo, texto) {
    const divs_aplicando_mensagem = document.querySelectorAll('.small-text')
    divs_aplicando_mensagem.forEach(e => {
        e.remove()
    })
    const div = document.createElement('div')
    div.innerHTML = texto
    div.classList.add('small-text')
    campo.insertAdjacentElement('afterend', div)
}

preencher_select_locais()
atualizar_lista_equipamentos()