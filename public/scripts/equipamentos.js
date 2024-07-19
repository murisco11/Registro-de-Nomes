const username = localStorage.getItem('username')
const localSelecionado = localStorage.getItem('localSelecionado')
const token = localStorage.getItem('token')
const h1Local = document.getElementById('localH1')
const localInput = document.getElementById('local')
const btnSairBarras = document.querySelector('#btnSairBarras')

if (!token || !username) {
    window.location.href = '../login-register.html'
}

btnSairBarras.addEventListener('click', () => {
    const divBarras = document.getElementById('divBarras')
    divBarras.style.display = 'none'
})

localInput.value = localSelecionado
h1Local.innerHTML = localSelecionado
let selecionados = new Set()
let resultado = ''
let barcode = ''
let reading = false

document.getElementById('leitorBarras').addEventListener('click', () => {
    const divBarras = document.getElementById('divBarras')
    divBarras.style.display = 'block'
    reading = true
    barcode = ''
})

document.addEventListener('keydown', async (event) => {
    if (!reading) return

    if (event.key === 'Enter') {
        const resultado = barcode.replace(/Shift/g, "").toUpperCase()
        barcode = ''
        reading = false

        const divBarras = document.getElementById('divBarras')
        divBarras.style.display = 'none'

        const response = await fetch(`/equipamentos?local=${encodeURIComponent(localSelecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
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
            const equipamentoInput = document.getElementById('tombamento')
            equipamentoInput.value = resultado
            divBarras.style.display = 'none'
        }
    } else {
        barcode += event.key
    }
})

document.getElementById('nomeForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
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
            alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
            window.location.href = '../login-register.html'
            return
        }

        const result = await response.json()
        alert(result.message)
        atualizar_lista_equipamentos()
    } catch (e) {
        alert('Erro ao adicionar equipamento')
    }
})

async function atualizar_lista_equipamentos() {
    try {
        const response = await fetch(`/equipamentos?local=${encodeURIComponent(localSelecionado)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
            window.location.href = '../login-register.html'
            return
        }
        const equipamentos = await response.json()

        const equipamentosList = document.getElementById('equipamentosList')
        const inputSearch = document.getElementById('inputSearch')
        const listaSelecionados = document.getElementById('listaSelecionados')

        equipamentosList.innerHTML = ''
        listaSelecionados.innerHTML = ''

        equipamentos.forEach(equipamento => {
            const li = document.createElement('li')
            li.textContent = `${equipamento.nome_equipamento} (${equipamento.tombamento}) - ${equipamento.local}`

            const btnExcluir = document.createElement('button')
            btnExcluir.textContent = 'Excluir'
            btnExcluir.addEventListener('click', () => deletar_equipamentos(equipamento.tombamento))
            li.appendChild(btnExcluir)

            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.setAttribute('data-nome', equipamento.tombamento)
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selecionados.add(equipamento.tombamento)
                } else {
                    selecionados.delete(equipamento.tombamento)
                }
                atualizar_lista_selecionados()
            })

            li.appendChild(checkbox)
            equipamentosList.appendChild(li)
        })

        inputSearch.addEventListener('input', () => {
            const searchTerm = inputSearch.value.toLowerCase()
            equipamentosList.innerHTML = ''

            equipamentos.forEach(equipmanto => {
                const equipamentoLowerCase = equipmanto.tombamento.toLowerCase()
                if (equipamentoLowerCase.includes(searchTerm)) {
                    const li = document.createElement('li')
                    li.textContent = `${equipmanto.nome_equipamento} (${equipmanto.tombamento}) - ${equipmanto.local}`

                    const btnExcluir = document.createElement('button')
                    btnExcluir.textContent = 'Excluir'
                    btnExcluir.addEventListener('click', () => deletar_equipamentos(equipmanto.tombamento))
                    li.appendChild(btnExcluir)

                    const checkbox = document.createElement('input')
                    checkbox.type = 'checkbox'
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            selecionados.add(equipmanto.tombamento)
                        } else {
                            selecionados.delete(equipmanto.tombamento)
                        }
                        atualizar_lista_selecionados()
                    })

                    li.appendChild(checkbox)
                    equipamentosList.appendChild(li)
                }
            })
        })
    } catch (e) {
        alert('Erro ao atualizar lista de equipamentos')
    }
}

function atualizar_lista_selecionados() {
    const listaSelecionados = document.getElementById('listaSelecionados')
    listaSelecionados.innerHTML = ''

    selecionados.forEach(equipamento => {
        const li = document.createElement('li')
        li.textContent = equipamento
        listaSelecionados.appendChild(li)
    })
}

async function deletar_equipamentos(equipamento) {
    try {
        const response = await fetch(`/deletando_equipamentos/${equipamento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
            window.location.href = '../login-register.html'
            return
        }
        atualizar_lista_equipamentos()
        alert(`${equipamento} excluído com sucesso!`)
    } catch (e) {
        alert('Erro ao excluir equipamento')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault()
    try {
        if (selecionados.size === 0) {
            return alert('Não possui nenhum equipamento selecionado!')
        }

        const nome_equipamento = document.getElementById('updateNomeEquipamento').value
        const local = document.getElementById('selectLocal').value
        const usuario_modificou = username

        const promises = Array.from(selecionados).map(equipamento => {
            return fetch(`/atualizando_equipamentos/${equipamento}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome_equipamento, local, usuario_modificou }),
            })
        })

        const responses = await Promise.all(promises)
        responses.forEach(async response => {
            await response.json()
        })
        if (responses.status === 401 || responses.status === 403) {
            alert('Sessão expirada ou não autorizada. Redirecionando para o login...')
            window.location.href = '../login-register.html'
            return
        }

        alert('Nomes atualizados com sucesso!')
        selecionados.clear()
        atualizar_lista_equipamentos()
    } catch (e) {
        alert('Erro ao atualizar equipamento')
    }
})

async function preencherSelectLocais() {
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
        const select = document.getElementById('selectLocal')

        locais.forEach(local => {
            const option = document.createElement('option')
            option.innerText = local.local
            option.value = local.local
            select.appendChild(option)
        })
    } catch (e) {
        alert('Erro ao preencher o select de locais')
    }
}

preencherSelectLocais()
atualizar_lista_equipamentos()