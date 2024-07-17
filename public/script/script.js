const token = localStorage.getItem('token')
const username = localStorage.getItem('username')
if (!token) {
    window.location.href = '../login.html'
}
if (!username) {
    window.location.href = '../login.html'
}

console.log(token)
console.log(username)

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
    }
    catch (e) {
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
        nomesList.innerHTML = ''
        nomesListNatal.innerHTML = ''
        nomesListFortaleza.innerHTML = ''

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

async function deletarNomes(nome) {
    try {
        const response = await fetch(`/deletando_nomes/${nome}`, {
            method: 'DELETE',
        })
        const result = await response.json()
        console.log('Resposta do servidor:', result)
        atualizarListaNomes()
        alert(`${nome} excluído com sucesso!`)
    }
    catch (e) {
        console.log(e)
        alert('Erro ao excluir nome')
    }
}

document.getElementById('updateForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault()
        const nome = document.getElementById('updateNome').value
        const idade = document.getElementById('updateIdade').value
        const estado = document.getElementById('updateEstado').value
        const usuario_modificou = username

        const response = await fetch(`/atualizando_nomes/${nome}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idade, estado, usuario_modificou }),
        })

        const result = await response.json()
        alert(result.message)
        atualizarListaNomes()
    } catch (e) {
        console.log(e)
        alert('Erro ao atualizar nome')
    }
})

atualizarListaNomes()