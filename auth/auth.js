const jwt = require('jsonwebtoken') // Requre o JWT
const chave = 'datashow-chave-secreta' // Assinatura digital necessária (tem que ser a mesma do server)

const authenticateToken = (req, res, next) => { // Função de autentificação
    const authHeader = req.headers['authorization'] // Coleta o header (geralmente Bearer ${token})
    const token = authHeader && authHeader.split(' ')[1] // Coleta o token

    if (token == null) return res.sendStatus(401) // Se o token não existir, retorna erro

    jwt.verify(token, chave, (err, user) => { // Função que verifica se o token está válido; primeiro parâmetro é o token a ser analisado, o segundo é a chave, e depois uma functio com erro e o usuário do qual está conectado com o token
        if (err) return res.sendStatus(403)
        req.user = user
        next() // Chama a próxima function do server
    })
}

module.exports = authenticateToken // Exporta a função