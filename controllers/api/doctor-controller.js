const db = require('../../db')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.doctors.list()
	.then(doctors => res.json(doctors))
	.catch(err => res.status(500).send(err))
})

router.get('/:id', (req, res) => {
  const doctorId = req.params.id
  if (!doctorId) {
  	res.status(400).send({ msg: 'invalidData' })
  }

  db.controllers.doctors.listById(doctorId)
	.then((doctor) => {
      if (!doctor) res.status(404).send({ success: false })
  	  res.json(doctor)
  	})
	.catch(err => res.status(500).send({ success: false, err }))
})

router.put('/:id', (req, res) => {
  const doctorId = req.params.id
  const data = req.body
  if (!doctorId || !data) {
  	res.status(400).send({ msg: 'invalidData' })
  }

  db.controllers.doctors.update(doctorId, data)
	.then((resp) => {
      if (!resp.success) res.status(500).send({ success: false })
  	  res.json(resp)
  	})
	.catch(err => {
  	  res.status(500).send({ success: false, err })
  	})
})

module.exports = router