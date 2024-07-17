const { MongoClient } = require('mongodb')
const porta = 3002
const uri = 'mongodb://localhost:27017'
const pasta_trabalho_arquivos = 'arquivos'
const pasta_trabalho_locais = 'locais'
const pasta_trabalho_usuarios = 'usuarios'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('./public/'))

const secretKey = 'chave'

app.post('/register', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_usuarios = database.collection(pasta_trabalho_usuarios)
        const { username, password } = req.body

        const usuario_repetido = await pasta_usuarios.findOne({ username })
        if (usuario_repetido) {
            return res.status(400).json({ message: "Usuário já registrado" })
        }

        const user_senha_criptografada = await bcrypt.hash(password, 10)
        await pasta_usuarios.insertOne({ username, password: user_senha_criptografada })
        res.status(201).json({ message: 'Usuário registrado com sucesso' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro em registrar o usuário' })
    }
})

app.post('/login', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_usuarios = database.collection(pasta_trabalho_usuarios)
        const { username, password } = req.body

        const user_usuario = await pasta_usuarios.findOne({ username })
        if (!user_usuario) {
            return res.status(400).json({ message: 'Usuário ou senha inválida' })
        }

        const user_senha = await bcrypt.compare(password, user_usuario.password)
        if (!user_senha) {
            return res.status(400).json({ message: 'Usuário ou senha inválida' })
        }

        const token = jwt.sign({ username: user_usuario.username }, secretKey, { expiresIn: '1m' })
        res.json({ token, username: user_usuario.username })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro em logar' })
    }
})


async function conexao_mongodb() {
    try {
        await client.connect()
        console.log('Mongo DB conectado')
    }
    catch (e) {
        console.log(`Ocorreu um erro e a conexão não foi possível: ${e}`)
    }
}

conexao_mongodb()

app.get('/nomes', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_nome = database.collection(pasta_trabalho_arquivos)
        const nomes = await pasta_nome.find({}).toArray()
        res.status(200).json(nomes)
    }
    catch (e) {
        console.log(`Erro no GET ${e}`)
        res.status(500).json({ message: "Erro ao buscar nomes" })
    }
})

app.post('/adicionando_nomes', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pastaNomes = database.collection(pasta_trabalho_arquivos)
        const { nome, idade, estado, usuario_modificou } = req.body
        const nome_repetido = await pastaNomes.findOne({ nome })
        if (nome_repetido) {
            return res.status(400).json({ message: 'Nome já existente. Nome não adicionado.' })
        }
        await pastaNomes.insertOne({ nome, idade, estado, usuario_modificou })
        res.status(200).json({ message: 'Nome adicionado na DB' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar nome' })
    }
})

app.post('/adicionando_eventos', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pastaLocais = database.collection(pasta_trabalho_locais)
        const { local } = req.body
        const local_repetido = await pastaLocais.findOne({ local })
        if (local_repetido) {
            return res.status(400).json({ message: 'Local já existente. Evento não adicionado.' })
        }
        await pastaLocais.insertOne({ local })
        res.status(200).json({ message: 'Local adicionado na DB' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar local' })
    }
})

app.delete('/deletando_nomes/:nome', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pastaNomes = database.collection(pasta_trabalho_arquivos)
        const nome = req.params.nome
        const deletado = await pastaNomes.deleteOne({ nome })
        res.status(200).json({ message: `${nome} foi deletado!` })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: `Erro ao excluir nome` })
    }
})

app.put('/atualizando_nomes/:nome', async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pastaNomes = database.collection(pasta_trabalho_arquivos)
        const nome = req.params.nome
        const { idade, estado, usuario_modificou } = req.body

        const result = await pastaNomes.updateOne({ nome }, { $set: { idade, estado, usuario_modificou } })

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Nome não encontrado' })
        }

        res.status(200).json({ message: `${nome} atualizado com sucesso!` })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao atualizar nome' })
    }
})

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/index.html`)
})