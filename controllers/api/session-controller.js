const db = require('../../db')
const emailHelper = require('../../helpers/email-helper.js')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.sessions.list()
	.then(sessions => res.json(sessions))
})

router.post('/isFirst', (req, res) => {
  const reqObj = req.body
  if (!reqObj) res.status(400).send({ msg: 'invalidData' })
  db.controllers.sessions.checkIsFirst(reqObj)
	.then(resObj => res.send(resObj))
	.catch(err => res.status(500).send({ success: false, err }))
})

router.post('/', (req, res) => {
  const sessionObj = req.body
  if (!sessionObj) res.status(400).send({ msg: 'invalidData' })

  db.controllers.sessions.create(sessionObj)
	.then(resp => {
  	  const emailOpts = {
		sessionId: resp.id
  	  }
  	  const doctor = resp.doctor
      const patient = resp.patient
                  
  	  const mailerPromises = [emailHelper.sendEmail(doctor.email, 'new-session', emailOpts), emailHelper.sendEmail(patient.email, 'new-session', emailOpts)]
      Promise.all(mailerPromises).then(resp => console.log(resp)).catch(err => console.log(err))
	  res.json({ success: true })
  	})
	.catch(err => {
  	  res.status(500).send(err)
  	})
})

router.post('/getByUser', (req, res) => {
  const userData = req.body
  if (!userData) res.status(400).send({ success: false, msg: 'invalidData' })
  db.controllers.sessions.listByUser(userData)
	.then(resObj => res.status(200).send(resObj))
	.catch(err => res.status(500).send({ success: false, err }))
})

router.delete('/', (req, res) => {
  db.controllers.sessions.deleteAll()
	.then(() => {
  	  res.json({ success: true })
  	})
})

module.exports = router