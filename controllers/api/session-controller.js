const db = require('../../db')
const emailHelper = require('../../helpers/email-helper.js')
const storageHelper = require('../../helpers/storage-helper.js')
const scheduleHelper = require('../../helpers/schedule-helper.js')
const express = require('express')
const moment = require('moment')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.sessions.list()
	.then(sessions => res.json(sessions))
	.catch(err => res.status(500).send({ success: false, err }))
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
  	  const emailOptsDoctor = {
		sessionId: resp.id
  	  }
      const emailOptsPatient = {
		sessionId: resp.id
  	  }
  	  const doctor = resp.doctor
      const patient = resp.patient
      
      const emailEnabled = false
      if (emailEnabled) {
      	const mailerPromises = [emailHelper.sendEmail(doctor.email, 'new-session', emailOptsDoctor), emailHelper.sendEmail(patient.email, 'new-session', emailOptsPatient)]
      	Promise.all(mailerPromises).then(resp => console.log(resp)).catch(err => console.log(err)) // log this
      }
  
  	  res.json({ success: true })
  	})
	.catch(err => res.status(500).send({ success: false, err }))
})

router.post('/getByUser', (req, res) => {
  const userData = req.body
  if (!userData) res.status(400).send({ success: false, msg: 'invalidData' })
  db.controllers.sessions.listByUser(userData, false)
	.then(resObj => res.status(200).send(resObj))
	.catch(err => res.status(500).send({ success: false, err }))
})

router.post('/getByUser/ready', (req, res) => {
  const userData = req.body
  if (!userData) res.status(400).send({ success: false, msg: 'invalidData' })

  const readySession = storageHelper.getByUser(userData.id)
  res.status(200).send({ success: true, found: !!readySession, payload: readySession || null })
})

router.post('/finalize', (req, res) => {
  const data = req.body
  if (!data) res.status(400).send({ success: false, msg: 'invalidData' })
  db.controllers.sessions.finalize(data.id, data.meta)
	.then(resp => res.status(200).send({ success: true }))
	.catch(err => res.status(500).send({ success: false, err }))
})

router.post('/:id/schedule', (req, res) => { // a bit odd endpoint name for sure ;)
  const id = Number(req.params.id)
  const scheduledTime = req.body.scheduledTime ? req.body.scheduledTime.trim() : null
  if (!scheduledTime) res.status(400).send({ msg: 'invalidData' })
  scheduleHelper.scheduleTask(scheduledTime, id)
	.then(resp => res.json(resp))
	.catch(err => res.status(500).send(err))
})

router.get('/:id/prepare', (req, res) => {
  const id = Number(req.params.id)

  db.controllers.sessions.listById(id)
  	.then(session => {
      if (!session) res.status(404).send()
  
  	  // is this the best place?
  	  session.update({ status: 'ongoing' })
      .then(() => {
        const sessionObj = {
          ...session.toJSON(),
          callState: {
            doctorConnected: false,
            patientConnected: false,
        	startDate: null
          }
        }
                   
        const resObj = storageHelper.persistSession(sessionObj, true)
        if (resObj) {
          res.json({ success: true })
          return
        }
        res.status(500).send({ msg: 'failed' })
  	  })
	  .catch(err => res.status(500).send({ success: false, err }))
	})
	.catch(err => res.status(500).send({ success: false, err }))
})

router.delete('/', (req, res) => {
  db.controllers.sessions.deleteAll()
	.then(resp => {
  	  storageHelper.popAll()
  	  res.status(200).send({ success: true })
    })
	.catch(err => res.status(500).send({ success: false, err }))
})

module.exports = router