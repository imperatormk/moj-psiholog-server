const User = require('../models').User
const Session = require('../models').Session
const Payment = require('../models').Payment
const SessionsMeta = require('../models').SessionsMeta

const chatTokenHelper = require('../../helpers/chat-token-helper.js')
const moment = require('moment')

const readyInterval = 100000 // as minutes

module.exports = {
  create(session) {
  	const doctorPromise = User.findOne({ where: { id: session.doctorId }})
    const patientPromise = User.findOne({ where: { id: session.patientId }})
    const paymentPromise = session.paymentId ? Payment.find({ where: { id: session.paymentId }}) : Promise.resolve(null)
    const sessionKeyPromise = chatTokenHelper.createSession()
    
    if (session.paymentId) delete session.paymentId
  	session.duration = '30 minute' // discussable
  	session.status = 'pending'
    
   	return Promise.all([doctorPromise, patientPromise, paymentPromise, sessionKeyPromise])
  	  .then((res) => {
    	const doctor = res[0]
        const patient = res[1]
        const payment = res[2]
        const sessionKey = res[3]
        
        let valid = doctor && patient && doctor.type === 'doctor' && patient.type === 'patient'
        if (!valid) return Promise.reject({ msg: 'invalidData' })
    
    	const includesArr = [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }]
        if (payment) includesArr.push({ model: Payment })
    
    	session.sessionKey = sessionKey || null
        
        return Session.create(session, {include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]})
          .then(session => session.setDoctor(doctor))
          .then(session => session.setPatient(patient))
    	  .then(session => payment ? session.setPayment(payment) : session)
          .then(session => session.save())
    	  .then(session => Session.find({ where: { id: session.id }, include: includesArr})) // maybe alias payment?
          .catch(err => {
        	console.log(err)
        	return Promise.reject(err)
          })
      })
  	  .catch(err => (Promise.reject(err)))
  },
  checkIsFirst(data) {
  	const doctorId = data.doctorId
    const patientId = data.patientId
    
    if (!doctorId || !patientId) return Promise.reject({ msg: 'invalidData' })
    
    const doctorPromise = User.findOne({ where: { id: doctorId }})
    const patientPromise = User.findOne({ where: { id: patientId }})
    
    return Promise.all([doctorPromise, patientPromise])
  	  .then((res) => {
    	const doctor = res[0]
        const patient = res[1]
        
        let valid = doctor && patient && doctor.type === 'doctor' && patient.type === 'patient'
        if (!valid) return Promise.reject({ msg: 'invalidData' })
    
    	return Session.findOne({ where: { doctorId, patientId }})
      	  .then(res => res ? { isFirst: false } : { isFirst: true })
      })
  },
  list() {
    return Session.findAll({include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }, { model: SessionsMeta, as: 'meta' }] }) // maybe alias payment?
  },
  listByStatus(status) {
  	if (!status) return Promise.reject({ msg: 'invalidData' })
  	return Session.findAll({ where: { status }, include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }] }) // maybe alias payment?
  },
  listReady() {
  	const now = moment(new Date())
    return Session.findAll({ where: { status: 'pending' }, include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }] }) // maybe alias payment?
      .then((sessions) => {
        const readySessions = sessions.filter((session) => {
          console.log('hereeee')
          const sessionDate = moment(session.datetime)
          const diff = moment.duration(sessionDate.diff(now)).asMinutes()
          return diff <= readyInterval
        })
        return readySessions
      })
  },
  listByUser(userData, readyOnly) {
  	if (!userData) return Promise.reject({ msg: 'invalidData' })
  	return User.findOne({ where: { id: userData.id }})
  	  .then(userRes => {
    	if (!userRes) return Promise.reject({ msg: 'invalidData' })        
        const criteriaObj = userRes.type === 'doctor' ? { doctorId: userRes.id } : { patientId: userRes.id }
        
        if (!readyOnly) {
          criteriaObj.status = userData.sessionStatusType
        } else {
          // TODO: add not status === completed
        }
        
    	const now = moment(new Date())
    	return Session.findAll({ where: criteriaObj, include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]}) // maybe alias payment?
    	  .then((sessions) => {
        	const readySessions = readyOnly ? sessions.find((session) => {
              const sessionDate = moment(session.datetime)
              const diff = moment.duration(sessionDate.diff(now)).asMinutes()
              console.log('diff atm: ', diff)
              return diff <= readyInterval
            }) : sessions
            return readySessions
          })
      })
  },
  deleteAll() {
  	return Session.destroy({where: {}})
  }
}