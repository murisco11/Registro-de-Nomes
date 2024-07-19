const username = localStorage.getItem('username')
console.log(username)
const localSelecionado = localStorage.getItem('localSelecionado')
const h1Local = document.getElementById('localH1')
h1Local.innerHTML = localSelecionado
const localInput = document.getElementById('local')
localInput.value = localSelecionado
const btnSairBarras = document.querySelector('#btnSairBarras')
btnSairBarras.addEventListener('click', () => {
    const divBarras = document.getElementById('divBarras')
    divBarras.style.display = 'none'
})

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
        console.log('Código de barras lido:', resultado)
        barcode = ''
        reading = false

        const divBarras = document.getElementById('divBarras')
        divBarras.style.display = 'none'

        const response = await fetch(`/equipamentos?local=${encodeURIComponent(localSelecionado)}`)
        const equipamentos = await response.json()

        const equipamento = equipamentos.find(equipamento => equipamento.tombamento === resultado)
        if (equipamento) {
            console.log(`Achei o ${resultado} e está sendo direcionado para a edição`)
            const checkbox = document.querySelector(`input[data-equipamento="${equipamento.tombamento}"]`)
            if (checkbox) {
                checkbox.checked = true
                selecionados.add(equipamento.tombamento)
                atualizar_lista_selecionados()
            }
        } else {
            const equipamentoInput = document.getElementById('tombamento')
            equipamentoInput.value = resultado
            console.log(`Não achei o ${resultado} e está sendo direcionado para adicionar um equipamento`)
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
            },
            body: JSON.stringify({ tombamento, nome_equipamento, local, usuario_modificou }),
        })

        const result = await response.json()
        alert(result.message)
        atualizar_lista_equipamentos()
    } catch (e) {
        console.log(e)
        alert('Erro ao adicionar equipamento')
    }
})

async function atualizar_lista_equipamentos() {
    try {
        const response = await fetch(`/equipamentos?local=${encodeURIComponent(localSelecionado)}`)
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
        console.log(e)
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
        })
        const result = await response.json()
        console.log('Resposta do servidor:', result)
        atualizar_lista_equipamentos()
        alert(`${equipamento} excluído com sucesso!`)
    } catch (e) {
        console.log(e)
        alert('Erro ao excluir equipamento')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => {
    try {
        if (selecionados.size === 0) {
            return alert('Não possui nenhum equipamento selecionado!')
        }
        event.preventDefault();
        const nome_equipamento = document.getElementById('updateNomeEquipamento').value;
        const local = document.getElementById('selectLocal').value;
        const usuario_modificou = username;

        const promises = Array.from(selecionados).map(equipamento => {
            return fetch(`/atualizando_equipamentos/${equipamento}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome_equipamento, local, usuario_modificou }),
            });
        });

        const responses = await Promise.all(promises);
        responses.forEach(async response => {
            const result = await response.json();
            console.log(result.message);
        });
        alert('Nomes atualizados com sucesso!');
        selecionados.clear()
        atualizar_lista_equipamentos();
    } catch (e) {
        console.log(e);
        alert('Erro ao atualizar equipamento');
    }
});

async function preencherSelectLocais() {
    try {
        const response = await fetch('/locais');
        const locais = await response.json();
        const select = document.getElementById('selectLocal');

        locais.forEach(local => {
            const option = document.createElement('option');
            option.innerText = local.local;
            option.value = local.local;
            select.appendChild(option);
        });
    } catch (e) {
        console.log(e);
        alert('Erro ao preencher o select de locais');
    }
}

preencherSelectLocais();
atualizar_lista_equipamentos();