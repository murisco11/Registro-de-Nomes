const { MongoClient } = require('mongodb')
const porta = 3002
const uri = 'mongodb://localhost:27017'
const pasta_trabalho_equipamentos = 'equipamentos'
const pasta_trabalho_locais = 'locais'
const pasta_trabalho_usuarios = 'usuarios'
const autenticacao_token = require('./auth/auth')
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('./public/'))

const chave = 'datashow-chave-secreta'

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
        const user_senha = await bcrypt.compare(password, user_usuario.password)
        if (!user_senha || !user_usuario) {
            return res.status(400).json({ message: 'Usuário ou senha inválida' })
        }

        const token = jwt.sign({ username: user_usuario.username }, chave, { expiresIn: '1m' })

        res.json({ token, username: user_usuario.username })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro em fazer o login' })
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

app.get('/equipamentos', autenticacao_token, async (req, res) => {
    try {
        const localSelecionado = req.query.local
        const database = client.db('pasta_equipamentos')
        const pasta_equipamento = database.collection(pasta_trabalho_equipamentos)

        let query = {}
        if (localSelecionado !== 'BRASIL') {
            query.local = localSelecionado
        }

        const equipamentos = await pasta_equipamento.find(query).toArray()
        res.status(200).json(equipamentos)
    } catch (e) {
        console.log(`Erro no GET ${e}`)
        res.status(500).json({ message: "Erro ao buscar equipamentos" })
    }
})


app.post('/adicionando_equipamentos', autenticacao_token, async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos)
        const { tombamento, nome_equipamento, local, usuario_modificou } = req.body

        const equipamento_repetido = await pasta_equipamentos.findOne({ tombamento })
        if (equipamento_repetido) {
            return res.status(400).json({ message: `Equipamento já existente. Equipamento não adicionado.` })
        }

        await pasta_equipamentos.insertOne({ tombamento, nome_equipamento, local, usuario_modificou })

        res.status(200).json({ message: 'Equipamento adicionado na DB' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar equipamento' })
    }
})

app.delete('/deletando_equipamentos/:equipamento', autenticacao_token, async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos)
        const tombamento = req.params.equipamento

        const deletado = await pasta_equipamentos.deleteOne({ tombamento })
        if (deletado.deletedCount === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado' })
        }

        res.status(200).json({ message: `${tombamento} foi deletado!` })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: `Erro ao excluir equipamento` })
    }
})

app.put('/atualizando_equipamentos/:equipamento', autenticacao_token, async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_equipamentos = database.collection(pasta_trabalho_equipamentos)
        const tombamento = req.params.equipamento
        const { nome_equipamento, local, usuario_modificou } = req.body

        const result = await pasta_equipamentos.updateOne({ tombamento }, { $set: { nome_equipamento, local, usuario_modificou } })

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Equipamento não encontrado' })
        }

        res.status(200).json({ message: `${tombamento} atualizado com sucesso!` })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao atualizar equipamento' })
    }
})

app.post('/adicionando_locais', autenticacao_token, async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_locais = database.collection(pasta_trabalho_locais)
        const { local } = req.body

        const local_repetido = await pasta_locais.findOne({ local })
        if (local_repetido) {
            return res.status(400).json({ message: 'Local já existente. Local não adicionado.' })
        }

        await pasta_locais.insertOne({ local })

        res.status(200).json({ message: 'Local adicionado na DB' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erro ao adicionar local' })
    }
})

app.get('/locais', autenticacao_token, async (req, res) => {
    try {
        const database = client.db('pasta_equipamentos')
        const pasta_locais = database.collection(pasta_trabalho_locais)
        const locais = await pasta_locais.find({}).toArray()

        res.status(200).json(locais)
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao achar os locais` })
    }
})

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/index.html`)
})