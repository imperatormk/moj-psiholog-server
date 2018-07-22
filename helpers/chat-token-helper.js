var exports = {}

const apiKey = '46139462' // move from here
const OpenTok = require('opentok'),
    opentok = new OpenTok(apiKey, 'a9c8977bc84eab8b050062d71093851630990aaf')

exports.createSession = () => {
  return new Promise((resolve, reject) => {
    return opentok.createSession((err, session) => {
      if (err) return reject(err)
      const sessionId = session.sessionId
      resolve(sessionId)
    })
  })
}

exports.createToken = (data) => {
  return new Promise((resolve, reject) => {
	const token = opentok.generateToken(data.sessionId)
    resolve({
      apiKey,
      token
    })
  })
}

module.exports = exports