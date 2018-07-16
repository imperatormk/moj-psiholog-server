const db = require('../../db')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.tokens.list()
	.then(tokens => res.json(tokens))
	.catch(err => res.status(500).send(err))
})

router.post('/verify', (req, res) => {
  const tokenObj = req.body
  if (!tokenObj) {
  	res.status(400).send({ msg: 'invalidData' })
  }

  db.controllers.tokens.isValid(tokenObj)
	.then((resObj) => {
      if (!resObj.valid) res.json({ valid: false })
  	  res.json({ valid: true })
  	})
	.catch(err => {
  	  res.status(500).send({ success: false, err })
  	})
})

module.exports = router