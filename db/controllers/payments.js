const Sequelize = require('sequelize')
const User = require('../models').User
const Session = require('../models').Session
const Payment = require('../models').Payment

const sessionController = require('./sessions.js')

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
    	return sessionController.create(sessionData)
    	  .then(session => payment.setSession(session))
    	  .then(payment => payment.save())
    	  .then(payment => Payment.findOne({ where: { id: payment.id }, include: [{ all: true, nested: true }] }))
    	  .catch((err) => ({ err }))
      })
  	  .catch((err) => ({ err }))
  },
  list() {
    return Payment.findAll({ include: [{ model: Session }] })
  },
  listByPeriod(period) {
  	const periodArr = ['day', 'week', 'month', 'quarter', 'year']
    const periodNo = Number(period)
    
    if (!Number.isInteger(periodNo)) return Promise.reject({ msg: 'invalidParam' })
    if (periodNo >= periodArr.length) return Promise.reject({ msg: 'invalidParam' })
  
  	const periodItem = periodArr[periodNo]
  	return Payment.findAll({
  	  group: [Sequelize.fn('date_trunc', periodItem, Sequelize.col('createdAt'))]
	})
  },
  deleteAll() {
  	return Payment.destroy({ where: {} })
  }
}