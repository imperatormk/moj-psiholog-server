const express = require('express')
const cors = require('cors')
const app = express()
var http = require('http').Server(app)
var router = express.Router()

const apiKey = '46139462' // move from here

const OpenTok = require('opentok'),
    opentok = new OpenTok(apiKey, 'a9c8977bc84eab8b050062d71093851630990aaf')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.get('/session', function(req, res) {
  opentok.createSession((err, session) => {
    if (err) return console.log(err)
  
    const sessionId = session.sessionId
    const token = opentok.generateToken(sessionId)

    res.json({
      apiKey,
      sessionId,
      token
    })
  })
})

http.listen(3002, () => console.log('App listening on port 3002!'))