const User = require('../models').User
const Session = require('../models').Session
const Payment = require('../models').Payment

module.exports = {
  create(session) {
  	const doctorPromise = User.findOne({ where: { id: session.doctorId }})
    const patientPromise = User.findOne({ where: { id: session.patientId }})
    const paymentPromise = session.paymentId ? Payment.find({ where: { id: session.paymentId }}) : Promise.resolve(null)
    if (session.paymentId) delete session.paymentId
    
   	return Promise.all([doctorPromise, patientPromise, paymentPromise])
  	  .then((res) => {
    	const doctor = res[0]
        const patient = res[1]
        const payment = res[2]
        
        let valid = doctor && patient && doctor.type === 'doctor' && patient.type === 'patient'
        if (!valid) return Promise.reject({ msg: 'invalidData' })
        
        return Session.create(session, {include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]})
          .then(session => session.setDoctor(doctor))
          .then(session => session.setPatient(patient))
    	  .then(session => session.setPayment(payment))
          .then(session => session.save())
    	  .then(session => Session.find({ where: { id: session.id }, include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]})) // maybe alias payment?
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
    return Session.findAll({include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]}) // maybe alias payment?
  },
  deleteAll() {
  	return Session.destroy({where: {}})
  }
}