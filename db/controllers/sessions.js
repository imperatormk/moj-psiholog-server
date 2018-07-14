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
        if (!valid) return Promise.reject({ success: false, msg: 'invalidData' })
        
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
  list() {
    return Session.findAll({include: [{ model: User, as: 'doctor' }, { model: User, as: 'patient' }, { model: Payment }]}) // maybe alias payment?
  },
  deleteAll() {
  	return Session.destroy({where: {}})
  }
}