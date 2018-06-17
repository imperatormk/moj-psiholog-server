const express = require('express')
const cors = require('cors')
const app = express()
const socketClusterServer = require('socketcluster-server')
const nodemailer = require("nodemailer")
const fs = require('fs')
const https = require('https')
const router = express.Router()

const apiKey = '46139462' // move from here

const OpenTok = require('opentok'),
    opentok = new OpenTok(apiKey, 'a9c8977bc84eab8b050062d71093851630990aaf')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.get('/', (req, res) => {
  res.json({
    sane: 'true'
  })
})

app.get('/api/tokens', (req, res) => {
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

var smtpTransport = nodemailer.createTransport({
  host: 'smtp.live.com',
  port: 587,
  service: "Hotmail",
  secureConnection: true,
  secure: true,
  auth: {
    user: 'windows_ntuser@hotmail.com',
    pass: 'hoho!'
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: "starttls"
  }
})

var mailOptions = {
  from: 'Darko Simonovski <windows_ntuser@hotmail.com>',
  to: 'darko.simonovski@hotmail.com',
  subject: 'Lorem ipsum - Lorem ipsum',
  html:
      'XXX: <br><br> HHH'
}

app.get('/email', (req, res) => {
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      res.send("Email could not sent due to error: " + error)
    } else {
      res.send("Requerimiento enviado con éxito")
    } 
  })
})

const httpsServer = https.createServer({
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.cert')
}, app)

const scServer = socketClusterServer.attach(httpsServer, {
  protocol: 'https',
  protocolOptions: {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.cert'),
    passphrase: ''
  },
})

scServer.on('connection', (socket) => {
  console.log('new connection')
})

httpsServer.listen(3002, () => {
  console.log('Example app listening on port 3002! Go to https://localhost:3002/')
})