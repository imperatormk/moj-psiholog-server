const express = require('express')
const cors = require('cors')
const app = express()
const socketClusterServer = require('socketcluster-server')
const fs = require('fs')
const https = require('https')
const routes = require('./controllers/index.js')
const bodyParser = require('body-parser')

const Sequelize = require('sequelize')
const sequelize = new Sequelize('mojpsiholog', 'mojPsiholog', 'pece123!', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())
app.use('/', routes)

app.use(express.static('static'))

const httpsServer = https.createServer({
  key: fs.readFileSync('./certs/private.key'),
  cert: fs.readFileSync('./certs/certificate.crt')
}, app)

const scServer = socketClusterServer.attach(httpsServer, {
  protocol: 'https',
  protocolOptions: {
    key: fs.readFileSync('./certs/private.key'),
    cert: fs.readFileSync('./certs/certificate.crt'),
    passphrase: ''
  },
})

// fns

let socketMap = []
const users = []
const sessions = []

const getUser = (userId) => {
  const userObj = users.find(user => user.id === userId)
  return userObj
}

users.push({
  id: 1,
  email: 'imperatormk',
  password: 'pece123!',
  type: 'doctor'
})

users.push({
  id: 2,
  email: 'mrmach',
  password: 'pece123!',
  type: 'patient'
})

users.push({
  id: 3,
  email: 'damence',
  password: 'pece123!',
  type: 'patient'
})

sessions.push({
  id: 1,
  hash: '123456',
  doctor: getUser(1),
  patient: getUser(2),
  ready: false
})

sessions.push({
  id: 2,
  hash: '456789',
  doctor: getUser(1),
  patient: getUser(3),
  ready: true,
  callState: { // rename
  	doctorConnected: false,
  	patientConnected: false,
  	ongoing: false
  }
})

const readySessions = sessions.filter(session => session.ready === true)

app.get('/dbtest', (req, res) => {

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
})

sequelize.sync()
  .then(() => User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  }))
  .then(jane => {
    console.log(jane.toJSON())
	res.json(jane.toJSON())
  })
})

app.get('/api/users/:id/sessions', (req, res) => {
  const userId = parseInt(req.params.id)
  const session = getReadySession(getUser(userId))
  session ? res.json({
  	success: true,
  	payload: session
  }) : res.json({ success: false }) // res.json({ status: 'notFound' })
})

const getReadySession = (user) => {
  const doctorCondition = (session => session.doctor.id === user.id)
  const patientCondition = (session => session.patient.id === user.id)
  return readySessions.find(user.type === 'doctor' ? doctorCondition : patientCondition)
}

const addUserToSession = (channel, authToken) => {
  const sessHash = channel.substring(5)
  const userType = authToken.type + 'Connected'
  readySessions.find(session => session.hash === sessHash).callState[userType] = true
}

// up and down merge into one

const removeUserFromSession = (channel, authToken) => {
  const sessHash = channel.substring(5)
  const userType = authToken.type + 'Connected'
  readySessions.find(session => session.hash === sessHash).callState[userType] = false
}

const userActive = (user) => {
  return socketMap.find(obj => obj.authToken.id === user.id) != null
}

scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {
  console.log('this is subscribe middleware')
  // scServer.exchange.publish(req.channel, req.socket.authToken)
  next()
})

scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {
  if (!req.data.senderId) req.data.senderId = req.socket.id
  console.log(req.socket.id, 'posted to', req.channel)
  next()
})

scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_OUT, (req, next) => {
  const senderId = req.data.senderId
  const recipientId = req.socket.id
  const canSend = senderId !== recipientId
    
  console.log('outbound - can be sent:', canSend, senderId, recipientId)

  if (canSend) {
  	next()
  } else {
  	next(true)
  }
})

scServer.on('connection', (socket, status) => {
  console.log('new connection', { isAuthenticated: status.isAuthenticated })

  socket.on('subscribe', (channel) => {
  	console.log('subscribed', channel)
  	
  	socketMap.push({
      id: socket.id,
      authToken: socket.authToken,
    })
  	addUserToSession(channel, socket.authToken)
  	scServer.exchange.publish(channel, {
      event: 'sessionChange',
      data: getReadySession(socket.authToken).callState
    })
  })

  socket.on('unsubscribe', (channel) => {
  	console.log('unsubscribed', channel)
  
  	socketMap = socketMap.filter(scObj => scObj.id !== socket.id)
  	removeUserFromSession(channel, socket.authToken)
    scServer.exchange.publish(channel, {
      event: 'sessionChange',
      data: getReadySession(socket.authToken).callState
    })
  })

  socket.on('callPatient', (data) => {
  	// socket.exchange.publish('callInvite', data)
  	// console.log('callPatient', data)
  	scServer.exchange.publish('sess-' + data.session.hash, {
      senderId: socket.id,
      event: 'callInvite', // hmm maybe map these?
      data: data.videoSessionData
    })
  })

  socket.on('acceptCall', (data) => {
  	scServer.exchange.publish('sess-' + data.session.hash, {
      senderId: socket.id,
      event: 'acceptCall' // hmm maybe map these?
    })
  })

  socket.on('login', (credentials, respond) => {
  	const user = users.find(user => user.email === credentials.email && user.password === credentials.password)
  	if (socket.authToken || (user && userActive(user))) {
	  respond(null, {
      	success: false,
      	msg: 'Already logged in...'
      })
	  return false
    }
  
    if (user) {
      socket.setAuthToken({
        id: user.id,
        email: user.email,
        type: user.type
      })
      respond(null, {
      	success: true
      })
    } else {
      respond(null, {
      	success: false,
      	msg: 'Invalid credentials'
      })
    }
  })

  socket.on('logout', function(data, respond) {
	if (!socket.authToken) {
	  respond(null, {
      	success: false,
      	msg: 'Already logged out.'
      })
	  return false
	}
	socket.deauthenticate()
	respond(null, {
      success: true
    })
  })
})

httpsServer.listen(3002, () => {
  console.log('Example app listening on port 3002! Go to https://localhost:3002/')
})