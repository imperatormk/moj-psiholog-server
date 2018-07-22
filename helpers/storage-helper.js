var exports = {}
let sessionMeta = []

exports.persistSession = (session) => {
  const index = sessionMeta.findIndex(sessionObj => session.id === sessionObj.id)
  if (index < 0) {
  	sessionMeta.push(session)
  } else {
    sessionMeta[index] = session
  }
  return session
}

exports.popSession = (id) => {
  const sessionId = Number(id)
  const session = sessionMeta.find(session => session.id === sessionId)
  if (session) {
  	sessionMeta = sessionMeta.filter(session => session.id !== sessionId)
  	return session
  }
  return null
}

exports.listSessions = () => {
  return sessionMeta
}

exports.getByUser = (id) => { // gets only one ready session.. enough right?
  const userId = Number(id)
  return sessionMeta.find(session => session.doctorId === userId || session.patientId === userId) || null
}

exports.getById = (id) => {
  const sessionId = Number(id)
  return sessionMeta.find(session => session.id === sessionId) || null
}

module.exports = exports