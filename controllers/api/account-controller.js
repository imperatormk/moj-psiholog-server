const db = require('../../db')
const emailHelper = require('../../helpers/email-helper.js')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.users.list()
	.then(users => res.json(users))
})

router.post('/register', (req, res) => {
  const userObj = req.body
  if (!userObj) {
  	res.status(400).send({ msg: 'invalidData' })
  }

  db.controllers.users.create(userObj)
	.then(resp => {
  	  const user = resp.data.user
      const token = resp.data.token
      
  	  const emailOpts = {
      	token: token.value
      }
  	  emailHelper.sendEmail(userObj.email, 'signup', emailOpts)
        .then(() => { // log this
          console.log('confirmation email sent')
        })
        .catch((err) => { // log this
          console.log('confirmation email not sent')
        })
  	  const success = resp.success
	  res.status(success ? 200 : 400).send({ success })
  	})
	.catch(err => {
  	  res.status(500).send({ success: false, err })
  	})
})

router.post('/confirm', (req, res) => {
  const confirmObj = req.body
  if (!confirmObj) res.status(400).send()

  db.controllers.users.confirm(confirmObj)
	.then(resObj => {
	  const success = resObj.success || false
  	  res.status(success ? 200 : 400).send(resObj)
  	})
	.catch(err => res.status(500).send(err))
})

router.delete('/', (req, res) => {
  db.controllers.users.deleteAll()
	.then(() => {
  	  res.json({ success: true })
  	})
})

module.exports = router