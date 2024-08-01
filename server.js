// Fazendo as requisições e criando as pastas da base de dados

const { MongoClient } = require('mongodb')
const porta = 3002
const uri = 'mongodb://localhost:27017'
const pasta_trabalho_equipamentos = 'equipamentos'
const pasta_trabalho_locais = 'locais'
const pasta_trabalho_usuarios = 'usuarios'
const pasta_trabalho_deletados = 'deletados'
const autenticacao_token = require('./auth/auth') // Pegando a função de autentifcação
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }) // O primeiro parâmetro é o URI e o segundo é a configuração
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
app.use(express.json()) // Permite o Express trabalhar com json
app.use(express.static('./public/')) // Permite o servidor utilizar os dados da pasta public

const chave = 'datashow-chave-secreta' // Criando a assinatura digital que será utilizada no JWT

// Criando function para utilizar a data atual e formatar datas
const data_atual = new Date()
const formatar_data = (data) => {
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const ano = data.getFullYear()
    return `${dia}/${mes}/${ano}`
}

app.post('/register', async (req, res) => { // Função de registro (POST); end-point + função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_usuarios = database.collection(pasta_trabalho_usuarios) // Acessa/cria a coleção da db
        const { username, password } = req.body // Coletando o conteúdo do corpo da requisição (username e password)

        const usuario_repetido = await pasta_usuarios.findOne({ username }) // Verifica se já existe um usuário com a função findOne (retorna o objeto de um usuário se existir)
        if (usuario_repetido) { // Se o o usuário_repetido existir
            return res.status(400).json({ message: "Usuário já registrado" }) // Retorna
        }

        const user_senha_criptografada = await bcrypt.hash(password, 10) // Criptografa a senha através da bibliote BCrpyt
        await pasta_usuarios.insertOne({ username, password: user_senha_criptografada }) // Insere um novo usuário através do insertOne (insere dados na base de dados)

        res.status(201).json({ message: 'Usuário registrado com sucesso' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro em registrar o usuário' })
    }
})

app.post('/login', async (req, res) => { // Função de login (POST); end-point + função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_usuarios = database.collection(pasta_trabalho_usuarios) // Acessa/cria a coleção da db
        const { username, password } = req.body // Coletando o conteúdo do corpo da requisição (username e password)

        const user_usuario = await pasta_usuarios.findOne({ username }) // Procura um usuário através do nome do usuário
        const user_senha = await bcrypt.compare(password, user_usuario.password) // Depois, compara a senha que o usuário colocou com a senha da base de dados (criptografada)
        if (!user_senha || !user_usuario) { // Verifica se o usuário e senha coincide
            return res.status(400).json({ message: 'Usuário ou senha inválida' }) // Caso der erro...
        }

        const token = jwt.sign({ username: user_usuario.username }, chave, { expiresIn: '48h' }) // Cria um token através do método sign, do qual o primeiro parâmetro é o usuário, o segundo é a assinatura e o terceiro é o tempo que vai expirar

        res.json({ token, username: user_usuario.username }) // Envia o token para o front
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro em fazer o login' })
    }
})

async function conexao_mongodb() { // Função para fazer a conexão com a base de dados
    try {
        await client.connect() // Função do próprio MongoDB para conectar o servidor com a base de dados
        console.log('Mongo DB conectado')
    }
    catch (e) {
        console.log(`Ocorreu um erro e a conexão não foi possível: ${e}`)
    }
}

conexao_mongodb()

app.get('/equipamentos', autenticacao_token, async (req, res) => { // Acessar a lista de equipamentos (GET); end-point + middlewere; função assíncrona
    try {
        const local_selecionado = req.query.local // Pega o local através do query
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_equipamento = database.collection(pasta_trabalho_equipamentos) // Acessa/cria a coleção da db

        let query = {} // Cria um query (objeto)

        if (local_selecionado === 'BRASIL') { // Se o local selecionado for o Brasil
            query = {} // O query será todos os equipamentos (independente do local)
        } else if (local_selecionado === 'GALPÕES') { // Se o local selecionado for GALPÕES
            query.local = { $in: ['GALPÃO 1', 'GALPÃO 2'] } // Adiciona na query locais que são o GALPÃO 1 e o GALPÃO 2
        } else if (local_selecionado === 'EVENTOS') { // Se o local selecionado for EVENTOS
            query.local = { $nin: ['GALPÃO 1', 'GALPÃO 2'] } // Adiciona na query locais que não são o GALPÃO 1 e o GALPÃO 2
        } else {
            query.local = local_selecionado // Caso não seja nenhuma das condiçõe específicas, o local será o local_adicionado (local selecionado pelo usuário)
        }

        const equipamentos = await pasta_equipamento.find(query).toArray() // Acessa os equipamentos dos locais selecionados e transforma em array
        res.status(200).json(equipamentos) // Envia o status e os equipamentos
    } catch (e) {
        console.log(`Erro no GET ${e}`)
        res.status(500).json({ message: "Erro ao buscar equipamentos" })
    }
})

