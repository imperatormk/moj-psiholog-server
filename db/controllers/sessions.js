const User = require('../models').User
const DoctorDetails = require('../models').DoctorDetails
const Session = require('../models').Session
const Payment = require('../models').Payment
const SessionsMeta = require('../models').SessionsMeta

const chatTokenHelper = require('../../helpers/chat-token-helper.js')
const scheduleHelper = require('../../helpers/schedule-helper.js')
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
        
        const sessionPromise = Session.create(session, {include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }] })
          .then(session => session.setDoctor(doctor))
          .then(session => session.setPatient(patient))
    	  .then(session => payment ? session.setPayment(payment) : session)
          .then(session => session.save())
    	  .then(session => Session.find({ where: { id: session.id }, include: includesArr})) // maybe alias payment?
          .catch(err => (Promise.reject(err)))
        
        return sessionPromise.then(sessResp => {
          const scheduledTime = moment(sessResp.datetime).utc().subtract(10, 'minutes').format('HH:mm YYYY-MM-DD')
      	  return scheduleHelper.scheduleTask(scheduledTime, sessResp.id)
			.then(resp => sessResp) // log just in case - for ref
			.catch(err => (Promise.reject(err)))
        })
    	.catch(err => (Promise.reject(err)))
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
  listById(id) {
    const sessionId = Number(id)
  	return Session.findOne({ where: { id: sessionId }, include: [{ model: User, as: 'doctor', include: [{ model: DoctorDetails, as: 'details' }] }, { model: User, as: 'patient' }, { model: Payment, attributes: ['id', 'amount'] }] })
  },
  listReady() { // hopefully used for preparing the sessions only?
  	const now = moment(new Date())
    return Session.findAll({ where: { status: 'pending' }, 
             include: [{ model: User, as: 'doctor', include: [{ model: DoctorDetails, as: 'details' }] }, { model: User, as: 'patient' }, { model: Payment, attributes: ['id', 'amount'] }] })
      .then((sessions) => {
        const readySessions = sessions.filter((session) => {
          const sessionDate = moment(session.datetime)
          const diff = moment.duration(sessionDate.diff(now)).asMinutes()
          return diff <= readyInterval
        })
        return readySessions
      })
  },
  listByStatus(status) {
  	if (!status) return Promise.reject({ msg: 'invalidData' })
  	const includes = [{ model: User, as: 'doctor', include: [{ model: DoctorDetails, as: 'details' }] }, { model: User, as: 'patient' }, { model: Payment, attributes: ['id', 'amount'] }]
    if (status === 'completed') includes.push({ model: SessionsMeta, as: 'meta' })
  	return Session.findAll({ where: { status }, include: includes }) // maybe alias payment?
  },
  listByUser(userData, readyOnly) {
  	if (!userData) return Promise.reject({ msg: 'invalidData' })
  	return User.findOne({ where: { id: userData.id }})
  	  .then(userRes => {
    	if (!userRes) return Promise.reject({ msg: 'invalidData' })        
        const criteriaObj = userRes.type === 'doctor' ? { doctorId: userRes.id } : { patientId: userRes.id }
        
        let includesArr = [{ model: User, as: 'doctor', include: [{ model: DoctorDetails, as: 'details' }] }, { model: User, as: 'patient' }, { model: Payment, attributes: ['id', 'amount'] }]
        if (!readyOnly) {
          criteriaObj.status = userData.sessionStatusType
          if (userData.sessionStatusType === 'completed') {
          	includesArr.push({ model: SessionsMeta, as: 'meta' })
          }
        } else {
          includesArr.push({ model: SessionsMeta, as: 'meta' })
          // TODO: add not status === completed
        }
        
    	const now = moment(new Date())
    	return Session.findAll({ where: criteriaObj, include: includesArr })
    	  .then((sessions) => {
        	const readySessions = readyOnly ? sessions.find((session) => {
              const sessionDate = moment(session.datetime)
              const diff = moment.duration(sessionDate.diff(now)).asMinutes()
              console.log('diff atm: ', diff)
              return diff <= readyInterval
            }) : sessions
            return readySessions
          })
    	  .catch(err => (Promise.reject(err)))
      })
  },
  finalize(sessionId, meta) {
  	if (!sessionId || !meta) return Promise.reject({ msg: 'invalidData' })
  	return Session.findOne({ where: { id: sessionId }})
  	  .then(session => {
    	if (!session) return Promise.reject({ msg: 'notFound' })
    	if (session.status !== 'pending' && session.status !== 'ongoing') return Promise.reject({ msg: 'cannotFinalize' })
    	session.status = 'completed'
    	return SessionsMeta.create(meta)
    	  .then(metaObj => session.setMeta(metaObj))
    	  .then(() => session.save())
    	  .catch(err => (Promise.reject(err)))
      })
  	  .catch(err => (Promise.reject(err)))
  },
  deleteAll() {
  	return Session.destroy({where: {}})
  }
}