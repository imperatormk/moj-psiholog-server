const express = require('express')
const router = express.Router()
const db = require('../../db')
const emailHelper = require('../../helpers/email-helper.js')
const sa = require('superagent')

router.get('/', (req, res) => {
  const period = req.query.period
  let promiseFn = period == null ? db.controllers.payments.list() : db.controllers.payments.listByPeriod(period)
  
  promiseFn
	.then(payments => res.json(payments))
	.catch(err => res.status(500).send(err))
})

router.post('/req', (req, res) => {
  const sessionData = req.body ? req.body.sessionData : null
  if (!sessionData) res.status(400).send({ msg: 'invalidData' })

  const isFirstReqData = {
    doctorId: sessionData.doctorId,
  	patientId: sessionData.patientId
  }
  db.controllers.sessions.checkIsFirst(isFirstReqData)
  	.then((resObj) => {
  	  if (resObj.isFirst) {
      	db.controllers.sessions.create(sessionData)
      	  .then(resObj => {
        	sendMailAfterCreated(resObj)
        	res.status(200).send({ success: true })
          })
      	  .catch(err => res.status(500).send({ success: false, err }))
      } else {
      	res.redirect(307, 'https://channelhopper.tv/testReq.php')
      }
    })
    .catch(err => res.status(400).send(err))
})

router.post('/res', (req, res) => {
  const resObj = req.body
  if (!resObj) res.status(400).send({ msg: 'invalidData' })

  const paymentStatus = resObj.paymentData.success
  delete resObj.paymentData.success
  
  if (paymentStatus === false) {
  	res.json({ success: false, msg: 'Payment has failed.'})
  }

  db.controllers.payments.create(resObj)
	.then(resp => {
  	  const sessionData = resp.Session
	  sendMailAfterCreated(sessionData)
	  res.json({ success: true })
    })
	.catch(err => res.status(500).send({ success: false, err }))
})

const sendMailAfterCreated = (sessionData) => {
  const doctor = sessionData.doctor
  const patient = sessionData.patient
  const payment = sessionData.Payment || {}

  const emailOptsPatient = {
	sessionId: sessionData.id,
  	doctor: doctor.details.name,
  	price: payment.amount || 'Free session',
  	datetime: sessionData.datetime,
  }
  const emailOptsDoctor = {
	sessionId: sessionData.id,
  	email: patient.email,
  	datetime: sessionData.datetime,
  }
  
  db.controllers.tests.getByUser(patient.id)
	.then((res) => {
  	  if (res) {
      	emailOptsDoctor.hasDoneTest = true
      	emailOptsDoctor.testId = res.id
      } else {
      	emailOptsDoctor.hasDoneTest = false
      }
  
  	  emailHelper.sendEmail(doctor.email, 'new-session-doctor', emailOptsDoctor)
        .then(() => {
            emailHelper.sendEmail(patient.email, 'new-session-patient', emailOptsPatient)
            .then(() => console.log('new sessions emails sent'))
            .catch(err => console.log(err))
          })
        .catch(err => console.log(err))
  	})
	.catch(err => console.log(err))
}

router.delete('/', (req, res) => {
  db.controllers.payments.deleteAll()
	.then(() => res.json({ success: true }))
	.catch(err => res.status(500).send({ success: false, err }))
})

module.exports = router