app.post('/adicionando_equipamentos', autenticacao_token, async (req, res) => { // Criar equipamentos (POST); end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos) // Acessa/cria a coleção da db
        const { tombamento, nome_equipamento, local, usuario_modificou } = req.body // Pega todos os dados do equipamento que será adicionado
        const data_criacao = formatar_data(data_atual) // Cria a data de criação
        const vezes_usado = 0 // Vezes usado

        const equipamento_repetido = await pasta_equipamentos.findOne({ tombamento }) // Procura se há um equipamento com o mesmo tombamento
        if (equipamento_repetido) {
            return res.status(400).json({ message: `Equipamento já existente. Equipamento não adicionado.` })
        }

        await pasta_equipamentos.insertOne({ tombamento, nome_equipamento, local, usuario_modificou, data_criacao, vezes_usado }) //Insere todos so dados do usuário

        res.status(200).json({ message: 'Equipamento adicionado na DB' }) //
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar equipamento' })
    }
})

app.delete('/deletando_equipamentos/:equipamento', autenticacao_token, async (req, res) => { // Deletar equipamentos (DELETE); end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos) // Acessa/cria a coleção da db
        const tombamento = req.params.equipamento // Pego o tombamento
        const motivo = req.query.motivo // Pego o motivo
        const pasta_equipamentos_deletados = database.collection(pasta_trabalho_deletados) // Pega todos os dados do equipamento que será adicionado

        const equipamento = await pasta_equipamentos.findOne({ tombamento }) // Coleto o equipamento a ser deletado
        if (!equipamento) { // Se o equipamento não existir (não for encontrado)
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }

        const equipamento_deletado = { // Crio um objeto com os dados do objeto deletado, para assim, ir para outra coleção
            tombamento: equipamento.tombamento,
            equipamento: equipamento.nome_equipamento,
            usuario: equipamento.usuario_modificou,
            motivo: motivo
        }

        await pasta_equipamentos_deletados.insertOne(equipamento_deletado) // Insere o equipamento deletado na coleção de equipamentos deletados

        const deletado = await pasta_equipamentos.deleteOne({ tombamento }) // Deleta o equipamento com o tombamento mandado pelo front
        if (deletado.deletedCount === 0) { // Se não deletar nenhum equipamento...
            return res.status(404).json({ message: 'Equipamento não encontrado' })
        }

        res.status(200).json({ message: `${tombamento} foi deletado!` })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: `Erro ao excluir equipamento` })
    }
})

app.put('/atualizando_equipamentos/:equipamento', autenticacao_token, async (req, res) => { // Atualizar equipamentos (PUT); end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos) // Acessa/cria a coleção da db
        const tombamento = req.params.equipamento // Pega o tombamento do equipamento
        const { nome_equipamento, local, usuario_modificou, vezes_usado } = req.body // Pega todas as características que serão modificadas 
        const atualizacao = { $set: { local, usuario_modificou } } // Inicializa o objeto de atualização com $set para local e usuario_modificou; o $set é um termo utilizado para operações de atualiações

        if (nome_equipamento !== '') { // Se o nome do equipamento for inserido
            atualizacao.$set.nome_equipamento = nome_equipamento // Adiciona o nome do equipamento no set da atualiação
        }

        if (local !== 'GALPÃO 1' && local !== 'GALPÃO 2' && vezes_usado === undefined) { // Se o campo de vezes_usado for indefinido e for enviado para um evento
            atualizacao.$inc = { vezes_usado: 1 } // Incrementa um no vezes_usado; o inc significa encremento
        }

        if (vezes_usado !== undefined) {
            atualizacao.$set.vezes_usado = vezes_usado // Altera o vezes_usado
        }

        const result = await pasta_equipamentos.updateOne({ tombamento }, atualizacao) // Atualiza o equipamento que tiver tal tombamento e atualiza; o primeiro parâmetro é o ID do objeto que será modificado, e o segundo é um objeto com os termos a serem modificados

        if (result.matchedCount === 0) { // Se não alterar nada...
            return res.status(404).json({ message: 'Equipamento não encontrado' })
        }

        res.status(200).json({ message: `${tombamento} atualizado com sucesso!` })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao atualizar equipamento' })
    }
})

app.get('/equipamentos_deletados', autenticacao_token, async (req, res) => { // Acessar equipamentos deletados (GET); end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_deletados = database.collection(pasta_trabalho_deletados) // Acessa/cria a coleção da db
        const equipamentos_deletados = await pasta_deletados.find({}).toArray() // Pega todos os objetos deletados e retorna um array

        res.status(200).json(equipamentos_deletados)
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao encontrar equipamentos deletados' })
    }
})

app.post('/adicionando_locais', autenticacao_token, async (req, res) => { // Adicionar locais (POST); end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_locais = database.collection(pasta_trabalho_locais) // Acessa/cria a coleção da db
        const { local } = req.body // Pega o local do front

        const local_repetido = await pasta_locais.findOne({ local }) // Procura se já existe um local com o mesmo nome
        if (local_repetido) { // Se o local já exisitr...
            return res.status(400).json({ message: 'Local já existente. Local não adicionado.' })
        }

        await pasta_locais.insertOne({ local }) // Adiciona o local

        res.status(200).json({ message: 'Local adicionado na DB' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar local' })
    }
})

app.get('/locais', autenticacao_token, async (req, res) => { // Acessar locais; end-point + middlewere; função assíncrona
    try {
        const database = client.db('pasta_equipamentos') // Acessa/cria a pasta da db
        const pasta_locais = database.collection(pasta_trabalho_locais) // Acessa/cria a coleção da db
        const locais = await pasta_locais.find({}).toArray() // Pega todos os locais da db

        res.status(200).json(locais) // Manda pro front
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao achar os locais` })
    }
})

app.listen(porta, () => { // Rodar servidor (primeiro parâmetro é um  )
    console.log(`Servidor rodando em http://localhost:${porta}/index.html`)
})