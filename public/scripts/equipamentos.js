const username = localStorage.getItem('username')
const local_selecionado = localStorage.getItem('localSelecionado')
const token = localStorage.getItem('token')
const h1_local = document.getElementById('localH1')
const local_input = document.getElementById('local')
const btn_sair_barras = document.querySelector('#btnSairBarras')
const div_barras = document.getElementById('divBarras')
const lista_selecionados = document.getElementById('listaSelecionados')


document.querySelectorAll('.usernameNav').forEach(elemento => {
    elemento.innerHTML += username
})

if (!token || !username) {
    window.location.href = '../login-register.html'
}

btn_sair_barras.addEventListener('click', () => {
    div_barras.style.display = 'none'
})

local_input.value = local_selecionado
h1_local.innerHTML = local_selecionado
let selecionados = new Set()
let resultado = ''
let barcode = ''
let reading = false

document.getElementById('leitorBarras').addEventListener('click', () => {
    div_barras.style.display = 'block'
    reading = true
    barcode = ''
})

document.querySelector('#btnBaixarRelatorio').addEventListener('click', async () => {
    try {
        const response = await fetch(`/equipamentos?local=${encodeURIComponent(local_selecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }

        const equipamentos = await response.json()

        const data = equipamentos.map(equipamento => ({
            Tombamento: equipamento.tombamento,
            Equipamento: equipamento.nome_equipamento,
            Local: equipamento.local,
            "Data de Criação": equipamento.data_criacao,
            "Vezes usado": equipamento.vezes_usado,
            "Últime vez alterado por": equipamento.usuario_modificou
        }))

        const planilha = XLSX.utils.json_to_sheet(data)
        const pasta_trabalho = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(pasta_trabalho, planilha, 'Histórico')

        XLSX.writeFile(pasta_trabalho, 'historico.xlsx')
    }
    catch (error) {
        console.log(error)
    }
})

document.addEventListener('keydown', async (event) => {
    if (!reading) return

    if (event.key === 'Enter') {
        const resultado = barcode.replace(/Shift/g, "").toUpperCase()
        barcode = ''
        reading = false

        div_barras.style.display = 'none'

        const response = await fetch(`/equipamentos?local=${encodeURIComponent(local_selecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        const equipamentos = await response.json()

        const equipamento = equipamentos.find(equipamento => equipamento.tombamento === resultado)
        if (equipamento) {
            const checkbox = document.querySelector(`input[data-equipamento="${equipamento.tombamento}"]`)
            if (checkbox) {
                checkbox.checked = true
                selecionados.add(equipamento.tombamento)
                atualizar_lista_selecionados()
            }
        } else {
            const equipamento_input = document.getElementById('tombamento')
            equipamento_input.value = resultado
            div_barras.style.display = 'none'
        }
    } else {
        barcode += event.key
    }
})

document.getElementById('nomeForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
        const tombamento_input = document.getElementById('tombamento')
        const tombamento = document.getElementById('tombamento').value
        const nome_equipamento = document.getElementById('nome_equipamento').value
        const local = document.getElementById('local').value
        const usuario_modificou = username

        const response = await fetch('/adicionando_equipamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tombamento, nome_equipamento, local, usuario_modificou }),
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }

        const result = await response.json()
        aplicando_erro(tombamento_input, result.message)
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
        const equipamentos = await response.json()

        const equipamentos_list = document.getElementById('equipamentosList')
        const input_search = document.getElementById('inputSearch')

        equipamentos_list.innerHTML = ''
        lista_selecionados.innerHTML = ''

        equipamentos.forEach(equipamento => {
            const li = document.createElement('li')
            li.textContent = `${equipamento.nome_equipamento} (${equipamento.tombamento}) - ${equipamento.local} -  Data de criação do produto: ${equipamento.data_criacao} - Quantas vezes usado: ${equipamento.vezes_usado}`

            const btn_excluir = document.createElement('button')
            btn_excluir.textContent = 'Excluir'
            btn_excluir.addEventListener('click', () => {
                const motivo = prompt(`Insira o motivo do porque deletar o ${equipamento.nome_equipamento} (${equipamento.tombamento})`)
                if (!motivo) {
                    aplicando_erro(li, "Equipamento não deletado!")
                    return
                }
                deletar_equipamentos(equipamento.tombamento, motivo)
            })
            btn_excluir.classList.add('button')
            btn_excluir.style.margin = '0 10px'
            li.appendChild(btn_excluir)

            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.id = 'checkbox-' + equipamento.tombamento
            
            const label = document.createElement('label')
            label.htmlFor = checkbox.id

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selecionados.add(equipamento.tombamento)
                } else {
                    selecionados.delete(equipamento.tombamento)
                }
                atualizar_lista_selecionados()
            })
            
            li.appendChild(checkbox)
            li.appendChild(label)
            equipamentos_list.appendChild(li)
        })

        input_search.addEventListener('input', () => {
            const pesquisa = input_search.value.toLowerCase()
            equipamentos_list.innerHTML = ''

            equipamentos.forEach(equipamento => {
                const equipamento_lower_case = equipamento.tombamento.toLowerCase()
                if (equipamento_lower_case.includes(pesquisa)) {
                    const li = document.createElement('li')
                    li.textContent = `${equipamento.nome_equipamento} (${equipamento.tombamento}) - ${equipamento.local} -  Data de criação do produto: ${equipamento.data_criacao} - Quantas vezes usado: ${equipamento.vezes_usado}`

                    const btn_excluir = document.createElement('button')
                    btn_excluir.textContent = 'Excluir'
                    btn_excluir.addEventListener('click', () => deletar_equipamentos(equipamento.tombamento))
                    btn_excluir.classList.add('button')
                    li.appendChild(btn_excluir)

                    const checkbox = document.createElement('input')
                    checkbox.type = 'checkbox'
                    checkbox.id = 'checkbox-' + equipamento.tombamento
                    
                    const label = document.createElement('label')
                    label.htmlFor = checkbox.id

                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            selecionados.add(equipamento.tombamento)
                        } else {
                            selecionados.delete(equipamento.tombamento)
                        }
                        atualizar_lista_selecionados()
                    })
                    
                    li.appendChild(checkbox)
                    li.appendChild(label)
                    equipamentos_list.appendChild(li)
                }
            })
        })
    } catch (e) {
        alert('Erro ao atualizar lista de equipamentos')
    }
}

