const User = require('../models').User
const Session = require('../models').Session
const Payment = require('../models').Payment

const SessionController = require('./sessions.js')

module.exports = {
  create(resData) {
  	// paymentData contains: paymentId, amount, status
  	const paymentData = resData.paymentData
  	return Payment.create(paymentData)
  	  .then(payment => {
    	// sessionData contains: datetime, doctorId, patientId
        const sessionData = {
          ...resData.sessionData,
          paymentId: payment.id
        }
    	return SessionController.create(sessionData)
    	  .then(session => payment.setSession(session))
    	  .then(payment => payment.save())
    	  .then(payment => Payment.findOne({ where: { id: payment.id }, include: [{ all: true, nested: true }]}))
    	  .catch((err) => ({ err }))
      })
  	  .catch((err) => ({ err }))
  },
  list() {
    return Payment.findAll({ include: [{ model: Session }] })
  },
  deleteAll() {
  	return Payment.destroy({ where: {} })
  }
}