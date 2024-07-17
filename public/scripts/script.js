const token = localStorage.getItem('token')
const username = localStorage.getItem('username')
if (!token || !username) {
    window.location.href = '../login.html'
}

console.log(token)
console.log(username)

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

        const response = await fetch('/nomes')
        const nomes = await response.json()

        const nome = nomes.find(nome => nome.nome === resultado)
        if (nome) {
            console.log(`Achei o ${resultado} e está sendo direcionado para a edição`)
            const checkbox = document.querySelector(`input[data-nome="${nome.nome}"]`)
            if (checkbox) {
                checkbox.checked = true
                selecionados.add(nome.nome)
                atualizarListaSelecionados()
            }
        } else {
            const nomeInput = document.getElementById('nome')
            nomeInput.value = resultado
            console.log(`Não achei o ${resultado} e está sendo direcionado para adicionar um nome`)
            divBarras.style.display = 'none'
        }
    } else {
        barcode += event.key
    }
})

document.getElementById('nomeForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
        const nome = document.getElementById('nome').value
        const idade = document.getElementById('idade').value
        const estado = document.getElementById('estado').value
        const usuario_modificou = username
        const response = await fetch('/adicionando_nomes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, idade, estado, usuario_modificou }),
        })

        const result = await response.json()
        alert(result.message)
        atualizarListaNomes()
    } catch (e) {
        console.log(e)
        alert('Erro ao adicionar nome')
    }
})

async function atualizarListaNomes() {
    try {
        const response = await fetch('/nomes')
        const nomes = await response.json()
        const nomesList = document.getElementById('nomesList')
        const nomesListNatal = document.getElementById('nomesListNatal')
        const nomesListFortaleza = document.getElementById('nomesListFortaleza')
        const inputSearch = document.getElementById('inputSearch')
        const listaSelecionados = document.getElementById('listaSelecionados')

        nomesList.innerHTML = ''
        nomesListNatal.innerHTML = ''
        nomesListFortaleza.innerHTML = ''
        listaSelecionados.innerHTML = ''

        nomes.forEach(nome => {
            const li = document.createElement('li')
            li.textContent = `${nome.nome} (${nome.idade} anos) - ${nome.estado}`

            const btnExcluir = document.createElement('button')
            btnExcluir.textContent = 'Excluir'
            btnExcluir.addEventListener('click', () => deletarNomes(nome.nome))
            li.appendChild(btnExcluir)

            const btnAtualizar = document.createElement('button')
            btnAtualizar.textContent = 'Atualizar'
            btnAtualizar.addEventListener('click', () => {
                document.getElementById('updateNome').value = nome.nome
                document.getElementById('updateIdade').value = nome.idade
                document.getElementById('updateEstado').value = nome.estado
            })
            li.appendChild(btnAtualizar)

            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.setAttribute('data-nome', nome.nome)
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selecionados.add(nome.nome)
                } else {
                    selecionados.delete(nome.nome)
                }
                atualizarListaSelecionados()
            })
            li.appendChild(checkbox)

            if (nome.estado === 'Ceará') {
                nomesListFortaleza.appendChild(li)
            } else if (nome.estado === 'RN') {
                nomesListNatal.appendChild(li)
            } else {
                nomesList.appendChild(li)
            }
        })

        inputSearch.addEventListener('input', () => {
            const searchTerm = inputSearch.value.toLowerCase()
            nomesList.innerHTML = ''
            nomesListNatal.innerHTML = ''
            nomesListFortaleza.innerHTML = ''

            nomes.forEach(nome => {
                const nomeLowerCase = nome.nome.toLowerCase()
                if (nomeLowerCase.includes(searchTerm)) {
                    const li = document.createElement('li')
                    li.textContent = `${nome.nome} (${nome.idade} anos) - ${nome.estado}`

                    const btnExcluir = document.createElement('button')
                    btnExcluir.textContent = 'Excluir'
                    btnExcluir.addEventListener('click', () => deletarNomes(nome.nome))
                    li.appendChild(btnExcluir)

                    const btnAtualizar = document.createElement('button')
                    btnAtualizar.textContent = 'Atualizar'
                    btnAtualizar.addEventListener('click', () => {
                        document.getElementById('updateNome').value = nome.nome
                        document.getElementById('updateIdade').value = nome.idade
                        document.getElementById('updateEstado').value = nome.estado
                    })
                    li.appendChild(btnAtualizar)

                    const checkbox = document.createElement('input')
                    checkbox.type = 'checkbox'
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            selecionados.add(nome.nome)
                        } else {
                            selecionados.delete(nome.nome)
                        }
                        atualizarListaSelecionados()
                    })
                    li.appendChild(checkbox)

                    if (nome.estado === 'Ceará') {
                        nomesListFortaleza.appendChild(li)
                    } else if (nome.estado === 'RN') {
                        nomesListNatal.appendChild(li)
                    } else {
                        nomesList.appendChild(li)
                    }
                }
            })
        })
    } catch (e) {
        console.log(e)
        alert('Erro ao atualizar lista de nomes')
    }
}

function atualizarListaSelecionados() {
    const listaSelecionados = document.getElementById('listaSelecionados')
    listaSelecionados.innerHTML = ''
    selecionados.forEach(nome => {
        const li = document.createElement('li')
        li.textContent = nome
        listaSelecionados.appendChild(li)
    })
}

async function deletarNomes(nome) {
    try {
        const response = await fetch(`/deletando_nomes/${nome}`, {
            method: 'DELETE',
        })
        const result = await response.json()
        console.log('Resposta do servidor:', result)
        atualizarListaNomes()
        alert(`${nome} excluído com sucesso!`)
    } catch (e) {
        console.log(e)
        alert('Erro ao excluir nome')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
        const idade = document.getElementById('updateIdade').value
        const estado = document.getElementById('updateEstado').value
        const usuario_modificou = username

        const promises = Array.from(selecionados).map(nome => {
            return fetch(`/atualizando_nomes/${nome}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idade, estado, usuario_modificou }),
            })
        })

        const responses = await Promise.all(promises)
        responses.forEach(async response => {
            const result = await response.json()
            console.log(result.message)
        })
        alert('Nomes atualizados com sucesso!')
        atualizarListaNomes()
    } catch (e) {
        console.log(e)
        alert('Erro ao atualizar nome')
    }
})

atualizarListaNomes()