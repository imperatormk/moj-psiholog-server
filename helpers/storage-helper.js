var exports = {}
let sessionMeta = []

exports.persistSession = (session, isNew) => {
  const index = sessionMeta.findIndex(sessionObj => session.id === sessionObj.id)
  let valid = true
  if (index < 0 && isNew) {
  	sessionMeta.push(session)
  } else if (index >= 0 && !isNew) {
    sessionMeta[index] = session
  } else {
  	valid = false
  }
  return valid ? session : null
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

exports.popAll = () => {
  sessionMeta = []
  return true
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