const express = require('express')
const cors = require('cors')
const app = express()
const socketClusterServer = require('socketcluster-server')
const fs = require('fs')
const https = require('https')
const routes = require('./controllers/index.js')
const bodyParser = require('body-parser')
const db = require('./db/index.js')
const storage = require('./helpers/storage-helper.js')
const sa = require('superagent') // remove and uninstall

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

const getUsers = () => { return db.controllers.users.list() }
const getUser = (userId) => { return db.controllers.users.listById(userId) }
const getUserByCreds = (email, pass) => { return db.controllers.users.listOne({ email, pass }) }
const getReadySessions = () => Promise.resolve(storage.listSessions())

getUsers().then(res => { users.push(...res) })

const getReadySession = (user) => {
  const doctorCondition = (session => session.doctor.id === user.id)
  const patientCondition = (session => session.patient.id === user.id)
  return getReadySessions()
  	.then(sessions => sessions.find(user.type === 'doctor' ? doctorCondition : patientCondition))
}

const getSessionById = (id) => {
  return new Promise((resolve, reject) => {
  	const session = storage.getById(id)
    if (session) resolve(session)
  	reject({ msg: 'notFound' })
  })
}

app.get('/api/sessions/prepare/', (req, res) => {
  db.controllers.sessions.listReady()
  	.then(sessions => {
      const resArr = []
      sessions.forEach(session => {
      	const sessionObj = {
          ...session.toJSON(),
          callState: {
            doctorConnected: false,
            patientConnected: false,
            duration: 0
          }
        }
        const resObj = storage.persistSession(sessionObj)
    	resArr.push(resObj)
      })
  	  res.json({ success: true, resArr })
    })
})

app.get('/api/sessions/unprepare/:id', (req, res) => {
  const id = req.params.id
  const resObj = storage.popSession(id)
  res.json({ resObj })
})

app.get('/api/sessions/listPrepared', (req, res) => {
  const id = req.params.id
  const resObj = getReadySessions()
  	.then(sessions => {
  	  res.json({ sessions })
    })
})

const addOrRemoveUserToSession = (channel, authToken, isAdd) => {
  return new Promise(resolve => {
    const sessId = channel.substring(5)
    const userType = authToken.type + 'Connected'
    getSessionById(sessId).then(session => {
      session.callState[userType] = isAdd
      const res = storage.persistSession(session)
      resolve(res)
    })
  })
}

const userActive = (user) => {
  return socketMap.find(obj => obj.authToken.id === user.id) != null
}

scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, (req, next) => {
  // console.log('this is subscribe middleware')
  // scServer.exchange.publish(req.channel, req.socket.authToken)
  next()
})

scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {
  if (!req.data.senderId) req.data.senderId = req.socket.id
  // console.log(req.socket.id, 'posted to', req.channel)
  next()
})

scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_OUT, (req, next) => {
  const senderId = req.data.senderId
  const recipientId = req.socket.id
  const canSend = true // senderId !== recipientId // discuss
    
  // console.log('outbound - can be sent:', canSend, senderId, recipientId)
  if (canSend) {
  	next()
  } else {
  	next(true)
  }
})

scServer.on('connection', (socket, status) => {
  console.log('new connection', { isAuthenticated: status.isAuthenticated })
  socket.on('subscribe', (channel) => {
  	socketMap.push({
      id: socket.id,
      authToken: socket.authToken,
    })
  	addOrRemoveUserToSession(channel, socket.authToken, true)
  	  .then(session => {    
    	scServer.exchange.publish(channel, {
          event: 'sessionChange',
          data: session.callState
        })
      })
  })

  socket.on('unsubscribe', (channel) => {
  	socketMap = socketMap.filter(scObj => scObj.id !== socket.id)
    addOrRemoveUserToSession(channel, socket.authToken, false)
  	  .then(session => {
    	scServer.exchange.publish(channel, {
          event: 'sessionChange',
          data: session.callState
        })
      })
  })

  socket.on('callPatient', (data) => {
  	const sessionId = data.session.id
  	scServer.exchange.publish('sess-' + sessionId, {
      senderId: socket.id,
      event: 'callInvite' // hmm maybe map these?
    })
  })

  socket.on('acceptCall', (data) => {
  	const sessionId = data.session.id
  	scServer.exchange.publish('sess-' + sessionId, {
      senderId: socket.id,
      event: 'acceptCall' // hmm maybe map these?
    })
  })

  socket.on('finishSession', (data) => {
  	const meta = {}
  	const sessionId = data.session.id
    const sessionData = storage.popSession(sessionId).callState
        
    meta.duration = sessionData.duration
  	db.controllers.sessions.finalize(sessionId, meta)
  	  .then(() => {
    	scServer.exchange.publish('sess-' + sessionId, {
      	  senderId: socket.id, // maybe not needed
      	  event: 'sessionFinished' // hmm maybe map these?
    	})
      })
  })

  socket.on('login', (credentials, respond) => {
   	getUserByCreds(credentials.email, credentials.password).then((user) => {
      if (socket.authToken || (user && userActive(user))) {
        respond(null, {
          success: false,
          msg: 'Already logged in...'
        })
        return false
      }
    
      if (user) {
      	if (!user.confirmed) {
          respond(null, {
            success: false,
            msg: 'Please activate your account first...'
          })
          return false
        }
      
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
  })

  socket.on('logout', (data, respond) => {
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