function atualizar_lista_selecionados() {
    lista_selecionados.innerHTML = ''

    selecionados.forEach(equipamento => {
        const li = document.createElement('li')
        li.textContent = equipamento
        lista_selecionados.appendChild(li)
    })
}

async function deletar_equipamentos(equipamento, motivo) {
    try {
        const response = await fetch(`/deletando_equipamentos/${equipamento}?motivo=${encodeURIComponent(motivo)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            window.location.href = '../login-register.html'
            return
        }
        atualizar_lista_equipamentos()
    } catch (e) {
        alert('Erro ao excluir equipamento')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault()
    const atualizar_equipamento_deletado = document.querySelector('#atualizarEquipamentoBtn')
    try {
        if (selecionados.size === 0) {
            aplicando_erro(atualizarEquipamentoBtn, "Não há nenhum equipamento selecionado!")
            return
        }

        const nome_equipamento = document.getElementById('updateNomeEquipamento').value
        const local = document.getElementById('selectLocal').value
        let vezes_usado = document.getElementById('updateVezesUsado').value
        const usuario_modificou = username

        if (!vezes_usado) {
            vezes_usado = undefined
        }

        const promises = Array.from(selecionados).map(equipamento => {
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

        aplicando_erro(atualizarEquipamentoBtn, "Equipamentos atualizados com sucesso!")
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
            option.innerText = local.local
            option.value = local.local
            select.appendChild(option)
        })
    } catch (e) {
        alert('Erro ao preencher o select de locais')
    }
}

function aplicando_erro (campo, texto) { 
    const divs_aplicando_erro = document.querySelectorAll('.small-text')
    divs_aplicando_erro.forEach(e => {
        e.remove()
    })
    const div = document.createElement('div') 
    div.innerHTML = texto
    div.classList.add('small-text')
    campo.insertAdjacentElement('afterend', div)
}

preencher_select_locais()
atualizar_lista_equipamentos()